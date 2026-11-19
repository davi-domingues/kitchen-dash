import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MATCH_MODES, PLAYER_COUNTS } from '../../game/core/matchModes.js'
import { storage } from '../../services/storage.js'
import { formatDuration } from '../match/matchEnded.js'
import { getBoard } from './progress.js'
import { clearCosmetics } from '../cosmetics/cosmeticsStore.js'
import { clearProgress, loadProgress } from './progressStore.js'

function useModeLabels() {
  const { t } = useTranslation()
  return {
    [MATCH_MODES.CLASSIC]: t('play.setup.modeClassic'),
    [MATCH_MODES.FREE]: t('play.setup.modeFree'),
    [MATCH_MODES.CHALLENGE]: t('play.setup.modeChallenge'),
  }
}

function BoardTable({ mode, players, entries }) {
  const { t } = useTranslation()
  const isChallenge = mode === MATCH_MODES.CHALLENGE
  const caption = t('profile.local.boardCaption', { mode: useModeLabels()[mode], players })
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <caption className="text-left font-semibold">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{isChallenge ? t('play.result.duration') : t('play.result.score')}</th>
            <th scope="col">{t('play.result.orders')}</th>
            <th scope="col">{t('profile.local.date')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.matchId}>
              <td>{i + 1}</td>
              <td>{isChallenge ? formatDuration(entry.durationMs) : entry.score}</td>
              <td>{entry.ordersCompleted}</td>
              <td>{new Date(entry.endedAt).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ClearProgress({ onCleared }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)
  function confirm() {
    clearProgress()
    clearCosmetics()
    dialogRef.current?.close()
    onCleared()
  }
  return (
    <section aria-labelledby="settings-title" className="flex flex-col gap-2">
      <h2 id="settings-title" className="text-xl font-bold">
        {t('profile.settings.title')}
      </h2>
      <button
        type="button"
        className="btn btn-outline btn-error self-start"
        onClick={() => dialogRef.current?.showModal()}
      >
        {t('profile.settings.clear')}
      </button>
      <dialog ref={dialogRef} className="modal" aria-labelledby="clear-title">
        <div className="modal-box">
          <h3 id="clear-title" className="text-lg font-bold">
            {t('profile.settings.clearConfirmTitle')}
          </h3>
          <p className="py-4">{t('profile.settings.clearConfirmText')}</p>
          <div className="modal-action">
            <button type="button" className="btn" onClick={() => dialogRef.current?.close()}>
              {t('profile.settings.cancel')}
            </button>
            <button type="button" className="btn btn-error" onClick={confirm}>
              {t('profile.settings.confirm')}
            </button>
          </div>
        </div>
      </dialog>
    </section>
  )
}

// Leitura síncrona do localStorage: não há estado de carregamento, só vazio e aviso
export default function LocalProgress({ onCleared }) {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(() => loadProgress())
  const { stats } = progress
  const groups = Object.values(MATCH_MODES)
    .flatMap((mode) =>
      PLAYER_COUNTS.map((players) => ({ mode, players, entries: getBoard(progress, mode, players) })),
    )
    .filter((group) => group.entries.length > 0)

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      {!storage.isPersistent && (
        <div role="alert" className="alert alert-warning">
          <span>{t('profile.local.notPersistent')}</span>
        </div>
      )}

      {stats.matchesPlayed === 0 ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p>{t('profile.local.empty')}</p>
          <Link to="/jogar" className="btn btn-primary">
            {t('home.play')}
          </Link>
        </div>
      ) : (
        <>
          <section aria-labelledby="stats-title">
            <h2 id="stats-title" className="text-xl font-bold">
              {t('profile.local.statsTitle')}
            </h2>
            <dl className="stats stats-vertical w-full sm:stats-horizontal">
              <div className="stat">
                <dt className="stat-title">{t('profile.local.matches')}</dt>
                <dd className="stat-value">{stats.matchesPlayed}</dd>
              </div>
              <div className="stat">
                <dt className="stat-title">{t('play.result.orders')}</dt>
                <dd className="stat-value">{stats.ordersCompleted}</dd>
                <dd className="stat-desc">{t('play.result.ordersFailed', { count: stats.ordersFailed })}</dd>
              </div>
              <div className="stat">
                <dt className="stat-title">{t('profile.local.playTime')}</dt>
                <dd className="stat-value">{formatDuration(stats.playTimeMs)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="board-title" className="flex flex-col gap-4">
            <h2 id="board-title" className="text-xl font-bold">
              {t('profile.local.boardTitle')}
            </h2>
            {groups.length === 0 ? (
              <p>{t('profile.local.boardEmpty')}</p>
            ) : (
              groups.map((group) => <BoardTable key={`${group.mode}-${group.players}`} {...group} />)
            )}
          </section>
        </>
      )}

      <ClearProgress
        onCleared={() => {
          setProgress(loadProgress())
          onCleared?.()
        }}
      />
    </div>
  )
}
