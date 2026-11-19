import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.js'
import { isMigrationDone, runAccountMigration } from './accountMigration.js'

// Login, recarga e StrictMode podem disparar juntos: uma rodada por usuário por vez
const running = new Map()

function runOnce(user, options) {
  if (!running.has(user.id)) {
    running.set(
      user.id,
      runAccountMigration(user, options).finally(() => running.delete(user.id)),
    )
  }
  return running.get(user.id)
}

/**
 * Dispara a migração local → conta (KD-37) quando há sessão e devolve o aviso a mostrar.
 * @returns {{ notice: null | { kind: 'progress', done: number, total: number }
 *   | { kind: 'done', sent: number, discarded: number }, dismiss: () => void }}
 */
export function useAccountMigration(run = runOnce, isDone = isMigrationDone) {
  const { user } = useAuth()
  const [notice, setNotice] = useState(null)
  const dismiss = useCallback(() => setNotice(null), [])

  useEffect(() => {
    if (!user?.id || isDone(user.id)) return undefined
    let active = true
    const onProgress = ({ done, total }) => {
      if (active && total > 0) setNotice({ kind: 'progress', done, total })
    }
    run(user, { onProgress }).then((result) => {
      if (!active) return
      const migrated = result.sent + result.discarded > 0
      setNotice(result.status === 'done' && migrated ? { kind: 'done', ...result } : null)
    })
    return () => {
      active = false
    }
  }, [user, run, isDone])

  return { notice, dismiss }
}
