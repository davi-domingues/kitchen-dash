# Feature Specification: Core de pontuação

**Feature Branch**: `feat/kd-14-core-pontuacao`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #13 (KD-14). Pontos base da receita + gorjeta pela rapidez (até 40), combo +10, prato errado −20, cliente que vai embora −30, piso zero (PRD, "Pontuação").

## Clarifications

### Session 2026-11-18

Resolvidas com o PRD e a SYSTEM_DESIGN §6, sem perguntar à pessoa (autorização do briefing).

- Q: O combo de +10 é fixo ou cresce a cada entrega seguida? → A: Fixo: +10 em cada entrega a partir da segunda da sequência (leitura literal do PRD; mantém o teto de plausibilidade estável).
- Q: Quanto vale a gorjeta num modo sem paciência (Livre)? → A: 0; não há medida de rapidez.
- Q: Qual teto de pontos por segundo o servidor deve usar? → A: 15 pontos/s mais uma folga de uma entrega máxima (180 pontos) para partidas curtas; derivado de 180 pontos por entrega ÷ 13 s de intervalo mínimo entre pedidos ≈ 13,8/s.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Entrega rende pontos base e gorjeta (Priority: P1)

O jogador entrega um prato que corresponde a uma comanda e ganha os pontos da receita mais uma gorjeta que é maior quanto mais rápido foi o atendimento.

**Why this priority**: É a fonte principal de pontos; sem ela não há placar.

**Independent Test**: Entregar uma Salada (60 pontos) com metade da paciência restante e conferir 60 + 20.

**Acceptance Scenarios**:

1. **Given** uma comanda com toda a paciência restante, **When** o prato é entregue, **Then** soma base + 40.
2. **Given** uma comanda com metade da paciência, **When** entregue, **Then** soma base + 20.
3. **Given** um modo sem paciência, **When** entregue, **Then** soma só a base (gorjeta 0).

### User Story 2 - Combo por entregas seguidas (Priority: P1)

Entregas consecutivas, sem erro nem cliente perdido no meio, dão +10 a cada entrega a partir da segunda.

**Independent Test**: Três entregas seguidas rendem bônus 0, 10 e 10.

**Acceptance Scenarios**:

1. **Given** nenhuma entrega anterior, **When** entrega, **Then** sem bônus de combo.
2. **Given** uma entrega anterior seguida, **When** entrega, **Then** +10.
3. **Given** um prato errado ou cliente perdido, **When** a próxima entrega acontece, **Then** o combo recomeça (sem bônus).

### User Story 3 - Penalidades com piso zero (Priority: P1)

Prato errado tira 20 pontos; cliente que vai embora tira 30; o placar nunca fica negativo.

**Acceptance Scenarios**:

1. **Given** placar 100, **When** prato errado, **Then** placar 80.
2. **Given** placar 100, **When** um cliente vai embora, **Then** placar 70.
3. **Given** placar 10, **When** qualquer penalidade, **Then** placar 0.

### Edge Cases

- Vários eventos no mesmo passo são aplicados na ordem em que chegaram.
- Penalidade com placar zero mantém zero e é informada com a variação efetiva (0).
- Gorjeta fracionária é arredondada para inteiro (placar sempre inteiro).
- Eventos que não são de pedido são ignorados.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Toda entrega válida MUST somar os pontos base da receita entregue.
- **FR-002**: Toda entrega MUST somar gorjeta = arredondamento de 40 × (paciência restante ÷ paciência total), entre 0 e 40; sem paciência, a gorjeta é 0.
- **FR-003**: A partir da segunda entrega consecutiva, cada entrega MUST somar +10 de combo.
- **FR-004**: Prato errado ou cliente que vai embora MUST zerar a sequência de combo.
- **FR-005**: Prato errado MUST subtrair 20; cliente que vai embora MUST subtrair 30.
- **FR-006**: O placar MUST nunca ficar abaixo de zero.
- **FR-007**: Cada alteração MUST gerar um aviso de placar com a variação efetiva, o motivo e o detalhamento (base, gorjeta, combo), para o HUD.
- **FR-008**: O cálculo MUST ser determinístico: os mesmos eventos produzem o mesmo placar.
- **FR-009**: O teto de plausibilidade MUST ser publicado: no máximo 15 pontos por segundo de partida mais 180 pontos de folga (uma entrega máxima: 130 + 40 + 10).

### Key Entities

- **Placar**: valor inteiro ≥ 0 da partida.
- **Combo**: número de entregas consecutivas desde o último erro ou cliente perdido.
- **Aviso de placar**: variação, motivo (entrega, prato errado, cliente perdido), detalhamento e placar resultante.

## Success Criteria _(mandatory)_

- **SC-001**: 100% das regras de pontuação do PRD têm teste automatizado correspondente.
- **SC-002**: Em nenhuma sequência de eventos testada o placar fica negativo.
- **SC-003**: Repetir a mesma sequência de eventos produz exatamente o mesmo placar em 100% das execuções.
- **SC-004**: O teto de pontos por segundo é publicado e nenhuma partida legítima simulada o ultrapassa.

## Assumptions

- "+10 por entrega consecutiva acima de uma" é lido como bônus fixo de +10 em cada entrega a partir da segunda da sequência (não cumulativo), para manter o teto de plausibilidade estável.
- A gorjeta é linear na paciência restante; no modo Livre (sem paciência) não há gorjeta.
- O combo só é quebrado por prato errado ou cliente perdido; o tempo entre entregas não o quebra.
- Penalidade é aplicada mesmo que a partida ainda não tenha pontos (resultado fica em 0).
