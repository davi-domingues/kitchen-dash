import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { DELETE_ACCOUNT_ANCHOR } from './anchors.js'

export default function DeleteAccountSection({ service }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const [deleting, setDeleting] = useState(false)
  const [failed, setFailed] = useState(false)

  async function confirmDelete() {
    setDeleting(true)
    setFailed(false)
    try {
      await service.deleteAccount()
      dialogRef.current?.close()
      navigate('/', { replace: true })
    } catch {
      setFailed(true)
      setDeleting(false)
    }
  }

  return (
    <div id={DELETE_ACCOUNT_ANCHOR} className="flex flex-col gap-2 border-t border-base-300 pt-4">
      <h3 className="font-semibold">{t('profile.account.deleteTitle')}</h3>
      <p className="text-sm opacity-80">{t('profile.account.deleteHint')}</p>
      <Link to="/privacidade" className="link text-sm">
        {t('profile.account.privacyLink')}
      </Link>
      <button
        type="button"
        className="btn btn-outline btn-error self-start"
        onClick={() => dialogRef.current?.showModal()}
      >
        {t('profile.account.delete')}
      </button>
      <dialog ref={dialogRef} className="modal" aria-labelledby="delete-account-title">
        <div className="modal-box">
          <h3 id="delete-account-title" className="text-lg font-bold">
            {t('profile.account.deleteConfirmTitle')}
          </h3>
          <p className="py-4">{t('profile.account.deleteConfirmText')}</p>
          {failed && (
            <p role="alert" className="text-error">
              {t('profile.account.deleteError')}
            </p>
          )}
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              disabled={deleting}
              onClick={() => dialogRef.current?.close()}
            >
              {t('profile.settings.cancel')}
            </button>
            <button type="button" className="btn btn-error" disabled={deleting} onClick={confirmDelete}>
              {deleting ? t('app.loading') : t('profile.account.deleteConfirm')}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
