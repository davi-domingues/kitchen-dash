import { useCallback, useEffect, useMemo, useState } from 'react'
import { isBackendConfigured } from '../../services/supabaseConfig.js'
import { loadAuthService } from '../../services/authLoader.js'
import { AuthContext } from './AuthContext.js'

// O serviço (e o supabase-js) chega por import() dinâmico, fora do JS inicial (SYSTEM_DESIGN §8.5)
export default function AuthProvider({
  children,
  enabled = isBackendConfigured,
  loadService = loadAuthService,
}) {
  const [service, setService] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    let stop = () => {}
    loadService()
      .then(async (loaded) => {
        if (!active || !loaded) return
        setService(loaded)
        stop = loaded.onUserChange((next) => active && setUser(next))
        const current = await loaded.getUser()
        if (active) setUser(current)
      })
      // Sem rede ou sessão ilegível = visitante; o jogo segue offline (princípio I)
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
      stop()
    }
  }, [enabled, loadService])

  const signOut = useCallback(() => service?.signOut() ?? Promise.resolve(), [service])

  const value = useMemo(() => {
    let status = 'guest'
    if (!enabled) status = 'disabled'
    else if (loading) status = 'loading'
    else if (user) status = 'authenticated'
    return { status, user, signOut }
  }, [enabled, loading, user, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
