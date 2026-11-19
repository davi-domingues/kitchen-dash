// Teclas padrão e remapeamento (PRD "Plataforma e controles", SYSTEM_DESIGN §8.1).
// As teclas usam KeyboardEvent.code, que independe do layout (ABNT2, US...) e do Shift.

export const PLAYER_IDS = ['p1', 'p2']
export const PLAYER_CONTROLS = ['up', 'down', 'left', 'right', 'action']

export const DEFAULT_KEY_BINDINGS = Object.freeze({
  p1: Object.freeze({
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    action: 'Enter',
  }),
  p2: Object.freeze({ up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'Space' }),
  pause: 'KeyP',
})

const isCode = (value) => typeof value === 'string' && value.length > 0

function cloneBindings(bindings) {
  return { p1: { ...bindings.p1 }, p2: { ...bindings.p2 }, pause: bindings.pause }
}

function readSlot(bindings, slot) {
  return slot.player ? bindings[slot.player][slot.control] : bindings.pause
}

function writeSlot(bindings, slot, code) {
  if (slot.player) bindings[slot.player][slot.control] = code
  else bindings.pause = code
}

function allSlots() {
  return [...PLAYER_IDS.flatMap((player) => PLAYER_CONTROLS.map((control) => ({ player, control }))), {}]
}

function hasDuplicates(bindings) {
  const codes = allSlots().map((slot) => readSlot(bindings, slot))
  return new Set(codes).size !== codes.length
}

/**
 * Valida o que veio do armazenamento local. Qualquer formato inválido ou tecla repetida
 * volta ao padrão, para um `settings` corrompido nunca deixar o jogo sem controle.
 * @param {unknown} raw
 * @returns {{p1: Record<string, string>, p2: Record<string, string>, pause: string}}
 */
export function sanitizeKeyBindings(raw) {
  const fallback = cloneBindings(DEFAULT_KEY_BINDINGS)
  if (typeof raw !== 'object' || raw === null) return fallback
  const candidate = cloneBindings(fallback)
  for (const slot of allSlots()) {
    const value = slot.player ? raw[slot.player]?.[slot.control] : raw.pause
    if (isCode(value)) writeSlot(candidate, slot, value)
  }
  return hasDuplicates(candidate) ? fallback : candidate
}

/**
 * Atribui `code` a um controle. Se a tecla já estava em outro controle, os dois trocam,
 * para nenhuma tecla ficar com duas funções.
 * @param {ReturnType<typeof sanitizeKeyBindings>} bindings
 * @param {{player?: 'p1'|'p2', control?: string}} slot `{}` (ou sem player) é a pausa
 * @param {string} code KeyboardEvent.code
 */
export function remapKey(bindings, slot, code) {
  if (!isCode(code)) throw new Error('tecla inválida')
  if (slot.player && (!PLAYER_IDS.includes(slot.player) || !PLAYER_CONTROLS.includes(slot.control))) {
    throw new Error('controle inválido')
  }
  const next = cloneBindings(bindings)
  const previous = readSlot(next, slot)
  const owner = allSlots().find((other) => readSlot(next, other) === code)
  if (owner) writeSlot(next, owner, previous)
  writeSlot(next, slot, code)
  return next
}

/**
 * Controle que usa `code`, na mesma convenção do `remapKey`: `{}` representa a pausa.
 * @param {ReturnType<typeof sanitizeKeyBindings>} bindings
 * @param {string} code KeyboardEvent.code
 * @returns {{player?: 'p1'|'p2', control?: string} | null} `null` quando a tecla está livre
 */
export function keyOwner(bindings, code) {
  if (!isCode(code) || typeof bindings !== 'object' || bindings === null) return null
  const owner = allSlots().find((slot) => {
    const value = slot.player ? bindings[slot.player]?.[slot.control] : bindings.pause
    return value === code
  })
  return owner ?? null
}

/**
 * Compara os onze valores com o padrão sem sanitizar: entrada incompleta ou inválida não é padrão.
 * @param {unknown} bindings
 * @returns {boolean}
 */
export function isDefaultKeyBindings(bindings) {
  if (typeof bindings !== 'object' || bindings === null) return false
  return allSlots().every((slot) => {
    const value = slot.player ? bindings[slot.player]?.[slot.control] : bindings.pause
    return value === readSlot(DEFAULT_KEY_BINDINGS, slot)
  })
}
