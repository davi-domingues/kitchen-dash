# Data Model: KD-15

- `state.players`: 1 ou 2.
- `state.stats`: `{ ordersCompleted, ordersFailed }`, começa em zero.
- `MODE_RULES[mode]`: `{ durationMs, orders: { maxVisible, maxQueued, patienceMs, sequenceLength? } }`.
- Estados: `running → ended` por tempo (Clássico), por sequência completa (Desafio) ou por `endMatch` (qualquer modo).
