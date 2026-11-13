import { describe, expect, it } from 'vitest'
import { createRng, pickInt } from './rng.js'

describe('createRng', () => {
  it('gera a mesma sequência para o mesmo seed', () => {
    const a = createRng(42)
    const b = createRng(42)

    const seqA = Array.from({ length: 5 }, a)
    const seqB = Array.from({ length: 5 }, b)

    expect(seqA).toEqual(seqB)
  })

  it('gera sequências diferentes para seeds diferentes', () => {
    expect(createRng(1)()).not.toBe(createRng(2)())
  })

  it('devolve valores em [0, 1)', () => {
    const rng = createRng(7)

    const values = Array.from({ length: 1000 }, rng)

    expect(values.every((v) => v >= 0 && v < 1)).toBe(true)
  })
})

describe('pickInt', () => {
  it('sorteia inteiros dentro do intervalo, incluindo os limites', () => {
    const rng = createRng(123)

    const values = new Set(Array.from({ length: 500 }, () => pickInt(rng, 1, 3)))

    expect([...values].sort()).toEqual([1, 2, 3])
  })
})
