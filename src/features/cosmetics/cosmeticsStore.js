// Leitura e gravação dos cosméticos em `kd:v1:cosmetics` (SYSTEM_DESIGN §7.2), sempre via storage.js.
// Chave separada de `progress` para não mudar o formato da KD-22.
import { storage as defaultStorage } from '../../services/storage.js'
import { applyScore, equip, equipP2, getLook, mergeUnlocked, sanitizeCosmetics } from './cosmetics.js'

export const COSMETICS_KEY = 'cosmetics'

export function loadCosmetics(store = defaultStorage) {
  return sanitizeCosmetics(store.get(COSMETICS_KEY, null))
}

function update(store, change) {
  const result = change(loadCosmetics(store))
  store.set(COSMETICS_KEY, result.state)
  return result
}

/** @returns {{ state, newlyUnlocked: string[] }} */
export function recordScore(score, store = defaultStorage) {
  return update(store, (state) => applyScore(state, score))
}

/** Para a KD-38: une os ids que a conta devolveu (`unlocked_cosmetics` ou `user_cosmetics`). */
export function mergeUnlockedCosmetics(ids, store = defaultStorage) {
  return update(store, (state) => mergeUnlocked(state, ids))
}

export function equipCosmetic(id, store = defaultStorage) {
  return update(store, (state) => ({ state: equip(state, id) })).state
}

/** Escolha do P2: fica só neste navegador, nunca vai para a conta. */
export function equipCosmeticP2(id, store = defaultStorage) {
  return update(store, (state) => ({ state: equipP2(state, id) })).state
}

export function loadCosmeticLook(store = defaultStorage) {
  return getLook(loadCosmetics(store))
}

export function clearCosmetics(store = defaultStorage) {
  store.remove(COSMETICS_KEY)
}
