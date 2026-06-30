#!/usr/bin/env node
/**
 * Logic tests for the greetings / IVR settings model.
 *
 * Imports the pure TypeScript module directly — Node (>=22.18 / 24) strips the
 * types at load. No test-runner dependency. Run with `npm test`.
 */
import assert from 'node:assert/strict'
import {
  isE164,
  isYmd,
  isHHMM,
  minutesOf,
  validateIvrSettings,
  normalizeIvrSettings,
  buildIvrPayload,
  isAdminRole,
  emptyIvrSettings,
  VS_CARRIERS_IVR_DEFAULTS,
} from '../lib/settings-ivr.ts'

let failures = 0
let count = 0
function test(name, fn) {
  count++
  try {
    fn()
    console.log(`  ✓ ${name}`)
  } catch (err) {
    failures++
    console.error(`  ✗ ${name}\n      ${err.message}`)
  }
}

console.log('\nPhone / date / time validators')

test('isE164 accepts well-formed E.164', () => {
  assert.equal(isE164('+15555550123'), true)
  assert.equal(isE164('+918054123456'), true)
  assert.equal(isE164('  +15555550123  '), true) // trims
})
test('isE164 rejects malformed numbers', () => {
  assert.equal(isE164('5555550123'), false) // no +
  assert.equal(isE164('+0555550123'), false) // leading zero
  assert.equal(isE164('+1 555 555 0123'), false) // spaces
  assert.equal(isE164('+12'), false) // too short
  assert.equal(isE164('+1234567890123456'), false) // too long (16 digits)
  assert.equal(isE164(''), false)
})

test('isYmd accepts valid calendar dates', () => {
  assert.equal(isYmd('2026-01-01'), true)
  assert.equal(isYmd('2026-12-25'), true)
  assert.equal(isYmd('2024-02-29'), true) // leap day
})
test('isYmd rejects malformed / impossible dates', () => {
  assert.equal(isYmd('2026-13-01'), false) // month
  assert.equal(isYmd('2026-02-30'), false) // impossible
  assert.equal(isYmd('2026-2-3'), false) // not zero-padded
  assert.equal(isYmd('12-25-2026'), false) // wrong order
  assert.equal(isYmd('2026/12/25'), false)
})

test('isHHMM accepts 24-hour times and rejects others', () => {
  assert.equal(isHHMM('00:00'), true)
  assert.equal(isHHMM('08:30'), true)
  assert.equal(isHHMM('23:59'), true)
  assert.equal(isHHMM('24:00'), false)
  assert.equal(isHHMM('8:30'), false) // not padded
  assert.equal(isHHMM('08:60'), false)
})
test('minutesOf converts and flags malformed', () => {
  assert.equal(minutesOf('01:30'), 90)
  assert.equal(Number.isNaN(minutesOf('nope')), true)
})

console.log('\nvalidateIvrSettings')

test('VS Carriers defaults are valid', () => {
  assert.deepEqual(validateIvrSettings(VS_CARRIERS_IVR_DEFAULTS), [])
})
test('flags a non-E.164 department phone', () => {
  const s = clone(VS_CARRIERS_IVR_DEFAULTS)
  s.departments[0].phone = '555-1234'
  const errs = validateIvrSettings(s)
  assert.ok(errs.some((e) => /E\.164/.test(e)), errs.join('; '))
})
test('flags duplicate Press options', () => {
  const s = clone(VS_CARRIERS_IVR_DEFAULTS)
  s.departments[1].option = '1'
  const errs = validateIvrSettings(s)
  assert.ok(errs.some((e) => /Press 1/.test(e)), errs.join('; '))
})
test('flags a bad holiday date', () => {
  const s = clone(VS_CARRIERS_IVR_DEFAULTS)
  s.holidays = ['2026-13-40']
  const errs = validateIvrSettings(s)
  assert.ok(errs.some((e) => /YYYY-MM-DD/.test(e)), errs.join('; '))
})
test('flags open time not before close time', () => {
  const s = clone(VS_CARRIERS_IVR_DEFAULTS)
  s.operating_hours.mon = ['18:00', '08:00']
  const errs = validateIvrSettings(s)
  assert.ok(errs.some((e) => /before its close/.test(e)), errs.join('; '))
})
test('empty department phones are allowed (optional)', () => {
  assert.deepEqual(validateIvrSettings(emptyIvrSettings()), [])
})

