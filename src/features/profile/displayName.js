// Mesma regra do check `profiles_display_name_format` (KD-30); o banco segue sendo a autoridade
export const DISPLAY_NAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/

export function normalizeDisplayName(value) {
  return String(value ?? '').trim()
}

/**
 * @returns {null | 'invalid' | 'unchanged'} null quando pode ser enviado
 */
export function validateDisplayName(value, current) {
  const name = normalizeDisplayName(value)
  if (!DISPLAY_NAME_PATTERN.test(name)) return 'invalid'
  if (name === current) return 'unchanged'
  return null
}
