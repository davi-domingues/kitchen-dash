import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('loadCosmeticsService', () => {
  it('devolve null sem backend, sem baixar o SDK', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    const { loadCosmeticsService } = await import('./cosmeticsLoader.js')

    expect(await loadCosmeticsService()).toBeNull()
  })

  it('carrega o serviço sob demanda quando há backend', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_teste')
    const { loadCosmeticsService } = await import('./cosmeticsLoader.js')

    const service = await loadCosmeticsService()

    expect(service).toEqual(
      expect.objectContaining({
        fetchAccountCosmetics: expect.any(Function),
        saveEquipped: expect.any(Function),
      }),
    )
  })
})
