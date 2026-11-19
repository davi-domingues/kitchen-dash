import { QueryClient, QueryObserver, onlineManager } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { rankingCurrentUserQueryOptions, rankingKeys, rankingPageQueryOptions } from './rankingQueries.js'

describe('ranking query options', () => {
  it('separa cache por quadro e página com validade de 60 segundos', () => {
    const firstPage = rankingPageQueryOptions('classic_1p', 0)
    const secondPage = rankingPageQueryOptions('classic_1p', 1)
    const otherBoard = rankingPageQueryOptions('free_1p', 0)

    expect(firstPage.queryKey).toEqual(rankingKeys.page('classic_1p', 0))
    expect(firstPage.staleTime).toBe(60_000)
    expect(secondPage.queryKey).not.toEqual(firstPage.queryKey)
    expect(otherBoard.queryKey).not.toEqual(firstPage.queryKey)
  })

  it('mantém dados anteriores somente ao trocar de página no mesmo quadro', () => {
    const data = { entries: [{ userId: 'player' }], hasNextPage: true }
    const previousPage = {
      queryKey: rankingKeys.page('classic_1p', 0),
    }

    const nextPage = rankingPageQueryOptions('classic_1p', 1)
    expect(nextPage.placeholderData(data, previousPage)).toBe(data)

    const differentBoard = rankingPageQueryOptions('free_1p', 0)
    expect(differentBoard.placeholderData(data, previousPage)).toBeUndefined()
  })

  it('mantém a identidade atual em cache separada do ranking público', () => {
    const options = rankingCurrentUserQueryOptions()

    expect(options.queryKey).toEqual(rankingKeys.currentUser())
    expect(options.staleTime).toBe(60_000)
    expect(options.retry).toBe(false)
  })

  it('pausa uma primeira consulta sem cache enquanto o navegador está offline', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    onlineManager.setOnline(false)
    const observer = new QueryObserver(queryClient, {
      ...rankingPageQueryOptions('classic_1p', 0),
      queryFn: async () => ({ entries: [], hasNextPage: false }),
    })
    const unsubscribe = observer.subscribe(() => {})

    try {
      expect(observer.getCurrentResult().isPending).toBe(true)
      expect(observer.getCurrentResult().fetchStatus).toBe('paused')
    } finally {
      unsubscribe()
      observer.destroy()
      queryClient.clear()
      onlineManager.setOnline(true)
    }
  })

  it('preserva cache após falha e atualiza com refetch manual', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const options = rankingPageQueryOptions('classic_1p', 0)
    const previousData = { entries: [{ userId: 'player' }], hasNextPage: false }
    const refreshedData = { entries: [{ userId: 'player', score: 100 }], hasNextPage: false }
    let attempts = 0
    const queryFn = async () => {
      attempts += 1
      if (attempts === 1) {
        throw new Error('network unavailable')
      }

      return refreshedData
    }

    queryClient.setQueryData(options.queryKey, previousData)
    const observer = new QueryObserver(queryClient, { ...options, queryFn })
    const unsubscribe = observer.subscribe(() => {})
    const failedResult = await observer.refetch()

    expect(failedResult.isError).toBe(true)
    expect(failedResult.data).toBe(previousData)

    const retryResult = await observer.refetch()

    expect(retryResult.isSuccess).toBe(true)
    expect(retryResult.data).toEqual(refreshedData)

    unsubscribe()
    observer.destroy()
    queryClient.clear()
  })
})
