# Data Model

Sem campos novos. Marcador por usuário em `kd:v1:migration`: `{ version: 1, steps: { scores, cosmetics, settings }, sent, discarded }`.

Transição nova: concluída + partida de visitante no `pending` → `scores` e `cosmetics` voltam a pendentes; `sent` e `discarded` voltam a 0.
