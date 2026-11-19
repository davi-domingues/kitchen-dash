# Research: KD-11

## R1 · Estado do RNG dentro do MatchState

- **Decision**: `createRng` expõe `getState()`; o `update` recria o RNG a partir de `state.rngState` e grava o novo valor ao final do passo.
- **Rationale**: o estado inteiro vira dado puro e serializável; salvar/retomar e replay ficam triviais.
- **Alternatives considered**: RNG como closure fora do estado (quebra a pureza de `update` e impede snapshot); contador de chamadas + avanço (custo O(n)).

## R2 · Teto do passo de tempo

- **Decision**: `MAX_DT_MS = 250`.
- **Rationale**: o Phaser entrega deltas enormes quando a aba volta do segundo plano; sem teto, a partida de 3 min poderia acabar num quadro.
- **Alternatives considered**: passo fixo com acumulador (mais complexo, desnecessário no MVP); sem teto (rejeitado).

## R3 · Payload de `match:ended` no core

- **Decision**: `{ seed, contentVersion, mode, score, durationMs }`, sem `matchId`.
- **Rationale**: o identificador da partida não é regra de jogo; a cena/React o atribui (contrato em `src/game/phaser/events.js`).
- **Alternatives considered**: gerar `matchId` no core (exigiria UUID não determinístico).

## R4 · Contrato de sistema

- **Decision**: `system(state, { dtMs, inputs, rng }) => { state, events }`, lista ordenada passada a `createUpdate`.
- **Rationale**: KD-12 a KD-15 plugam sem alterar o ciclo; ordem explícita mantém o determinismo.
- **Alternatives considered**: barramento de eventos interno (ordem implícita, mais difícil de testar).
