# Contrato: cosméticos locais (para KD-38/KD-37)

`src/features/cosmetics/cosmetics.js` (puro):
- `createEmptyCosmetics() → CosmeticsState`
- `sanitizeCosmetics(raw) → CosmeticsState`
- `applyScore(state, score) → { state, newlyUnlocked: string[] }`
- `mergeUnlocked(state, ids) → { state, newlyUnlocked: string[] }`
- `equip(state, id) → CosmeticsState` (P1)
- `equipP2(state, id) → CosmeticsState` (P2: só chapéu e avental)
- `CHEF_SLOTS = ['hat', 'apron']`
- `getLook(state) → { theme, chefs: { p1: { hat, apron }, p2: { hat, apron } } }` (cores `#rrggbb`)

`src/features/cosmetics/cosmeticsStore.js` (storage):
- `COSMETICS_KEY = 'cosmetics'`
- `loadCosmetics(store?)`, `recordScore(score, store?)`, `mergeUnlockedCosmetics(ids, store?)`, `equipCosmetic(id, store?)`, `equipCosmeticP2(id, store?)`, `clearCosmetics(store?)`

Phaser: `registry.get(COSMETIC_LOOK_KEY)` → `{ theme, chefs: { p1, p2 } }` ou ausente (cores padrão), via `resolveLook`.

KD-38/KD-37: a conta guarda só `equipped` (P1); `equippedP2` nunca é enviado.
