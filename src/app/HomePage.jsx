import { ChefHat } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <ChefHat className="mx-auto size-16 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-5xl font-bold text-primary">{t('app.name')}</h1>
          <p className="py-6">{t('home.tagline')}</p>
          <Link to="/jogar" className="btn btn-primary btn-lg">
            {t('home.play')}
          </Link>
        </div>
      </div>
    </main>
  )
}
