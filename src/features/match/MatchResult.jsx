import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { formatDuration } from './matchEnded.js'

export default function MatchResult({ result, onReplay, onChangeMode }) {
  const { t } = useTranslation()
  const headingRef = useRef(null)

  // Leva o foco ao título para o leitor de tela anunciar o resultado
  useEffect(() => headingRef.current?.focus(), [])

  return (
    <section className="card w-full max-w-lg bg-base-100 shadow-xl" aria-labelledby="result-title">
      <div className="card-body items-center gap-6 text-center">
        <h1 id="result-title" ref={headingRef} tabIndex={-1} className="card-title text-3xl text-primary">
          {t('play.result.title')}
        </h1>

        <dl className="stats stats-vertical w-full sm:stats-horizontal">
          <div className="stat">
            <dt className="stat-title">{t('play.result.score')}</dt>
            <dd className="stat-value text-primary">{result.score}</dd>
          </div>
          <div className="stat">
            <dt className="stat-title">{t('play.result.orders')}</dt>
            <dd className="stat-value">{result.ordersCompleted}</dd>
            <dd className="stat-desc">{t('play.result.ordersFailed', { count: result.ordersFailed })}</dd>
          </div>
          <div className="stat">
            <dt className="stat-title">{t('play.result.duration')}</dt>
            <dd className="stat-value">{formatDuration(result.durationMs)}</dd>
          </div>
        </dl>

        {result.ordersCompleted === 0 && <p className="text-sm opacity-80">{t('play.result.empty')}</p>}

        <div className="card-actions flex-wrap justify-center">
          <button type="button" className="btn btn-primary" onClick={onReplay}>
            {t('play.result.replay')}
          </button>
          <button type="button" className="btn" onClick={onChangeMode}>
            {t('play.result.changeMode')}
          </button>
          <Link to="/" className="btn btn-ghost">
            {t('play.result.home')}
          </Link>
        </div>
      </div>
    </section>
  )
}
