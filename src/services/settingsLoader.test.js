import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('loadSettingsService', () => {
  it('devolve null sem backend, sem baixar o SDK', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    const { loadSettingsService } = await import('./settingsLoader.js')

    expect(await loadSettingsService()).toBeNull()
  })

  it('carrega o serviço sob demanda quando há backend', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_teste')
    const { loadSettingsService } = await import('./settingsLoader.js')

    const service = await loadSettingsService()

    expect(service).toEqual(
      expect.objectContaining({ fetchSettings: expect.any(Function), saveSettings: expect.any(Function) }),
    )
  })
})
