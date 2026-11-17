import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import { initMonitoring } from './services/monitoring.js'
import './i18n/index.js'
import './index.css'

initMonitoring().catch((error) => console.error(error))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
