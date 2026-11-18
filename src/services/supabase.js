import { createClient } from '@supabase/supabase-js'
import { supabaseConfig as config } from './supabaseConfig.js'

// Cliente único do Supabase (SYSTEM_DESIGN §6.3). Importe só por import() dinâmico (ver authLoader.js).
// Sem as variáveis, o app segue funcionando offline (princípio I) e as features online ficam desligadas.

export { isBackendConfigured, readSupabaseConfig } from './supabaseConfig.js'

export const supabase = config
  ? createClient(config.url, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.')
  }
  return supabase
}
