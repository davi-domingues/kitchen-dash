# Spec — KD-11 · Core: RNG com seed, MatchState e ciclo de atualização

Issue: #10 · Trilha `core` · Referências: SYSTEM_DESIGN §3 (Determinismo), AGENTS.md §4.

## Objetivo

Dar ao `game/core` um estado de partida puro e um ciclo de atualização determinístico onde
estações (KD-12), pedidos (KD-13), pontuação (KD-14) e modos (KD-15) se plugam como sistemas.

## Requisitos

- **R1** Mesmo seed + mesmos inputs + mesmos dt ⇒ mesmo estado e mesmos eventos.
- **R2** `MatchState` é dado puro e serializável: seed, `rngState`, modo, `contentVersion`,
  status, tick, relógio (`elapsedMs`, `durationMs`), placar, chefs, estações, itens e pedidos.
- **R3** `update(state, inputs, dtMs)` é puro: não muta o estado recebido e devolve `{ state, events }`.
- **R4** Pausa congela relógio e sistemas; partida encerrada não avança.
- **R5** Com `durationMs`, ao esgotar o tempo a partida encerra e emite `match:ended` uma única vez.
- **R6** dt inválido (negativo, NaN, infinito) é rejeitado; dt grande é limitado a `MAX_DT_MS`.
- **R7** Sem Phaser, React, DOM nem `Math.random`.

## Suposições (clarify resolvido pelos docs, sem perguntar)

- O estado do RNG fica no `MatchState` (`rngState`) para o estado inteiro ser serializável;
  `createRng` ganhou `getState()`.
- `MAX_DT_MS = 250`: evita que uma aba em segundo plano encerre a partida num único frame.
- O payload de `match:ended` do core traz `{ seed, contentVersion, mode, score, durationMs }`;
  `matchId` é atribuído fora do core (cena/React), conforme `src/game/phaser/events.js`.
- Formato de `inputs` é livre neste ponto; a KD-17 (`game/input`) define as ações abstratas.
