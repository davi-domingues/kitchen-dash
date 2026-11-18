import { describe, expect, it } from 'vitest'
import { MATCH_STATUS, createMatchState, pauseMatch, resumeMatch } from './matchState.js'

const base = { seed: 7, mode: 'classic', contentVersion: 'v1' }

describe('createMatchState', () => {
  it('cria a partida rodando, no tempo zero e sem itens nem pedidos', () => {
    const state = createMatchState({ ...base, durationMs: 180000 })

    expect(state).toMatchObject({
      seed: 7,
      rngState: 7,
      status: MATCH_STATUS.RUNNING,
      tick: 0,
      elapsedMs: 0,
      durationMs: 180000,
      score: 0,
      chefs: [],
      stations: [],
      items: [],
      orders: [],
    })
  })

  it('aceita partida sem tempo limite', () => {
    expect(createMatchState(base).durationMs).toBeNull()
  })

  it('rejeita seed que não é inteiro', () => {
    expect(() => createMatchState({ ...base, seed: 1.5 })).toThrow(TypeError)
  })

  it('rejeita duração não positiva', () => {
    expect(() => createMatchState({ ...base, durationMs: 0 })).toThrow(RangeError)
  })
})

describe('pauseMatch e resumeMatch', () => {
  it('pausa e retoma sem alterar o restante do estado', () => {
    const state = createMatchState(base)

    const paused = pauseMatch(state)
    const resumed = resumeMatch(paused)

    expect(paused.status).toBe(MATCH_STATUS.PAUSED)
    expect(resumed).toEqual(state)
  })

  it('ignora pausar o que não está rodando e retomar o que não está pausado', () => {
    const state = createMatchState(base)
    const ended = { ...state, status: MATCH_STATUS.ENDED }

    expect(pauseMatch(ended)).toBe(ended)
    expect(resumeMatch(state)).toBe(state)
  })
})
