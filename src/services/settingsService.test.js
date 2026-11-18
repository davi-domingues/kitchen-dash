import { describe, expect, it, vi } from 'vitest'
import { SettingsFailure, createSettingsService } from './settingsService.js'

const USER_ID = '11111111-1111-1111-1111-111111111111'

// Cliente falso no formato encadeado do supabase-js
function fakeClient({ row = null, error = null, updateResult = { data: null, error: null } } = {}) {
  const eqUpdate = vi.fn(async () => updateResult)
  const update = vi.fn(() => ({ eq: eqUpdate }))
  const select = vi.fn(() => ({
    eq: vi.fn(() => ({ maybeSingle: async () => ({ data: row, error }) })),
  }))
  return { client: { from: vi.fn(() => ({ select, update })) }, update, eqUpdate }
}

describe('createSettingsService', () => {
  it('lê as configurações da própria linha', async () => {
    const { client } = fakeClient({ row: { settings: { keyBindings: { pause: 'KeyP' } } } })

    const result = await createSettingsService(client).fetchSettings(USER_ID)

    expect(result).toEqual({ keyBindings: { pause: 'KeyP' } })
    expect(client.from).toHaveBeenCalledWith('user_settings')
  })

  it('settings inválido vira objeto vazio', async () => {
    const { client } = fakeClient({ row: { settings: null } })

    expect(await createSettingsService(client).fetchSettings(USER_ID)).toEqual({})
  })

  it('atualiza só a coluna settings da linha do usuário', async () => {
    const { client, update, eqUpdate } = fakeClient()

    await createSettingsService(client).saveSettings(USER_ID, { a: 1 })

    expect(update).toHaveBeenCalledWith({ settings: { a: 1 } })
    expect(eqUpdate).toHaveBeenCalledWith('user_id', USER_ID)
  })

  it('erro do servidor vira SettingsFailure', async () => {
    const { client } = fakeClient({ error: { code: '42501' } })

    await expect(createSettingsService(client).fetchSettings(USER_ID)).rejects.toBeInstanceOf(SettingsFailure)
  })

  it('erro de rede vira SettingsFailure', async () => {
    const client = {
      from: () => ({ update: () => ({ eq: () => Promise.reject(new Error('offline')) }) }),
    }

    await expect(createSettingsService(client).saveSettings(USER_ID, {})).rejects.toBeInstanceOf(
      SettingsFailure,
    )
  })
})
