import type { ReactNode } from 'react'
import { UserChip, type UserChipProps } from './UserChip.js'

const STYLES_ID = 'zenaigc-miniapp-header-styles'
const STYLES = `
.zmh-header {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border, #242424);
  background: var(--layer-elevated, #111111);
  padding: 16px 20px 14px;
}
.zmh-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.zmh-icon-brand {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
  color: #1a1004;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.zmh-icon-empty {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px dashed var(--border, #242424);
  color: var(--fg-dim, #737373);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.zmh-icon-skel {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--layer-card, #161616);
  animation: zmh-pulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}
.zmh-main {
  flex: 1;
  min-width: 0;
}
.zmh-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.zmh-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.012em;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--foreground, #fafafa);
}
.zmh-badge {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--fg-dim, #737373);
}
.zmh-sub {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 6px;
  row-gap: 4px;
  font-size: 12px;
  color: var(--muted-foreground, #a3a3a3);
}
.zmh-empty-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--muted-foreground, #a3a3a3);
}
.zmh-skel-line {
  background: var(--layer-card, #161616);
  border-radius: 4px;
  animation: zmh-pulse 1.6s ease-in-out infinite;
}
.zmh-skel-line-1 { height: 14px; width: 128px; }
.zmh-skel-line-2 { height: 12px; width: 192px; margin-top: 6px; }
.zmh-userchip { flex-shrink: 0; }
@keyframes zmh-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`

function injectStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLES_ID)) return
  const s = document.createElement('style')
  s.id = STYLES_ID
  s.textContent = STYLES
  document.head.appendChild(s)
}

if (typeof document !== 'undefined') {
  injectStyles()
}

export interface MiniappHeaderProps {
  brandLetter: string
  loaded: boolean
  title?: string | null
  badge?: string | null
  subContent?: ReactNode
  emptyTitle?: string
  emptyDescription?: ReactNode
  emptyIcon?: ReactNode
  userChipProps?: Omit<UserChipProps, 'className'>
}

export function MiniappHeader({
  brandLetter,
  loaded,
  title,
  badge,
  subContent,
  emptyTitle = '新项目',
  emptyDescription,
  emptyIcon,
  userChipProps,
}: MiniappHeaderProps) {
  return (
    <header className="zmh-header">
      <div className="zmh-row">
        {!loaded ? (
          <>
            <div className="zmh-icon-skel" />
            <div className="zmh-main">
              <div className="zmh-skel-line zmh-skel-line-1" />
              <div className="zmh-skel-line zmh-skel-line-2" />
            </div>
          </>
        ) : !title ? (
          <>
            <div className="zmh-icon-empty">
              {emptyIcon ?? <DefaultEmptyIcon />}
            </div>
            <div className="zmh-main">
              <h1 className="zmh-title">{emptyTitle}</h1>
              {emptyDescription !== undefined && emptyDescription !== null && (
                <div className="zmh-empty-desc">{emptyDescription}</div>
              )}
            </div>
            <UserChip className="zmh-userchip" {...userChipProps} />
          </>
        ) : (
          <>
            <div className="zmh-icon-brand">{brandLetter}</div>
            <div className="zmh-main">
              <div className="zmh-title-row">
                <h1 className="zmh-title">{title}</h1>
                {badge && <span className="zmh-badge">{badge}</span>}
              </div>
              {subContent !== undefined && subContent !== null && (
                <div className="zmh-sub">{subContent}</div>
              )}
            </div>
            <UserChip className="zmh-userchip" {...userChipProps} />
          </>
        )}
      </div>
    </header>
  )
}

function DefaultEmptyIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 4h10v8H3z M5 7l3 2 3-2" />
    </svg>
  )
}
