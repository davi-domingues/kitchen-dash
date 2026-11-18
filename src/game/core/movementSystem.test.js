import { describe, expect, it } from 'vitest'
import { KITCHENS } from '../../content/index.js'
import { createKitchenChefs } from './kitchenMap.js'
import { CHEF_STEP_MS, MOVE_ACTION, createMovementSystem } from './movementSystem.js'

const BISTRO = KITCHENS[0]
const system = createMovementSystem(BISTRO)
const move = (chefId, x, y) => ({ chefId, action: MOVE_ACTION, x, y })

function at(chefOverrides = {}, playerCount = 1) {
  const chefs = createKitchenChefs(BISTRO, playerCount)
  chefs[0] = { ...chefs[0], ...chefOverrides }
  return { chefs, stations: [] }
}

const p1 = (result) => result.state.chefs[0]

describe('movementSystem', () => {
  it('anda um tile e espera CHEF_STEP_MS para o próximo', () => {
    const first = system(at(), { dtMs: 16, inputs: [move('p1', 1, 0)] })
    expect(p1(first)).toMatchObject({ x: 4, y: 2, facing: 'right', stepCooldownMs: CHEF_STEP_MS })
    const waiting = system(first.state, { dtMs: CHEF_STEP_MS - 1, inputs: [move('p1', 1, 0)] })
    expect(p1(waiting)).toMatchObject({ x: 4, stepCooldownMs: 1 })
    const second = system(waiting.state, { dtMs: 1, inputs: [move('p1', 1, 0)] })
    expect(p1(second).x).toBe(5)
  })

  it('soltar a direção zera a espera e mantém o olhar', () => {
    const state = at({ facing: 'left', stepCooldownMs: 100 })
    expect(p1(system(state, { dtMs: 16, inputs: [] }))).toMatchObject({ facing: 'left', stepCooldownMs: 0 })
    expect(p1(system(state, { dtMs: 16, inputs: [move('p1', 0, 0)] })).x).toBe(3)
  })

  it('parede e estação bloqueiam, mas o chef vira para elas', () => {
    const wall = system(at({ x: 1, y: 2 }), { dtMs: 16, inputs: [move('p1', -1, 0)] })
    expect(p1(wall)).toMatchObject({ x: 1, y: 2, facing: 'left' })
    const crate = system(at({ x: 1, y: 2 }), { dtMs: 16, inputs: [move('p1', 0, -1)] })
    expect(p1(crate)).toMatchObject({ x: 1, y: 2, facing: 'up' })
  })

  it('na diagonal o horizontal tem prioridade', () => {
    expect(p1(system(at(), { dtMs: 16, inputs: [move('p1', -1, 1)] }))).toMatchObject({ x: 2, y: 2 })
  })

  it('um chef bloqueia o outro', () => {
    const state = at({ x: 8, y: 5 }, 2)
    const result = system(state, { dtMs: 16, inputs: [move('p1', 1, 0)] })
    expect(p1(result)).toMatchObject({ x: 8, y: 5, facing: 'right' })
  })

  it('o segundo chef não entra no tile que o primeiro acabou de ocupar', () => {
    const state = at({ x: 7, y: 5 }, 2)
    const result = system(state, { dtMs: 16, inputs: [move('p1', 1, 0), move('p2', -1, 0)] })
    expect(result.state.chefs.map(({ x, y }) => [x, y])).toEqual([
      [8, 5],
      [9, 5],
    ])
  })

  it('andar interrompe o corte', () => {
    const result = system(at({ workingAt: 'cutting-1-3' }), { dtMs: 16, inputs: [move('p1', 0, 1)] })
    expect(p1(result).workingAt).toBeNull()
  })
})
