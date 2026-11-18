// Preferências locais do jogador (`kd:v1:settings`, SYSTEM_DESIGN §7.2 e §8.1)
import { sanitizeKeyBindings } from '../game/input/keyBindings.js'
import { storage as defaultStorage } from './storage.js'

const SETTINGS_KEY = 'settings'

export function loadKeyBindings(store = defaultStorage) {
  return sanitizeKeyBindings(store.get(SETTINGS_KEY, {})?.keyBindings)
}

export function saveKeyBindings(bindings, store = defaultStorage) {
  const current = store.get(SETTINGS_KEY, {})
  const base = typeof current === 'object' && current !== null ? current : {}
  store.set(SETTINGS_KEY, { ...base, keyBindings: sanitizeKeyBindings(bindings) })
}
