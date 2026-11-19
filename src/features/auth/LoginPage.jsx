import { Turnstile } from '@marsidev/react-turnstile'
import { ArrowLeft } from 'lucide-react'
import { useReducer, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { authService, captchaSiteKey } from '../../services/auth.js'
import { useAuth } from './AuthContext.js'
import {
  initialLoginState,
  loginReducer,
  OTP_LENGTH,
  validateCodeStep,
  validateEmailStep,
} from './loginFlow.js'

function useErrorText() {
  const { t } = useTranslation()
  return {
    invalidEmail: t('auth.error.invalidEmail'),
    captchaPending: t('auth.error.captchaPending'),
    codeFormat: t('auth.error.codeFormat'),
    invalidCode: t('auth.error.invalidCode'),
    rateLimit: t('auth.error.rateLimit'),
    captcha: t('auth.error.captcha'),
    network: t('auth.error.network'),
    generic: t('auth.error.generic'),
  }
}

function Shell({ children }) {
  const { t } = useTranslation()
  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content w-full max-w-md flex-col">
        <h1 className="text-4xl font-bold text-primary">{t('auth.login.title')}</h1>
        {children}
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft aria-hidden="true" /> {t('nav.home')}
        </Link>
      </div>
    </main>
  )
}

export default function LoginPage() {
  const { t } = useTranslation()
  const { status } = useAuth()
  const errorText = useErrorText()
  const [state, dispatch] = useReducer(loginReducer, initialLoginState)
  const captchaRef = useRef(null)

  if (status === 'authenticated') return <Navigate to="/" replace />
  if (status === 'disabled' || !authService) {
    return (
      <Shell>
        <p role="status">{t('auth.login.unavailable')}</p>
      </Shell>
    )
  }

  async function attempt(validation, request) {
    if (validation) {
      dispatch({ type: 'failed', reason: validation })
      return
    }
    dispatch({ type: 'submitted' })
    try {
      await request()
    } catch (error) {
      captchaRef.current?.reset()
      dispatch({ type: 'failed', reason: error.reason ?? 'generic' })
    }
  }

  function handleSendCode(event) {
    event.preventDefault()
    attempt(validateEmailStep(state, Boolean(captchaSiteKey)), async () => {
      await authService.requestOtp(state.email.trim(), state.captchaToken ?? undefined)
      dispatch({ type: 'codeSent' })
    })
  }

  function handleVerify(event) {
    event.preventDefault()
    // Sucesso: o AuthProvider recebe a sessão e o redirecionamento acima leva à home
    attempt(validateCodeStep(state), () => authService.verifyOtp(state.email.trim(), state.code))
  }

  const error = state.error && (
    <p role="alert" className="text-error">
      {errorText[state.error]}
    </p>
  )

  if (state.step === 'code') {
    return (
      <Shell>
        <form onSubmit={handleVerify} className="card w-full bg-base-100 p-6 shadow" noValidate>
          <p>{t('auth.login.codeSent', { email: state.email.trim() })}</p>
          <label className="fieldset">
            <span className="fieldset-legend">{t('auth.login.codeLabel')}</span>
            <input
              className="input input-lg w-full text-center tracking-[0.5em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={state.code}
              onChange={(event) => dispatch({ type: 'codeChanged', code: event.target.value })}
              aria-invalid={Boolean(state.error)}
              autoFocus
            />
          </label>
          {error}
          <button type="submit" className="btn btn-primary mt-4" disabled={state.pending}>
            {state.pending && <span className="loading loading-spinner" aria-hidden="true" />}
            {t('auth.login.verify')}
          </button>
          <button type="button" className="btn btn-link" onClick={() => dispatch({ type: 'back' })}>
            {t('auth.login.resend')}
          </button>
        </form>
      </Shell>
    )
  }

  return (
    <Shell>
      <form onSubmit={handleSendCode} className="card w-full bg-base-100 p-6 shadow" noValidate>
        <p>{t('auth.login.intro')}</p>
        <label className="fieldset">
          <span className="fieldset-legend">{t('auth.login.emailLabel')}</span>
          <input
            type="email"
            className="input w-full"
            autoComplete="email"
            value={state.email}
            onChange={(event) => dispatch({ type: 'emailChanged', email: event.target.value })}
            aria-invalid={Boolean(state.error)}
            autoFocus
          />
        </label>
        {captchaSiteKey && (
          <Turnstile
            ref={captchaRef}
            siteKey={captchaSiteKey}
            options={{ language: 'pt-BR' }}
            onSuccess={(token) => dispatch({ type: 'captchaSolved', token })}
            onExpire={() => dispatch({ type: 'captchaReset' })}
            onError={() => dispatch({ type: 'failed', reason: 'captcha' })}
          />
        )}
        {error}
        <button type="submit" className="btn btn-primary mt-4" disabled={state.pending}>
          {state.pending && <span className="loading loading-spinner" aria-hidden="true" />}
          {t('auth.login.sendCode')}
        </button>
      </form>
    </Shell>
  )
}
