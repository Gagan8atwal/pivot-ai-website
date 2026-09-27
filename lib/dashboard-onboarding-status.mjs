// Dashboard-only projection of the authoritative onboarding response.
// Historical activated_at is an audit fact, not proof that required capabilities
// are still ready now. Fail closed when the current activation contract is absent.
export function deriveDashboardOnboardingStatus(payload) {
  const state = payload?.state && typeof payload.state === 'object' ? payload.state : {}
  const activation = payload?.activation && typeof payload.activation === 'object'
    ? payload.activation
    : null

  const active = activation?.active === true
  const previouslyActivated = activation
    ? activation.previouslyActivated === true
    : Boolean(typeof state.activated_at === 'string' && state.activated_at.trim())
  const requiresAttention = activation
    ? activation.requiresAttention === true
    : previouslyActivated && !active

  const completedSteps = Array.isArray(state.completed_steps) ? state.completed_steps : []
  const totalSteps = Number.isInteger(payload?.totalSteps) && payload.totalSteps > 0
    ? payload.totalSteps
    : 7
  const resumeStep = Number.isInteger(state.current_step) && state.current_step > 0
    ? state.current_step
    : 1

  return {
    active,
    previouslyActivated,
    requiresAttention,
    completedCount: completedSteps.length,
    totalSteps,
    resumeStep,
    showSetupBanner: Boolean(payload) && !active,
  }
}
