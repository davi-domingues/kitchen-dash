// Itens que os chefs carregam ou deixam nas estações. Dado puro: as regras ficam em stations.js.
export function createIngredient(ingredientId) {
  return { type: 'ingredient', ingredientId, chopped: false, chopProgressMs: 0 }
}

export function createPlate() {
  return { type: 'plate', ingredients: [], recipeId: null }
}

const countIds = (ids) => {
  const counts = new Map()
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
  return counts
}

// `part` cabe em `whole` contando repetições (3 tomates exigem 3 tomates na receita)
const isSubMultiset = (part, whole) => {
  const available = countIds(whole)
  return [...countIds(part)].every(([id, n]) => (available.get(id) ?? 0) >= n)
}

export function fitsSomeRecipe(recipes, container, ingredientIds) {
  return recipes.some(
    (recipe) => recipe.container === container && isSubMultiset(ingredientIds, recipe.ingredients),
  )
}

export function matchRecipe(recipes, container, ingredientIds) {
  return (
    recipes.find(
      (recipe) =>
        recipe.container === container &&
        recipe.ingredients.length === ingredientIds.length &&
        isSubMultiset(ingredientIds, recipe.ingredients),
    ) ?? null
  )
}
