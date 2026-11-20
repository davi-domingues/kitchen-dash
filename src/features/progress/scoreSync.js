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

export const SUBMIT_STATUS = Object.freeze({
  SENDING: 'sending',
  SENT: 'sent',
  PENDING: 'pending',
  FAILED: 'failed',
  GUEST: 'guest',
})

// Fora da rodada (envio concorrente, sem backend, sessão expirada) a partida segue na fila: pendente
export function submitStatus(summary, matchId) {
  const outcome = summary?.outcomes?.[matchId]
  if (outcome === 'sent') return SUBMIT_STATUS.SENT
  if (outcome === 'discarded') return SUBMIT_STATUS.FAILED
  return SUBMIT_STATUS.PENDING
}

// Visitante não envia: as partidas dele vão na migração local → conta (KD-37) com origin 'local'
export async function submitMatch(outbox, matchId, user) {
  if (!matchId) return null
  if (!user) return SUBMIT_STATUS.GUEST
  try {
    outbox.enqueue(matchId, user.id)
    return submitStatus(await outbox.flush(user.id), matchId)
  } catch {
    // Erro inesperado não pode derrubar a tela de resultado
    return SUBMIT_STATUS.FAILED
  }
}

export const scoreOutbox = createAppOutbox()
