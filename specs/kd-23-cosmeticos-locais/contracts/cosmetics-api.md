# Contrato: cosméticos locais (para KD-38/KD-37)

`src/features/cosmetics/cosmetics.js` (puro):
- `createEmptyCosmetics() → CosmeticsState`
- `sanitizeCosmetics(raw) → CosmeticsState`
- `applyScore(state, score) → { state, newlyUnlocked: string[] }`
- `mergeUnlocked(state, ids) → { state, newlyUnlocked: string[] }`
- `equip(state, id) → CosmeticsState`
- `getLook(state) → { hat, apron, theme }` (cores `#rrggbb`)

`src/features/cosmetics/cosmeticsStore.js` (storage):
- `COSMETICS_KEY = 'cosmetics'`
- `loadCosmetics(store?)`, `recordScore(score, store?)`, `mergeUnlockedCosmetics(ids, store?)`, `equipCosmetic(id, store?)`, `clearCosmetics(store?)`

Phaser: `registry.get(COSMETICS_KEY)` → `{ hat, apron, theme }` ou ausente (cores padrão).
