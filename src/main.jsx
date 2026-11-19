import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import AuthProvider from './features/auth/AuthProvider.jsx'
import { initMonitoring } from './services/monitoring.js'
import './i18n/index.js'
import './index.css'

initMonitoring().catch((error) => console.error(error))

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
