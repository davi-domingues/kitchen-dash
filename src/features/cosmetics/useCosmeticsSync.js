import { useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.js'
import { equippedOutboxFor, pullAccountCosmetics } from './cosmeticsSync.js'

// No login (ou abertura com sessão), reenvia o equipado pendente (#74) e traz os cosméticos da conta.
// Com pendência, não lê a conta: o equipado de lá reverteria a escolha local ainda não enviada.
export function useCosmeticsSync(pull = pullAccountCosmetics, outbox = equippedOutboxFor()) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    outbox.flush(userId).then(() => {
      if (active && !outbox.isPending(userId)) pull(userId)
    })
    const onOnline = () => outbox.flush(userId)
    globalThis.addEventListener?.('online', onOnline)
    return () => {
      active = false
      globalThis.removeEventListener?.('online', onOnline)
      outbox.dispose()
    }
  }, [pull, outbox, userId])
}
