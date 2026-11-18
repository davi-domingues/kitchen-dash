# Feature Specification: Core de pedidos e paciência (OrderQueue)

**Feature Branch**: `feat/kd-13-core-pedidos`
**Created**: 2026-11-18
**Status**: Draft
**Input**: User description: "KD-13 (issue #12): Core: pedidos e paciência (OrderQueue, desbloqueio de receitas por tempo, fila). Entrega de prato como função pura que a KD-12/KD-18 chamará; eventos com os dados que a KD-14 (pontuação) precisa."

## Clarifications

### Session 2026-11-18

Resolvidas pelos docs, sem perguntar à pessoa (instrução do coordenador):

- Q: A paciência corre para pedidos na fila (não visíveis)? → A: Não. Só comandas visíveis perdem paciência; a fila é espera do restaurante, não do cliente (PRD §Livre: "fila visível").
- Q: Qual comanda um prato atende quando há duas da mesma receita? → A: A visível mais antiga (menor número).
- Q: O que acontece quando a fila está cheia? → A: O pedido novo não é criado (sem evento); a chegada seguinte é reagendada normalmente.
- Q: Valores do Clássico (comandas visíveis, intervalo, paciência)? → A: O PRD só fixa os do Livre (13–17 s, 6 visíveis, fila 20). Padrões assumidos: 4 visíveis, fila 20, chegada a cada 13–17 s, paciência de 60 s. A KD-15 ajusta por modo.

## User Scenarios & Testing _(mandatory)_

Os "usuários" são o jogador (indiretamente) e as tasks seguintes: estações/cena (KD-12/KD-18) entregam
pratos, pontuação (KD-14) consome os eventos, modos (KD-15) configuram a fila, HUD (KD-20) mostra as comandas.

### User Story 1 - Pedidos chegam com receitas liberadas pelo tempo (Priority: P1)

Durante a partida chegam pedidos em intervalos sorteados pela semente; cada pedido é de uma receita já
liberada no tempo decorrido (Salada desde 0 s, Tartine 20 s, Sopa 45 s, Ratatouille 70 s).

**Why this priority**: Sem pedidos não há jogo.

**Independent Test**: avançar a partida com semente fixa e conferir instantes, receitas e numeração.

**Acceptance Scenarios**:

1. **Given** uma partida nova, **When** o primeiro passo roda, **Then** chega o pedido #1, de Salada.
2. **Given** tempo decorrido abaixo de 20 s, **When** chegam pedidos, **Then** todos são de receitas com desbloqueio ≤ tempo decorrido.
3. **Given** a mesma semente, **When** a partida é repetida, **Then** a sequência de pedidos é idêntica.

---

### User Story 2 - Comandas visíveis e fila (Priority: P1)

Há um limite de comandas visíveis; excedentes entram numa fila limitada e sobem quando abre vaga.

**Why this priority**: Base dos três modos (PRD §Modos).

**Independent Test**: lotar as comandas e conferir fila e promoção.

**Acceptance Scenarios**:

1. **Given** todas as comandas visíveis ocupadas, **When** chega um pedido, **Then** ele entra na fila.
2. **Given** pedidos na fila, **When** uma comanda sai (entregue ou expirada), **Then** o mais antigo da fila vira comanda visível com paciência cheia.
3. **Given** a fila cheia, **When** chegaria um pedido, **Then** ele não é criado.

---

### User Story 3 - Paciência e expiração (Priority: P1)

Cada comanda visível perde paciência com o tempo; ao zerar, o cliente vai embora e é emitido um evento
com os dados para a penalidade.

**Why this priority**: É a pressão do modo Clássico.

**Independent Test**: avançar o tempo até a paciência zerar.

**Acceptance Scenarios**:

1. **Given** uma comanda com 60 s de paciência, **When** passam 60 s, **Then** ela sai e é emitido `order:expired`.
2. **Given** paciência desligada (modo Livre), **When** o tempo passa, **Then** nenhuma comanda expira.

---

### User Story 4 - Entrega de prato (Priority: P1)

