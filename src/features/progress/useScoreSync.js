import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.js'
import { SUBMIT_STATUS, scoreOutbox, submitMatch } from './scoreSync.js'

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

// Fim de partida: com sessão, entra na fila e é enviada na hora; devolve o estado para o resultado
export function useSubmitMatch(matchId, outbox = scoreOutbox) {
  const { status, user } = useAuth()
  const [submitted, setSubmitted] = useState({ matchId: null, status: null })
  const authLoading = status === 'loading'

  useEffect(() => {
    if (!matchId || authLoading) return undefined
    let active = true
    submitMatch(outbox, matchId, user).then((result) => {
      if (active) setSubmitted({ matchId, status: result })
    })
    return () => {
      active = false
    }
  }, [outbox, matchId, user, authLoading])

  if (!matchId) return null
  return submitted.matchId === matchId ? submitted.status : SUBMIT_STATUS.SENDING
}
