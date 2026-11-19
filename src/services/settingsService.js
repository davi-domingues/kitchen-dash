// Configurações da conta em `user_settings` (KD-30). Importe só via settingsLoader.js (supabase-js fora do JS inicial).
import { supabase } from './supabase.js'

export class SettingsFailure extends Error {
  constructor(cause) {
    super('settings_failed', { cause })
    this.name = 'SettingsFailure'
  }
}

async function call(promise) {
  let result
  try {
    result = await promise
  } catch (error) {
    throw new SettingsFailure(error)
  }
  if (result.error) throw new SettingsFailure(result.error)
  return result.data
}

export function createSettingsService(client) {
  return {
    async fetchSettings(userId) {
      const row = await call(
        client.from('user_settings').select('settings').eq('user_id', userId).maybeSingle(),
      )
      const settings = row?.settings
      return typeof settings === 'object' && settings !== null ? settings : {}
    },

    // A RLS só deixa o autenticado atualizar a coluna `settings` da própria linha
    async saveSettings(userId, settings) {
      return call(client.from('user_settings').update({ settings }).eq('user_id', userId))
    },
  }
}

export const settingsService = supabase ? createSettingsService(supabase) : null
