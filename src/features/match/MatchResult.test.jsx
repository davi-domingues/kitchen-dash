// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { t } from '../../i18n/index.js'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import MatchResult from './MatchResult.jsx'

const RESULT = { score: 420, ordersCompleted: 5, ordersFailed: 1, durationMs: 180_000 }

function renderResult(props = {}) {
  const handlers = { onReplay: vi.fn(), onChangeMode: vi.fn() }
  renderWithProviders(<MatchResult result={RESULT} {...handlers} {...props} />)
  return handlers
}

describe('MatchResult', () => {
  it('mostra a pontuação e leva o foco ao título', () => {
    renderResult()

    const heading = screen.getByRole('heading', { name: t('play.result.title') })
    expect(document.activeElement).toBe(heading)
    expect(screen.getByText('420')).toBeTruthy()
  })

  it('anuncia novo recorde', () => {
    renderResult({ recorded: { isNewRecord: true, record: { mode: 'classic', score: 420 }, unlocked: [] } })

    expect(screen.getByRole('status').textContent).toContain(t('play.result.newRecord'))
  })

  it('mostra o recorde anterior quando não bateu', () => {
    renderResult({ recorded: { isNewRecord: false, record: { mode: 'classic', score: 900 }, unlocked: [] } })

    expect(screen.queryByText(t('play.result.newRecord'))).toBeNull()
    expect(screen.getByText(t('play.result.recordScore', { score: 900 }))).toBeTruthy()
  })

  it('mostra a mensagem de partida vazia sem entregas', () => {
    renderResult({ result: { ...RESULT, ordersCompleted: 0 } })

    expect(screen.getByText(t('play.result.empty'))).toBeTruthy()
  })

  it('aciona jogar de novo e trocar modo', () => {
    const { onReplay, onChangeMode } = renderResult()

    fireEvent.click(screen.getByRole('button', { name: t('play.result.replay') }))
    fireEvent.click(screen.getByRole('button', { name: t('play.result.changeMode') }))

    expect(onReplay).toHaveBeenCalledOnce()
    expect(onChangeMode).toHaveBeenCalledOnce()
  })
})
