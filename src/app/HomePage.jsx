import { ChefHat } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import AccountStatus from '../features/auth/AccountStatus.jsx'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <ChefHat className="mx-auto size-16 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-5xl font-bold text-primary">{t('app.name')}</h1>
          <p className="py-6">{t('home.tagline')}</p>
          <ul className="mb-6 space-y-1 text-sm opacity-80">
            <li>{t('home.howTo.move')}</li>
            <li>{t('home.howTo.action')}</li>
            <li>{t('home.howTo.pause')}</li>
          </ul>
          <Link to="/jogar" className="btn btn-primary btn-lg">
            {t('home.play')}
          </Link>
          <div className="mt-6">
            <AccountStatus />
          </div>
          <nav aria-label={t('nav.label')} className="mt-6 flex justify-center gap-2">
            <Link to="/ranking" className="btn btn-ghost btn-sm">
              {t('nav.ranking')}
            </Link>
            <Link to="/configuracoes" className="btn btn-ghost btn-sm">
              {t('nav.settings')}
            </Link>
            <Link to="/perfil" className="btn btn-ghost btn-sm">
              {t('nav.profile')}
            </Link>
            <Link to="/privacidade" className="btn btn-ghost btn-sm">
              {t('nav.privacy')}
            </Link>
          </nav>
        </div>
      </div>
    </main>
  )
}
