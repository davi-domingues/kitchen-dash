// Traduz teclas em ações abstratas (move, interact, pause) por jogador. Não conhece Phaser nem DOM:
// a cena repassa keydown/keyup com o tempo atual e chama update(now) a cada frame.
import { DEFAULT_KEY_BINDINGS, PLAYER_CONTROLS, PLAYER_IDS } from './keyBindings.js'

// PRD: toque rápido dura menos de ~0,22 s; a partir daí é "segurar" (picar)
export const TAP_THRESHOLD_MS = 220

export const INPUT_EVENTS = Object.freeze({
  TAP: 'interact:tap',
  HOLD_START: 'interact:holdStart',
  HOLD_END: 'interact:holdEnd',
  PAUSE: 'pause',
})

const AXES = { up: ['y', -1], down: ['y', 1], left: ['x', -1], right: ['x', 1] }

function buildKeyTable(bindings, playerCount) {
  const table = new Map()
  for (const owner of PLAYER_IDS) {
    // Em 1 jogador os dois conjuntos de teclas controlam o mesmo chef (PRD)
    const player = playerCount === 1 ? 'p1' : owner
    for (const control of PLAYER_CONTROLS) table.set(bindings[owner][control], { player, control })
  }
  table.set(bindings.pause, { control: 'pause' })
  return table
}

/**
 * @param {object} [options]
 * @param {ReturnType<import('./keyBindings.js').sanitizeKeyBindings>} [options.bindings]
 * @param {1|2} [options.playerCount]
 * @param {number} [options.tapThresholdMs]
 */
export function createInputMap({
  bindings = DEFAULT_KEY_BINDINGS,
  playerCount = 2,
  tapThresholdMs = TAP_THRESHOLD_MS,
} = {}) {
  if (playerCount !== 1 && playerCount !== 2) throw new Error('playerCount deve ser 1 ou 2')
  const keyTable = buildKeyTable(bindings, playerCount)
  const pressed = new Set()
  const actionState = Object.fromEntries(
    PLAYER_IDS.map((id) => [id, { keysDown: new Set(), since: 0, holding: false }]),
  )

  function keyDown(code, now) {
    const binding = keyTable.get(code)
    // Repetição automática do SO chega como novo keydown: ignorar mantém o "segurar" estável
    if (!binding || pressed.has(code)) return []
    pressed.add(code)
    if (binding.control === 'pause') return [{ type: INPUT_EVENTS.PAUSE }]
    if (binding.control !== 'action') return []
    const state = actionState[binding.player]
    if (state.keysDown.size === 0) Object.assign(state, { since: now, holding: false })
    state.keysDown.add(code)
    return []
  }

  function keyUp(code) {
    const binding = keyTable.get(code)
    if (!binding || !pressed.delete(code) || binding.control !== 'action') return []
    const state = actionState[binding.player]
    state.keysDown.delete(code)
    if (state.keysDown.size > 0) return []
    const type = state.holding ? INPUT_EVENTS.HOLD_END : INPUT_EVENTS.TAP
    state.holding = false
    return [{ type, player: binding.player }]
  }

  function update(now) {
    const events = []
    for (const player of PLAYER_IDS) {
      const state = actionState[player]
      if (state.keysDown.size > 0 && !state.holding && now - state.since >= tapThresholdMs) {
        state.holding = true
        events.push({ type: INPUT_EVENTS.HOLD_START, player })
      }
    }
    return events
  }

  function getMove(player) {
    const move = { x: 0, y: 0 }
    for (const code of pressed) {
      const binding = keyTable.get(code)
      if (binding.player !== player || !AXES[binding.control]) continue
      const [axis, delta] = AXES[binding.control]
      move[axis] += delta
    }
    // Teclas opostas juntas se anulam; o valor fica sempre em -1, 0 ou 1
    move.x = Math.sign(move.x)
    move.y = Math.sign(move.y)
    return move
  }

  // Ao perder o foco o navegador não envia keyup: soltar tudo sem eventos evita chef andando sozinho
  function releaseAll() {
    pressed.clear()
    for (const state of Object.values(actionState))
      Object.assign(state, { holding: false, since: 0 }).keysDown.clear()
  }

  return {
    keyDown,
    keyUp,
    update,
    getMove,
    isHolding: (player) => actionState[player].holding,
    releaseAll,
  }
}
