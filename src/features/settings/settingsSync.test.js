import { describe, expect, it, vi } from 'vitest'
import { pullAccountSettings, pushAccountSettings } from './settingsSync.js'

const USER = { id: '11111111-1111-1111-1111-111111111111', email: 'chef@example.com' }

function memoryStore(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    get: (key, fallback) => (data.has(key) ? data.get(key) : fallback),
    set: (key, v) => data.set(key, v),
  }
}

function deps({ account = {}, fail = false, store = memoryStore() } = {}) {
  const service = {
    fetchSettings: vi.fn(async () => {
      if (fail) throw new Error('offline')
      return account
    }),
    saveSettings: vi.fn(async () => {
      if (fail) throw new Error('offline')
    }),
  }
  return { service, store, loadService: async () => service }
}

describe('pullAccountSettings', () => {
  it('aplica os campos da conta e leva à conta os só locais', async () => {
    const d = deps({
      account: { reduceEffects: true },
      store: memoryStore({ settings: { reduceEffects: false, keyBindings: { p1: {} } } }),
    })

    const ok = await pullAccountSettings(USER.id, d)

    expect(ok).toBe(true)
    expect(d.store.get('settings')).toEqual({ reduceEffects: true, keyBindings: { p1: {} } })
    expect(d.service.saveSettings).toHaveBeenCalledWith(USER.id, {
      reduceEffects: true,
      keyBindings: { p1: {} },
    })
  })

  it('não grava na conta quando ela já tem todos os campos', async () => {
    const d = deps({
      account: { reduceEffects: true },
      store: memoryStore({ settings: { reduceEffects: false } }),
    })

    await pullAccountSettings(USER.id, d)

    expect(d.service.saveSettings).not.toHaveBeenCalled()
  })

  it('falha remota mantém o local intacto', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const d = deps({ fail: true, store: memoryStore({ settings: { reduceEffects: false } }) })

    expect(await pullAccountSettings(USER.id, d)).toBe(false)
    expect(d.store.get('settings')).toEqual({ reduceEffects: false })
  })

  it('sem backend não faz nada', async () => {
    expect(await pullAccountSettings(USER.id, { loadService: async () => null, store: memoryStore() })).toBe(
      false,
    )
  })
})

describe('pushAccountSettings', () => {
  it('envia o objeto local inteiro', async () => {
    const d = deps({ store: memoryStore({ settings: { reduceEffects: true } }) })

    expect(await pushAccountSettings(USER, d)).toBe(true)
    expect(d.service.saveSettings).toHaveBeenCalledWith(USER.id, { reduceEffects: true })
  })

  it('sem sessão não envia', async () => {
    const d = deps()

    expect(await pushAccountSettings(null, d)).toBe(false)
    expect(d.service.saveSettings).not.toHaveBeenCalled()
  })

  it('falha remota devolve false sem lançar', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(await pushAccountSettings(USER, deps({ fail: true }))).toBe(false)
  })
})
