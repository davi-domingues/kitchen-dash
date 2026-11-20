import { describe, expect, it } from 'vitest'
import { normalizeDisplayName, validateDisplayName } from './displayName.js'

describe('validateDisplayName', () => {
  it.each(['Chef_Ana', 'abc', 'A1_b2_C3_d4_E5_f6_G7'])('aceita %s', (name) => {
    expect(validateDisplayName(name, 'outro')).toBeNull()
  })

  it.each(['ab', 'A1_b2_C3_d4_E5_f6_G7x', 'Chef Ana', 'Chéf', 'chef-ana', ''])('recusa %s', (name) => {
    expect(validateDisplayName(name, 'outro')).toBe('invalid')
  })

  it('remove espaços das pontas antes de validar', () => {
    expect(normalizeDisplayName('  Chef_Ana ')).toBe('Chef_Ana')
    expect(validateDisplayName('  Chef_Ana ', 'outro')).toBeNull()
  })

  it('marca nome igual ao atual como sem mudança', () => {
    expect(validateDisplayName('Chef_Ana', 'Chef_Ana')).toBe('unchanged')
  })
})
