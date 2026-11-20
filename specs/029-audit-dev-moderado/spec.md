# Feature Specification: Auditoria de dependências de desenvolvimento no nível moderado

**Feature Branch**: `ci/debito-55-audit-dev`
**Created**: 2026-11-20
**Status**: Draft
**Input**: Débito #55 — advisories moderados do `minimatch` (via `eslint`, dependência de desenvolvimento) passaram despercebidos porque o CI audita só dependências de produção no nível alto. O job Qualidade deve auditar também as de desenvolvimento no nível moderado, mantendo o passo existente.

## Clarifications

### Session 2026-11-20

- Q: O passo novo substitui o antigo? → A: Não; mantém-se o passo de produção nível alto (pedido explícito), e o novo é adicional, resolvido pelos docs sem perguntar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vulnerabilidade moderada em ferramenta de desenvolvimento barra o merge (Priority: P1)

Quem mantém o projeto quer que um PR que introduza (ou mantenha) uma dependência de desenvolvimento com advisory de severidade moderada ou maior falhe no check **Qualidade**, para que o problema seja tratado antes do merge e não vire débito silencioso.

**Why this priority**: É a causa do débito #55; sem isso, a falha se repete.

**Independent Test**: Rodar a auditoria de todas as dependências no nível moderado na árvore atual (deve passar) e verificar que o passo existe no job Qualidade.

**Acceptance Scenarios**:

1. **Given** a árvore atual sem advisories, **When** o CI roda o job Qualidade, **Then** a nova auditoria passa.
2. **Given** uma dependência de desenvolvimento com advisory moderado, **When** o CI roda, **Then** o check Qualidade falha.
3. **Given** uma dependência de produção com advisory alto, **When** o CI roda, **Then** o passo existente continua falhando como antes.

### Edge Cases

- Advisory de severidade baixa (*low*) em dependência de desenvolvimento não barra o merge.
- Advisory sem correção disponível barra o merge até que haja decisão registrada (issue `débito`/exceção aprovada).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O job Qualidade DEVE auditar todas as dependências (produção e desenvolvimento) e falhar com advisory de severidade moderada ou maior.
- **FR-002**: O passo de auditoria existente (produção, nível alto) DEVE ser mantido sem alteração.
- **FR-003**: A decisão DEVE ser registrada em ESTUDOS_E_DECISOES (seção 13.10), e a descrição dos gates em AGENTS e SYSTEM_DESIGN DEVE refletir a nova auditoria.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos PRs com advisory moderado ou maior em qualquer dependência ficam bloqueados pelo check Qualidade.
- **SC-002**: A árvore atual passa na nova auditoria (0 vulnerabilidades reportadas).

## Assumptions

- A árvore atual (eslint 10.15.0, minimatch 11.0.8) não tem advisories; confirmado localmente.
- O passo de produção nível alto é mantido por ser o contrato documentado; fica redundante em severidade, mas preserva o gate original explícito (decisão do pedido).
- Não há nova dependência nem mudança de código da aplicação.
