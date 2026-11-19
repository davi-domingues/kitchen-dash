import { describe, expect, it } from 'vitest'
import {
  alreadyDefaultMessage,
  boundMessage,
  cancelledMessage,
  modifierMessage,
  restoredMessage,
  sameMessage,
  swappedMessage,
} from './statusMessage.js'

describe('statusMessage', () => {
  it('bound leva controle e tecla', () => {
    expect(boundMessage('Cima', 'W')).toEqual({ kind: 'bound', params: { control: 'Cima', key: 'W' } })
  })

  it('swapped leva os dois controles e as duas teclas', () => {
    expect(swappedMessage('Ação', 'W', 'Cima', 'Enter')).toEqual({
      kind: 'swapped',
      params: { control: 'Ação', key: 'W', otherControl: 'Cima', otherKey: 'Enter' },
    })
  })

  it('same leva controle e tecla atual', () => {
    expect(sameMessage('Baixo', 'S')).toEqual({ kind: 'same', params: { control: 'Baixo', key: 'S' } })
  })

  it('cancelled, restored e alreadyDefault não têm parâmetros', () => {
    expect(cancelledMessage()).toEqual({ kind: 'cancelled' })
    expect(restoredMessage()).toEqual({ kind: 'restored' })
    expect(alreadyDefaultMessage()).toEqual({ kind: 'alreadyDefault' })
  })

  it('modifier leva a tecla recusada', () => {
    expect(modifierMessage('Shift')).toEqual({ kind: 'modifier', params: { key: 'Shift' } })
  })
})
