import { describe, expect, it } from 'vitest'
import { CORE_EVENTS } from '../core/coreEvents.js'
import { createMatch, endMatch } from '../core/match.js'
import { createMatchEndGuard } from './matchEndGuard.js'

const MATCH_ID = '00000000-0000-4000-8000-000000000001'
const ended = (score) => ({ type: CORE_EVENTS.MATCH_ENDED, payload: { mode: 'free', score } })

describe('createMatchEndGuard', () => {
  it('ignora lotes sem match:ended', () => {
    const take = createMatchEndGuard(MATCH_ID)
    expect(take([])).toBeNull()
    expect(take([{ type: CORE_EVENTS.ORDER_DELIVERED }])).toBeNull()
  })

  it('devolve o payload com o matchId na primeira vez', () => {
    const take = createMatchEndGuard(MATCH_ID)
    expect(take([{ type: CORE_EVENTS.ORDER_DELIVERED }, ended(90)])).toEqual({
      matchId: MATCH_ID,
      mode: 'free',
      score: 90,
    })
  })

  it('não devolve um segundo fim', () => {
    const take = createMatchEndGuard(MATCH_ID)
    take([ended(90)])
    expect(take([ended(120)])).toBeNull()
  })

  it('com o core real, Encerrar duas vezes gera um só fim', () => {
    const take = createMatchEndGuard(MATCH_ID)
    const { state } = createMatch({ mode: 'free', players: 1, seed: 3, contentVersion: 'v-test' })
    const first = endMatch(state)
    const second = endMatch(first.state)

    expect(take(first.events)).toMatchObject({ matchId: MATCH_ID, mode: 'free', players: 1, seed: 3 })
    expect(take(second.events)).toBeNull()
  })
})
