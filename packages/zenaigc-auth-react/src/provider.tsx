import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  createAuthClient,
  createSuperoneFsStorage,
  type AuthClient,
  type AuthSession,
  type SessionStorage,
} from 'zenaigc-auth'

const AuthClientContext = createContext<AuthClient | null>(null)

export interface AuthSessionContextValue {
  session: AuthSession | null
  loading: boolean
  error: Error | null
  setSession: (next: AuthSession | null) => void
  setLoading: (next: boolean) => void
  setError: (next: Error | null) => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
  serverUrl: string
  storage?: SessionStorage
  clientType?: string
  fetchImpl?: typeof fetch
}

export function AuthProvider({
  children,
  serverUrl,
  storage,
  clientType,
  fetchImpl,
}: AuthProviderProps) {
  const client = useMemo(() => {
    const resolvedStorage = storage ?? createSuperoneFsStorage()
    return createAuthClient({
      serverUrl,
      storage: resolvedStorage,
      clientType,
      fetchImpl,
    })
  }, [serverUrl, storage, clientType, fetchImpl])

  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const sessionCtx = useMemo<AuthSessionContextValue>(
    () => ({ session, loading, error, setSession, setLoading, setError }),
    [session, loading, error]
  )

  return (
    <AuthClientContext.Provider value={client}>
      <AuthSessionContext.Provider value={sessionCtx}>{children}</AuthSessionContext.Provider>
    </AuthClientContext.Provider>
  )
}

export function useAuthClient(): AuthClient {
  const client = useContext(AuthClientContext)
  if (!client) {
    throw new Error('useAuthClient must be used inside <AuthProvider>')
  }
  return client
}

export function useAuthSessionStore(): AuthSessionContextValue {
  const store = useContext(AuthSessionContext)
  if (!store) {
    throw new Error('useAuthSessionStore must be used inside <AuthProvider>')
  }
  return store
}
