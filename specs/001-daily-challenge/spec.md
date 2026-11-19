# Feature Specification: Desafio do dia

**Feature Branch**: `feat/kd-24-desafio-do-dia`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "faça a issue #kitchen-dash#23 Task KD-24 do Plano do MVP · trilha core · onda 7

Escopo
Desafio escolhido de forma determinística pela data
Verificação ao fim da partida e registro local de conclusão
Critério de pronto

Mesmo desafio para todos no mesmo dia

Definition of Done do time atendida (lint, testes, review, CI verde)
Dependências
Bloqueada por: KD-15 · Core: modos Clássico, Livre e Desafio #14 (KD-15), KD-22 · Progresso local do visitante: recordes, placar e configurações #21 (KD-22)
Bloqueia: —
Referências
PRD.md (Desafio do dia)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogar o desafio do dia (Priority: P1)

Como jogador, ao iniciar uma partida em qualquer modo, quero que o desafio do dia seja o mesmo para todas as pessoas naquele dia, para que a comparação de desempenho seja justa.

**Why this priority**: O desafio diário é um motivador central e precisa ser consistente para gerar engajamento e comparação.

**Independent Test**: Em duas sessões independentes no mesmo dia, o desafio exibido é idêntico.

**Acceptance Scenarios**:

1. **Given** duas sessões iniciadas no mesmo dia, **When** o desafio do dia é consultado, **Then** ambas retornam o mesmo desafio.
2. **Given** dois dias diferentes, **When** o desafio do dia é consultado, **Then** o desafio muda de acordo com a data.

---

### User Story 2 - Verificação no fim da partida (Priority: P2)

Como jogador, ao terminar uma partida, quero saber se completei o desafio do dia, para entender meu progresso.

**Why this priority**: A confirmação imediata no fim da partida é o feedback principal de conclusão.

**Independent Test**: Finalizar uma partida que cumpre os critérios marca o desafio como concluído no resultado.

**Acceptance Scenarios**:

1. **Given** uma partida finalizada que atende os critérios do desafio do dia, **When** o resultado é exibido, **Then** a conclusão do desafio é indicada.
2. **Given** uma partida finalizada que não atende os critérios, **When** o resultado é exibido, **Then** a conclusão não é indicada.

---

### User Story 3 - Conclusão diária registrada (Priority: P3)

Como jogador, ao voltar ao jogo no mesmo dia, quero ver que o desafio do dia já foi concluído, para não repetir esforço desnecessário.

**Why this priority**: Reforça o progresso diário e evita frustração por repetição.

**Independent Test**: Após concluir o desafio, reiniciar o jogo no mesmo dia mantém o estado de concluído.

**Acceptance Scenarios**:

1. **Given** o desafio do dia concluído, **When** o jogador reabre o jogo no mesmo dia, **Then** o status de concluído permanece visível.

---

### Edge Cases

- O que acontece se a data mudar durante uma partida em andamento?
- Como o sistema lida com o relógio do dispositivo ajustado manualmente?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST selecionar o desafio do dia de forma determinística a partir da data em UTC.
- **FR-002**: O sistema MUST garantir que o mesmo desafio seja apresentado para todas as pessoas no mesmo dia.
- **FR-003**: O desafio do dia MUST ser aplicável e verificável em qualquer modo de jogo.
- **FR-004**: Ao final da partida, o sistema MUST verificar se os critérios do desafio do dia foram atendidos com base no resultado da partida.
- **FR-005**: Quando o desafio do dia for concluído, o sistema MUST registrar a conclusão localmente associada à data correspondente.
- **FR-006**: O sistema MUST expor o desafio do dia e o status de conclusão para que o jogador possa visualizar seu progresso diário.

### Key Entities *(include if feature involves data)*

- **Daily Challenge**: Representa o desafio válido para uma data específica, com descrição, critérios de conclusão e validade diária.
- **Daily Challenge Completion**: Registro local de conclusão do desafio em uma data, usado para indicar progresso diário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes no mesmo dia, sessões independentes exibem o mesmo desafio do dia.
- **SC-002**: Após concluir o desafio, o status de concluído permanece disponível ao reabrir o jogo no mesmo dia.
- **SC-003**: Em partidas encerradas, o resultado inclui a indicação correta de conclusão ou não conclusão do desafio do dia.

## Assumptions

- Existe um conjunto definido de desafios diários disponível para seleção determinística.
- O resumo da partida inclui dados suficientes para avaliar critérios do desafio no fim da partida.
- A conclusão diária é registrada uma única vez por data, independentemente do número de jogadores ou do modo.
- O progresso local do visitante já oferece um local confiável para persistir esse registro.
