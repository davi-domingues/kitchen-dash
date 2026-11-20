import { useCallback, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.js'
import { pullAccountSettings, pushAccountSettings } from './settingsSync.js'

/** No login traz as configurações da conta; devolve `push` para enviar uma mudança local. */
export function useSettingsSync(pull = pullAccountSettings, send = pushAccountSettings) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    if (userId) pull(userId)
  }, [pull, userId])

  return useCallback(() => send(user), [send, user])
}
