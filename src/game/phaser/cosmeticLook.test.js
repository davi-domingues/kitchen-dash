import { describe, expect, it } from 'vitest'
import { resolveLook } from './cosmeticLook.js'

describe('resolveLook', () => {
  it('converte as cores hex em números do Phaser', () => {
    expect(resolveLook({ hat: '#c9a227', apron: '#5b7f3a', theme: '#8a7fc0' })).toEqual({
      hat: 0xc9a227,
      apron: 0x5b7f3a,
      theme: 0x8a7fc0,
    })
  })

  it('usa o padrão para visual ausente ou inválido', () => {
    expect(resolveLook(undefined)).toEqual({ hat: 0xf5ead6, apron: 0xf5ead6, theme: 0x3b2f2f })
    expect(resolveLook({ hat: 'red', apron: 12 }).hat).toBe(0xf5ead6)
  })
})
