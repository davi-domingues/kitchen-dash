import { describe, expect, it } from 'vitest'
import { contentPlugin, readContent, validateContent } from './validate-content.js'

const withChange = (change) => {
  const content = structuredClone(readContent())
  change(content)
  return validateContent(content)
}

describe('validateContent', () => {
  it('aceita o conteúdo versionado', () => {
    expect(validateContent(readContent())).toEqual([])
  })

  it('barra campo obrigatório ausente', () => {
    const errors = withChange((c) => delete c.recipes.recipes[0].points)

    expect(errors.join()).toMatch(/recipes\.json\/recipes\/0: must have required property 'points'/)
  })

  it('barra receita de panela sem tempo de cozimento', () => {
    const errors = withChange((c) => (c.recipes.recipes[2].cookMs = 0))

    expect(errors.join()).toMatch(/cookMs/)
  })

  it('barra cosmético com slot desconhecido', () => {
    const errors = withChange((c) => (c.cosmetics.cosmetics[0].slot = 'shoes'))

    expect(errors.join()).toMatch(/cosmetics\.json\/cosmetics\/0\/slot/)
  })

  it('barra receita com ingrediente desconhecido', () => {
    const errors = withChange((c) => c.recipes.recipes[0].ingredients.push('truffle'))

    expect(errors).toContain('recipes.json salad: ingrediente desconhecido "truffle"')
  })

  it('barra id duplicado', () => {
    const errors = withChange((c) => (c.cosmetics.cosmetics[1].id = 'hat_classic'))

    expect(errors).toContain('cosmetics.json: id duplicado "hat_classic"')
  })

  it('barra slot sem item grátis', () => {
    const errors = withChange((c) => (c.cosmetics.cosmetics[0].unlockScore = 50))

    expect(errors).toContain('cosmetics.json: slot "hat" sem item grátis')
  })

  it('barra estação sem chão adjacente', () => {
    const errors = withChange((c) => (c.kitchens.kitchens[0].tiles[2] = '##........S.#'))

    expect(errors).toContain('kitchens.json bistro: estação em (1,1) sem chão adjacente')
  })

  it('barra mapa não retangular, caractere fora da legenda e spawn na parede', () => {
    const errors = withChange((c) => {
      const kitchen = c.kitchens.kitchens[0]
      kitchen.tiles[5] = '#..?........#.'
      kitchen.spawns[0] = [0, 0]
    })

    expect(errors).toEqual(
      expect.arrayContaining([
        'kitchens.json bistro: linha 5 com largura diferente',
        'kitchens.json bistro: "?" em (3,5) fora da legenda',
        'kitchens.json bistro: spawn (0,0) fora do chão',
      ]),
    )
  })

  it('barra cozinha sem caixa de um ingrediente ou sem uma estação', () => {
    const errors = withChange((c) => {
      const kitchen = c.kitchens.kitchens[0]
      kitchen.tiles[6] = '#..........X#'
      kitchen.tiles[1] = '#.LEZBC#....#'
    })

    expect(errors).toEqual(
      expect.arrayContaining([
        'kitchens.json bistro: falta estação "plates" no mapa',
        'kitchens.json bistro: sem caixa de "tomato"',
      ]),
    )
  })

  it('barra caixa com ingrediente desconhecido', () => {
    const errors = withChange((c) => (c.kitchens.kitchens[0].legend.T.ingredient = 'truffle'))

    expect(errors).toContain('kitchens.json bistro: ingrediente desconhecido "truffle"')
  })
})

describe('contentPlugin', () => {
  it('não interrompe o build com conteúdo válido', () => {
    const ctx = { addWatchFile: () => {}, error: (msg) => expect.fail(msg) }

    contentPlugin().buildStart.call(ctx)
  })
})
