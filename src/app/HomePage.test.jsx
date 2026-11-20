// @vitest-environment happy-dom
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { t } from '../i18n/index.js'
import { renderWithProviders } from '../test/renderWithProviders.jsx'
import HomePage from './HomePage.jsx'

describe('HomePage', () => {
  it('mostra o título, o botão Jogar e a navegação principal', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('heading', { level: 1, name: t('app.name') })).toBeTruthy()
    expect(screen.getByRole('link', { name: t('home.play') }).getAttribute('href')).toBe('/jogar')
    const nav = screen.getByRole('navigation', { name: t('nav.label') })
    expect(nav.querySelectorAll('a')).toHaveLength(4)
  })

  it('mostra o desafio do dia como pendente para quem ainda não jogou', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('heading', { name: t('dailyChallenge.title') })).toBeTruthy()
    expect(screen.getByText(t('dailyChallenge.status.pending'))).toBeTruthy()
  })

  it('não mostra a área de conta sem backend configurado', () => {
    renderWithProviders(<HomePage />)

    expect(screen.queryByText(t('auth.account.signIn'))).toBeNull()
  })

  it('mostra o atalho de login para visitante com backend', () => {
    renderWithProviders(<HomePage />, { auth: { status: 'guest', user: null, signOut: async () => {} } })

    expect(screen.getByRole('link', { name: t('auth.account.signIn') }).getAttribute('href')).toBe('/entrar')
  })
})
