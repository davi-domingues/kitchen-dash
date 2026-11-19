// Leitura e gravação do progresso em `kd:v1:progress` (SYSTEM_DESIGN §7.2), sempre via storage.js
import { storage as defaultStorage } from '../../services/storage.js'
import { applyMatchResult, removePendingEntries, sanitizeProgress } from './progress.js'

export const PROGRESS_KEY = 'progress'

export function loadProgress(store = defaultStorage) {
  return sanitizeProgress(store.get(PROGRESS_KEY, null))
}

export function recordMatchResult(result, { store = defaultStorage, now = new Date() } = {}) {
  const outcome = applyMatchResult(loadProgress(store), result, { now })
  if (!outcome.duplicate) store.set(PROGRESS_KEY, outcome.progress)
  return outcome
}

// Para a KD-35: tira da lista as partidas que o servidor já aceitou
export function removePending(matchIds, store = defaultStorage) {
  store.set(PROGRESS_KEY, removePendingEntries(loadProgress(store), matchIds))
}

export function clearProgress(store = defaultStorage) {
  store.remove(PROGRESS_KEY)
}
