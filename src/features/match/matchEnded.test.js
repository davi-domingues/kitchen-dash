import { describe, expect, it } from 'vitest'
import { formatDuration, parseMatchEnded } from './matchEnded.js'

const VALID = {
  matchId: '0b6e2f1c-9d3a-4c7e-8f21-5a4b3c2d1e0f',
  mode: 'classic',
  players: 2,
  seed: 42,
  contentVersion: '1',
  score: 320,
  ordersCompleted: 5,
  ordersFailed: 1,
  durationMs: 180000,
}

describe('parseMatchEnded', () => {
  it('aceita o payload do contrato', () => {
    expect(parseMatchEnded(VALID)).toEqual(VALID)
  })

  it('descarta campos fora do contrato', () => {
    const result = parseMatchEnded({ ...VALID, cheat: true })

    expect(result).not.toHaveProperty('cheat')
  })

  it.each([
    ['matchId não UUID', { matchId: 'abc' }],
    ['modo desconhecido', { mode: 'daily' }],
    ['3 jogadores', { players: 3 }],
    ['seed negativo', { seed: -1 }],
    ['seed acima de uint32', { seed: 2 ** 32 }],
    ['contentVersion vazio', { contentVersion: '' }],
    ['score negativo', { score: -10 }],
    ['score fracionário', { score: 1.5 }],
    ['pedidos entregues ausentes', { ordersCompleted: undefined }],
    ['pedidos perdidos negativos', { ordersFailed: -1 }],
    ['duração zero', { durationMs: 0 }],
  ])('rejeita %s', (_, override) => {
    expect(parseMatchEnded({ ...VALID, ...override })).toBeNull()
  })

  it('rejeita payload ausente', () => {
    expect(parseMatchEnded(undefined)).toBeNull()
  })
})

describe('formatDuration', () => {
  it('formata em m:ss', () => {
    expect(formatDuration(180000)).toBe('3:00')
    expect(formatDuration(65999)).toBe('1:05')
    expect(formatDuration(999)).toBe('0:00')
  })
})
