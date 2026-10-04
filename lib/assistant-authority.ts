import {
  api,
  type MeResponse,
  type OnboardingResponse,
  type Settings,
} from '@/lib/api'

export function assertAssistantAuthorityPayload(
  settings: Settings,
  onboarding: OnboardingResponse,
  me: MeResponse,
) {
  if (!settings || typeof settings !== 'object') {
    throw new Error('Assistant settings authority payload is invalid.')
  }

  const businessId =
    me && typeof me === 'object' && me.business && typeof me.business.id === 'string'
      ? me.business.id.trim()
      : ''
  if (!businessId) {
    throw new Error('Assistant business authority is unavailable.')
  }

  if (
    !onboarding
    || typeof onboarding !== 'object'
    || !onboarding.state
    || typeof onboarding.state !== 'object'
    || !Number.isInteger(onboarding.state.current_step)
    || !Array.isArray(onboarding.state.completed_steps)
    || !onboarding.readiness
    || typeof onboarding.readiness.ready !== 'boolean'
    || !Array.isArray(onboarding.readiness.blockers)
    || !Array.isArray(onboarding.readiness.warnings)
    || !onboarding.integrations
    || typeof onboarding.integrations.calendar !== 'boolean'
    || typeof onboarding.integrations.phone !== 'boolean'
    || typeof onboarding.integrations.email !== 'boolean'
    || !onboarding.integrations.sms
    || typeof onboarding.integrations.sms.enabled !== 'boolean'
    || typeof onboarding.integrations.sms.deliverable !== 'boolean'
    || typeof onboarding.state.business_id !== 'string'
    || onboarding.state.business_id.trim() !== businessId
  ) {
    throw new Error('Assistant setup authority payload is invalid.')
  }
}

export async function assertAssistantAuthorityReadable() {
  const [settings, onboarding, me] = await Promise.all([
    api.settings.get(),
    api.onboarding.get(),
    api.me(),
  ])
  assertAssistantAuthorityPayload(settings, onboarding, me)
  return true as const
}
