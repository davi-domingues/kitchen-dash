import { LogIn, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from './AuthContext.js'

// Área de conta da home: some sem backend (o jogo segue como visitante)
export default function AccountStatus() {
  const { t } = useTranslation()
  const { status, user, signOut } = useAuth()
  const [failed, setFailed] = useState(false)

  if (status === 'disabled') return null
  if (status === 'loading') {
    return <span className="loading loading-dots" aria-label={t('app.loading')} />
  }
  if (status === 'guest') {
    return (
      <Link to="/entrar" className="btn btn-outline btn-sm">
        <LogIn aria-hidden="true" /> {t('auth.account.signIn')}
      </Link>
    )
  }

  async function handleSignOut() {
    setFailed(false)
    try {
      await signOut()
    } catch {
      setFailed(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 text-sm">
      <span>{t('auth.account.signedInAs', { email: user.email })}</span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleSignOut}>
        <LogOut aria-hidden="true" /> {t('auth.account.signOut')}
      </button>
      {failed && (
        <p role="alert" className="text-error">
          {t('auth.account.signOutError')}
        </p>
      )}
    </div>
  )
}
