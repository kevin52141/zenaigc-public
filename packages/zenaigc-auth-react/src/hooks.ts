import { useCallback, useEffect, useState } from 'react'
import type { AuthSession, CreditBalance, Plan, Subscription } from 'zenaigc-auth'
import { useAuthClient, useAuthSessionStore } from './provider.js'

export const CREDITS_CHANGED_EVENT = 'zenaigc:credits-changed'

export interface CreditsChangedEventDetail {
  optimisticDelta?: number
  refresh?: boolean
}

export interface AuthState {
  session: AuthSession | null
  loading: boolean
  error: Error | null
  loggedIn: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>
  loginWithDevice: (
    onCode: (info: { user_code: string; verification_uri: string; expires_in: number }) => void,
    opts?: { signal?: AbortSignal; pollIntervalMs?: number }
  ) => Promise<void>
}

export function useAuth(): AuthState {
  const client = useAuthClient()
  const store = useAuthSessionStore()
  const { session, loading, error, setSession, setLoading, setError } = store

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const current = await client.getSession()
      setSession(current)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [client, setError, setSession, setLoading])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await client.logout()
    setSession(null)
  }, [client])

  const loginWithDevice = useCallback<AuthState['loginWithDevice']>(
    async (onCode, opts) => {
      setError(null)
      try {
        const result = await client.loginWithDevice(onCode, opts)
        setSession(result)
      } catch (e) {
        setError(e as Error)
        throw e
      }
    },
    [client]
  )

  const login = useCallback<AuthState['login']>(
    async (email, password) => {
      setError(null)
      try {
        const result = await client.login(email, password)
        setSession(result)
      } catch (e) {
        setError(e as Error)
        throw e
      }
    },
    [client]
  )

  const register = useCallback<AuthState['register']>(
    async (email, password, displayName) => {
      setError(null)
      try {
        const result = await client.register(email, password, displayName)
        setSession(result)
      } catch (e) {
        setError(e as Error)
        throw e
      }
    },
    [client]
  )

  const requestPasswordReset = useCallback<AuthState['requestPasswordReset']>(
    async (email) => {
      await client.requestPasswordReset(email)
    },
    [client]
  )

  const confirmPasswordReset = useCallback<AuthState['confirmPasswordReset']>(
    async (token, newPassword) => {
      await client.confirmPasswordReset(token, newPassword)
    },
    [client]
  )

  return {
    session,
    loading,
    error,
    loggedIn: session != null,
    refresh,
    logout,
    login,
    register,
    requestPasswordReset,
    confirmPasswordReset,
    loginWithDevice,
  }
}

export interface CreditsState {
  balance: CreditBalance | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function useCredits(opts: { enabled?: boolean } = {}): CreditsState {
  const enabled = opts.enabled ?? true
  const client = useAuthClient()
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const data = await client.credits.balance()
      setBalance(data)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [client, enabled])

  useEffect(() => {
    if (!enabled) return
    void refresh()
  }, [enabled, refresh])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const onCreditsChanged = (event: Event) => {
      const detail = (event as CustomEvent<CreditsChangedEventDetail>).detail
      if (typeof detail?.optimisticDelta === 'number') {
        const delta = detail.optimisticDelta
        setBalance((current) => (current ? applyOptimisticCreditDelta(current, delta) : current))
      }
      if (detail?.refresh === false) return
      void refresh()
    }
    window.addEventListener(CREDITS_CHANGED_EVENT, onCreditsChanged)
    return () => window.removeEventListener(CREDITS_CHANGED_EVENT, onCreditsChanged)
  }, [enabled, refresh])

  return { balance, loading, error, refresh }
}

function applyOptimisticCreditDelta(balance: CreditBalance, delta: number): CreditBalance {
  if (delta === 0) return balance
  const nextTotal = Math.max(0, balance.total_balance + delta)
  if (delta < 0) {
    const consume = -delta
    const grantUsed = Math.min(balance.grant_balance, consume)
    const topupUsed = Math.min(balance.topup_balance, consume - grantUsed)
    return {
      ...balance,
      grant_balance: Math.max(0, balance.grant_balance - grantUsed),
      topup_balance: Math.max(0, balance.topup_balance - topupUsed),
      total_balance: nextTotal,
    }
  }
  return {
    ...balance,
    topup_balance: balance.topup_balance + delta,
    total_balance: nextTotal,
  }
}

export interface PlansState {
  plans: Plan[] | null
  current: Subscription | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function usePlans(opts: { enabled?: boolean } = {}): PlansState {
  const enabled = opts.enabled ?? true
  const client = useAuthClient()
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [current, setCurrent] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const [allPlans, currentSub] = await Promise.all([
        client.plans.list(),
        client.plans.current(),
      ])
      setPlans(allPlans)
      setCurrent(currentSub)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [client, enabled])

  useEffect(() => {
    if (!enabled) return
    void refresh()
  }, [enabled, refresh])

  return { plans, current, loading, error, refresh }
}
