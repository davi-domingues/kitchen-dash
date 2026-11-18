# Plano — KD-10

## Abordagem

- **Dados:** `src/content/{recipes,kitchens,cosmetics}.json` e `src/content/schemas/*.schema.json` (draft-07).
- **Validação:** `scripts/validate-content.js` usa ajv (dev, aprovada) e checagens de referência e de mapa. O plugin `contentPlugin()` roda no `buildStart` do Vite e chama `this.error`, o que derruba `npm run build` e o dev server. O ajv fica fora do bundle.
- **Loader:** `src/content/index.js`, com exports nomeados, dados congelados e sem dependências. Pode ser importado por `game/core` (o ESLint permite).
- **Versão:** FNV-1a 32 bits sobre `JSON.stringify` dos 3 arquivos.
- **i18n:** as chaves `ingredient|recipe|kitchen|cosmetic.<id>.name` ficam em `pt-BR.json`. O `i18n.test.js` passa a considerar as chaves derivadas do conteúdo como usadas.

## Constituição / AGENTS.md

- Conteúdo é dado (§4) ✔. Sem dependência nova além da ajv aprovada ✔. Textos via i18n ✔. Testes determinísticos ✔.

## Contrato para KD-12/13/18/23

Veja `src/content/index.js`: `INGREDIENTS`, `RECIPES`, `KITCHENS`, `COSMETICS`, `COSMETIC_SLOTS`, `CONTENT_VERSION`, `hashContent`, `getIngredient`, `getRecipe`, `getKitchen`, `getCosmetic`, `getUnlockedRecipes(elapsedMs)`, `getUnlockedCosmetics(bestScore)` e `contentKey(type, id, field?)`.
