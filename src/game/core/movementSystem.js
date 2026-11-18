// Movimento em grade (contrato do KD-11): um tile por passo, sem física, para ser reproduzível.
import { DIRECTIONS, isWalkable } from './kitchenMap.js'

// Com a direção segurada o chef anda um tile a cada CHEF_STEP_MS (ESTUDOS_E_DECISOES)
export const CHEF_STEP_MS = 150
export const MOVE_ACTION = 'move'

// Na diagonal o eixo horizontal vence, para o passo ser sempre de um tile ortogonal
function directionOf({ x, y }) {
  if (x !== 0) return x < 0 ? 'left' : 'right'
  if (y !== 0) return y < 0 ? 'up' : 'down'
  return null
}

function stepChef(kitchen, chefs, chef, input, dtMs) {
  const cooldown = Math.max(0, chef.stepCooldownMs - dtMs)
  const facing = input ? directionOf(input) : null
  if (!facing) return { ...chef, stepCooldownMs: 0 }
  if (cooldown > 0) return { ...chef, facing, stepCooldownMs: cooldown }
  const x = chef.x + DIRECTIONS[facing].x
  const y = chef.y + DIRECTIONS[facing].y
  const blocked = !isWalkable(kitchen, x, y) || chefs.some((c) => c.id !== chef.id && c.x === x && c.y === y)
  // Andar interrompe o corte: picar exige ficar na tábua
  if (blocked) return { ...chef, facing, stepCooldownMs: 0 }
  return { ...chef, facing, x, y, workingAt: null, stepCooldownMs: CHEF_STEP_MS }
}

export function createMovementSystem(kitchen) {
  return function movementSystem(state, { dtMs, inputs }) {
    const moves = new Map(inputs.filter((i) => i.action === MOVE_ACTION).map((i) => [i.chefId, i]))
    // Em ordem: o chef que já andou neste frame ocupa o tile novo para os seguintes
    const chefs = [...state.chefs]
    chefs.forEach((chef, index) => {
      chefs[index] = stepChef(kitchen, chefs, chef, moves.get(chef.id), dtMs)
    })
    return { state: { ...state, chefs }, events: [] }
  }
}
