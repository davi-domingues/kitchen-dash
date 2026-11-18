import { describe, expect, it } from 'vitest'
import { DEFAULT_MATCH_CONFIG, MATCH_MODES, isMatchConfig, isMatchMode, isPlayerCount } from './matchModes.js'

describe('matchModes', () => {
  it('expõe os três modos do PRD', () => {
    expect(Object.values(MATCH_MODES)).toEqual(['classic', 'free', 'challenge'])
  })

  it('aceita só modos conhecidos', () => {
    expect(isMatchMode('free')).toBe(true)
    expect(isMatchMode('daily')).toBe(false)
  })

  it('aceita só 1 ou 2 jogadores', () => {
    expect(isPlayerCount(1)).toBe(true)
    expect(isPlayerCount(2)).toBe(true)
    expect(isPlayerCount(3)).toBe(false)
    expect(isPlayerCount('1')).toBe(false)
  })

  it('valida a configuração completa', () => {
    expect(isMatchConfig(DEFAULT_MATCH_CONFIG)).toBe(true)
    expect(isMatchConfig({ mode: 'challenge', players: 2 })).toBe(true)
    expect(isMatchConfig({ mode: 'challenge' })).toBe(false)
    expect(isMatchConfig(null)).toBe(false)
  })

  it('usa 1 jogador no Clássico como padrão', () => {
    expect(DEFAULT_MATCH_CONFIG).toEqual({ mode: 'classic', players: 1 })
  })
})