A cena/estações entregam um prato no passe por uma operação pura. Prato certo fecha a comanda e emite
`order:delivered` com receita, pontos base e paciência restante; prato sem comanda emite `order:wrong`.

**Why this priority**: Fecha o ciclo de jogo e alimenta a pontuação.

**Independent Test**: entregar pratos certos e errados e conferir comandas e eventos.

**Acceptance Scenarios**:

1. **Given** uma comanda de Salada visível, **When** é entregue uma Salada, **Then** a comanda sai e `order:delivered` traz pontos base e paciência restante.
2. **Given** nenhuma comanda visível de Tartine, **When** é entregue uma Tartine, **Then** nenhuma comanda muda e é emitido `order:wrong`.

---

### User Story 5 - Sequência fixa (Priority: P2)

Para o modo Desafio, a fila aceita uma sequência fixa de receitas que ignora o desbloqueio por tempo; quando
todos os pedidos foram entregues, a sequência é dada por concluída.

**Why this priority**: Pré-requisito da KD-15, mas não do Clássico.

**Independent Test**: configurar 3 receitas, entregar todas e conferir a conclusão.

**Acceptance Scenarios**:

1. **Given** uma sequência de 3 receitas, **When** a partida avança, **Then** chegam exatamente essas 3, na ordem, e nada mais.
2. **Given** todas entregues, **When** se consulta a fila, **Then** a sequência está concluída.

### Edge Cases

- Passo de tempo maior que a paciência restante: a comanda expira no mesmo passo.
- No máximo uma chegada por passo (passo ≤ 250 ms, intervalo ≥ 13 s nos padrões).
- Partida pausada ou encerrada: o ciclo não roda e a entrega é ignorada, sem eventos.
- Receita desconhecida entregue: tratada como prato errado.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema DEVE criar pedidos em intervalos sorteados pela semente dentro de uma faixa configurável.
- **FR-002**: Fora de sequência fixa, a receita DEVE ser sorteada entre as liberadas no tempo decorrido.
- **FR-003**: Pedidos DEVEM ter número sequencial a partir de 1 e identificador estável.
- **FR-004**: O número de comandas visíveis e o tamanho da fila DEVEM ser limitados e configuráveis.
- **FR-005**: Comandas visíveis DEVEM perder paciência a cada passo; pedidos na fila não.
- **FR-006**: Comanda com paciência zerada DEVE sair e gerar evento de expiração.
- **FR-007**: A entrega de prato DEVE ser uma operação pura que fecha a comanda visível mais antiga da mesma receita.
- **FR-008**: Prato sem comanda correspondente DEVE gerar evento de prato errado sem alterar as comandas.
- **FR-009**: Eventos de entrega e expiração DEVEM trazer receita, pontos base e paciência total/restante.
- **FR-010**: Uma sequência fixa de receitas DEVE ser suportada, e DEVE ser possível saber quando ela foi concluída.
- **FR-011**: Mesma semente e mesmas ações DEVEM produzir os mesmos pedidos e eventos.

### Key Entities

- **Pedido (comanda)**: identificador, número, receita, instante de chegada, paciência total e restante.
- **Fila de pedidos**: comandas visíveis, pedidos em espera, próximo instante de chegada, contador, posição na sequência.

## Success Criteria _(mandatory)_

- **SC-001**: 100% das regras de chegada, fila, paciência e entrega cobertas por testes automatizados.
- **SC-002**: Duas execuções com a mesma semente geram sequências de pedidos idênticas em 100% dos casos testados.
- **SC-003**: Nenhum pedido aparece com receita ainda não liberada no tempo da partida.

## Assumptions

- Valores padrão do Clássico (4 visíveis, fila 20, 13–17 s, 60 s de paciência) são suposições; a KD-15 os ajusta por modo.
- O primeiro pedido chega no primeiro passo da partida.
- O cálculo de pontos (gorjeta, combo, penalidades, piso zero) é da KD-14; aqui só se emitem os dados.
- Estações e montagem de pratos são da KD-12; aqui o prato é identificado pela receita.
