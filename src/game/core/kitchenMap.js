// Regras de grade da cozinha: o que bloqueia, onde os chefs nascem, para qual estação cada um
// olha e se toda estação pode ser alcançada. Puro: só lê o mapa do conteúdo e o estado.
import { createChef } from './stations.js'

export const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
})

const PLAYER_IDS = ['p1', 'p2']
const FLOOR = 'floor'
const WALL = 'wall'

export function tileKind(kitchen, x, y) {
  const symbol = kitchen.tiles[y]?.[x]
  return symbol === undefined ? WALL : kitchen.legend[symbol].kind
}

export const isWalkable = (kitchen, x, y) => tileKind(kitchen, x, y) === FLOOR

export function createKitchenChefs(kitchen, playerCount) {
  if (playerCount !== 1 && playerCount !== 2) throw new Error('playerCount deve ser 1 ou 2')
  if (kitchen.spawns.length < playerCount) throw new Error(`cozinha "${kitchen.id}" sem spawns suficientes`)
  return PLAYER_IDS.slice(0, playerCount).map((id, index) => {
    const [x, y] = kitchen.spawns[index]
    return { ...createChef(id), x, y, facing: 'down', stepCooldownMs: 0 }
  })
}

export function findTargetStation(state, chefId) {
  const chef = state.chefs.find((c) => c.id === chefId)
  if (!chef) throw new Error(`chef desconhecido: "${chefId}"`)
  const { x, y } = DIRECTIONS[chef.facing]
  return state.stations.find((s) => s.x === chef.x + x && s.y === chef.y + y) ?? null
}

const neighbors = (x, y) => Object.values(DIRECTIONS).map((d) => [x + d.x, y + d.y])

// BFS no piso a partir dos spawns; estação vale se algum vizinho ortogonal for piso alcançado
export function checkReachability(kitchen) {
  const key = (x, y) => `${x},${y}`
  const seen = new Set()
  const queue = kitchen.spawns.filter(([x, y]) => isWalkable(kitchen, x, y))
  queue.forEach(([x, y]) => seen.add(key(x, y)))
  while (queue.length > 0) {
    const [x, y] = queue.shift()
    for (const [nx, ny] of neighbors(x, y)) {
      if (isWalkable(kitchen, nx, ny) && !seen.has(key(nx, ny))) {
        seen.add(key(nx, ny))
        queue.push([nx, ny])
      }
    }
  }
  const unreachable = []
  kitchen.tiles.forEach((row, y) => {
    ;[...row].forEach((_, x) => {
      const kind = tileKind(kitchen, x, y)
      if (kind === FLOOR || kind === WALL) return
      if (!neighbors(x, y).some(([nx, ny]) => seen.has(key(nx, ny)))) unreachable.push(`${kind}-${x}-${y}`)
    })
  })
  return { ok: unreachable.length === 0, unreachable }
}
