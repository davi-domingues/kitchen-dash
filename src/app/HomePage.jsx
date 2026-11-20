import { ChefHat } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import SiteFooter from '../ui/SiteFooter.jsx'
import AccountStatus from '../features/auth/AccountStatus.jsx'
import { getDailyChallenge } from '../game/core/dailyChallenge/index.js'
import { getDailyChallengeCompletion } from '../services/dailyChallengeProgress.js'

export default function HomePage() {
  const { t } = useTranslation()
  void t('dailyChallenge.challenge.serveRatatouille.title')
  void t('dailyChallenge.challenge.serveRatatouille.description')
  void t('dailyChallenge.challenge.noMissed.title')
  void t('dailyChallenge.challenge.noMissed.description')
  void t('dailyChallenge.challenge.score600.title')
  void t('dailyChallenge.challenge.score600.description')
  let dailyChallenge
  let completion

  try {
    dailyChallenge = getDailyChallenge()
    completion = getDailyChallengeCompletion(dailyChallenge.dateUtc)
  } catch {
    dailyChallenge = null
  }

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
          <section className="mt-6 rounded-box bg-base-100 p-4 text-left shadow">
            <h2 className="text-lg font-semibold">{t('dailyChallenge.title')}</h2>
            {dailyChallenge ? (
              <>
                <p className="mt-2 text-base-content/80">{t(dailyChallenge.challenge.titleKey)}</p>
                <p className="mt-1 text-sm text-base-content/70">
                  {t(dailyChallenge.challenge.descriptionKey)}
                </p>
                <div className="mt-3">
                  <span className="badge badge-outline">
                    {completion ? t('dailyChallenge.status.completed') : t('dailyChallenge.status.pending')}
                  </span>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-base-content/70">{t('dailyChallenge.unavailable')}</p>
            )}
          </section>
          <SiteFooter />
        </div>
      </div>
    </main>
  )
}
