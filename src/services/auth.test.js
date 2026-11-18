import { describe, expect, it, vi } from 'vitest'
import { AuthFailure, createAuthService, toAuthFailure } from './auth.js'

const EMAIL = 'jogador@example.com'
const USER = { id: 'u-1', email: EMAIL, app_metadata: {} }

function fakeClient(overrides = {}) {
  const unsubscribe = vi.fn()
  return {
    unsubscribe,
    auth: {
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ data: { user: USER }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null, data: {} }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: USER } }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe } } }),
      ...overrides,
    },
  }
}

describe('createAuthService', () => {
  it('pede o código com o token do captcha', async () => {
    const client = fakeClient()

    await createAuthService(client).requestOtp(EMAIL, 'captcha-token')

    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: { shouldCreateUser: true, captchaToken: 'captcha-token' },
    })
  })

  it('verifica o código como OTP de e-mail e devolve só id e e-mail', async () => {
    const client = fakeClient()

    const user = await createAuthService(client).verifyOtp(EMAIL, '123456')

    expect(client.auth.verifyOtp).toHaveBeenCalledWith({ email: EMAIL, token: '123456', type: 'email' })
    expect(user).toEqual({ id: 'u-1', email: EMAIL })
  })

  it('traduz o erro do Auth em AuthFailure com motivo', async () => {
    const client = fakeClient({
      verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: { code: 'otp_expired' } }),
    })

    await expect(createAuthService(client).verifyOtp(EMAIL, '000000')).rejects.toMatchObject({
      reason: 'invalidCode',
    })
  })

  it('traduz exceção de rede', async () => {
    const client = fakeClient({ signInWithOtp: vi.fn().mockRejectedValue(new TypeError('fetch')) })

    await expect(createAuthService(client).requestOtp(EMAIL, 't')).rejects.toBeInstanceOf(AuthFailure)
  })

  it('lê o usuário da sessão salva ou null', async () => {
    const guest = fakeClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    })

    expect(await createAuthService(fakeClient()).getUser()).toEqual({ id: 'u-1', email: EMAIL })
    expect(await createAuthService(guest).getUser()).toBeNull()
  })

  it('avisa mudanças de usuário e cancela a inscrição', () => {
    const client = fakeClient()
    const callback = vi.fn()

    const stop = createAuthService(client).onUserChange(callback)
    client.auth.onAuthStateChange.mock.calls[0][0]('SIGNED_OUT', null)
    stop()

    expect(callback).toHaveBeenCalledWith(null)
    expect(client.unsubscribe).toHaveBeenCalled()
  })

  it('sai da conta', async () => {
    const client = fakeClient()

    await createAuthService(client).signOut()

    expect(client.auth.signOut).toHaveBeenCalled()
  })
})

describe('toAuthFailure', () => {
  it.each([
    [{ code: 'over_email_send_rate_limit' }, 'rateLimit'],
    [{ status: 429 }, 'rateLimit'],
    [{ code: 'captcha_failed' }, 'captcha'],
    [{ code: 'validation_failed' }, 'invalidEmail'],
    [{ name: 'AuthRetryableFetchError' }, 'network'],
    [{ code: 'unexpected_failure' }, 'generic'],
  ])('mapeia %o para %s', (error, reason) => {
    expect(toAuthFailure(error).reason).toBe(reason)
  })
})
