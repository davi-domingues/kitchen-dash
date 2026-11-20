# Tasks: Auditoria de dependências de desenvolvimento no nível moderado

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [quickstart.md](quickstart.md)

## Phase 1: Setup

- [X] T001 Confirmar localmente que `npm audit --audit-level=moderate` passa na árvore atual (quickstart.md, passos 1-3)

## Phase 2: User Story 1 - Advisory moderado em dev barra o merge (P1)

**Independent Test**: o check Qualidade do PR roda os dois passos de auditoria e fica verde.

- [X] T002 [US1] Acrescentar o passo `npm audit --audit-level=moderate` após o passo existente, com a mesma condição, em .github/workflows/ci.yml (FR-001, FR-002)

## Phase 3: Polish

- [X] T003 [P] Registrar a decisão na §13.10 de docs/ESTUDOS_E_DECISOES.md (FR-003)
- [X] T004 [P] Atualizar a linha do check Qualidade na tabela de gates de AGENTS.md (FR-003)
- [X] T005 [P] Atualizar a descrição do `npm audit` em docs/SYSTEM_DESIGN.md (FR-003)
- [X] T006 Rodar os gates locais (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies

T001 → T002 → T006; T003-T005 independentes entre si.
