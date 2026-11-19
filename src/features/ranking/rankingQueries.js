import { fetchCurrentUserId, fetchRankingPage } from './rankingService.js'

export const rankingKeys = {
  currentUser: () => ['ranking', 'current-user'],
  page: (board, page) => ['ranking', 'page', board, page],
}

export function rankingCurrentUserQueryOptions() {
  return {
    queryKey: rankingKeys.currentUser(),
    queryFn: fetchCurrentUserId,
    staleTime: 60_000,
    retry: false,
  }
}

export function rankingPageQueryOptions(board, page) {
  return {
    queryKey: rankingKeys.page(board, page),
    queryFn: () => fetchRankingPage(board, page),
    staleTime: 60_000,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey?.[2] === board ? previousData : undefined,
  }
}
