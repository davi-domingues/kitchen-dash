# Data Model

`kd:v1:equippedOutbox`: `null` ou `{ userId: string, rev: integer, attempts: integer >= 0, nextAt: number (ms) }`. `rev` cresce a cada troca e evita apagar uma pendência criada durante um envio.

- Equipar com sessão → `{ userId, rev: rev + 1, attempts: 0, nextAt: agora }` (substitui a pendência anterior).
- Envio ok → `null`.
- Falha → `attempts + 1`; `nextAt = agora + backoffDelay(attempts)`; ao chegar a 8 tentativas → `null`.
- Valor inválido é lido como `null`.
