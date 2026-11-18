// Fluxo da tela de login, puro para ser testado sem React nem rede.
// `error` guarda o motivo da falha (AuthFailure.reason) ou uma validação local.

export const OTP_LENGTH = 6
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_PATTERN = new RegExp(`^\\d{${OTP_LENGTH}}$`)

export const isValidEmail = (email) => EMAIL_PATTERN.test(email.trim())
export const isValidOtp = (code) => OTP_PATTERN.test(code)

export const initialLoginState = {
  step: 'email',
  email: '',
  code: '',
  captchaToken: null,
  pending: false,
  error: null,
}

export function loginReducer(state, action) {
  switch (action.type) {
    case 'emailChanged':
      return { ...state, email: action.email, error: null }
    case 'codeChanged':
      return { ...state, code: action.code.replace(/\D/g, '').slice(0, OTP_LENGTH), error: null }
    case 'captchaSolved':
      return { ...state, captchaToken: action.token }
    case 'captchaReset':
      return { ...state, captchaToken: null }
    case 'submitted':
      return { ...state, pending: true, error: null }
    case 'codeSent':
      return { ...state, step: 'code', pending: false, code: '', captchaToken: null }
    case 'failed':
      // O token do Turnstile é de uso único: depois de uma tentativa no passo do e-mail ele não vale mais
      return {
        ...state,
        pending: false,
        error: action.reason,
        captchaToken: state.step === 'email' ? null : state.captchaToken,
      }
    case 'back':
      return { ...state, step: 'email', code: '', captchaToken: null, error: null }
    default:
      return state
  }
}

// Validação local antes de chamar o servidor; devolve o motivo ou null
export function validateEmailStep({ email, captchaToken }) {
  if (!isValidEmail(email)) return 'invalidEmail'
  if (!captchaToken) return 'captchaPending'
  return null
}

export function validateCodeStep({ code }) {
  return isValidOtp(code) ? null : 'codeFormat'
}
