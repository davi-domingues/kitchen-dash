import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// <dialog> nativo com showModal: prende o foco e trata Esc sem código extra (SYSTEM_DESIGN §8.2)
export default function PauseDialog({ onResume, onQuit }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  function handleCancel(event) {
    event.preventDefault()
    onResume()
  }

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby="pause-title" onCancel={handleCancel}>
      <div className="modal-box text-center">
        <h2 id="pause-title" className="text-2xl font-bold text-primary">
          {t('play.pause.title')}
        </h2>
        <p className="py-4">{t('play.pause.hint')}</p>
        <div className="modal-action justify-center">
          <button type="button" className="btn btn-primary" onClick={onResume} autoFocus>
            {t('play.pause.resume')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onQuit}>
            {t('play.pause.quit')}
          </button>
        </div>
      </div>
    </dialog>
  )
}
