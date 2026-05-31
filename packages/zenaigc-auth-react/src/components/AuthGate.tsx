import type { ReactNode } from 'react'
import { useAuth } from '../hooks.js'
import { SignInPanel, type SignInPanelProps } from './SignInPanel.js'

export interface AuthGateProps {
  children: ReactNode
  loading?: ReactNode
  fallback?: ReactNode
  brand?: string
  appName?: SignInPanelProps['appName']
}

const DEFAULT_LOADING = (
  <div
    style={{
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background, #0a0a0a)',
      color: 'var(--muted-foreground, #a3a3a3)',
      fontSize: 13,
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}
  >
    <span>加载会话中…</span>
  </div>
)

export function AuthGate({ children, loading, fallback, brand, appName }: AuthGateProps) {
  const { loggedIn, loading: authLoading } = useAuth()

  if (authLoading) return <>{loading ?? DEFAULT_LOADING}</>
  if (!loggedIn) return <>{fallback ?? <SignInPanel brand={brand} appName={appName} />}</>
  return <>{children}</>
}
