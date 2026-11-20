// Liga as preferências locais à conta (KD-34). Offline primeiro: o local vale na hora e falha remota não o apaga.
import { mergeSettings } from '../migration/settingsMerge.js'
import { loadSettings, saveSettings } from '../../services/settings.js'
import { loadSettingsService } from '../../services/settingsLoader.js'
import { storage } from '../../services/storage.js'

const DEFAULTS = { loadService: loadSettingsService, store: storage }

/** No login: concilia pela regra da KD-37 (a conta vence por campo) e grava o resultado local. */
export async function pullAccountSettings(userId, { loadService, store } = DEFAULTS) {
  if (!userId) return false
  const service = await loadService()
  if (!service) return false
  try {
    const account = await service.fetchSettings(userId)
    const { settings, changedAccount } = mergeSettings(loadSettings(store), account)
    if (changedAccount) await service.saveSettings(userId, settings)
    saveSettings(settings, store)
    return true
  } catch (error) {
    console.warn('[settings] falha ao conciliar as configurações da conta', error)
    return false
  }
}

/** Depois de uma mudança local: envia o objeto inteiro à conta em segundo plano. */
export async function pushAccountSettings(user, { loadService, store } = DEFAULTS) {
  if (!user?.id) return false
  const service = await loadService()
  if (!service) return false
  try {
    await service.saveSettings(user.id, loadSettings(store))
    return true
  } catch (error) {
    console.warn('[settings] falha ao salvar as configurações na conta', error)
    return false
  }
}
