import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadProfileService } from '../../services/profileLoader.js'
import { useAuth } from '../auth/AuthContext.js'
import DeleteAccountSection from './DeleteAccountSection.jsx'
import DisplayNameForm from './DisplayNameForm.jsx'

// Só aparece com sessão; o visitante continua com o perfil local (KD-22/KD-23)
export default function AccountSection({ loadService = loadProfileService }) {
  const { t } = useTranslation()
  const { status, user } = useAuth()
  const [service, setService] = useState(null)
  const [failed, setFailed] = useState(false)
  const authenticated = status === 'authenticated'

  useEffect(() => {
    if (!authenticated) return undefined
    let active = true
    loadService()
      .then((loaded) => active && setService(loaded))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [authenticated, loadService])

  if (!authenticated) return null

  return (
    <section className="card w-full max-w-md bg-base-100 shadow" aria-labelledby="account-title">
      <div className="card-body gap-4">
        <h2 id="account-title" className="card-title">
          {t('profile.account.title')}
        </h2>
        <p className="text-sm opacity-80">{t('profile.account.signedInAs', { email: user.email })}</p>
        {failed && (
          <p role="alert" className="text-error">
            {t('profile.account.loadError')}
          </p>
        )}
        {!failed && !service && <span className="loading loading-dots" aria-label={t('app.loading')} />}
        {service && (
          <>
            <DisplayNameForm service={service} userId={user.id} />
            <DeleteAccountSection service={service} />
          </>
        )}
      </div>
    </section>
  )
}
