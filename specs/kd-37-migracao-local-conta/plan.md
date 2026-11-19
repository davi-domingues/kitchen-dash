# Implementation Plan: Migração local → conta (KD-37)

**Branch**: `feat/kd-37-migracao-local-conta` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

No login (ou abertura com sessão), um orquestrador em `features/migration/` executa três etapas idempotentes e marcadas: (1) envia as partidas de visitante pelo `submit_score` com `origin = 'local'`, em lotes de 10 por janela de 60 s; (2) lê os cosméticos da conta, une ao local e grava o equipado; (3) concilia as configurações com `user_settings` (a conta vence por campo). Um marcador `kd:v1:migration` guarda as etapas concluídas por usuário. Um aviso `role="status"` mostra progresso e conclusão.

## Technical Context

**Language/Version**: JavaScript ESM, React 19 · **Testing**: Vitest (cliente falso, timers injetados) · **Storage**: `services/storage.js` (local), Supabase `user_settings` (conta) · **Constraints**: supabase-js fora do JS inicial (loaders dinâmicos); sem dependência nova; sem mudança de banco.

## Constitution Check

- Fronteiras §4: lógica em `features/migration` (regra pura testável) e `services/settingsService.js`; UI só exibe. ✅
- RLS: `user_settings` já permite ao autenticado atualizar só `settings` da própria linha (KD-30). Pontuação só pela RPC. ✅
- i18n e acessibilidade: textos em `pt-BR.json`, aviso com `role="status"` e botão de fechar. ✅
- Testes determinísticos sem rede. ✅

## Project Structure

```text
src/services/settingsService.js (+ .test)     # fetch/save de user_settings.settings
src/services/settingsLoader.js (+ .test)      # import dinâmico, padrão dos outros loaders
src/services/settings.js                      # + loadSettings/saveSettings genéricos
src/features/migration/settingsMerge.js (+ .test)   # regra pura conta × local
src/features/migration/accountMigration.js (+ .test) # orquestrador e marcador
src/features/migration/useAccountMigration.js
src/features/migration/MigrationNotice.jsx
src/app/App.jsx                               # monta o hook e o aviso
```

## Complexity Tracking

Nenhuma violação.
