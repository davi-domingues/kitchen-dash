// Único ponto do app que conhece o Sentry (SYSTEM_DESIGN §3 e §7.3)
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g
const REDACTED = '[redacted]'

let sdk = null

export function scrubPii(event) {
  if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined
  if (event.request) {
    delete event.request.cookies
    delete event.request.headers
  }
  return JSON.parse(JSON.stringify(event), (_key, value) =>
    typeof value === 'string' ? value.replace(EMAIL_PATTERN, REDACTED) : value,
  )
}

export function buildOptions(env) {
  return {
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_SENTRY_ENVIRONMENT || env.MODE,
    release: env.VITE_SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    integrations: [],
    beforeSend: scrubPii,
    beforeBreadcrumb: (breadcrumb) => scrubPii(breadcrumb),
  }
}

// O SDK é importado sob demanda para não pesar no JS inicial (SYSTEM_DESIGN §8.5)
export async function initMonitoring(env = import.meta.env, loadSdk = () => import('@sentry/react')) {
  if (!env.VITE_SENTRY_DSN) return false
  sdk = await loadSdk()
  sdk.init(buildOptions(env))
  return true
}

export function captureError(error, context) {
  if (!sdk) return
  sdk.captureException(error, context ? { extra: context } : undefined)
}
