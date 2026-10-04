import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../components/app/assistant/assistant-console.tsx', import.meta.url), 'utf8')
const authority = readFileSync(new URL('../lib/assistant-authority.ts', import.meta.url), 'utf8')
const activity = readFileSync(new URL('../components/app/assistant/activity-panel.tsx', import.meta.url), 'utf8')

assert.match(authority, /export async function assertAssistantAuthorityReadable\(\)/)
assert.match(authority, /function assertAssistantAuthorityPayload\([\s\S]*settings: Settings,[\s\S]*onboarding: OnboardingResponse,[\s\S]*me: MeResponse/)
assert.match(authority, /Number\.isInteger\(onboarding\.state\.current_step\)/)
assert.match(authority, /Array\.isArray\(onboarding\.readiness\.blockers\)/)
assert.match(authority, /typeof onboarding\.integrations\.calendar !== 'boolean'/)
assert.match(authority, /typeof onboarding\.integrations\.phone !== 'boolean'/)
assert.match(authority, /typeof onboarding\.integrations\.sms\.deliverable !== 'boolean'/)
assert.match(authority, /typeof onboarding\.state\.business_id !== 'string'/)
assert.match(authority, /onboarding\.state\.business_id\.trim\(\) !== businessId/)
assert.match(authority, /api\.me\(\)/)
assert.match(authority, /Assistant business authority is unavailable\./)
assert.match(authority, /assertAssistantAuthorityPayload\(settings, onboarding, me\)/)
assert.match(authority, /return true as const/)

assert.match(source, /loadMessages = React\.useCallback\([\s\S]*await assertAssistantAuthorityReadable\(\)[\s\S]*api\.assistant\.conversations\.messages/)
assert.match(source, /loadConversations = React\.useCallback\([\s\S]*await assertAssistantAuthorityReadable\(\)[\s\S]*api\.assistant\.conversations\.list/)
assert.match(source, /catch \(err\) \{\s*setConversations\(\[\]\)\s*setActiveId\(null\)\s*setMessages\(\[\]\)/)
assert.match(activity, /await assertAssistantAuthorityReadable\(\)[\s\S]*return api\.assistant\.activity\(\)/)
assert.match(source, /authorityVerified === true/)
assert.match(source, /Settings &amp; setup verified/)
assert.ok(
  source.indexOf('authorityVerified === true') < source.indexOf('Settings &amp; setup verified'),
  'verified badge must be gated by successful authoritative reads',
)
assert.match(authority, /Promise\.all\(\[[\s\S]*api\.settings\.get\(\)[\s\S]*api\.onboarding\.get\(\)[\s\S]*api\.me\(\)[\s\S]*\]\)/)
assert.match(source, /Promise\.all\(\[api\.assistant\.overview\(\), assertAssistantAuthorityReadable\(\)\]\)/)
assert.match(source, /try \{\s*await assertAssistantAuthorityReadable\(\)\s*let conversationId = activeId/)
assert.ok(
  source.indexOf('await assertAssistantAuthorityReadable()') < source.indexOf('api.assistant.conversations.create'),
  'authority must be verified before creating or sending a conversation',
)

console.log('assistant authority fail-closed contract: ok')
