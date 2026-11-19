import { isBackendConfigured } from './supabaseConfig.js'

// Mesmo padrão do authLoader: o supabase-js só é baixado quando há backend
export function loadCosmeticsService() {
  if (!isBackendConfigured) return Promise.resolve(null)
  return import('./cosmeticsService.js').then((module) => module.cosmeticsService)
}
