import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAuth } from '../hooks.js'
import { useAuthClient } from '../provider.js'

interface QuotaStatus {
  used: number
  limit: number | null
  canCreate: boolean
  planTier: 'free' | 'pro' | 'max'
}

// server 返 snake_case: { used, limit, can_create, plan_tier, project_id }
interface QuotaStatusRaw {
  used: number
  limit: number | null
  can_create: boolean
  plan_tier: 'free' | 'pro' | 'max'
}

export interface QuotaChipProps {
  projectId: string | null | undefined
  /** 口径 A: writer / director 各自独立配额。默认 'writer' (向后兼容旧调用)。director panel 传 'director'。 */
  app?: 'writer' | 'director'
  onUpgradeClick?: () => void
  className?: string
  style?: CSSProperties
}

const POLL_INTERVAL_MS = 60_000

const PLAN_BADGE: Record<string, { text: string; color: string }> = {
  free: { text: 'Free', color: 'var(--fg-dim, #737373)' },
  pro: { text: 'Pro', color: '#f59e0b' },
  max: { text: 'MAX', color: '#f59e0b' },
}

/**
 * 顶部小 chip 显示本项目集数配额状态。
 *
 * - free 未满: "本项目 3/10 集"
 * - free 满了: "已满 10/10 · 升级 →" (clickable)
 * - pro/max:  "本项目 7 集 · Pro"  (无 limit)
 * - projectId 为空 / fetch 失败: 不显示
 */
export function QuotaChip({ projectId, app = 'writer', onUpgradeClick, className, style }: QuotaChipProps) {
  const { session } = useAuth()
  const client = useAuthClient()
  const [status, setStatus] = useState<QuotaStatus | null>(null)

  const fetchStatus = useCallback(async () => {
    if (!projectId || !session) {
      setStatus(null)
      return
    }
    try {
      const res = await client.api.fetch(
        `/v1/me/episode-quota?project_id=${encodeURIComponent(projectId)}&app=${app}`,
      )
      const body = (await res.json().catch(() => null)) as
        | { ok: true; data: QuotaStatusRaw }
        | null
      if (body && body.ok) {
        setStatus({
          used: body.data.used,
          limit: body.data.limit,
          canCreate: body.data.can_create,
          planTier: body.data.plan_tier,
        })
      } else setStatus(null)
    } catch {
      setStatus(null)
    }
  }, [client, projectId, session, app])

  useEffect(() => {
    void fetchStatus()
    if (!projectId || !session) return
    const id = window.setInterval(() => void fetchStatus(), POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [fetchStatus, projectId, session])

  if (!projectId || !status) return null

  const badge = PLAN_BADGE[status.planTier] ?? { text: status.planTier, color: 'var(--fg-dim, #737373)' }
  const isFree = status.planTier === 'free'
  const isFull = isFree && status.limit !== null && status.used >= status.limit

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 26,
    padding: '0 10px',
    borderRadius: 999,
    background: isFull ? 'rgba(245, 158, 11, 0.16)' : 'var(--layer-card, #161616)',
    border: isFull
      ? '1px solid rgba(245, 158, 11, 0.55)'
      : '1px solid var(--border, #242424)',
    color: isFull ? '#f59e0b' : 'var(--foreground, #fafafa)',
    fontSize: 11.5,
    fontVariantNumeric: 'tabular-nums',
    cursor: isFull ? 'pointer' : 'default',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    ...style,
  }

  const handleClick = () => {
    if (isFull && onUpgradeClick) onUpgradeClick()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={baseStyle}
      disabled={!isFull}
      aria-label={
        isFull
          ? `已用满 ${status.used}/${status.limit} 集, 点击升级`
          : `本项目已用 ${status.used} 集`
      }
    >
      <span style={{ color: 'var(--fg-dim, #737373)' }}>本项目</span>
      {isFree && status.limit !== null ? (
        <>
          <span style={{ fontWeight: 600 }}>
            {status.used}/{status.limit}
          </span>
          <span style={{ color: 'var(--fg-dim, #737373)' }}>集</span>
          {isFull && <span style={{ fontWeight: 700 }}>· 升级 →</span>}
        </>
      ) : (
        <>
          <span style={{ fontWeight: 600 }}>{status.used}</span>
          <span style={{ color: 'var(--fg-dim, #737373)' }}>集</span>
          <span
            style={{
              color: badge.color,
              fontWeight: 700,
              letterSpacing: 0.4,
              fontSize: 10,
              textTransform: 'uppercase',
            }}
          >
            · {badge.text}
          </span>
        </>
      )}
    </button>
  )
}

