import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// <dialog> nativo: prende o foco, trata Esc e devolve o foco ao botão que abriu (SYSTEM_DESIGN §8.2)
export default function RestoreDefaultsDialog({ onConfirm, onCancel }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  function handleCancel(event) {
    event.preventDefault()
    onCancel()
  }

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby="restore-title" onCancel={handleCancel}>
      <div className="modal-box">
        <h2 id="restore-title" className="text-2xl font-bold text-primary">
          {t('settings.restore.title')}
        </h2>
        <p className="py-4">{t('settings.restore.body')}</p>
        <div className="modal-action">
          <button type="button" className="btn btn-primary" onClick={onConfirm} autoFocus>
            {t('settings.restore.confirm')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('settings.restore.cancel')}
          </button>
        </div>
      </div>
    </dialog>
  )
}
