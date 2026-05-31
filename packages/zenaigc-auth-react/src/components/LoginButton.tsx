import { useState } from 'react'
import { useAuth } from '../hooks.js'

export interface LoginButtonProps {
  className?: string
  label?: string
  onCode?: (info: { user_code: string; verification_uri: string; expires_in: number }) => void
}

export function LoginButton({ className, label = '登录', onCode }: LoginButtonProps) {
  const { loginWithDevice, loading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setBusy(true)
    setError(null)
    setCode(null)
    try {
      await loginWithDevice((info) => {
        setCode(info.user_code)
        if (onCode) {
          onCode(info)
          return
        }
        const sys = typeof window !== 'undefined' ? (window as { superone?: { openExternalLink?: (u: string) => void } }).superone : undefined
        if (sys?.openExternalLink) {
          sys.openExternalLink(info.verification_uri)
        } else if (typeof window !== 'undefined') {
          window.open(info.verification_uri, '_blank', 'noopener,noreferrer')
        }
      })
    } catch (e) {
      setError((e as Error).message || '登录失败')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return null

  return (
    <div className={className}>
      <button onClick={handleClick} disabled={busy}>
        {busy ? '登录中…' : label}
      </button>
      {code && <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>设备码: {code}</span>}
      {error && <span style={{ marginLeft: 8, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}
