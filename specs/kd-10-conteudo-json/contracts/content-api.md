# Contrato — `src/content/index.js`

Consumido por KD-12, KD-13, KD-18 e KD-23. Os dados são congelados com `Object.freeze` profundo.

| Export | Assinatura | Notas |
|---|---|---|
| `INGREDIENTS` | `Ingredient[]` | [data-model](../data-model.md) |
| `RECIPES` | `Recipe[]` | na ordem de desbloqueio |
| `KITCHENS` | `Kitchen[]` | `bistro` |
| `COSMETICS` | `Cosmetic[]` | |
| `COSMETIC_SLOTS` | `['hat','apron','theme']` | |
| `CONTENT_VERSION` | `string` (8 hex) | vai no payload `match:ended.contentVersion` e no `submit_score` |
| `hashContent(value)` | `(any) => string` | FNV-1a de 32 bits |
| `getIngredient(id)` / `getRecipe(id)` / `getKitchen(id)` / `getCosmetic(id)` | `(string) => item` | lança `Error('<tipo> desconhecido: "<id>"')` |
| `getUnlockedRecipes(elapsedMs)` | `(number) => Recipe[]` | `unlockAtMs <= elapsedMs` |
| `getUnlockedCosmetics(bestScore)` | `(number) => Cosmetic[]` | `unlockScore <= bestScore` |
| `contentKey(type, id, field='name')` | `=> '<tipo>.<id>.<campo>'` | para usar com `t()` |

Contrato do build, em `scripts/validate-content.js`:

- `validateContent(content) => string[]`: devolve as mensagens de erro, com o arquivo e o caminho do campo.
- `readContent()` lê os 3 JSON.
- `contentPlugin()` é o plugin do Vite.
