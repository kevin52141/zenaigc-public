import type { CSSProperties } from 'react'
import { useState } from 'react'
import { usePlans } from '../hooks.js'
import { useAuthClient } from '../provider.js'

const TIER_NAMES: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  max: 'MAX',
}

const TIER_TAGLINE: Record<string, string> = {
  free: '试用与轻量探索',
  pro: '日常创作主力',
  max: '专业创作者 / 高产出',
}

const TIER_FEATURES: Record<string, string[]> = {
  free: ['每项目 10 集编剧/导演', '基础生图模型', '1 个并发任务'],
  pro: ['编剧/导演不限集数', '100 积分/月（生图生视频）', '全部模型访问', '5 个并发任务', '优先队列'],
  max: ['编剧/导演不限集数', '300 积分/月（生图生视频）', '全部模型访问', '20 个并发任务', '最高优先级', '专属支持'],
}

function formatPrice(cents: number): string {
  if (cents === 0) return '$0'
  return `$${(cents / 100).toFixed(0)}`
}

export interface PlansPageProps {
  className?: string
}

const STATE_TEXT: CSSProperties = {
  padding: 24,
  color: 'var(--fg-dim, #737373)',
  fontSize: 13,
}

export function PlansPage({ className }: PlansPageProps) {
  const { plans, current, loading, error, refresh } = usePlans()
  const client = useAuthClient()
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  const [busyTier, setBusyTier] = useState<string | null>(null)
  const [portalBusy, setPortalBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') return
    setBusyTier(tier)
    setActionError(null)
    try {
      const result = await client.plans.checkout(tier as 'pro' | 'max', interval)
      if (typeof window !== 'undefined' && (window as any).superone?.openExternalLink) {
        ;(window as any).superone.openExternalLink(result.url)
      } else {
        window.open(result.url, '_blank')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '创建支付会话失败'
      setActionError(msg)
      console.error('Failed to create checkout session:', e)
    } finally {
      setBusyTier(null)
    }
  }

  const handlePortal = async () => {
    setPortalBusy(true)
    try {
      const result = await client.plans.createPortal()
      if (typeof window !== 'undefined' && (window as any).superone?.openExternalLink) {
        ;(window as any).superone.openExternalLink(result.url)
      } else {
        window.open(result.url, '_blank')
      }
    } catch (e) {
      console.error('Failed to create portal session:', e)
    } finally {
      setPortalBusy(false)
    }
  }

  const filteredPlans = (plans ?? []).filter((p) => p.billing_interval === interval)
  const currentTier = current?.plan_tier ?? null

  if (loading) {
    return <div className={className} style={STATE_TEXT}>加载套餐信息…</div>
  }

  if (error) {
    return (
      <div
        className={className}
        style={{ ...STATE_TEXT, color: 'var(--color-status-danger, #ef4444)' }}
      >
        加载失败：{error.message}
        <button
          onClick={refresh}
          style={{
            marginLeft: 12,
            background: 'transparent',
            border: '1px solid var(--border, #242424)',
            borderRadius: 6,
            padding: '2px 10px',
            color: 'var(--foreground, #fafafa)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className={className} style={{ paddingBottom: 8 }}>
      {actionError && (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: 16,
            borderRadius: 8,
            background: 'color-mix(in oklab, var(--color-status-danger, #ef4444) 12%, transparent)',
            border: '1px solid color-mix(in oklab, var(--color-status-danger, #ef4444) 32%, transparent)',
            color: 'var(--color-status-danger, #ef4444)',
            fontSize: 12.5,
          }}
        >
          {actionError}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--foreground, #fafafa)',
            }}
          >
            订阅与积分
          </h2>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 12.5,
              color: 'var(--muted-foreground, #a3a3a3)',
            }}
          >
            积分按月发放，付费档共享全模型访问 + 更高并发
          </p>
        </div>
        {current && current.plan_tier !== 'free' && (
          <button
            onClick={handlePortal}
            disabled={portalBusy}
            style={{
              flexShrink: 0,
              background: 'var(--layer-elevated, #111111)',
              border: '1px solid var(--border, #242424)',
              borderRadius: 8,
              padding: '6px 14px',
              color: 'var(--foreground, #fafafa)',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: portalBusy ? 'not-allowed' : 'pointer',
              opacity: portalBusy ? 0.5 : 1,
            }}
            title="去 Stripe 客户门户管理订阅 / 发票"
          >
            {portalBusy ? '打开中…' : '管理订阅 ↗'}
          </button>
        )}
      </div>

      <div
        style={{
          display: 'inline-flex',
          gap: 2,
          marginBottom: 20,
          background: 'var(--layer-card, #161616)',
          border: '1px solid var(--border, #242424)',
          borderRadius: 10,
          padding: 3,
        }}
      >
        {(['month', 'year'] as const).map((v) => {
          const active = interval === v
          return (
            <button
              key={v}
              onClick={() => setInterval(v)}
              style={{
                padding: '5px 16px',
                borderRadius: 7,
                border: 'none',
                background: active ? 'var(--layer-elevated, #111111)' : 'transparent',
                color: active ? 'var(--foreground, #fafafa)' : 'var(--fg-dim, #737373)',
                fontWeight: active ? 600 : 500,
                fontSize: 12.5,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 2px rgba(0, 0, 0, 0.25)' : 'none',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              {v === 'month' ? '月付' : '年付'}
            </button>
          )
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        {filteredPlans.map((plan) => {
          const isCurrent = plan.tier === currentTier
          const isBusy = busyTier === plan.tier
          const isFree = plan.tier === 'free'
          const isMax = plan.tier === 'max'

          return (
            <div
              key={`${plan.tier}-${plan.billing_interval}`}
              style={{
                position: 'relative',
                padding: 20,
                borderRadius: 14,
                background: 'var(--layer-card, #161616)',
                border: isCurrent
                  ? '1px solid #f59e0b'
                  : '1px solid var(--border, #242424)',
                boxShadow: isCurrent
                  ? '0 0 0 3px rgba(245, 158, 11, 0.12)'
                  : 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {isCurrent && (
                <span
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 14,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                    color: '#1a1004',
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 999,
                    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  当前套餐
                </span>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--foreground, #fafafa)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {TIER_NAMES[plan.tier] ?? plan.tier}
                </span>
                {isMax && (
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.55)',
                      borderRadius: 999,
                      padding: '1px 7px',
                    }}
                  >
                    Top
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  color: 'var(--fg-dim, #737373)',
                  marginBottom: 14,
                }}
              >
                {TIER_TAGLINE[plan.tier] ?? ''}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 16,
                  color: 'var(--foreground, #fafafa)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em' }}>
                  {formatPrice(plan.price_cents)}
                </span>
                {plan.price_cents > 0 && (
                  <span style={{ fontSize: 12.5, color: 'var(--fg-dim, #737373)' }}>
                    /{interval === 'month' ? '月' : '年'}
                  </span>
                )}
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                  fontSize: 12.5,
                  color: 'var(--muted-foreground, #a3a3a3)',
                }}
              >
                {(TIER_FEATURES[plan.tier] ?? []).map((f, i) => (
                  <li
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '9px 0',
                    borderRadius: 9,
                    border: '1px solid var(--border, #242424)',
                    background: 'var(--layer-hover, #1c1c1c)',
                    color: 'var(--fg-subtle, #525252)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'not-allowed',
                  }}
                >
                  当前套餐
                </button>
              ) : isFree ? (
                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={isBusy}
                  style={{
                    width: '100%',
                    padding: '9px 0',
                    borderRadius: 9,
                    border: '1px solid var(--border, #242424)',
                    background: 'var(--layer-elevated, #111111)',
                    color: 'var(--foreground, #fafafa)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    opacity: isBusy ? 0.5 : 1,
                  }}
                >
                  免费使用
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={isBusy}
                  style={{
                    width: '100%',
                    padding: '9px 0',
                    borderRadius: 9,
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                    color: '#1a1004',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    opacity: isBusy ? 0.6 : 1,
                    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                  }}
                >
                  {isBusy ? '跳转中…' : `升级到 ${TIER_NAMES[plan.tier] ?? plan.tier}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 28,
          padding: 18,
          borderRadius: 12,
          border: '1px dashed var(--border, #242424)',
          background: 'var(--layer-card, #161616)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(245, 158, 11, 0.08)',
            color: '#f59e0b',
            fontSize: 16,
          }}
        >
          ★
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--foreground, #fafafa)',
              marginBottom: 2,
            }}
          >
            企业版 · Coming Soon
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-dim, #737373)', lineHeight: 1.5 }}>
            多席位团队管理、私有部署、SLA、自定义模型接入。联系{' '}
            <a
              href="mailto:hi@zenaigc.com"
              style={{
                color: '#f59e0b',
                textDecoration: 'none',
                borderBottom: '1px dashed currentColor',
              }}
            >
              hi@zenaigc.com
            </a>{' '}
            定制方案。
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--color-status-success, #10b981)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  )
}
