import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router'
import { useCosmeticsSync } from '../features/cosmetics/useCosmeticsSync.js'
import MigrationNotice from '../features/migration/MigrationNotice.jsx'
import { useScoreSync } from '../features/progress/useScoreSync.js'
import ErrorBoundary from '../ui/ErrorBoundary.jsx'
import HomePage from './HomePage.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import PrivacyPage from './PrivacyPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import RankingPage from './RankingPage.jsx'
import SettingsPage from './SettingsPage.jsx'
import { loadReduceEffects, saveReduceEffects } from '../services/settings.js'

// Phaser só é baixado na rota do jogo (orçamento de JS inicial, SYSTEM_DESIGN §8.5)
const PlayPage = lazy(() => import('./PlayPage.jsx'))
// Login (Turnstile e supabase-js) também fora do JS inicial
const LoginPage = lazy(() => import('../features/auth/LoginPage.jsx'))

function Lazy({ page: Page, ...props }) {
  const { t } = useTranslation()
  return (
    <Suspense
      fallback={<span className="loading loading-dots loading-lg m-auto" aria-label={t('app.loading')} />}
    >
      <Page {...props} />
    </Suspense>
  )
}

export default function App() {
  const [preference, setPreference] = useState(loadReduceEffects)
  const [systemReduced, setSystemReduced] = useState(
    () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  const reduceEffects = preference ?? systemReduced

  useEffect(() => {
    const media = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!media) return undefined
    const update = (event) => setSystemReduced(event.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.reduceEffects = String(reduceEffects)
  }, [reduceEffects])

  function changeReduceEffects(value) {
    saveReduceEffects(value)
    setPreference(value)
  }

  useScoreSync()
  useCosmeticsSync()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <HomePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/jogar"
          element={
            <ErrorBoundary>
              <Lazy
                page={PlayPage}
                reduceEffects={reduceEffects}
                onReduceEffectsChange={changeReduceEffects}
              />
            </ErrorBoundary>
          }
        />
        <Route
          path="/entrar"
          element={
            <ErrorBoundary>
              <Lazy page={LoginPage} />
            </ErrorBoundary>
          }
        />
        <Route
          path="/ranking"
          element={
            <ErrorBoundary>
              <RankingPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/perfil"
          element={
            <ErrorBoundary>
              <ProfilePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/privacidade"
          element={
            <ErrorBoundary>
              <PrivacyPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="*"
          element={
            <ErrorBoundary>
              <NotFoundPage />
            </ErrorBoundary>
          }
        />
      </Routes>
      <MigrationNotice />
    </BrowserRouter>
  )
}
