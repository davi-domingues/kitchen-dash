// Preferências locais do jogador (`kd:v1:settings`, SYSTEM_DESIGN §7.2 e §8.1)
import { sanitizeKeyBindings } from '../game/input/keyBindings.js'
import { storage as defaultStorage } from './storage.js'

const SETTINGS_KEY = 'settings'

/** Objeto completo de preferências (usado na migração para a conta, KD-37). */
export function loadSettings(store = defaultStorage) {
  const current = store.get(SETTINGS_KEY, {})
  return typeof current === 'object' && current !== null && !Array.isArray(current) ? current : {}
}

export function saveSettings(settings, store = defaultStorage) {
  store.set(SETTINGS_KEY, settings)
}

export function loadKeyBindings(store = defaultStorage) {
  return sanitizeKeyBindings(loadSettings(store).keyBindings)
}

export function saveKeyBindings(bindings, store = defaultStorage) {
  saveSettings({ ...loadSettings(store), keyBindings: sanitizeKeyBindings(bindings) }, store)
}
