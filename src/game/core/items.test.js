import { describe, expect, it } from 'vitest'
import { createIngredient, createPlate, fitsSomeRecipe, matchRecipe } from './items.js'

const RECIPES = [
  { id: 'salad', container: 'plate', ingredients: ['lettuce', 'tomato'] },
  { id: 'soup', container: 'pot', ingredients: ['tomato', 'tomato', 'tomato'] },
]

describe('items', () => {
  it('cria ingrediente cru e prato vazio', () => {
    expect(createIngredient('tomato')).toEqual({
      type: 'ingredient',
      ingredientId: 'tomato',
      chopped: false,
      chopProgressMs: 0,
    })
    expect(createPlate()).toEqual({ type: 'plate', ingredients: [], recipeId: null })
  })

  it('aceita combinações parciais só do mesmo recipiente', () => {
    expect(fitsSomeRecipe(RECIPES, 'plate', ['tomato'])).toBe(true)
    expect(fitsSomeRecipe(RECIPES, 'plate', ['tomato', 'tomato'])).toBe(false)
    expect(fitsSomeRecipe(RECIPES, 'pot', ['tomato', 'tomato', 'tomato'])).toBe(true)
    expect(fitsSomeRecipe(RECIPES, 'pot', ['lettuce'])).toBe(false)
  })

  it('reconhece a receita exata independente da ordem', () => {
    expect(matchRecipe(RECIPES, 'plate', ['tomato', 'lettuce'])?.id).toBe('salad')
    expect(matchRecipe(RECIPES, 'plate', ['tomato'])).toBeNull()
    expect(matchRecipe(RECIPES, 'pot', ['tomato', 'tomato', 'tomato'])?.id).toBe('soup')
  })
})
