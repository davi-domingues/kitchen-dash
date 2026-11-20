import { Sparkles, Trophy } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { contentKey } from '../../content/index.js'
import { MATCH_MODES } from '../../game/core/matchModes.js'
import { SUBMIT_STATUS } from '../progress/scoreSync.js'
import { formatDuration } from './matchEnded.js'

// Chaves literais para o i18n.test enxergar cada uma
const SUBMIT_TEXT = {
  [SUBMIT_STATUS.SENDING]: (t) => t('play.result.sync.sending'),
  [SUBMIT_STATUS.SENT]: (t) => t('play.result.sync.sent'),
  [SUBMIT_STATUS.PENDING]: (t) => t('play.result.sync.pending'),
  [SUBMIT_STATUS.FAILED]: (t) => t('play.result.sync.failed'),
  [SUBMIT_STATUS.GUEST]: (t) => t('play.result.sync.guest'),
}

export default function MatchResult({ result, recorded, submitStatus, onReplay, onChangeMode }) {
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

        <p role="status" aria-live="polite" className="text-sm">
          {SUBMIT_TEXT[submitStatus]?.(t)}
        </p>

        {recorded?.isNewRecord && (
          <p role="status" className="badge badge-lg badge-accent gap-2">
            <Trophy aria-hidden="true" className="size-4" /> {t('play.result.newRecord')}
          </p>
        )}
        {recorded?.record && !recorded.isNewRecord && (
          <p className="text-sm">
            {recorded.record.mode === MATCH_MODES.CHALLENGE
              ? t('play.result.recordTime', { time: formatDuration(recorded.record.durationMs) })
              : t('play.result.recordScore', { score: recorded.record.score })}
          </p>
        )}

        {recorded?.unlocked?.length > 0 && (
          <div role="status" className="alert alert-success">
            <Sparkles aria-hidden="true" className="size-5" />
            <span>
              {t('play.result.unlocked', {
                items: recorded.unlocked.map((id) => t(contentKey('cosmetic', id))).join(', '),
              })}{' '}
              <Link to="/perfil" className="link">
                {t('play.result.customize')}
              </Link>
            </span>
          </div>
        )}

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
