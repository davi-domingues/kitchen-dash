import { Component } from 'react'
import { captureError } from '../services/monitoring.js'
import { t } from '../i18n/index.js'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    captureError(error, { componentStack: info.componentStack })
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main className="hero min-h-screen bg-base-200">
        <div role="alert" className="hero-content flex-col text-center">
          <h1 className="text-3xl font-bold">{t('ui.error.title')}</h1>
          <p>{t('ui.error.description')}</p>
          <button
            type="button"
            className="btn btn-primary"
            autoFocus
            onClick={() => window.location.reload()}
          >
            {t('ui.error.reload')}
          </button>
        </div>
      </main>
    )
  }
}
