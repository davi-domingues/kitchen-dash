import { supabase } from './supabase.js'

// Login por código no e-mail (ARQUITETURA): features/auth só conhece este módulo, nunca o SDK.

const ERROR_REASONS = {
  otp_expired: 'invalidCode',
  invalid_credentials: 'invalidCode',
  over_email_send_rate_limit: 'rateLimit',
  over_request_rate_limit: 'rateLimit',
  captcha_failed: 'captcha',
  email_address_invalid: 'invalidEmail',
  validation_failed: 'invalidEmail',
}

export class AuthFailure extends Error {
  constructor(reason, cause) {
    super(reason, { cause })
    this.name = 'AuthFailure'
    this.reason = reason
  }
}

export function toAuthFailure(error) {
  if (error?.code && ERROR_REASONS[error.code]) return new AuthFailure(ERROR_REASONS[error.code], error)
  if (error?.status === 429) return new AuthFailure('rateLimit', error)
  if (error?.name === 'AuthRetryableFetchError' || error instanceof TypeError) {
    return new AuthFailure('network', error)
  }
  return new AuthFailure('generic', error)
}

function toUser(user) {
  return user ? { id: user.id, email: user.email } : null
}

export function createAuthService(client) {
  async function call(promise) {
    let result
    try {
      result = await promise
    } catch (error) {
      throw toAuthFailure(error)
    }
    if (result.error) throw toAuthFailure(result.error)
    return result.data
  }

  return {
    async requestOtp(email, captchaToken) {
      await call(client.auth.signInWithOtp({ email, options: { shouldCreateUser: true, captchaToken } }))
    },

    async verifyOtp(email, code) {
      const data = await call(client.auth.verifyOtp({ email, token: code, type: 'email' }))
      return toUser(data.user)
    },

    async signOut() {
      await call(client.auth.signOut())
    },

    async getUser() {
      const data = await call(client.auth.getSession())
      return toUser(data.session?.user)
    },

    onUserChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        callback(toUser(session?.user))
      })
      return () => data.subscription.unsubscribe()
    },
  }
}

// Site key pública do Turnstile; sem ela o widget some (ambiente local com captcha desligado)
export const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || null

export const authService = supabase ? createAuthService(supabase) : null
