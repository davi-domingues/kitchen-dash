# Tasks: Envio validado de pontuação (submit_score)

- [x] T001 Criar migration com `supabase migration new submit_score` (supabase/migrations/)
- [x] T002 Adicionar `cosmetic_unlocks` em `game_rules` na migration (FR-006, FR-008)
- [x] T003 Implementar `public.submit_score` com auth, idempotência, rate limit, plausibilidade, gravação e desbloqueio (FR-001..FR-007)
- [x] T004 Revogar `execute` de `public`/`anon` e conceder a `authenticated` (FR-009)
- [x] T005 [P] Testes pgTAP em supabase/tests/submit_score_test.sql cobrindo US1–US4 e casos de borda (SC-001..SC-003)
- [x] T006 Ajustar a contagem de `game_rules` em supabase/tests/rls_test.sql
- [x] T007 Atualizar SYSTEM_DESIGN §6.2 com a assinatura (SC-004) e registrar decisões em ESTUDOS_E_DECISOES
- [x] T008 Rodar `db:reset`, `db:test`, `db lint` e os gates do npm
