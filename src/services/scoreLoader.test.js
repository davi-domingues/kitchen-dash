import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('loadScoreService', () => {
  it('devolve null sem backend, sem baixar o SDK', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    const { loadScoreService } = await import('./scoreLoader.js')

    expect(await loadScoreService()).toBeNull()
  })

  it('carrega o serviço sob demanda quando há backend', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_teste')
    const { loadScoreService } = await import('./scoreLoader.js')

    const service = await loadScoreService()

    expect(service).toEqual(expect.objectContaining({ submitScore: expect.any(Function) }))
  })
})
