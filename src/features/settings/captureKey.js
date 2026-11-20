// Classifica o keydown durante a captura de uma tecla (contrato em specs/010-remapeamento-teclas).
// A primeira tecla só conta depois que a captura começou: o keydown de ativação não passa por aqui.

const MODIFIER_CODES = new Set([
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight',
])

export function isModifierCode(code) {
  return MODIFIER_CODES.has(code)
}

/**
 * @param {{ code?: string, repeat?: boolean }} event
 * @returns {'cancel' | 'ignore' | 'bind'}
 */
export function classifyCaptureKey({ code, repeat = false } = {}) {
  if (repeat) return 'ignore'
  if (code === 'Escape' || code === 'Tab') return 'cancel'
  if (isModifierCode(code)) return 'ignore'
  if (typeof code !== 'string' || code.length === 0) return 'ignore'
  return 'bind'
}
