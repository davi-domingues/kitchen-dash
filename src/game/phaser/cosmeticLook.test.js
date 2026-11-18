import { describe, expect, it } from 'vitest'
import { resolveLook } from './cosmeticLook.js'

const DEFAULT_CHEF = { hat: 0xf5ead6, apron: 0xf5ead6 }

describe('resolveLook', () => {
  it('converte as cores hex em números do Phaser, por chef', () => {
    const look = {
      theme: '#8a7fc0',
      chefs: { p1: { hat: '#c9a227', apron: '#5b7f3a' }, p2: { hat: '#7b1e3a', apron: '#f5ead6' } },
    }

    expect(resolveLook(look)).toEqual({
      theme: 0x8a7fc0,
      chefs: { p1: { hat: 0xc9a227, apron: 0x5b7f3a }, p2: { hat: 0x7b1e3a, apron: 0xf5ead6 } },
    })
  })

  it('usa o padrão para visual ausente ou inválido', () => {
    expect(resolveLook(undefined)).toEqual({ theme: 0x3b2f2f, chefs: { p1: DEFAULT_CHEF, p2: DEFAULT_CHEF } })
    expect(resolveLook({ chefs: { p1: { hat: 'red', apron: 12 } } }).chefs.p1).toEqual(DEFAULT_CHEF)
  })
})
