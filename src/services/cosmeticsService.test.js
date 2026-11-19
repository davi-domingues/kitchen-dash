import { describe, expect, it, vi } from 'vitest'
import { CosmeticsFailure, createCosmeticsService } from './cosmeticsService.js'

const USER_ID = '11111111-1111-1111-1111-111111111111'

// Cliente falso no formato encadeado do supabase-js: from().select().eq()[.maybeSingle()]
function fakeClient({ rows = [], profile = null, rpc = { data: null, error: null } } = {}) {
  const query = (result) => {
    const promise = Promise.resolve(result)
    return { eq: vi.fn(() => Object.assign(promise, { maybeSingle: () => promise })) }
  }
  return {
    from: vi.fn((table) => ({
      select: vi.fn(() =>
        table === 'user_cosmetics'
          ? query({ data: rows, error: null })
          : query({ data: profile, error: null }),
      ),
    })),
    rpc: vi.fn(async () => rpc),
  }
}

describe('createCosmeticsService', () => {
  it('lê os itens e o equipado da conta', async () => {
    const client = fakeClient({
      rows: [{ cosmetic_id: 'hat_navy' }],
      profile: { equipped: { hat: 'hat_navy' } },
    })

    const result = await createCosmeticsService(client).fetchAccountCosmetics(USER_ID)

    expect(result).toEqual({ unlocked: ['hat_navy'], equipped: { hat: 'hat_navy' } })
    expect(client.from).toHaveBeenCalledWith('user_cosmetics')
    expect(client.from).toHaveBeenCalledWith('profiles')
  })

  it('perfil ausente vira equipado vazio', async () => {
    const result = await createCosmeticsService(fakeClient()).fetchAccountCosmetics(USER_ID)

    expect(result).toEqual({ unlocked: [], equipped: {} })
  })

  it('grava o equipado pela RPC set_equipped', async () => {
    const equipped = { hat: 'hat_navy' }
    const client = fakeClient({ rpc: { data: equipped, error: null } })

    const result = await createCosmeticsService(client).saveEquipped(equipped)

    expect(client.rpc).toHaveBeenCalledWith('set_equipped', { p_equipped: equipped })
    expect(result).toEqual(equipped)
  })

  it('erro da RPC ou da rede vira CosmeticsFailure', async () => {
    const refused = fakeClient({ rpc: { data: null, error: { code: '42501' } } })
    const offline = { rpc: vi.fn(async () => Promise.reject(new TypeError('offline'))) }

    await expect(createCosmeticsService(refused).saveEquipped({})).rejects.toBeInstanceOf(CosmeticsFailure)
    await expect(createCosmeticsService(offline).saveEquipped({})).rejects.toBeInstanceOf(CosmeticsFailure)
  })
})
