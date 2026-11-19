import { describe, expect, it } from 'vitest'
import { COSMETICS } from '../../content/index.js'
import { PLAYER_COLORS, THEME_PALETTES, paletteOf, resolveLook } from './cosmeticLook.js'

const DEFAULT_CHEF = (id) => ({ hat: 0xf5ead6, apron: 0xf5ead6, player: PLAYER_COLORS[id] })

describe('resolveLook', () => {
  it('converte as cores hex em números do Phaser, por chef, com a paleta do tema', () => {
    const look = {
      themeId: 'theme_provence',
      theme: '#8a7fc0',
      chefs: { p1: { hat: '#c9a227', apron: '#5b7f3a' }, p2: { hat: '#7b1e3a', apron: '#f5ead6' } },
    }

    expect(resolveLook(look)).toEqual({
      theme: 0x8a7fc0,
      palette: THEME_PALETTES.theme_provence,
      chefs: {
        p1: { hat: 0xc9a227, apron: 0x5b7f3a, player: PLAYER_COLORS.p1 },
        p2: { hat: 0x7b1e3a, apron: 0xf5ead6, player: PLAYER_COLORS.p2 },
      },
    })
  })

  it('usa o padrão para visual ausente ou inválido', () => {
    expect(resolveLook(undefined)).toEqual({
      theme: 0x3b2f2f,
      palette: THEME_PALETTES.theme_bistro,
      chefs: { p1: DEFAULT_CHEF('p1'), p2: DEFAULT_CHEF('p2') },
    })
    expect(resolveLook({ chefs: { p1: { hat: 'red', apron: 12 } } }).chefs.p1).toEqual(DEFAULT_CHEF('p1'))
  })
})

describe('paletteOf', () => {
  it('tem uma paleta distinta para cada tema do catálogo', () => {
    const themes = COSMETICS.filter((c) => c.slot === 'theme').map((c) => c.id)

    const palettes = themes.map(paletteOf)

    expect(new Set(palettes).size).toBe(themes.length)
    themes.forEach((id) => expect(paletteOf(id)).toBe(THEME_PALETTES[id]))
  })

  it('cai no Bistrô para tema desconhecido ou ausente', () => {
    expect(paletteOf('toString')).toBe(THEME_PALETTES.theme_bistro)
    expect(paletteOf(undefined)).toBe(THEME_PALETTES.theme_bistro)
  })
})
