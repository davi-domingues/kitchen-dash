# Implementation Plan: Cosméticos vinculados à conta (KD-38)

**Branch**: `feat/kd-38-cosmeticos-conta` | **Spec**: [spec.md](spec.md)

## Summary

Um serviço `services/cosmeticsService.js` (carregado por `cosmeticsLoader.js`, lazy como auth/score) lê `user_cosmetics` + `profiles.equipped` e grava o equipado pela RPC nova `set_equipped`. Em `features/cosmetics/`, `cosmeticsSync.js` faz a orquestração (puxar no login, empurrar ao equipar) e `useCosmeticsSync()` liga no `App` via `useAuth()`. A outbox ganha `onSubmitted(entry, result)`, usado pela app para `mergeUnlockedCosmetics(result.unlockedCosmetics)`.

## Technical Context

JS/ESM, React 19, supabase-js (já no projeto), Vitest, Postgres/pgTAP local. Sem dependência nova.

## Constitution Check

- Offline primeiro: sem backend o loader devolve `null` e nada muda. OK
- Fronteiras: React → features → services; supabase-js só por `import()`. OK
- Escrita sensível só por RPC security definer, `search_path = ''`, sem `anon`. OK (revoga `update(equipped)` direto)
- Testes sem rede: serviço com cliente falso; sync com serviço falso. OK

## Project Structure

```text
supabase/migrations/<ts>_set_equipped.sql
supabase/tests/set_equipped_test.sql
src/services/cosmeticsService.js(+test)   createCosmeticsService(client)
src/services/cosmeticsLoader.js(+test)    loadCosmeticsService()
src/services/scoreOutbox.js               + onSubmitted
src/features/cosmetics/cosmetics.js       + applyAccountEquipped (pura)
src/features/cosmetics/cosmeticsStore.js  + applyAccountCosmetics
src/features/cosmetics/cosmeticsSync.js(+test)  pullAccountCosmetics, equipAndSync
src/features/cosmetics/useCosmeticsSync.js
src/features/progress/scoreSync.js        onSubmitted → mergeUnlockedCosmetics
```
