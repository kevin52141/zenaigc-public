export { AuthProvider, useAuthClient } from './provider.js'
export type { AuthProviderProps } from './provider.js'

export {
  CREDITS_CHANGED_EVENT,
  useAuth,
  useCredits,
  usePlans,
  type CreditsChangedEventDetail,
} from './hooks.js'
export type { AuthState, CreditsState, PlansState } from './hooks.js'

export { LoginButton } from './components/LoginButton.js'
export type { LoginButtonProps } from './components/LoginButton.js'

export { UserChip } from './components/UserChip.js'
export type { UserChipProps } from './components/UserChip.js'

export { MiniappHeader } from './components/MiniappHeader.js'
export type { MiniappHeaderProps } from './components/MiniappHeader.js'

export { SignInPanel } from './components/SignInPanel.js'
export type { SignInPanelProps } from './components/SignInPanel.js'

export { AuthGate } from './components/AuthGate.js'
export type { AuthGateProps } from './components/AuthGate.js'

export { PlansPage } from './components/PlansPage.js'
export type { PlansPageProps } from './components/PlansPage.js'

export { QuotaChip } from './components/QuotaChip.js'
export type { QuotaChipProps } from './components/QuotaChip.js'