console.log('\nnormalizeIvrSettings (GET → form)')

test('fills structural defaults from an empty/garbage response', () => {
  const s = normalizeIvrSettings(undefined)
  assert.equal(s.ivr_enabled, true)
  assert.equal(s.transfer_mode, 'warm')
  assert.deepEqual(Object.keys(s.greetings), ['en', 'pa', 'hi'])
  assert.equal(s.departments.length, 3)
  assert.deepEqual(s.departments.map((d) => d.option), ['1', '2', '3'])
  assert.equal(s.operating_hours.sun, null)
})
test('reads provided fields and overlays departments by option', () => {
  const s = normalizeIvrSettings({
    ivr_enabled: false,
    transfer_mode: 'conference',
    greetings: { en: 'Hello', pa: 'Sat sri akal' },
    holidays: ['2026-12-25', 42],
    departments: [{ option: '2', name: 'Shop', phone: '+15555550123' }],
    operating_hours: { mon: ['09:00', '17:00'], sat: null },
  })
  assert.equal(s.ivr_enabled, false)
  assert.equal(s.transfer_mode, 'conference')
  assert.equal(s.greetings.en, 'Hello')
  assert.equal(s.greetings.hi, '') // missing → empty
  assert.deepEqual(s.holidays, ['2026-12-25']) // non-strings dropped
  const press2 = s.departments.find((d) => d.option === '2')
  assert.equal(press2.name, 'Shop')
  assert.equal(press2.phone, '+15555550123')
  assert.equal(s.departments.length, 3) // still three standard rows
})

console.log('\nbuildIvrPayload (form → PATCH shape)')

test('emits exactly the contract keys', () => {
  const payload = buildIvrPayload(VS_CARRIERS_IVR_DEFAULTS)
  assert.deepEqual(
    Object.keys(payload).sort(),
    [
      'after_hours_greeting',
      'departments',
      'greetings',
      'holiday_greeting',
      'holidays',
      'ivr_enabled',
      'operating_hours',
      'transfer_mode',
    ]
  )
})
test('greetings keep all three language keys (trimmed)', () => {
  const s = clone(VS_CARRIERS_IVR_DEFAULTS)
  s.greetings = { en: '  hi  ', pa: '', hi: 'x' }
  const payload = buildIvrPayload(s)
  assert.deepEqual(Object.keys(payload.greetings).sort(), ['en', 'hi', 'pa'])
  assert.equal(payload.greetings.en, 'hi')
})
test('department label omitted when blank, kept when present', () => {
  const s = clone(VS_CARRIERS_IVR_DEFAULTS)
  s.departments = [
    { name: 'Dispatch', label: '', option: '1', phone: '+15555550123' },
    { name: 'Manager', label: 'Sunny', option: '3', phone: '' },
  ]
  const payload = buildIvrPayload(s)
  assert.equal('label' in payload.departments[0], false)
  assert.equal(payload.departments[1].label, 'Sunny')
})
test('closed days serialize as null; holidays trimmed + emptied dropped', () => {
  const s = clone(VS_CARRIERS_IVR_DEFAULTS)
  s.operating_hours.sun = null
  s.holidays = [' 2026-12-25 ', '']
  const payload = buildIvrPayload(s)
  assert.equal(payload.operating_hours.sun, null)
  assert.deepEqual(payload.holidays, ['2026-12-25'])
})

console.log('\nAdmin gating (read-only vs editable)')

test('admin-and-above roles can write', () => {
  for (const r of ['owner', 'admin', 'manager', 'Owner', 'ADMIN']) {
    assert.equal(isAdminRole(r), true, `expected ${r} to be admin`)
  }
})
test('lower roles and missing role are read-only', () => {
  for (const r of ['dispatcher', 'mechanic', 'employee', 'member', 'driver', 'viewer', '', null, undefined]) {
    assert.equal(isAdminRole(r), false, `expected ${r} to be read-only`)
  }
})

function clone(v) {
  return JSON.parse(JSON.stringify(v))
}

if (failures > 0) {
  console.error(`\n${failures} of ${count} settings-ivr tests failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${count} settings-ivr logic tests passed.\n`)
