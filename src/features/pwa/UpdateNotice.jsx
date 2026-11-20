import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { registerServiceWorker } from '../../services/pwa.js'
import { shouldShowUpdateNotice } from './updateNotice.js'

// Aviso de nova versão: anunciado por leitores de tela e só fora da partida
export default function UpdateNotice() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [needRefresh, setNeedRefresh] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const updateRef = useRef(null)

  useEffect(() => {
    registerServiceWorker({ onNeedRefresh: () => setNeedRefresh(true) })
      .then((update) => {
        updateRef.current = update
      })
      .catch((error) => console.error(error))
  }, [])

  const visible = shouldShowUpdateNotice({ needRefresh, dismissed, pathname })

  return (
    <div className="toast toast-start toast-bottom z-50" role="status" aria-live="polite">
      {visible && (
        <div className="alert alert-info text-sm">
          <span>{t('pwa.update.message')}</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => updateRef.current?.(true)}>
            {t('pwa.update.reload')}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDismissed(true)}>
            {t('pwa.update.dismiss')}
          </button>
        </div>
      )}
    </div>
  )
}
