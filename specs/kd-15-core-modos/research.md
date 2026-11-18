# Research: KD-15

- **Decision**: Desafio sem paciência. **Rationale**: o PRD só mede tempo; pedido expirado impediria completar a sequência. **Alternatives**: paciência de 60 s (rejeitada, partida sem fim).
- **Decision**: sequência do Desafio gerada por `rng(CHALLENGE_SEED)` sobre todas as receitas. **Rationale**: determinística e sem mudar o JSON (CONTENT_VERSION). **Alternatives**: lista curada no `recipes.json` (pendência para decisão de produto).
- **Decision**: intervalo 13–17 s nos três modos. **Rationale**: o PRD só cita esse intervalo; mantém o teto 180 + s×15 da KD-14.
- **Decision**: contadores `stats.ordersCompleted/ordersFailed` no estado, atualizados pelo sistema composto a partir dos eventos `order:delivered`/`order:expired`. **Rationale**: `match:ended` precisa deles e a KD-11 não repassa eventos entre sistemas.
- **Decision**: o modo Livre termina por `endMatch(state)`. **Rationale**: botão Encerrar do PRD.
