import { describe, expect, it } from 'vitest'
import { KITCHENS } from '../../content/index.js'
import {
  checkReachability,
  createKitchenChefs,
  findTargetStation,
  isWalkable,
  tileKind,
} from './kitchenMap.js'
import { createStations } from './stations.js'

const BISTRO = KITCHENS[0]

const tiny = (tiles, spawns = [[1, 1]]) => ({
  id: 'tiny',
  tiles,
  spawns,
  legend: {
    '#': { kind: 'wall' },
    '.': { kind: 'floor' },
    T: { kind: 'crate', ingredient: 'tomato' },
    X: { kind: 'trash' },
  },
})

describe('tileKind / isWalkable', () => {
  it('lê o tipo da legenda e trata fora do mapa como parede', () => {
    expect(tileKind(BISTRO, 1, 1)).toBe('crate')
    expect(tileKind(BISTRO, -1, 0)).toBe('wall')
    expect(tileKind(BISTRO, 0, 99)).toBe('wall')
    expect(isWalkable(BISTRO, 3, 2)).toBe(true)
    expect(isWalkable(BISTRO, 1, 1)).toBe(false)
  })
})

describe('createKitchenChefs', () => {
  it('põe P1 e P2 nos spawns olhando para baixo', () => {
    const chefs = createKitchenChefs(BISTRO, 2)
    expect(chefs).toEqual([
      {
        id: 'p1',
        holding: null,
        workingAt: null,
        x: 3,
        y: 2,
        facing: 'down',
        stepCooldownMs: 0,
        idleMs: 0,
        idleKey: null,
        autoAction: null,
        autoFired: null,
      },
      {
        id: 'p2',
        holding: null,
        workingAt: null,
        x: 9,
        y: 5,
        facing: 'down',
        stepCooldownMs: 0,
        idleMs: 0,
        idleKey: null,
        autoAction: null,
        autoFired: null,
      },
    ])
  })

  it('cria só P1 em 1 jogador', () => {
    expect(createKitchenChefs(BISTRO, 1).map((c) => c.id)).toEqual(['p1'])
  })

  it('rejeita playerCount inválido e spawns insuficientes', () => {
    expect(() => createKitchenChefs(BISTRO, 3)).toThrow('playerCount')
    expect(() => createKitchenChefs(tiny(['###', '#.#', '###']), 2)).toThrow('spawns')
  })
})

describe('findTargetStation', () => {
  const stations = createStations(BISTRO)
  const stateWith = (chef) => ({ chefs: [chef], stations })

  it('devolve a estação no tile para onde o chef olha', () => {
    const chef = { id: 'p1', x: 1, y: 2, facing: 'up' }
    expect(findTargetStation(stateWith(chef), 'p1').id).toBe('crate-1-1')
  })

  it('devolve null de frente para o piso', () => {
    const chef = { id: 'p1', x: 3, y: 2, facing: 'down' }
    expect(findTargetStation(stateWith(chef), 'p1')).toBeNull()
  })

  it('falha com chef desconhecido', () => {
    expect(() => findTargetStation({ chefs: [], stations }, 'p9')).toThrow('chef desconhecido')
  })
})

describe('checkReachability', () => {
  it.each(KITCHENS.map((k) => [k.id, k]))('a cozinha %s tem todas as estações alcançáveis', (_, k) => {
    expect(checkReachability(k)).toEqual({ ok: true, unreachable: [] })
  })

  it('aponta a estação isolada por paredes', () => {
    const kitchen = tiny(['#####', '#.#T#', '#.###', '#X###', '#####'])
    expect(checkReachability(kitchen)).toEqual({ ok: false, unreachable: ['crate-3-1'] })
  })

  it('ignora spawn que não está no piso', () => {
    const kitchen = tiny(['####', '#.X#', '####'], [[0, 0]])
    expect(checkReachability(kitchen).unreachable).toEqual(['trash-2-1'])
  })
})
