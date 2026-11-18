import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from './HomePage.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import PrivacyPage from './PrivacyPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import RankingPage from './RankingPage.jsx'

// Phaser só é baixado na rota do jogo (orçamento de JS inicial, SYSTEM_DESIGN §8.5)
const PlayPage = lazy(() => import('./PlayPage.jsx'))
// Login (Turnstile e supabase-js) também fora do JS inicial
const LoginPage = lazy(() => import('../features/auth/LoginPage.jsx'))

function Lazy({ page: Page }) {
  const { t } = useTranslation()
  return (
    <Suspense
      fallback={<span className="loading loading-dots loading-lg m-auto" aria-label={t('app.loading')} />}
    >
      <Page />
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jogar" element={<Lazy page={PlayPage} />} />
        <Route path="/entrar" element={<Lazy page={LoginPage} />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
