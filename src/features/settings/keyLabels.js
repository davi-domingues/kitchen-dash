// Identificador estável do rótulo de uma tecla. Não traduz: o componente resolve o texto com t().

const NAMED_CODES = {
  ArrowUp: 'arrowUp',
  ArrowDown: 'arrowDown',
  ArrowLeft: 'arrowLeft',
  ArrowRight: 'arrowRight',
  Enter: 'enter',
  Space: 'space',
  Escape: 'escape',
  Tab: 'tab',
  Backspace: 'backspace',
  Delete: 'delete',
  Home: 'home',
  End: 'end',
  PageUp: 'pageUp',
  PageDown: 'pageDown',
  Insert: 'insert',
}

/**
 * @param {string} code KeyboardEvent.code
 * @returns {string} `labelId`; nunca vazio
 */
export function keyLabel(code) {
  if (typeof code !== 'string' || code.length === 0) return 'unknown'
  if (NAMED_CODES[code]) return NAMED_CODES[code]
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase()
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)
  if (/^Numpad[0-9]$/.test(code)) return `numpad${code.slice(6)}`
  return 'unknown'
}
