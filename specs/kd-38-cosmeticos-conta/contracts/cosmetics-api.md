# Contratos — KD-38

## RPC `public.set_equipped(p_equipped jsonb) returns jsonb`

security definer, `search_path = ''`, só `authenticated`. Erros: `28000 not_authenticated`; `22023 invalid_equipped` (não é objeto, slot desconhecido, id mal formado); `42501 cosmetic_not_owned`. Retorna o equipado gravado.

## `services/cosmeticsLoader.js`

`loadCosmeticsService(): Promise<CosmeticsService | null>`

`CosmeticsService`:
- `fetchAccountCosmetics(userId) → { unlocked: string[], equipped: object }`
- `saveEquipped(equipped) → object`

## `features/cosmetics/cosmeticsSync.js` (usado pela KD-37)

- `pullAccountCosmetics(userId, { loadService, store }) → state | null`
- `equipAndSync(id, user, { loadService, store }) → state` (local na hora; envio em segundo plano)
- `pushEquipped(user, { loadService, store }) → Promise` — grava o equipado local atual na conta.

## Outbox

`createScoreOutbox({ ..., onSubmitted(entry, result) })`.
