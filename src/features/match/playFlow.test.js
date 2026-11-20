import { describe, expect, it } from 'vitest'
import { PLAY_PHASES, initialPlayState, playFlowReducer } from './playFlow.js'

const CONFIG = { mode: 'free', players: 2 }
const PAYLOAD = {
  matchId: '0b6e2f1c-9d3a-4c7e-8f21-5a4b3c2d1e0f',
  mode: 'free',
  players: 2,
  seed: 7,
  contentVersion: '1',
  score: 0,
  ordersCompleted: 0,
  ordersFailed: 0,
  durationMs: 5000,
}

const run = (...actions) => actions.reduce(playFlowReducer, initialPlayState)

describe('playFlowReducer', () => {
  it('começa na escolha de partida', () => {
    expect(initialPlayState.phase).toBe(PLAY_PHASES.SETUP)
  })

  it('inicia a partida com a configuração escolhida', () => {
    const state = run({ type: 'start', config: CONFIG })

    expect(state).toMatchObject({ phase: PLAY_PHASES.PLAYING, config: CONFIG, run: 1 })
  })

  it('ignora configuração inválida', () => {
    const state = run({ type: 'start', config: { mode: 'x', players: 1 } })

    expect(state).toBe(initialPlayState)
  })

  it('percorre home → partida → resultado → jogar de novo', () => {
    const state = run(
      { type: 'start', config: CONFIG },
      { type: 'ended', payload: PAYLOAD },
      { type: 'replay' },
    )

    expect(state).toMatchObject({ phase: PLAY_PHASES.PLAYING, config: CONFIG, run: 2, result: null })
  })

  it('guarda o resultado validado', () => {
    const state = run({ type: 'start', config: CONFIG }, { type: 'ended', payload: PAYLOAD })

    expect(state.phase).toBe(PLAY_PHASES.RESULT)
    expect(state.result).toEqual(PAYLOAD)
  })

  it('vai para erro com payload inválido', () => {
    const state = run({ type: 'start', config: CONFIG }, { type: 'ended', payload: { score: 1 } })

    expect(state.phase).toBe(PLAY_PHASES.ERROR)
  })

  it('pausa e retoma só durante a partida', () => {
    expect(run({ type: 'paused' }).phase).toBe(PLAY_PHASES.SETUP)
    const paused = run({ type: 'start', config: CONFIG }, { type: 'paused' })
    expect(paused.phase).toBe(PLAY_PHASES.PAUSED)
    expect(playFlowReducer(paused, { type: 'resumed' }).phase).toBe(PLAY_PHASES.PLAYING)
  })

  it('aceita o fim da partida mesmo pausada', () => {
    const state = run(
      { type: 'start', config: CONFIG },
      { type: 'paused' },
      { type: 'ended', payload: PAYLOAD },
    )

    expect(state.phase).toBe(PLAY_PHASES.RESULT)
  })

  it('ignora match:ended fora de partida', () => {
    expect(run({ type: 'ended', payload: PAYLOAD })).toBe(initialPlayState)
  })

  it('não repete partida sem resultado', () => {
    expect(run({ type: 'replay' })).toBe(initialPlayState)
  })

  it('volta à escolha mantendo a última configuração', () => {
    const state = run({ type: 'start', config: CONFIG }, { type: 'setup' })

    expect(state).toMatchObject({ phase: PLAY_PHASES.SETUP, config: CONFIG })
  })

  it('volta ao menu marcando a falha do jogo', () => {
    const state = run({ type: 'start', config: CONFIG }, { type: 'crashed' })

    expect(state).toMatchObject({ phase: PLAY_PHASES.SETUP, config: CONFIG, crashed: true, result: null })
  })

  it('limpa o aviso de falha ao iniciar outra partida', () => {
    const state = run(
      { type: 'start', config: CONFIG },
      { type: 'crashed' },
      { type: 'start', config: CONFIG },
    )

    expect(state).toMatchObject({ phase: PLAY_PHASES.PLAYING, crashed: false })
  })

  it('ignora ação desconhecida', () => {
    expect(run({ type: 'nope' })).toBe(initialPlayState)
  })
})
