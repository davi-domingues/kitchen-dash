import { describe, expect, it } from 'vitest'
import { readSupabaseConfig } from './supabase.js'

describe('readSupabaseConfig', () => {
  it('devolve null sem as variáveis (o app segue offline)', () => {
    expect(readSupabaseConfig({})).toBeNull()
    expect(readSupabaseConfig({ VITE_SUPABASE_URL: 'https://x.supabase.co' })).toBeNull()
  })

  it('lê a URL e a chave publicável', () => {
    const config = readSupabaseConfig({
      VITE_SUPABASE_URL: ' https://x.supabase.co ',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_abc',
    })

    expect(config).toEqual({ url: 'https://x.supabase.co', publishableKey: 'sb_publishable_abc' })
  })

  it('recusa chave secreta no frontend', () => {
    const vars = {
      VITE_SUPABASE_URL: 'https://x.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_abc',
    }

    expect(() => readSupabaseConfig(vars)).toThrow(/chave secreta/i)
  })
})
