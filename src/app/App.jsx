import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router'
import { useCosmeticsSync } from '../features/cosmetics/useCosmeticsSync.js'
import MigrationNotice from '../features/migration/MigrationNotice.jsx'
import { useScoreSync } from '../features/progress/useScoreSync.js'
import ErrorBoundary from '../ui/ErrorBoundary.jsx'
import HomePage from './HomePage.jsx'
import ControlsPage from '../features/controls/ControlsPage.jsx'
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

// Um boundary por rota: o erro de uma tela não derruba as outras (KD-40)
const ROUTES = [
  ['/', <HomePage key="home" />],
  ['/controles', <ControlsPage key="controls" />],
  ['/jogar', <Lazy key="play" page={PlayPage} />],
  ['/entrar', <Lazy key="login" page={LoginPage} />],
  ['/ranking', <RankingPage key="ranking" />],
  ['/perfil', <ProfilePage key="profile" />],
  ['/privacidade', <PrivacyPage key="privacy" />],
  ['*', <NotFoundPage key="404" />],
]

export default function App() {
  useScoreSync()
  useCosmeticsSync()
  return (
    <BrowserRouter>
      <Routes>
        {ROUTES.map(([path, page]) => (
          <Route key={path} path={path} element={<ErrorBoundary>{page}</ErrorBoundary>} />
        ))}
      </Routes>
      <MigrationNotice />
    </BrowserRouter>
  )
}
