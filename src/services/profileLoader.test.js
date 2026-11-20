import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('loadProfileService', () => {
  it('devolve null sem backend, sem baixar o SDK', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    const { loadProfileService } = await import('./profileLoader.js')

    expect(await loadProfileService()).toBeNull()
  })

  it('carrega o serviço sob demanda quando há backend', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_teste')
    const { loadProfileService } = await import('./profileLoader.js')

    const service = await loadProfileService()

    expect(service).toEqual(
      expect.objectContaining({
        fetchDisplayName: expect.any(Function),
        updateDisplayName: expect.any(Function),
        deleteAccount: expect.any(Function),
      }),
    )
  })
})
