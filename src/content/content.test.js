import { describe, expect, it } from 'vitest'
import {
  CONTENT_VERSION,
  contentKey,
  getCosmetic,
  getIngredient,
  getKitchen,
  getRecipe,
  getUnlockedCosmetics,
  getUnlockedRecipes,
  hashContent,
  RECIPES,
} from './index.js'

describe('conteúdo', () => {
  it('expõe as 4 receitas do protótipo com pontos e desbloqueio do PRD', () => {
    const summary = RECIPES.map(({ id, points, unlockAtMs }) => [id, points, unlockAtMs])

    expect(summary).toEqual([
      ['salad', 60, 0],
      ['tartine', 60, 20000],
      ['tomato_soup', 90, 45000],
      ['ratatouille', 130, 70000],
    ])
  })

  it('busca itens por id e falha com id desconhecido', () => {
    expect(getRecipe('salad').container).toBe('plate')
    expect(getIngredient('tomato').chopMs).toBeGreaterThan(0)
    expect(getKitchen('bistro').tiles.length).toBeGreaterThan(0)
    expect(getCosmetic('hat_gold').unlockScore).toBe(1000)
    expect(() => getRecipe('truffle')).toThrow('recipe desconhecido: "truffle"')
  })

  it('libera receitas pelo tempo decorrido', () => {
    expect(getUnlockedRecipes(0).map((r) => r.id)).toEqual(['salad'])
    expect(getUnlockedRecipes(45000).map((r) => r.id)).toEqual(['salad', 'tartine', 'tomato_soup'])
  })

  it('libera cosméticos pelo recorde', () => {
    const ids = getUnlockedCosmetics(300).map((c) => c.id)

    expect(ids).toEqual(['hat_classic', 'hat_bordeaux', 'apron_cream', 'apron_herbs', 'theme_bistro'])
  })

  it('congela os dados', () => {
    expect(() => {
      getRecipe('salad').points = 999
    }).toThrow(TypeError)
  })

  it('monta a chave i18n do conteúdo', () => {
    expect(contentKey('recipe', 'salad')).toBe('recipe.salad.name')
  })

  it('calcula content_version determinístico e sensível a mudanças', () => {
    expect(CONTENT_VERSION).toMatch(/^[0-9a-f]{8}$/)
    expect(hashContent({ a: 1 })).toBe(hashContent({ a: 1 }))
    expect(hashContent({ a: 1 })).not.toBe(hashContent({ a: 2 }))
  })
})
