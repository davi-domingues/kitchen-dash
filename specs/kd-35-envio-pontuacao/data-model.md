# Data model — KD-35

`kd:v1:outbox` = `{ items: OutboxItem[] }`

| Campo | Tipo | Regra |
|---|---|---|
| matchId | string (uuid) | único na fila; precisa existir em `progress.pending` |
| userId | string | só é enviado pela sessão desse usuário |
| attempts | int ≥ 0 | > 8 → descarte |
| nextAt | int (ms epoch) | envio só quando `now ≥ nextAt` |

Transições: `enqueue` → (sucesso | permanente | teto) remove item + `removePending`; transitório → `attempts++`, `nextAt`; sem sessão → inalterado.
