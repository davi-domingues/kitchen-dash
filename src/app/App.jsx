import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from './HomePage.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import PrivacyPage from './PrivacyPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import RankingPage from './RankingPage.jsx'
import { loadReduceEffects, saveReduceEffects } from '../services/settings.js'

// Phaser só é baixado na rota do jogo (orçamento de JS inicial, SYSTEM_DESIGN §8.5)
const PlayPage = lazy(() => import('./PlayPage.jsx'))

export default function App() {
  const { t } = useTranslation()
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/jogar"
          element={
            <Suspense
              fallback={
                <span className="loading loading-dots loading-lg m-auto" aria-label={t('app.loading')} />
              }
            >
              <PlayPage reduceEffects={reduceEffects} onReduceEffectsChange={changeReduceEffects} />
            </Suspense>
          }
        />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
