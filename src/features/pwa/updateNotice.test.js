import { describe, expect, it } from 'vitest'
import { shouldShowUpdateNotice } from './updateNotice.js'

describe('shouldShowUpdateNotice', () => {
  it('mostra quando há versão nova fora da partida', () => {
    expect(shouldShowUpdateNotice({ needRefresh: true, dismissed: false, pathname: '/' })).toBe(true)
    expect(shouldShowUpdateNotice({ needRefresh: true, dismissed: false, pathname: '/jogador' })).toBe(true)
  })

  it('nunca mostra na tela da partida', () => {
    expect(shouldShowUpdateNotice({ needRefresh: true, dismissed: false, pathname: '/jogar' })).toBe(false)
    expect(shouldShowUpdateNotice({ needRefresh: true, dismissed: false, pathname: '/jogar/x' })).toBe(false)
  })

  it('não mostra sem versão nova ou depois de dispensado', () => {
    expect(shouldShowUpdateNotice({ needRefresh: false, dismissed: false, pathname: '/' })).toBe(false)
    expect(shouldShowUpdateNotice({ needRefresh: true, dismissed: true, pathname: '/' })).toBe(false)
  })
})
