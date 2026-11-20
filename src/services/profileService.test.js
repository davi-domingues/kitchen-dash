import { describe, expect, it, vi } from 'vitest'
import { createProfileService } from './profileService.js'

const USER_ID = '11111111-1111-1111-1111-111111111111'

// Cliente falso no formato encadeado do supabase-js
function fakeClient({ select = { data: null, error: null }, update = { data: null, error: null } } = {}) {
  const chain = (result) => {
    const promise = Promise.resolve(result)
    return { eq: vi.fn(() => Object.assign(promise, { maybeSingle: () => promise })) }
  }
  const updateFn = vi.fn(() => chain(update))
  return {
    updateFn,
    from: vi.fn(() => ({ select: vi.fn(() => chain(select)), update: updateFn })),
    rpc: vi.fn(async () => ({ data: null, error: null })),
    auth: { signOut: vi.fn(async () => ({ error: null })) },
  }
}

describe('createProfileService', () => {
  it('lê o nome de exibição da conta', async () => {
    const client = fakeClient({ select: { data: { display_name: 'Chef_Ana' }, error: null } })

    const name = await createProfileService(client).fetchDisplayName(USER_ID)

    expect(name).toBe('Chef_Ana')
    expect(client.from).toHaveBeenCalledWith('profiles')
  })

  it('perfil ausente vira null', async () => {
    expect(await createProfileService(fakeClient()).fetchDisplayName(USER_ID)).toBeNull()
  })

  it('grava o nome novo', async () => {
    const client = fakeClient()

    await createProfileService(client).updateDisplayName(USER_ID, 'Chef_Ana')

    expect(client.updateFn).toHaveBeenCalledWith({ display_name: 'Chef_Ana' })
  })

  it.each([
    ['23505', 'taken'],
    ['23514', 'invalid'],
    ['42501', 'generic'],
  ])('erro %s do banco vira motivo %s', async (code, reason) => {
    const client = fakeClient({ update: { data: null, error: { code } } })

    const attempt = createProfileService(client).updateDisplayName(USER_ID, 'Chef_Ana')

    await expect(attempt).rejects.toMatchObject({ name: 'ProfileFailure', reason })
  })

  it('falha de rede vira motivo generic', async () => {
    const client = fakeClient()
    client.rpc = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))

    await expect(createProfileService(client).deleteAccount()).rejects.toMatchObject({
      name: 'ProfileFailure',
      reason: 'generic',
    })
  })

  it('exclui pela RPC e encerra só a sessão local', async () => {
    const client = fakeClient()

    await createProfileService(client).deleteAccount()

    expect(client.rpc).toHaveBeenCalledWith('delete_my_account')
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('não encerra a sessão se a exclusão falhar', async () => {
    const client = fakeClient()
    client.rpc = vi.fn(async () => ({ data: null, error: { code: '42501' } }))

    await expect(createProfileService(client).deleteAccount()).rejects.toMatchObject({ reason: 'generic' })
    expect(client.auth.signOut).not.toHaveBeenCalled()
  })
})
