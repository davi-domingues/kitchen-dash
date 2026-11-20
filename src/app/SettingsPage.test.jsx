// @vitest-environment happy-dom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { t } from '../i18n/index.js'
import { renderWithProviders } from '../test/renderWithProviders.jsx'
import SettingsPage from './SettingsPage.jsx'

describe('SettingsPage', () => {
  it('lista os controles dos dois jogadores e da pausa', () => {
    renderWithProviders(<SettingsPage />)

    expect(screen.getByRole('heading', { level: 1, name: t('settings.title') })).toBeTruthy()
    for (const name of [t('settings.players.p1'), t('settings.players.p2'), t('settings.players.pause')]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy()
    }
  })

  it('informa que já está no padrão ao restaurar sem mudanças', () => {
    renderWithProviders(<SettingsPage />)

    fireEvent.click(screen.getByRole('button', { name: t('settings.restore.button') }))
    fireEvent.click(screen.getByRole('button', { name: t('settings.restore.confirm') }))

    expect(screen.getByText(t('settings.status.alreadyDefault'))).toBeTruthy()
  })
})
