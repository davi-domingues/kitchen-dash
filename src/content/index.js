// Ponto único de leitura do conteúdo do jogo. Os JSON já foram validados no build
// (scripts/validate-content.js), então aqui só expomos os dados congelados.
import cosmeticsData from './cosmetics.json'
import kitchensData from './kitchens.json'
import recipesData from './recipes.json'

const deepFreeze = (value) => {
  if (value && typeof value === 'object') Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

export const INGREDIENTS = deepFreeze(recipesData.ingredients)
export const RECIPES = deepFreeze(recipesData.recipes)
export const KITCHENS = deepFreeze(kitchensData.kitchens)
export const COSMETICS = deepFreeze(cosmeticsData.cosmetics)
export const COSMETIC_SLOTS = Object.freeze(['hat', 'apron', 'theme'])

// FNV-1a 32 bits: basta para distinguir versões de conteúdo, não é proteção criptográfica
export function hashContent(value) {
  const text = JSON.stringify(value)
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

// Vai em cada partida e em cada pontuação enviada (SYSTEM_DESIGN §4)
export const CONTENT_VERSION = hashContent([recipesData, kitchensData, cosmeticsData])

const byId = (items, type) => {
  const index = new Map(items.map((item) => [item.id, item]))
  return (id) => {
    const item = index.get(id)
    if (!item) throw new Error(`${type} desconhecido: "${id}"`)
    return item
  }
}

export const getIngredient = byId(INGREDIENTS, 'ingredient')
export const getRecipe = byId(RECIPES, 'recipe')
export const getKitchen = byId(KITCHENS, 'kitchen')
export const getCosmetic = byId(COSMETICS, 'cosmetic')

export const getUnlockedRecipes = (elapsedMs) => RECIPES.filter((r) => r.unlockAtMs <= elapsedMs)

export const getUnlockedCosmetics = (bestScore) => COSMETICS.filter((c) => c.unlockScore <= bestScore)

// Chave i18n de um item de conteúdo: `<tipo>.<id>.<campo>` (AGENTS.md §5)
export const contentKey = (type, id, field = 'name') => `${type}.${id}.${field}`
