// Perfil da conta (KD-34). Importe só via profileLoader.js (supabase-js fora do JS inicial).
import { supabase } from './supabase.js'

// Códigos do Postgres repassados pelo PostgREST: unique_violation e check_violation
const REASONS = { 23505: 'taken', 23514: 'invalid' }

export class ProfileFailure extends Error {
  constructor(reason, cause) {
    super(reason, { cause })
    this.name = 'ProfileFailure'
    this.reason = reason
  }
}

async function call(promise) {
  let result
  try {
    result = await promise
  } catch (error) {
    throw new ProfileFailure('generic', error)
  }
  if (result.error) throw new ProfileFailure(REASONS[result.error.code] ?? 'generic', result.error)
  return result.data
}

export function createProfileService(client) {
  return {
    async fetchDisplayName(userId) {
      const row = await call(client.from('profiles').select('display_name').eq('id', userId).maybeSingle())
      return row?.display_name ?? null
    },

    // O banco é a autoridade do formato e da unicidade; a RLS limita à própria linha
    async updateDisplayName(userId, displayName) {
      await call(client.from('profiles').update({ display_name: displayName }).eq('id', userId))
    },

    // O usuário deixa de existir na RPC, então o logout é só local (o global falharia no servidor)
    async deleteAccount() {
      await call(client.rpc('delete_my_account'))
      await call(client.auth.signOut({ scope: 'local' }))
    },
  }
}

export const profileService = supabase ? createProfileService(supabase) : null
