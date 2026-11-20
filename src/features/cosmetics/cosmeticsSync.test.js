import { afterEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from '../../services/storage.js'
import { equipCosmetic, equipCosmeticP2, loadCosmetics, mergeUnlockedCosmetics } from './cosmeticsStore.js'
import { equipAndSync, equippedOutboxFor, pullAccountCosmetics, pushEquipped } from './cosmeticsSync.js'

const USER = { id: '11111111-1111-1111-1111-111111111111', email: 'ana@example.com' }

function memoryStore() {
  const map = new Map()
  return createStorage({
    backend: {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, v),
      removeItem: (k) => map.delete(k),
    },
  })
}

function deps(service) {
  return { store: memoryStore(), loadService: vi.fn(async () => service) }
}

afterEach(() => vi.restoreAllMocks())

describe('pullAccountCosmetics', () => {
  it('une os itens da conta e restaura o equipado', async () => {
    const service = {
      fetchAccountCosmetics: vi.fn(async () => ({ unlocked: ['hat_navy'], equipped: { hat: 'hat_navy' } })),
    }
    const d = deps(service)
    mergeUnlockedCosmetics(['apron_herbs'], d.store)

    const state = await pullAccountCosmetics(USER.id, d)

    expect(service.fetchAccountCosmetics).toHaveBeenCalledWith(USER.id)
    expect(state.unlocked).toEqual(expect.arrayContaining(['hat_navy', 'apron_herbs']))
    expect(loadCosmetics(d.store).equipped.hat).toBe('hat_navy')
  })

  it('visitante ou sem backend não chama o servidor', async () => {
    const d = deps(null)

    expect(await pullAccountCosmetics(null, d)).toBeNull()
    expect(d.loadService).not.toHaveBeenCalled()
    expect(await pullAccountCosmetics(USER.id, d)).toBeNull()
  })

  it('falha remota mantém o local', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const d = deps({ fetchAccountCosmetics: vi.fn(async () => Promise.reject(new Error('offline'))) })
    mergeUnlockedCosmetics(['hat_navy'], d.store)

    expect(await pullAccountCosmetics(USER.id, d)).toBeNull()
    expect(loadCosmetics(d.store).unlocked).toContain('hat_navy')
  })
})

describe('equipAndSync com reenvio (#74)', () => {
  it('falha ao gravar agenda o reenvio do último equipado', async () => {
    let time = 0
    const timers = []
    const service = {
      saveEquipped: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({}),
    }
    const d = {
      ...deps(service),
      now: () => time,
      rng: () => 0.5,
      setTimer: (fn, ms) => timers.push({ fn, at: time + ms }),
      clearTimer: () => {},
    }
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mergeUnlockedCosmetics(['hat_navy'], d.store)

    equipAndSync('hat_navy', USER, d)
    await vi.waitFor(() => expect(equippedOutboxFor(d).isPending(USER.id)).toBe(true))
    await vi.waitFor(() => expect(timers).toHaveLength(1))
    time = timers[0].at
    await timers[0].fn()

    expect(service.saveEquipped).toHaveBeenCalledTimes(2)
    expect(service.saveEquipped).toHaveBeenLastCalledWith(expect.objectContaining({ hat: 'hat_navy' }))
    expect(equippedOutboxFor(d).isPending(USER.id)).toBe(false)
  })
})

describe('pushEquipped e equipAndSync', () => {
  it('equipa local e envia o equipado para a conta', async () => {
    const service = { saveEquipped: vi.fn(async (e) => e) }
    const d = deps(service)
    mergeUnlockedCosmetics(['hat_navy'], d.store)

    const state = equipAndSync('hat_navy', USER, d)
    await vi.waitFor(() => expect(service.saveEquipped).toHaveBeenCalled())

    expect(state.equipped.hat).toBe('hat_navy')
    expect(service.saveEquipped).toHaveBeenCalledWith(expect.objectContaining({ hat: 'hat_navy' }))
  })

  it('envia só o equipado do P1, nunca o do P2', async () => {
    const service = { saveEquipped: vi.fn(async (e) => e) }
    const d = deps(service)
    mergeUnlockedCosmetics(['hat_navy'], d.store)
    equipCosmeticP2('hat_navy', d.store)

    await pushEquipped(USER, d)

    expect(service.saveEquipped).toHaveBeenCalledWith({
      hat: 'hat_classic',
      apron: 'apron_cream',
      theme: 'theme_bistro',
    })
  })

  it('visitante equipa só no local', async () => {
    const d = deps({ saveEquipped: vi.fn() })

    expect(await pushEquipped(null, d)).toBe(false)
    expect(d.loadService).not.toHaveBeenCalled()
  })

  it('recusa do servidor não desfaz a escolha local', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const d = deps({ saveEquipped: vi.fn(async () => Promise.reject(new Error('42501'))) })
    mergeUnlockedCosmetics(['hat_navy'], d.store)
    equipCosmetic('hat_navy', d.store)

    expect(await pushEquipped(USER, d)).toBe(false)
    expect(loadCosmetics(d.store).equipped.hat).toBe('hat_navy')
  })

  it('sem backend devolve false', async () => {
    expect(await pushEquipped(USER, deps(null))).toBe(false)
  })
})
