import { createClient } from '@supabase/supabase-js'

// Cliente único do Supabase (SYSTEM_DESIGN §6.3). Só a chave publicável: variáveis VITE_* vão para o bundle.
// Sem as variáveis, o app segue funcionando offline (princípio I) e as features online ficam desligadas.

export function readSupabaseConfig(vars) {
  const url = vars.VITE_SUPABASE_URL?.trim()
  const publishableKey = vars.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!url || !publishableKey) return null
  if (/^sb_secret_/.test(publishableKey) || /service_role/.test(publishableKey)) {
    throw new Error('Chave secreta do Supabase no frontend. Use a chave publicável (sb_publishable_...).')
  }
  return { url, publishableKey }
}

const config = readSupabaseConfig(import.meta.env)

export const isBackendConfigured = config !== null

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
