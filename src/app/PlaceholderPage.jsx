import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

// Casca das rotas cujo conteúdo chega em tasks futuras (ranking, perfil, privacidade, 404)
export default function PlaceholderPage({ title, message }) {
  const { t } = useTranslation()

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-primary">{title}</h1>
          <p className="py-6">{message}</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft aria-hidden="true" /> {t('nav.home')}
          </Link>
        </div>
      </div>
    </main>
  )
}
