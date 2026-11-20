# Data Model: Estado de envio

## SUBMIT_STATUS

`sending | sent | pending | failed | guest` (não persistido; vive no estado do React da tela de jogo).

Transições: `sending` → (`sent` | `pending` | `failed`); `guest` é terminal.

## Contratos internos

- `outbox.flush(userId)` → `{ sent, discarded, retrying, outcomes }`, onde `outcomes[matchId] ∈ {'sent','discarded','retrying'}` só para itens processados nesta rodada.
- `submitStatus(summary, matchId)` → `SUBMIT_STATUS` (`sent`, `failed` ou `pending`).
- `submitMatch(outbox, matchId, user)` → `Promise<SUBMIT_STATUS>` (`guest` sem usuário; `failed` se a rodada lançar).
- `useSubmitMatch(matchId)` → `SUBMIT_STATUS | null` (`null` sem partida; `sending` enquanto a sessão carrega ou o envio corre).

## i18n

`play.result.sync.{sending,sent,pending,failed,guest}`.
