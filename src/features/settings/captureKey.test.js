import { describe, expect, it } from 'vitest'
import { classifyCaptureKey, isModifierCode } from './captureKey.js'

describe('classifyCaptureKey', () => {
  it('Esc e Tab cancelam a captura', () => {
    expect(classifyCaptureKey({ code: 'Escape' })).toBe('cancel')
    expect(classifyCaptureKey({ code: 'Tab' })).toBe('cancel')
  })

  it('evento repetido é ignorado: tecla segurada não regrava nem encerra a captura', () => {
    expect(classifyCaptureKey({ code: 'KeyL', repeat: true })).toBe('ignore')
    expect(classifyCaptureKey({ code: 'Escape', repeat: true })).toBe('ignore')
  })

  it('modificadores isolados são ignorados', () => {
    for (const code of [
      'ShiftLeft',
      'ShiftRight',
      'ControlLeft',
      'ControlRight',
      'AltLeft',
      'AltRight',
      'MetaLeft',
      'MetaRight',
    ]) {
      expect(classifyCaptureKey({ code })).toBe('ignore')
      expect(isModifierCode(code)).toBe(true)
    }
    expect(isModifierCode('KeyA')).toBe(false)
  })

  it('Enter, Espaço e teclas comuns viram binding', () => {
    expect(classifyCaptureKey({ code: 'Enter' })).toBe('bind')
    expect(classifyCaptureKey({ code: 'Space' })).toBe('bind')
    expect(classifyCaptureKey({ code: 'KeyL' })).toBe('bind')
    expect(classifyCaptureKey({ code: 'ArrowUp' })).toBe('bind')
  })

  it('code vazio ou ausente é ignorado', () => {
    expect(classifyCaptureKey({ code: '' })).toBe('ignore')
    expect(classifyCaptureKey({})).toBe('ignore')
    expect(classifyCaptureKey()).toBe('ignore')
  })
})
