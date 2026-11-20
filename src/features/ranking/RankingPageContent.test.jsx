// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { t } from '../../i18n/index.js'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import RankingPageContent from './RankingPageContent.jsx'
import { fetchCurrentUserId, fetchRankingPage } from './rankingService.js'

// Dublê do serviço: nenhum teste de componente fala com o Supabase
vi.mock('./rankingService.js', () => ({
  RANKING_BOARDS: ['classic_1p', 'classic_2p', 'free_1p', 'free_2p', 'challenge_1p', 'challenge_2p'],
  fetchRankingPage: vi.fn(),
  fetchCurrentUserId: vi.fn(),
}))

const EMPTY_PAGE = { entries: [], hasNextPage: false }

describe('RankingPageContent', () => {
  beforeEach(() => {
    vi.mocked(fetchRankingPage).mockReset()
    vi.mocked(fetchCurrentUserId).mockResolvedValue(null)
  })

  it('mostra o estado vazio', async () => {
    vi.mocked(fetchRankingPage).mockResolvedValue(EMPTY_PAGE)

    renderWithProviders(<RankingPageContent />)

    expect(await screen.findByText(t('ranking.empty'))).toBeTruthy()
  })

  it('mostra erro com opção de tentar de novo', async () => {
    vi.mocked(fetchRankingPage).mockRejectedValue(new Error('falha fictícia'))

    renderWithProviders(<RankingPageContent />)

    expect((await screen.findByRole('alert')).textContent).toContain(t('ranking.error'))
    vi.mocked(fetchRankingPage).mockResolvedValue(EMPTY_PAGE)
    fireEvent.click(screen.getByRole('button', { name: t('ranking.retry') }))
    expect(await screen.findByText(t('ranking.empty'))).toBeTruthy()
  })

  it('lista as entradas e destaca o jogador atual', async () => {
    vi.mocked(fetchCurrentUserId).mockResolvedValue('user-2')
    vi.mocked(fetchRankingPage).mockResolvedValue({
      entries: [
        { userId: 'user-1', position: 1, displayName: 'Chef Alfa', score: 1200 },
        { userId: 'user-2', position: 2, displayName: 'Chef Beta', score: 900 },
      ],
      hasNextPage: false,
    })

    renderWithProviders(<RankingPageContent />)

    expect(await screen.findByText('Chef Alfa')).toBeTruthy()
    expect(await screen.findByText(t('ranking.you'))).toBeTruthy()
  })
})
