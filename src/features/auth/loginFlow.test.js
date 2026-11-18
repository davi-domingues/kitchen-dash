import { describe, expect, it } from 'vitest'
import {
  initialLoginState,
  isValidEmail,
  isValidOtp,
  loginReducer,
  validateCodeStep,
  validateEmailStep,
} from './loginFlow.js'

const run = (actions, state = initialLoginState) => actions.reduce(loginReducer, state)

describe('validações', () => {
  it.each([
    ['jogador@example.com', true],
    ['  jogador@example.com ', true],
    ['jogador@', false],
    ['sem arroba.com', false],
  ])('e-mail %s → %s', (email, valid) => {
    expect(isValidEmail(email)).toBe(valid)
  })

  it.each([
    ['123456', true],
    ['12345', false],
    ['12a456', false],
  ])('código %s → %s', (code, valid) => {
    expect(isValidOtp(code)).toBe(valid)
  })

  it('exige e-mail válido e captcha resolvido', () => {
    expect(validateEmailStep({ email: 'x', captchaToken: 't' })).toBe('invalidEmail')
    expect(validateEmailStep({ email: 'jogador@example.com', captchaToken: null })).toBe('captchaPending')
    expect(validateEmailStep({ email: 'jogador@example.com', captchaToken: 't' })).toBeNull()
  })

  it('exige 6 dígitos no código', () => {
    expect(validateCodeStep({ code: '123' })).toBe('codeFormat')
    expect(validateCodeStep({ code: '123456' })).toBeNull()
  })
})

describe('loginReducer', () => {
  it('vai para o passo do código após o envio e descarta o captcha usado', () => {
    const state = run([
      { type: 'emailChanged', email: 'jogador@example.com' },
      { type: 'captchaSolved', token: 't' },
      { type: 'submitted' },
      { type: 'codeSent' },
    ])

    expect(state).toMatchObject({
      step: 'code',
      pending: false,
      captchaToken: null,
      email: 'jogador@example.com',
    })
  })

  it('mantém só dígitos no código, até 6', () => {
    expect(run([{ type: 'codeChanged', code: '12a3 4567' }]).code).toBe('123456')
  })

  it('falha no passo do e-mail zera o captcha e guarda o motivo', () => {
    const state = run([
      { type: 'captchaSolved', token: 't' },
      { type: 'submitted' },
      { type: 'failed', reason: 'rateLimit' },
    ])

    expect(state).toMatchObject({ pending: false, error: 'rateLimit', captchaToken: null })
  })

  it('falha no passo do código mantém o passo e o e-mail', () => {
    const state = run(
      [{ type: 'codeSent' }, { type: 'submitted' }, { type: 'failed', reason: 'invalidCode' }],
      {
        ...initialLoginState,
        email: 'jogador@example.com',
      },
    )

    expect(state).toMatchObject({ step: 'code', error: 'invalidCode', email: 'jogador@example.com' })
  })

  it('voltar pede um novo código sem perder o e-mail', () => {
    const state = run([
      { type: 'emailChanged', email: 'jogador@example.com' },
      { type: 'codeSent' },
      { type: 'back' },
    ])

    expect(state).toMatchObject({ step: 'email', email: 'jogador@example.com', code: '', error: null })
  })

  it('editar o campo limpa o erro; ação desconhecida não muda nada', () => {
    const failed = run([{ type: 'failed', reason: 'invalidEmail' }])

    expect(loginReducer(failed, { type: 'emailChanged', email: 'a' }).error).toBeNull()
    expect(loginReducer(failed, { type: 'captchaReset' }).captchaToken).toBeNull()
    expect(loginReducer(failed, { type: '???' })).toBe(failed)
  })
})
