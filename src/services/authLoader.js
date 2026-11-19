import { isBackendConfigured } from './supabaseConfig.js'

// O supabase-js só é baixado quando há backend; o visitante offline não paga esse peso no JS inicial
export function loadAuthService() {
  if (!isBackendConfigured) return Promise.resolve(null)
  return import('./auth.js').then((module) => module.authService)
}
