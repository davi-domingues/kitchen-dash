// Liga os cosméticos locais (KD-23) à conta (KD-38). Offline primeiro: falha remota nunca apaga o local.
import { loadCosmeticsService } from '../../services/cosmeticsLoader.js'
import { createEquippedOutbox } from '../../services/equippedOutbox.js'
import { storage } from '../../services/storage.js'
import { applyAccountCosmetics, equipCosmetic, loadCosmetics } from './cosmeticsStore.js'

const DEFAULTS = { loadService: loadCosmeticsService, store: storage }

/** No login: une os itens da conta ao local e restaura o equipado dela. null = sem backend ou falha. */
export async function pullAccountCosmetics(userId, { loadService, store } = DEFAULTS) {
  if (!userId) return null
  const service = await loadService()
  if (!service) return null
  try {
    const account = await service.fetchAccountCosmetics(userId)
    return applyAccountCosmetics(account, store).state
  } catch (error) {
    console.warn('[cosmetics] falha ao ler os cosméticos da conta', error)
    return null
  }
}

/** Grava na conta o equipado local atual (usado ao equipar e pela KD-37). */
export async function pushEquipped(user, { loadService, store } = DEFAULTS) {
  if (!user) return false
  const service = await loadService()
  if (!service) return false
  try {
    await service.saveEquipped(loadCosmetics(store).equipped)
    return true
  } catch (error) {
    console.warn('[cosmetics] falha ao salvar o equipado na conta', error)
    return false
  }
}

const outboxes = new WeakMap()

/** Fila de reenvio do equipado (#74), uma por conjunto de dependências (o app usa só a padrão). */
export function equippedOutboxFor(deps = DEFAULTS) {
  if (!outboxes.has(deps)) {
    const { loadService, store, ...timing } = deps
    const send = (userId) => pushEquipped({ id: userId }, { loadService, store })
    outboxes.set(deps, createEquippedOutbox({ store, send, ...timing }))
  }
  return outboxes.get(deps)
}

/** Equipa na hora (local) e, com sessão, envia para a conta em segundo plano, com reenvio se falhar. */
export function equipAndSync(id, user, deps = DEFAULTS) {
  const state = equipCosmetic(id, deps.store)
  if (user?.id) equippedOutboxFor(deps).request(user.id)
  return state
}
