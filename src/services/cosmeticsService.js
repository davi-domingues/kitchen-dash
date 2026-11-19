// Cosméticos da conta (KD-38). Importe só via cosmeticsLoader.js (supabase-js fora do JS inicial).
import { supabase } from './supabase.js'

export class CosmeticsFailure extends Error {
  constructor(cause) {
    super('cosmetics_failed', { cause })
    this.name = 'CosmeticsFailure'
  }
}

async function call(promise) {
  let result
  try {
    result = await promise
  } catch (error) {
    throw new CosmeticsFailure(error)
  }
  if (result.error) throw new CosmeticsFailure(result.error)
  return result.data
}

export function createCosmeticsService(client) {
  return {
    async fetchAccountCosmetics(userId) {
      const [rows, profile] = await Promise.all([
        call(client.from('user_cosmetics').select('cosmetic_id').eq('user_id', userId)),
        call(client.from('profiles').select('equipped').eq('id', userId).maybeSingle()),
      ])
      return { unlocked: rows.map((row) => row.cosmetic_id), equipped: profile?.equipped ?? {} }
    },

    // A RPC recusa item que a conta não possui (42501); escrita direta em profiles.equipped é bloqueada
    async saveEquipped(equipped) {
      return call(client.rpc('set_equipped', { p_equipped: equipped }))
    },
  }
}

export const cosmeticsService = supabase ? createCosmeticsService(supabase) : null
