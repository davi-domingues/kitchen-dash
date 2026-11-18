import { describe, expect, it } from 'vitest'
import { CORE_EVENTS, createEvent } from './coreEvents.js'
import { MATCH_STATUS, createMatchState, pauseMatch } from './matchState.js'
import { MAX_DT_MS, createUpdate } from './update.js'

const base = { seed: 42, mode: 'classic', contentVersion: 'v1' }

// Sistema de teste: sorteia um valor por tick e registra as entradas recebidas.
function rollingSystem(state, { inputs, rng }) {
  const roll = rng()
  return {
    state: { ...state, items: [...state.items, { roll, inputs }] },
    events: [createEvent('test:rolled', { roll })],
  }
}

function play(seed, inputsPerTick) {
  const update = createUpdate([rollingSystem])
  let state = createMatchState({ ...base, seed })
  const events = []
  for (const inputs of inputsPerTick) {
    const result = update(state, inputs, 16)
    state = result.state
    events.push(...result.events)
  }
  return { state, events }
}

describe('update', () => {
  it('mesmo seed e mesmos inputs geram o mesmo estado e os mesmos eventos', () => {
    const inputs = [[{ action: 'move' }], [], [{ action: 'interact' }]]

    expect(play(42, inputs)).toEqual(play(42, inputs))
  })

  it('seeds diferentes geram estados diferentes', () => {
    expect(play(1, [[]]).state).not.toEqual(play(2, [[]]).state)
  })

  it('avança o relógio e o tick sem mutar o estado anterior', () => {
    const update = createUpdate()
    const state = createMatchState(base)

    const { state: next, events } = update(state, [], 16)

    expect(next.elapsedMs).toBe(16)
    expect(next.tick).toBe(1)
    expect(state.elapsedMs).toBe(0)
    expect(events).toEqual([])
  })

  it('limita o passo a MAX_DT_MS', () => {
    const update = createUpdate()

    const { state } = update(createMatchState(base), [], 5000)

    expect(state.elapsedMs).toBe(MAX_DT_MS)
  })

  it('rejeita dt negativo ou não finito', () => {
    const update = createUpdate()
    const state = createMatchState(base)

    expect(() => update(state, [], -1)).toThrow(RangeError)
    expect(() => update(state, [], Number.NaN)).toThrow(RangeError)
  })

  it('não avança partida pausada', () => {
    const update = createUpdate([rollingSystem])
    const paused = pauseMatch(createMatchState(base))

    expect(update(paused, [], 16)).toEqual({ state: paused, events: [] })
  })

  it('passa o dt limitado e as entradas aos sistemas, em ordem', () => {
    const calls = []
    const spy = (name) => (state, ctx) => {
      calls.push([name, ctx.dtMs, ctx.inputs])
      return { state, events: [] }
    }
    const update = createUpdate([spy('a'), spy('b')])

    update(createMatchState(base), ['x'], 400)

    expect(calls).toEqual([
      ['a', MAX_DT_MS, ['x']],
      ['b', MAX_DT_MS, ['x']],
    ])
  })

  it('encerra a partida ao fim do tempo e emite match:ended uma única vez', () => {
    const update = createUpdate()
    const state = { ...createMatchState({ ...base, durationMs: 100 }), score: 30 }

    const first = update(state, [], 120)
    const second = update(first.state, [], 16)

    expect(first.state.status).toBe(MATCH_STATUS.ENDED)
    expect(first.events).toEqual([
      createEvent(CORE_EVENTS.MATCH_ENDED, {
        seed: 42,
        contentVersion: 'v1',
        mode: 'classic',
        score: 30,
        durationMs: 100,
      }),
    ])
    expect(second.events).toEqual([])
  })

  it('partida sem tempo limite não encerra pelo relógio', () => {
    const update = createUpdate()

    const { state } = update(createMatchState(base), [], MAX_DT_MS)

    expect(state.status).toBe(MATCH_STATUS.RUNNING)
  })
})
