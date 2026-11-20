// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { t } from '../../i18n/index.js'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import MigrationNotice from './MigrationNotice.jsx'
import { useAccountMigration } from './useAccountMigration.js'

vi.mock('./useAccountMigration.js', () => ({ useAccountMigration: vi.fn() }))

function renderNotice(notice) {
  const dismiss = vi.fn()
  vi.mocked(useAccountMigration).mockReturnValue({ notice, dismiss })
  renderWithProviders(<MigrationNotice />)
  return dismiss
}

describe('MigrationNotice', () => {
  it('fica vazio sem migração', () => {
    renderNotice(null)

    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('mostra o progresso', () => {
    renderNotice({ kind: 'progress', done: 2, total: 5 })

    expect(screen.getByText(t('migration.notice.progress', { done: 2, total: 5 }))).toBeTruthy()
  })

  it('avisa descartes ao concluir e pode ser dispensado', () => {
    const dismiss = renderNotice({ kind: 'done', sent: 3, discarded: 1 })

    const text = screen.getByRole('status').textContent
    expect(text).toContain(t('migration.notice.done', { count: 3 }))
    expect(text).toContain(t('migration.notice.discarded', { count: 1 }))
    fireEvent.click(screen.getByRole('button', { name: t('migration.notice.dismiss') }))
    expect(dismiss).toHaveBeenCalledOnce()
  })
})
