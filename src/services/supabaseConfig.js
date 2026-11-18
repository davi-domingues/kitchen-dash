// Config do Supabase sem importar o SDK: o app sabe se há backend sem baixar o supabase-js
// no JS inicial (SYSTEM_DESIGN §8.5). Só a chave publicável: variáveis VITE_* vão para o bundle.

export function readSupabaseConfig(vars) {
  const url = vars.VITE_SUPABASE_URL?.trim()
  const publishableKey = vars.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!url || !publishableKey) return null
  if (/^sb_secret_/.test(publishableKey) || /service_role/.test(publishableKey)) {
    throw new Error('Chave secreta do Supabase no frontend. Use a chave publicável (sb_publishable_...).')
  }
  return { url, publishableKey }
}

export const supabaseConfig = readSupabaseConfig(import.meta.env)

export const isBackendConfigured = supabaseConfig !== null
