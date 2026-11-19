# Research: KD-37

## R1 · Quais partidas migrar
- **Decision**: `progress.pending` menos os `matchId` presentes na outbox (`kd:v1:outbox`, de qualquer usuário).
- **Rationale**: a outbox só contém partidas logadas (KD-35); o resto foi jogado como visitante.
- **Alternatives**: reenviar o `board` local inteiro. Rejeitado: o board não tem os itens já removidos do pending, e enviar duas vezes custaria rate limit.

## R2 · Rate limit
- **Decision**: lotes de 10 envios; antes de cada lote seguinte, espera 60 s (`sleep` injetado). Erro `retry` (54000 ou rede) → espera `backoffDelay` e tenta o mesmo item até 3 vezes na rodada; esgotado, a rodada para e a etapa fica incompleta.
- **Rationale**: KD-31 limita 10/60 s por usuário; espaçar evita cair no 54000.

## R3 · Conflito de configurações
- **Decision**: por campo de primeiro nível (`keyBindings`): se a conta já tem o campo, ela vence e o local é sobrescrito; se não tem, o valor local é gravado na conta.
- **Rationale**: ARQUITETURA §5.1 ("o local passa a refletir a conta") e coerência com o equipado da KD-38.
- **Alternatives**: "mais recente vence" (exige timestamps em dois lados, sem relógio confiável); "local vence" (apagaria a configuração de outro dispositivo).

## R4 · Marcador
- **Decision**: `kd:v1:migration` = `{ [userId]: { version: 1, steps: { scores, cosmetics, settings }, sent, discarded } }`. Só uma etapa concluída é marcada; uma rodada incompleta reexecuta as etapas pendentes. Idempotência de partida garantida pelo `match_id` no servidor e pela remoção do pending.

## R5 · Cosméticos
- **Decision**: depois das partidas (que liberam itens no servidor), `pullAccountCosmetics` e `pushEquipped`. Falha em qualquer um deixa a etapa pendente.
