// Liga a outbox (services/) ao progresso local (KD-22): a fila só envia o que está em `pending`
import { loadScoreService } from '../../services/scoreLoader.js'
import { createScoreOutbox } from '../../services/scoreOutbox.js'
import { storage } from '../../services/storage.js'
import { mergeUnlockedCosmetics } from '../cosmetics/cosmeticsStore.js'
import { loadProgress, removePending } from './progressStore.js'

export function createAppOutbox({ store = storage, loadService = loadScoreService, ...rest } = {}) {
  return createScoreOutbox({
    store,
    loadService,
    listPending: () => loadProgress(store).pending,
    removePending: (ids) => removePending(ids, store),
    // KD-38: o que o servidor liberou entra nos cosméticos locais
    onSubmitted: (_entry, result) => mergeUnlockedCosmetics(result?.unlockedCosmetics, store),
    ...rest,
  })
}

// Visitante não envia: as partidas dele vão na migração local → conta (KD-37) com origin 'local'
export function submitMatch(outbox, matchId, user) {
  if (!user || !matchId) return Promise.resolve(null)
  outbox.enqueue(matchId, user.id)
  return outbox.flush(user.id)
}

export const scoreOutbox = createAppOutbox()
