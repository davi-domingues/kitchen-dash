import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from './HomePage.jsx'

// Phaser só é baixado na rota do jogo (orçamento de JS inicial, SYSTEM_DESIGN §8.5)
const PlayPage = lazy(() => import('./PlayPage.jsx'))

export default function App() {
  const { t } = useTranslation()

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
              <PlayPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
