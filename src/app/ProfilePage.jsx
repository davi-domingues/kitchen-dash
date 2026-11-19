import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import CosmeticsPicker from '../features/cosmetics/CosmeticsPicker.jsx'
import LocalProgress from '../features/progress/LocalProgress.jsx'

export default function ProfilePage() {
  const { t } = useTranslation()
  // Remonta a personalização quando o progresso é apagado
  const [resetCount, setResetCount] = useState(0)
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-base-200 p-4">
      <Link to="/" className="btn btn-ghost self-start">
        <ArrowLeft aria-hidden="true" /> {t('nav.home')}
      </Link>
      <h1 className="text-4xl font-bold text-primary">{t('nav.profile')}</h1>
      <p className="text-sm opacity-80">{t('profile.local.visitorHint')}</p>
      <CosmeticsPicker key={resetCount} />
      <LocalProgress onCleared={() => setResetCount((n) => n + 1)} />
    </main>
  )
}
