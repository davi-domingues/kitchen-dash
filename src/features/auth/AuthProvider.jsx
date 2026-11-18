import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../../services/auth.js'
import { AuthContext } from './AuthContext.js'

export default function AuthProvider({ children, service = authService }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(service))

  useEffect(() => {
    if (!service) return undefined
    let active = true
    service
      .getUser()
      .then((current) => active && setUser(current))
      // Sessão salva ilegível = visitante; o jogo segue offline (princípio I)
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false))
    const stop = service.onUserChange((next) => {
      setUser(next)
      setLoading(false)
    })
    return () => {
      active = false
      stop()
    }
  }, [service])

  const signOut = useCallback(() => service?.signOut() ?? Promise.resolve(), [service])

  const value = useMemo(() => {
    let status = 'guest'
    if (!service) status = 'disabled'
    else if (loading) status = 'loading'
    else if (user) status = 'authenticated'
    return { status, user, signOut }
  }, [service, loading, user, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
