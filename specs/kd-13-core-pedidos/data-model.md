# Data Model: KD-13

## Order (`state.orders[]` — comandas visíveis; `state.orderQueue.pending[]` — fila)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | `order-<number>` |
| `number` | inteiro ≥ 1 | sequencial na partida |
| `recipeId` | string | receita liberada no instante da chegada (ou da sequência) |
| `points` | inteiro | pontos base da receita |
| `createdAtMs` | inteiro | `elapsedMs` da chegada |
| `patienceMs` | inteiro \| null | cheia ao virar visível; `null` = sem paciência |
| `remainingMs` | inteiro \| null | decresce só enquanto visível; 0 ⇒ expira |

## OrderQueue (`state.orderQueue`)

| Campo | Tipo | Regra |
|---|---|---|
| `config.maxVisible` | inteiro ≥ 1 | padrão 4 |
| `config.maxQueued` | inteiro ≥ 0 | padrão 20 |
| `config.spawnIntervalMs` | `{ min, max }` | padrão 13000–17000 |
| `config.patienceMs` | inteiro > 0 \| null | padrão 60000 |
| `config.sequence` | string[] \| null | receitas fixas (Desafio) |
| `pending` | Order[] | FIFO, ≤ `maxQueued` |
| `nextNumber` | inteiro | próximo número |
| `nextSpawnAtMs` | inteiro \| null | `null` quando a sequência acabou |
| `deliveredCount` | inteiro | entregas |

## Transições

chegada → visível (se há vaga) | fila (se há espaço) | descartado;
visível → entregue (`deliverDish`) | expirado (paciência 0); saída de visível promove o 1º da fila.
