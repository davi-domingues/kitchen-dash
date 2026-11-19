import { useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.js'
import { scoreOutbox, submitMatch } from './scoreSync.js'

// Reenvia a fila na abertura do app, no login e quando a conexão volta (SYSTEM_DESIGN §7.1)
export function useScoreSync(outbox = scoreOutbox) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    outbox.flush(userId)
    const onOnline = () => outbox.flush(userId)
    globalThis.addEventListener?.('online', onOnline)
    return () => {
      globalThis.removeEventListener?.('online', onOnline)
      outbox.dispose()
    }
  }, [outbox, userId])
}

// Fim de partida: com sessão, entra na fila e é enviada na hora
export function useSubmitMatch(matchId, outbox = scoreOutbox) {
  const { user } = useAuth()

  useEffect(() => {
    if (matchId) submitMatch(outbox, matchId, user)
  }, [outbox, matchId, user])
}
