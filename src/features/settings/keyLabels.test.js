import { describe, expect, it } from 'vitest'
import { keyLabel } from './keyLabels.js'

describe('keyLabel', () => {
  it('devolve identificadores de teclas nomeadas', () => {
    expect(keyLabel('ArrowUp')).toBe('arrowUp')
    expect(keyLabel('Enter')).toBe('enter')
    expect(keyLabel('Space')).toBe('space')
    expect(keyLabel('PageDown')).toBe('pageDown')
  })

  it('letras e dígitos viram identificadores de caractere', () => {
    expect(keyLabel('KeyA')).toBe('a')
    expect(keyLabel('KeyZ')).toBe('z')
    expect(keyLabel('Digit1')).toBe('1')
    expect(keyLabel('Digit0')).toBe('0')
  })

  it('numpad usa o identificador com prefixo', () => {
    expect(keyLabel('Numpad1')).toBe('numpad1')
  })

  it('tecla desconhecida ou vazia nunca devolve string vazia', () => {
    expect(keyLabel('F13')).toBe('unknown')
    expect(keyLabel('')).toBe('unknown')
    expect(keyLabel(undefined)).toBe('unknown')
  })
})
