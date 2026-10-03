import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../components/app/assistant/assistant-console.tsx', import.meta.url), 'utf8')

assert.match(source, /async function assertAssistantAuthorityReadable\(\)/)
assert.match(source, /Promise\.all\(\[api\.settings\.get\(\), api\.onboarding\.get\(\)\]\)/)
assert.match(source, /Promise\.all\(\[api\.assistant\.overview\(\), assertAssistantAuthorityReadable\(\)\]\)/)
assert.match(source, /try \{\s*await assertAssistantAuthorityReadable\(\)\s*let conversationId = activeId/)
assert.ok(
  source.indexOf('await assertAssistantAuthorityReadable()') < source.indexOf('api.assistant.conversations.create'),
  'authority must be verified before creating or sending a conversation',
)

console.log('assistant authority fail-closed contract: ok')
