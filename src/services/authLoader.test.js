import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('loadAuthService', () => {
  it('devolve null sem backend, sem baixar o SDK', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    const { loadAuthService } = await import('./authLoader.js')

    expect(await loadAuthService()).toBeNull()
  })

  it('carrega o serviço sob demanda quando há backend', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_teste')
    const { loadAuthService } = await import('./authLoader.js')

    const service = await loadAuthService()

    expect(service).toEqual(expect.objectContaining({ requestOtp: expect.any(Function) }))
  })
})
