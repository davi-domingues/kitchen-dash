import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { loadProfileService } from '../../services/profileLoader.js'
import { useAuth } from '../auth/AuthContext.js'
import { DELETE_ACCOUNT_ANCHOR } from './anchors.js'
import DeleteAccountSection from './DeleteAccountSection.jsx'
import DisplayNameForm from './DisplayNameForm.jsx'

// Com sessão: nome e exclusão. O visitante só vê como entrar para excluir (link da política, KD-44)
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

  // O react-router não rola até o #hash, e a seção de exclusão só existe depois de carregar o serviço
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === `#${DELETE_ACCOUNT_ANCHOR}`) document.getElementById(DELETE_ACCOUNT_ANCHOR)?.scrollIntoView()
  }, [hash, service, status])

  if (status === 'guest') {
    return (
      <p id={DELETE_ACCOUNT_ANCHOR} className="text-sm">
        {t('profile.account.guestDelete')}{' '}
        <Link to="/entrar" className="link">
          {t('profile.account.signIn')}
        </Link>
      </p>
    )
  }
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
