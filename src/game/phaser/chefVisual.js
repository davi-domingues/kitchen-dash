// Pose do chef (direção do olhar, balanço, rótulo) em função pura; a cena só desenha (KD-19).
import { DIRECTIONS } from '../core/kitchenMap.js'

// Medidas do protótipo, feitas para um tile de 64 px; a cena escala por tile / BASE_TILE
export const BASE_TILE = 64
const BOB_PX = 2
const BOB_PERIOD_MS = 120

/**
 * @param {object} chef chef do core (facing, stepCooldownMs)
 * @param {{ elapsedMs: number, playerCount: number }} context
 */
export function chefPose(chef, { elapsedMs, playerCount }) {
  const facing = DIRECTIONS[chef.facing] ?? DIRECTIONS.down
  // stepCooldownMs > 0 só logo depois de um passo: é quando o chef está andando
  const moving = chef.stepCooldownMs > 0
  return {
    fx: facing.x,
    fy: facing.y,
    bob: moving ? Math.sin((elapsedMs / BOB_PERIOD_MS) * Math.PI) * BOB_PX : 0,
    showPlayer: playerCount > 1,
  }
}
