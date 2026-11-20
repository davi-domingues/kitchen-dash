// @vitest-environment happy-dom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { t } from '../i18n/index.js'
import { renderWithProviders } from '../test/renderWithProviders.jsx'
import ProfilePage from './ProfilePage.jsx'

describe('ProfilePage', () => {
  it('mostra o estado vazio com atalho para jogar quando não há partidas', () => {
    renderWithProviders(<ProfilePage />)

    expect(screen.getByRole('heading', { level: 1, name: t('nav.profile') })).toBeTruthy()
    expect(screen.getByText(t('profile.local.empty'))).toBeTruthy()
    expect(screen.getByRole('link', { name: t('home.play') }).getAttribute('href')).toBe('/jogar')
    expect(screen.queryByText(t('profile.local.notPersistent'))).toBeNull()
  })

  it('oferece apagar o progresso local', () => {
    renderWithProviders(<ProfilePage />)

    expect(screen.getByRole('button', { name: t('profile.settings.clear') })).toBeTruthy()
  })
})
