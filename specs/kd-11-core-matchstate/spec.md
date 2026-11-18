# Feature Specification: Core da partida (RNG com seed, MatchState e ciclo de atualização)

**Feature Branch**: `feat/kd-11-core-matchstate`
**Created**: 2026-11-18
**Status**: Draft
**Input**: User description: "KD-11 (issue #10): Core do jogo com RNG com seed, MatchState (chefs, itens, estações, pedidos, tempo), relógio e ciclo de atualização puro update(state, inputs, dt) que devolve estado e eventos (order:delivered, match:ended). Determinístico: mesmo seed e inputs geram o mesmo estado. Sem Phaser/React. Sistemas de KD-12..KD-15 plugam no ciclo."

## Clarifications

### Session 2026-11-18

Resolvidas pelos docs, sem perguntar à pessoa (instrução do coordenador):

- Q: Onde fica a posição da sequência aleatória entre passos? → A: Dentro do MatchState (`rngState`), para o estado ser serializável e reprodutível (SYSTEM_DESIGN §3, replay no ROADMAP).
- Q: Qual o teto de um passo de tempo? → A: 250 ms; protege o modo Clássico de 3 min contra quadro travado (PRD §Modos).
- Q: O `match:ended` do core traz o `matchId`? → A: Não; o core emite `{ seed, contentVersion, mode, score, durationMs }` e a cena/React atribui o `matchId` (contrato em `src/game/phaser/events.js`).

## User Scenarios & Testing _(mandatory)_

Os "usuários" desta feature são o jogador (indiretamente) e as próximas tasks do core
(estações, pedidos, pontuação, modos) e a cena do jogo, que consomem o ciclo.

### User Story 1 - Partida reproduzível (Priority: P1)

Duas partidas iniciadas com a mesma semente e o mesmo conteúdo, recebendo as mesmas ações nos
mesmos instantes, terminam exatamente no mesmo estado e produzem os mesmos eventos.

**Why this priority**: É o critério de pronto da issue e a base para desafios com seed
compartilhada e validação por replay (SYSTEM_DESIGN §3).

**Independent Test**: Reproduzir uma sequência fixa de ações duas vezes com a mesma semente e
comparar estado final e eventos.

**Acceptance Scenarios**:

1. **Given** duas partidas com a mesma semente, **When** recebem as mesmas ações e passos de tempo, **Then** o estado final e a lista de eventos são idênticos.
2. **Given** duas partidas com sementes diferentes e um sistema que sorteia valores, **When** avançam um passo, **Then** os estados diferem.

---

### User Story 2 - Relógio, pausa e fim por tempo (Priority: P1)

A partida mede o tempo decorrido, pode ser pausada e retomada sem perder nada e, quando tem
limite de tempo, termina sozinha ao esgotá-lo, avisando uma única vez.

**Why this priority**: O modo Clássico (3 min) e o menu de pausa dependem disso.

**Independent Test**: Avançar o relógio, pausar, retomar e esgotar o tempo, verificando estado e eventos.

**Acceptance Scenarios**:

1. **Given** uma partida em andamento, **When** avança um passo, **Then** o tempo decorrido aumenta exatamente do passo e o estado anterior não muda.
2. **Given** uma partida pausada, **When** recebe um passo, **Then** nada muda e nenhum evento é emitido.
3. **Given** uma partida com limite de tempo, **When** o tempo decorrido alcança o limite, **Then** ela termina, o tempo fica igual ao limite e o evento de fim é emitido uma vez com semente, versão do conteúdo, modo, placar e duração.
4. **Given** uma partida sem limite de tempo, **When** avança, **Then** ela não termina pelo relógio.

---

### User Story 3 - Sistemas plugáveis (Priority: P2)

As regras de estações, pedidos, pontuação e modos entram como sistemas independentes no ciclo,
executados em ordem fixa, cada um recebendo o estado, o passo de tempo, as ações e a fonte de
aleatoriedade da partida, e devolvendo novo estado e eventos.

**Why this priority**: Destrava KD-12, KD-13, KD-14 e KD-15 sem alterar o ciclo.

**Independent Test**: Registrar sistemas de teste e verificar ordem, argumentos e agregação dos eventos.

**Acceptance Scenarios**:

1. **Given** dois sistemas registrados, **When** a partida avança, **Then** ambos rodam na ordem de registro com o mesmo passo e as mesmas ações, e os eventos de ambos são devolvidos.

### Edge Cases

- Passo de tempo negativo, NaN ou infinito: rejeitado com erro.
- Passo muito grande (aba em segundo plano): limitado a um teto, para a partida não acabar num único quadro.
- Semente não inteira ou limite de tempo não positivo: criação da partida rejeitada.
- Pausar o que não está rodando ou retomar o que não está pausado: sem efeito.
- Partida encerrada recebendo novos passos: sem efeito e sem novo evento de fim.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O core MUST gerar números pseudoaleatórios a partir de uma semente, e a mesma semente MUST gerar a mesma sequência.
- **FR-002**: O estado da partida MUST ser dado puro e serializável, incluindo a posição atual da sequência aleatória, para que possa ser salvo e retomado.
- **FR-003**: O estado MUST conter semente, modo, versão do conteúdo, situação (rodando, pausada, encerrada), contador de passos, tempo decorrido, limite de tempo opcional, placar, chefs, estações, itens e pedidos.
- **FR-004**: O passo de atualização MUST receber estado, ações e passo de tempo e devolver novo estado e eventos, sem alterar o estado recebido.
- **FR-005**: O passo MUST ser determinístico: mesmas entradas geram mesmas saídas.
- **FR-006**: A partida MUST poder ser pausada e retomada; pausada ou encerrada, não avança.
- **FR-007**: Com limite de tempo, a partida MUST terminar ao alcançá-lo e emitir `match:ended` uma única vez.
- **FR-008**: O core MUST declarar os nomes dos eventos de saída, incluindo `order:delivered` e `match:ended`.
- **FR-009**: O ciclo MUST aceitar uma lista ordenada de sistemas com contrato único (estado, passo, ações, aleatoriedade → estado, eventos).
- **FR-010**: Passos inválidos MUST ser rejeitados e passos grandes MUST ser limitados a um teto.
- **FR-011**: O core MUST NOT depender de motor gráfico, interface, DOM ou aleatoriedade não semeada.

### Key Entities

- **MatchState**: a partida inteira em um instante (ver FR-003).
- **Sistema**: regra plugável que transforma o estado a cada passo e pode emitir eventos.
- **Evento**: fato ocorrido no passo, com tipo (`área:ação`) e dados.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% das reproduções com a mesma semente e as mesmas ações chegam ao mesmo estado e aos mesmos eventos.
- **SC-002**: 100% das regras do ciclo (relógio, pausa, fim, limites de passo, ordem dos sistemas) cobertas por teste automatizado.
- **SC-003**: Um quadro travado de qualquer duração avança a partida no máximo 250 ms.
- **SC-004**: Novas regras (KD-12 a KD-15) entram sem alterar o ciclo, só registrando sistemas.

## Assumptions

- A posição da sequência aleatória é guardada dentro do estado da partida, para o estado ser serializável e retomável.
- O teto do passo é 250 ms.
- O evento `match:ended` do core não traz identificador da partida; quem atribui o `matchId` é a cena ou o React (contrato em `src/game/phaser/events.js`).
- O formato das ações é livre nesta feature; a KD-17 (`game/input`) define as ações abstratas.
- Fora de escopo: regras de estações, pedidos, pontuação e modos (KD-12 a KD-15).
