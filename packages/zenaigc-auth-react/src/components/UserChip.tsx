import type { CSSProperties } from 'react'
import { useAuth, useCredits, usePlans } from '../hooks.js'
import { LoginButton } from './LoginButton.js'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  max: 'MAX',
}

const TIER_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  free: {
    bg: 'var(--layer-hover, #1c1c1c)',
    text: 'var(--fg-dim, #737373)',
    border: '1px solid transparent',
  },
  pro: {
    bg: 'rgba(245, 158, 11, 0.16)',
    text: '#f59e0b',
    border: '1px solid transparent',
  },
  max: {
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.55)',
  },
}

const CHIP_BASE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 28,
  borderRadius: 999,
  background: 'var(--layer-card, #161616)',
  border: '1px solid var(--border, #242424)',
  color: 'var(--foreground, #fafafa)',
  fontSize: 12,
  lineHeight: 1,
}

export interface UserChipProps {
  className?: string
  showBalance?: boolean
  showLogout?: boolean
  showUpgrade?: boolean
  onUpgrade?: () => void
}

export function UserChip({
  className,
  showBalance = true,
  showLogout = true,
  showUpgrade = true,
  onUpgrade,
}: UserChipProps) {
  const { session, loggedIn, loading, logout } = useAuth()
  const { balance } = useCredits({ enabled: loggedIn })
  const { current } = usePlans({ enabled: loggedIn })

  if (loading) {
    return (
      <div
        className={className}
        style={{
          ...CHIP_BASE,
          paddingInline: 12,
          color: 'var(--fg-dim, #737373)',
        }}
      >
        加载…
      </div>
    )
  }

  if (!loggedIn || !session) {
    return (
      <div className={className}>
        <LoginButton />
      </div>
    )
  }

  const tier = current?.plan_tier ?? session.user.plan_tier
  const tierLabel = PLAN_LABELS[tier] ?? tier
  const badge = TIER_BADGE[tier] ?? TIER_BADGE.free!
  const initial = (
    session.user.display_name?.trim()?.[0] ??
    session.user.email?.[0] ??
    '?'
  ).toUpperCase()

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          ...CHIP_BASE,
          gap: 7,
          paddingLeft: 3,
          paddingRight: 9,
        }}
        title={session.user.email ?? ''}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            color: '#1a1004',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: -0.2,
          }}
          aria-hidden
        >
          {initial}
        </span>
        <span
          style={{
            maxWidth: 96,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          {session.user.display_name}
        </span>
        <span
          style={{
            background: badge.bg,
            color: badge.text,
            border: badge.border,
            padding: '1px 7px',
            borderRadius: 999,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {tierLabel}
        </span>
      </div>

      {showBalance && balance && (
        <div
          style={{
            ...CHIP_BASE,
            gap: 6,
            paddingInline: 10,
            fontVariantNumeric: 'tabular-nums',
          }}
          title="可用积分余额"
        >
          <SparkIcon />
          <span style={{ color: 'var(--fg-dim, #737373)', fontSize: 10.5 }}>积分</span>
          <span style={{ fontWeight: 600 }}>{balance.total_balance.toLocaleString()}</span>
        </div>
      )}

      {showUpgrade && tier !== 'max' && onUpgrade && (
        <button
          onClick={onUpgrade}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 28,
            paddingInline: 14,
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            color: '#1a1004',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.2,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.22)',
          }}
          title="升级套餐"
        >
          升级
        </button>
      )}

      {showLogout && (
        <button
          onClick={() => void logout()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 28,
            width: 28,
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: 999,
            color: 'var(--fg-dim, #737373)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--foreground, #fafafa)'
            e.currentTarget.style.borderColor = 'var(--border, #242424)'
            e.currentTarget.style.background = 'var(--layer-card, #161616)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--fg-dim, #737373)'
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.background = 'transparent'
          }}
          title="登出"
          aria-label="登出"
        >
          <LogoutIcon />
        </button>
      )}
    </div>
  )
}

function SparkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5l1.55 4.45 4.45 1.55-4.45 1.55L8 13.5l-1.55-4.45L2 7.5l4.45-1.55L8 1.5z"
        fill="#f59e0b"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6.5 13.5H3.5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h3" />
      <path d="M10.5 11l3-3-3-3" />
      <path d="M13.5 8h-7" />
    </svg>
  )
}
