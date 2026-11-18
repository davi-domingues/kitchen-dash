# Feature Specification: Core dos modos de jogo

**Feature Branch**: `feat/kd-15-core-modos`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #14 (KD-15). Modos Clássico (3 min), Livre (sem tempo) e Desafio (12 pedidos fixos), montados por uma fábrica única que a cena chama (PRD, "Modos de jogo").

## Clarifications

### Session 2026-11-18

Resolvidas com o PRD e o PLANO_MVP, sem perguntar à pessoa (autorização do briefing).

- Q: O Desafio tem perda de paciência? → A: Não. O PRD só fala em cronômetro crescente e menor tempo; um cliente perdido tornaria a sequência impossível de completar.
- Q: Qual é a sequência fixa do Desafio, se o conteúdo não a define? → A: Gerada de forma determinística com uma seed fixa do Desafio (`CHALLENGE_SEED`) sobre as receitas do conteúdo, ignorando o desbloqueio por tempo. É a mesma a cada "Tentar de novo". Curadoria manual no JSON fica como pendência (mudaria o CONTENT_VERSION).
- Q: O intervalo de chegada muda por modo? → A: Não; 13–17 s nos três modos, então o teto de plausibilidade da KD-14 (180 + s×15) segue válido.
- Q: Como o Livre termina? → A: Pelo botão Encerrar: a cena chama `endMatch(state)`, que emite o mesmo `match:ended`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Clássico de 3 minutos (Priority: P1)

O jogador joga um turno de 3 minutos com clientes impacientes; ao fim recebe o resumo.

**Independent Test**: Montar o Clássico e avançar 180 s: a partida termina com `match:ended`.

**Acceptance Scenarios**:

1. **Given** o Clássico, **When** passam 180 s, **Then** o estado fica encerrado e `match:ended` traz modo, jogadores, seed, versão do conteúdo, placar, pedidos entregues e perdidos e duração 180000.
2. **Given** um prato servido no passe, **When** o core avança, **Then** a comanda correspondente é entregue, pontuada e a lista de entregas fica vazia.

### User Story 2 - Livre sem tempo (Priority: P1)

Sem limite de tempo nem paciência; até 6 comandas e fila de 20. Termina quando o jogador encerra.

**Acceptance Scenarios**:

1. **Given** o Livre, **When** passam vários minutos, **Then** a partida segue rodando e nenhuma comanda expira.
2. **Given** o Livre rodando, **When** o jogador encerra, **Then** `match:ended` traz a duração decorrida.

### User Story 3 - Desafio de 12 pedidos (Priority: P1)

Sequência fixa de 12 pedidos, 3 visíveis por vez; termina quando o último é entregue.

**Acceptance Scenarios**:

1. **Given** duas partidas do Desafio com seeds de entrada diferentes, **When** montadas, **Then** usam a mesma seed e a mesma sequência de 12 receitas.
2. **Given** o Desafio, **When** o 12º pedido é entregue, **Then** a partida encerra com a duração igual ao tempo decorrido.

### Edge Cases

- Modo ou número de jogadores inválido: a fábrica rejeita.
- Prato sem comanda: penalidade de prato errado e a entrega é consumida.
- `endMatch` numa partida já encerrada não emite nada.

## Requirements _(mandatory)_

- **FR-001**: Fábrica única que recebe modo, jogadores, seed, versão e conteúdo e devolve o estado inicial e a função de avanço.
- **FR-002**: Ids dos modos `classic`, `free`, `challenge`; jogadores 1 ou 2.
- **FR-003**: Clássico: 180 s, paciência 60 s, 4 comandas, fila 20.
- **FR-004**: Livre: sem tempo, sem paciência, 6 comandas, fila 20.
- **FR-005**: Desafio: 12 pedidos fixos, 3 visíveis, sem paciência, seed fixa, fim ao completar.
- **FR-006**: Pratos servidos no passe são entregues às comandas e pontuados a cada avanço.
- **FR-007**: `match:ended` com `{ mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs }`.
- **FR-008**: Encerramento manual disponível em qualquer modo.

### Key Entities

- **Configuração de modo**: duração e regras da fila de pedidos.
- **Estatísticas da partida**: pedidos entregues e perdidos.

## Success Criteria _(mandatory)_

- **SC-001**: 100% das regras dos três modos cobertas por teste determinístico.
- **SC-002**: A mesma entrada produz a mesma partida (mesma sequência e placar).

## Assumptions

- O `matchId` é atribuído pela cena, fora do core.
- Sem mudança em `src/content/*.json`.
