import { useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.js'
import { pullAccountCosmetics } from './cosmeticsSync.js'

// No login (ou abertura com sessão), traz os cosméticos da conta para este dispositivo
export function useCosmeticsSync(pull = pullAccountCosmetics) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    if (userId) pull(userId)
  }, [pull, userId])
}
