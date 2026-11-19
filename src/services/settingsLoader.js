import { isBackendConfigured } from './supabaseConfig.js'

// Mesmo padrão do authLoader: o supabase-js só é baixado quando há backend
export function loadSettingsService() {
  if (!isBackendConfigured) return Promise.resolve(null)
  return import('./settingsService.js').then((module) => module.settingsService)
}
