import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { rankingCurrentUserQueryOptions, rankingPageQueryOptions } from './rankingQueries.js'
import { RANKING_BOARDS } from './rankingService.js'

export default function RankingPageContent() {
  const { t } = useTranslation()
  const [board, setBoard] = useState(RANKING_BOARDS[0])
  const [page, setPage] = useState(0)
  const boardLabels = {
    classic_1p: t('ranking.board.classic_1p'),
    classic_2p: t('ranking.board.classic_2p'),
    free_1p: t('ranking.board.free_1p'),
    free_2p: t('ranking.board.free_2p'),
    challenge_1p: t('ranking.board.challenge_1p'),
    challenge_2p: t('ranking.board.challenge_2p'),
  }
  const rankingQuery = useQuery(rankingPageQueryOptions(board, page))
  const currentUserQuery = useQuery(rankingCurrentUserQueryOptions())
  const data = rankingQuery.data
  const isOffline =
    rankingQuery.fetchStatus === 'paused' || (typeof navigator !== 'undefined' && !navigator.onLine)

  function changeBoard(event) {
    setBoard(event.currentTarget.value)
    setPage(0)
  }

  function retry() {
    rankingQuery.refetch()
  }

  return (
    <main className="min-h-screen bg-base-200 p-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6">
        <Link to="/" className="link link-primary w-fit">
          {t('ranking.back')}
        </Link>

        <section className="card bg-base-100 shadow-xl" aria-labelledby="ranking-title">
          <div className="card-body">
            <h1 id="ranking-title" className="card-title text-3xl">
              {t('ranking.title')}
            </h1>
            <p>{t('ranking.description')}</p>

            <label className="form-control mt-4 w-full max-w-sm">
              <span className="label">
                <span className="label-text">{t('ranking.board.label')}</span>
              </span>
              <select className="select select-bordered" value={board} onChange={changeBoard}>
                {RANKING_BOARDS.map((option) => (
                  <option key={option} value={option}>
                    {boardLabels[option]}
                  </option>
                ))}
              </select>
            </label>

            {rankingQuery.isPending && !data && isOffline ? (
              <div role="alert" className="alert alert-warning mt-4">
                <span>{t('ranking.offline')}</span>
                <button className="btn btn-sm" onClick={retry} disabled={rankingQuery.isFetching}>
                  {t('ranking.retry')}
                </button>
              </div>
            ) : null}

            {rankingQuery.isPending && !data && !isOffline ? (
              <p role="status" className="py-6">
                {t('ranking.loading')}
              </p>
            ) : null}

            {rankingQuery.isError && !data ? (
              <div role="alert" className="alert alert-error mt-4">
                <span>{isOffline ? t('ranking.offline') : t('ranking.error')}</span>
                <button className="btn btn-sm" onClick={retry} disabled={rankingQuery.isFetching}>
                  {t('ranking.retry')}
                </button>
              </div>
            ) : null}

            {rankingQuery.isPlaceholderData ? (
              <p role="status" aria-live="polite" className="text-sm">
                {t('ranking.updating')}
              </p>
            ) : null}

            {data && (rankingQuery.isError || isOffline) ? (
              <div role="status" className="alert mt-4">
                <span>{t('ranking.stale')}</span>
                <button className="btn btn-sm" onClick={retry} disabled={rankingQuery.isFetching}>
                  {t('ranking.retry')}
                </button>
              </div>
            ) : null}

            {data && currentUserQuery.isError ? (
              <p role="status" className="text-sm">
                {t('ranking.sessionError')}
              </p>
            ) : null}

            {data && !rankingQuery.isError && rankingQuery.isFetching && !rankingQuery.isPlaceholderData ? (
              <p role="status" aria-live="polite" className="text-sm">
                {t('ranking.updating')}
              </p>
            ) : null}

            {data && data.entries.length === 0 ? <p className="py-6">{t('ranking.empty')}</p> : null}

            {data && data.entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <caption className="sr-only">{t('ranking.tableCaption')}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('ranking.position')}</th>
                      <th scope="col">{t('ranking.player')}</th>
                      <th scope="col">{t('ranking.score')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((entry) => {
                      const isCurrentUser = entry.userId === currentUserQuery.data

                      return (
                        <tr
                          key={`${entry.userId}-${entry.position}`}
                          className={isCurrentUser ? 'bg-primary/10 font-semibold' : undefined}
                        >
                          <th scope="row">{entry.position}</th>
                          <td>
                            {entry.displayName}
                            {isCurrentUser ? (
                              <span className="badge badge-primary ml-2">{t('ranking.you')}</span>
                            ) : null}
                          </td>
                          <td>{entry.score.toLocaleString('pt-BR')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            <nav className="flex items-center justify-between gap-4" aria-label={t('ranking.pagination')}>
              <button
                className="btn btn-outline"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={page === 0 || rankingQuery.isFetching || rankingQuery.isPlaceholderData}
              >
                {t('ranking.previous')}
              </button>
              <span aria-live="polite">{t('ranking.page', { page: page + 1 })}</span>
              <button
                className="btn btn-outline"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={!data?.hasNextPage || rankingQuery.isFetching || rankingQuery.isPlaceholderData}
              >
                {t('ranking.next')}
              </button>
            </nav>
          </div>
        </section>
      </div>
    </main>
  )
}
