// Leitura e gravação dos cosméticos em `kd:v1:cosmetics` (SYSTEM_DESIGN §7.2), sempre via storage.js.
// Chave separada de `progress` para não mudar o formato da KD-22.
import { storage as defaultStorage } from '../../services/storage.js'
import {
  applyAccountEquipped,
  applyScore,
  equip,
  getLook,
  mergeUnlocked,
  sanitizeCosmetics,
} from './cosmetics.js'

export const COSMETICS_KEY = 'cosmetics'

export function loadCosmetics(store = defaultStorage) {
  return sanitizeCosmetics(store.get(COSMETICS_KEY, null))
}

// Telas abertas (ex.: o seletor no /perfil) se atualizam quando a sincronização da conta grava
const listeners = new Set()

/** @returns {() => void} cancela a inscrição */
export function subscribeCosmetics(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function update(store, change) {
  const result = change(loadCosmetics(store))
  store.set(COSMETICS_KEY, result.state)
  listeners.forEach((listener) => listener(result.state))
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

/** KD-38: une os itens da conta e aplica o equipado dela. */
export function applyAccountCosmetics({ unlocked, equipped }, store = defaultStorage) {
  return update(store, (state) => {
    const merged = mergeUnlocked(state, unlocked)
    return { ...merged, state: applyAccountEquipped(merged.state, equipped) }
  })
}

export function equipCosmetic(id, store = defaultStorage) {
  return update(store, (state) => ({ state: equip(state, id) })).state
}

export function loadCosmeticLook(store = defaultStorage) {
  return getLook(loadCosmetics(store))
}

export function clearCosmetics(store = defaultStorage) {
  store.remove(COSMETICS_KEY)
}
