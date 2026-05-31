import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks.js'

const STYLES_ID = 'zenaigc-signin-styles'
const STYLES = `
.zauth-shell {
  font-family: -apple-system, "SF Pro Display", "Inter", system-ui, sans-serif;
  background: var(--background, #0a0a0a);
  color: var(--foreground, #fafafa);
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.zauth-card {
  width: 100%;
  max-width: 380px;
  background: var(--card, #161616);
  border: 1px solid var(--border, #242424);
  border-radius: var(--radius, 12px);
  padding: 28px 26px 22px;
}
.zauth-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted-foreground, #a3a3a3);
  letter-spacing: -0.005em;
  margin-bottom: 24px;
}
.zauth-brand-dot {
  width: 7px;
  height: 7px;
  background: var(--primary, #f59e0b);
  border-radius: 999px;
}
.zauth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--accent, rgba(255,255,255,0.06));
  padding: 3px;
  border-radius: 9px;
  margin-bottom: 24px;
}
.zauth-tab {
  padding: 7px 0;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted-foreground, #a3a3a3);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  font-family: inherit;
}
.zauth-tab.active {
  background: var(--card, #161616);
  color: var(--foreground, #fafafa);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.15);
}
.zauth-title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}
.zauth-subtitle {
  font-size: 13px;
  color: var(--muted-foreground, #a3a3a3);
  margin: 0 0 20px;
}
.zauth-oauth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--card, #161616);
  color: var(--foreground, #fafafa);
  border: 1px solid var(--border, #242424);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
}
.zauth-oauth-btn:hover:not(:disabled) {
  background: var(--accent, rgba(255,255,255,0.06));
}
.zauth-oauth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.zauth-oauth-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.zauth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  color: var(--muted-foreground, #a3a3a3);
  font-size: 12px;
}
.zauth-divider::before, .zauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border, #242424);
}
.zauth-field {
  margin-bottom: 12px;
}
.zauth-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--foreground, #fafafa);
}
.zauth-field label .zauth-opt {
  color: var(--muted-foreground, #a3a3a3);
  font-weight: 400;
  margin-left: 4px;
}
.zauth-field input {
  width: 100%;
  padding: 9px 12px;
  background: transparent;
  color: var(--foreground, #fafafa);
  border: 1px solid var(--border, #242424);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.zauth-field input:focus {
  outline: none;
  border-color: var(--ring, #f59e0b);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring, #f59e0b) 22%, transparent);
}
.zauth-field input::placeholder {
  color: var(--muted-foreground, #a3a3a3);
}
.zauth-error {
  color: var(--destructive, #ef4444);
  font-size: 12px;
  margin-top: 4px;
  min-height: 14px;
}
.zauth-form-error {
  color: var(--destructive, #ef4444);
  font-size: 12px;
  text-align: center;
  margin: 8px 0 4px;
  min-height: 14px;
}
.zauth-submit {
  width: 100%;
  padding: 10px 14px;
  background: var(--primary, #f59e0b);
  color: var(--primary-foreground, #1a1004);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: opacity 0.15s;
  font-family: inherit;
}
.zauth-submit:hover:not(:disabled) { opacity: 0.92; }
.zauth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.zauth-forgot {
  display: block;
  margin: 0 0 12px auto;
  font-size: 12px;
  color: var(--muted-foreground, #a3a3a3);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}
.zauth-forgot:hover { color: var(--foreground, #fafafa); }
.zauth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--muted-foreground, #a3a3a3);
}
.zauth-footer a {
  color: var(--foreground, #fafafa);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.zauth-device-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}
.zauth-device-card {
  width: 100%;
  max-width: 360px;
  background: var(--card, #161616);
  border: 1px solid var(--border, #242424);
  border-radius: var(--radius, 12px);
  padding: 24px;
  text-align: center;
}
.zauth-device-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
}
.zauth-device-sub {
  font-size: 13px;
  color: var(--muted-foreground, #a3a3a3);
  margin: 0 0 16px;
}
.zauth-device-code {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.15em;
  background: var(--accent, rgba(255,255,255,0.06));
  padding: 12px 16px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 16px;
}
.zauth-device-link {
  display: block;
  font-size: 12px;
  color: var(--muted-foreground, #a3a3a3);
  margin-bottom: 16px;
  word-break: break-all;
}
.zauth-device-cancel {
  background: transparent;
  color: var(--muted-foreground, #a3a3a3);
  border: 1px solid var(--border, #242424);
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.zauth-device-cancel:hover { color: var(--foreground, #fafafa); }
.zauth-hidden { display: none !important; }
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

type Mode = 'signup' | 'signin'

interface DeviceInfo {
  user_code: string
  verification_uri: string
  expires_in: number
}

export interface SignInPanelProps {
  brand?: string
  appName?: string
}

export function SignInPanel({ brand = 'zenaigc', appName }: SignInPanelProps) {
  const { login, register, requestPasswordReset, confirmPasswordReset, loginWithDevice } = useAuth()
  const [mode, setMode] = useState<Mode>('signup')
  const [view, setView] = useState<'auth' | 'forgot' | 'reset'>('auth')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [device, setDevice] = useState<DeviceInfo | null>(null)
  const [deviceBusy, setDeviceBusy] = useState(false)
  const deviceAbortRef = useRef<AbortController | null>(null)
  // 密码重置流程 state
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)

  useEffect(() => {
    setEmailError('')
    setPasswordError('')
    setFormError('')
    setSuccessMsg('')
  }, [mode])

  async function onForgotSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setResetError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetError('邮箱格式不正确')
      return
    }
    setResetSubmitting(true)
    try {
      await requestPasswordReset(resetEmail.trim())
      setResetMsg(`重置码已发送至 ${resetEmail.trim()}（若该邮箱已注册）。请查收邮件并复制重置码。`)
      setView('reset')
    } catch (err) {
      setResetError((err as { message?: string }).message || '发送失败，请稍后重试')
    } finally {
      setResetSubmitting(false)
    }
  }

  async function onResetSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setResetError('')
    if (!resetCode.trim()) {
      setResetError('请粘贴邮件中的重置码')
      return
    }
    if (resetNewPassword.length < 8) {
      setResetError('新密码至少 8 位')
      return
    }
    setResetSubmitting(true)
    try {
      await confirmPasswordReset(resetCode.trim(), resetNewPassword)
      setView('auth')
      setMode('signin')
      setResetCode('')
      setResetNewPassword('')
      setResetMsg('')
      setSuccessMsg('✓ 密码已重置，请用新密码登录')
    } catch (err) {
      setResetError((err as { message?: string }).message || '重置码无效或已过期，请重新发起')
    } finally {
      setResetSubmitting(false)
    }
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setEmailError('')
    setPasswordError('')
    setFormError('')

    let valid = true
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('邮箱格式不正确')
      valid = false
    }
    if (mode === 'signup' && password.length < 8) {
      setPasswordError('密码至少 8 位')
      valid = false
    } else if (!password) {
      setPasswordError('请输入密码')
      valid = false
    }
    if (!valid) return

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await register(email.trim(), password, displayName.trim() || undefined)
      } else {
        await login(email.trim(), password)
      }
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'EMAIL_TAKEN_OAUTH' || e.code === 'email_taken_oauth') {
        setEmailError('该邮箱已用 Google 注册，请用上方 Google 登录')
      } else if (e.code === 'EMAIL_TAKEN' || e.code === 'email_taken') {
        setEmailError('该邮箱已注册，请切换到"登录"')
      } else if (e.code === 'INVALID_CREDENTIALS' || e.code === 'invalid_credentials') {
        setFormError('邮箱或密码不正确')
      } else if (e.code === 'network_error') {
        setFormError('网络连接失败，请稍后重试')
      } else {
        setFormError(e.message || '操作失败，请稍后重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function onGoogle() {
    setFormError('')
    setDeviceBusy(true)
    setDevice(null)
    const ac = new AbortController()
    deviceAbortRef.current = ac
    try {
      await loginWithDevice(
        (info) => {
          setDevice(info)
          const sys = (window as { superone?: { openExternalLink?: (u: string) => void } }).superone
          if (sys?.openExternalLink) {
            sys.openExternalLink(info.verification_uri)
          } else {
            window.open(info.verification_uri, '_blank', 'noopener,noreferrer')
          }
        },
        { signal: ac.signal }
      )
      setDevice(null)
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code !== 'device_cancelled') {
        setFormError(e.message || 'Google 登录失败')
      }
      setDevice(null)
    } finally {
      setDeviceBusy(false)
      deviceAbortRef.current = null
    }
  }

  function cancelDevice() {
    deviceAbortRef.current?.abort()
  }

  const title = mode === 'signup' ? '创建账户' : '欢迎回来'
  const subtitle =
    mode === 'signup'
      ? '注册即获 Free 套餐 · 100 credits 起步'
      : `使用你的 ${brand} 账户登录`
  const googleLabel = mode === 'signup' ? '使用 Google 继续' : '使用 Google 登录'
  const submitLabel = submitting
    ? mode === 'signup' ? '创建中…' : '登录中…'
    : mode === 'signup' ? '创建账户' : '登录'

  if (view === 'forgot' || view === 'reset') {
    return (
      <div className="zauth-shell">
        <div className="zauth-card">
          <div className="zauth-brand">
            <span className="zauth-brand-dot" />
            <span>{brand}</span>
            {appName && <span style={{ marginLeft: 'auto', fontWeight: 400 }}>{appName}</span>}
          </div>
          {view === 'forgot' ? (
            <>
              <h1 className="zauth-title">重置密码</h1>
              <p className="zauth-subtitle">输入注册邮箱，我们会把重置码发到你的邮箱</p>
              <form onSubmit={onForgotSubmit} noValidate>
                <div className="zauth-field">
                  <label htmlFor="zauth-forgot-email">邮箱</label>
                  <input
                    id="zauth-forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength={254}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  <div className="zauth-error">{resetError}</div>
                </div>
                <button className="zauth-submit" type="button" onClick={() => onForgotSubmit()} disabled={resetSubmitting}>
                  {resetSubmitting ? '发送中…' : '发送重置码'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="zauth-title">设置新密码</h1>
              <p className="zauth-subtitle">{resetMsg || '粘贴邮件里的重置码并设置新密码'}</p>
              <form onSubmit={onResetSubmit} noValidate>
                <div className="zauth-field">
                  <label htmlFor="zauth-reset-code">重置码</label>
                  <input
                    id="zauth-reset-code"
                    type="text"
                    placeholder="粘贴邮件中的重置码"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                  />
                </div>
                <div className="zauth-field">
                  <label htmlFor="zauth-reset-pw">新密码</label>
                  <input
                    id="zauth-reset-pw"
                    type="password"
                    autoComplete="new-password"
                    placeholder="至少 8 位"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                  />
                  <div className="zauth-error">{resetError}</div>
                </div>
                <button className="zauth-submit" type="button" onClick={() => onResetSubmit()} disabled={resetSubmitting}>
                  {resetSubmitting ? '提交中…' : '重置密码'}
                </button>
              </form>
            </>
          )}
          <p className="zauth-footer">
            <a
              onClick={() => {
                setView('auth')
                setResetError('')
              }}
            >
              ← 返回登录
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="zauth-shell">
      <div className="zauth-card">
        <div className="zauth-brand">
          <span className="zauth-brand-dot" />
          <span>{brand}</span>
          {appName && <span style={{ marginLeft: 'auto', fontWeight: 400 }}>{appName}</span>}
        </div>

        <div className="zauth-tabs" role="tablist">
          <button
            className={`zauth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => setMode('signup')}
            type="button"
            role="tab"
          >
            注册
          </button>
          <button
            className={`zauth-tab${mode === 'signin' ? ' active' : ''}`}
            onClick={() => setMode('signin')}
            type="button"
            role="tab"
          >
            登录
          </button>
        </div>

        <h1 className="zauth-title">{title}</h1>
        <p className="zauth-subtitle">{subtitle}</p>

        <button
          className="zauth-oauth-btn"
          onClick={onGoogle}
          type="button"
          disabled={deviceBusy || submitting}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.43 3.44 1.18 4.93l3.66-2.83z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          <span>{deviceBusy ? '正在打开浏览器…' : googleLabel}</span>
        </button>

        <div className="zauth-divider"><span>或</span></div>

        <form onSubmit={onSubmit} noValidate>
          {mode === 'signup' && (
            <div className="zauth-field">
              <label htmlFor="zauth-displayname">
                昵称<span className="zauth-opt">(可选)</span>
              </label>
              <input
                id="zauth-displayname"
                type="text"
                placeholder="你想被叫什么？"
                maxLength={64}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div className="zauth-field">
            <label htmlFor="zauth-email">邮箱</label>
            <input
              id="zauth-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="zauth-error">{emailError}</div>
          </div>

          <div className="zauth-field">
            <label htmlFor="zauth-password">密码</label>
            <input
              id="zauth-password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder={mode === 'signup' ? '至少 8 位' : '输入密码'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="zauth-error">{passwordError}</div>
          </div>

          {mode === 'signin' && (
            <button
              type="button"
              className="zauth-forgot"
              onClick={() => {
                setResetEmail(email.trim())
                setResetError('')
                setResetMsg('')
                setView('forgot')
              }}
            >
              忘记密码？
            </button>
          )}

          <button className="zauth-submit" type="button" onClick={() => onSubmit()} disabled={submitting || deviceBusy}>
            {submitLabel}
          </button>

          {formError && <div className="zauth-form-error">{formError}</div>}
          {successMsg && (
            <div className="zauth-form-error" style={{ color: 'var(--primary, #16a34a)' }}>
              {successMsg}
            </div>
          )}
        </form>

        <p className="zauth-footer">
          继续即表示同意我们的 <a>服务条款</a> 与 <a>隐私政策</a>
        </p>
      </div>

      {device && (
        <div className="zauth-device-modal" role="dialog" aria-modal="true">
          <div className="zauth-device-card">
            <h2 className="zauth-device-title">前往浏览器完成 Google 登录</h2>
            <p className="zauth-device-sub">在浏览器里输入下面的验证码：</p>
            <div className="zauth-device-code">{device.user_code}</div>
            <div className="zauth-device-link">{device.verification_uri}</div>
            <button className="zauth-device-cancel" onClick={cancelDevice} type="button">
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
