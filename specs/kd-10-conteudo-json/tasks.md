# Tasks: Conteúdo do jogo em dados com schema (KD-10)

**Input**: Design documents from `/specs/kd-10-conteudo-json/`

**Tests**: obrigatórios pelo AGENTS.md §5 (lógica nova vem com teste).

## Phase 1: Setup

- [x] T001 Instalar `ajv@8.20.0` como dev, com versão exata, em package.json e package-lock.json

## Phase 2: Foundational

- [x] T002 [P] Criar src/content/schemas/recipes.schema.json: `id` com `^[a-z][a-z0-9_]*$`; `container` com `plate` | `pot`; `pot` ⇒ `cookMs` ≥ 1 e `plate` ⇒ 0
- [x] T003 [P] Criar src/content/schemas/kitchens.schema.json: `kind` ∈ wall, floor, crate, cutting, stove, counter, plates, trash, pass; `ingredient` só em crate e obrigatório nele
- [x] T004 [P] Criar src/content/schemas/cosmetics.schema.json: `slot` com `hat` | `apron` | `theme`; `color` no formato `#rrggbb`

## Phase 3: User Story 1 — Conteúdo disponível como dado (P1)

**Independent Test**: as receitas trazem os pontos 60, 60, 90 e 130 e o desbloqueio aos 0, 20, 45 e 70 s.

- [x] T005 [P] [US1] Escrever src/content/recipes.json com 6 ingredientes e 4 receitas do PRD
- [x] T006 [P] [US1] Escrever src/content/kitchens.json com o mapa do bistrô, 2 spawns e `stoveBurnAfterMs`
- [x] T007 [P] [US1] Escrever src/content/cosmetics.json com 11 itens e os limiares do PRD
- [x] T008 [US1] Implementar o loader em src/content/index.js (contrato em contracts/content-api.md)
- [x] T009 [US1] Testar o loader em src/content/content.test.js
- [x] T010 [US1] Adicionar as chaves `<tipo>.<id>.name` em src/i18n/pt-BR.json e contar as chaves derivadas em src/i18n/i18n.test.js

## Phase 4: User Story 2 — Conteúdo inválido não é publicado (P1)

**Independent Test**: com um slot inválido, `npm run build` falha.

- [x] T011 [US2] Implementar `validateContent`, `readContent` e `contentPlugin` em scripts/validate-content.js
- [x] T012 [US2] Testar cada regra dos Edge Cases em scripts/validate-content.test.js
- [x] T013 [US2] Registrar `contentPlugin()` em vite.config.js

## Phase 5: User Story 3 — Versão identificável (P2)

**Independent Test**: o hash é estável e muda quando o conteúdo muda.

- [x] T014 [US3] Implementar `hashContent` e `CONTENT_VERSION` em src/content/index.js, com teste em src/content/content.test.js

## Phase 6: Polish

- [x] T015 Registrar as decisões em docs/ESTUDOS_E_DECISOES.md §7
- [x] T016 Rodar os gates (format:check, lint, test, build, check-size) e a verificação manual do quickstart.md

## Dependencies

T001 → T002–T004 → US1 (T005–T010) → US2 (T011–T013) → US3 (T014) → Polish. US2 e US3 dependem dos JSON de US1.

## Parallel

T002–T004 rodam em paralelo; T005–T007 também.

## Implementation Strategy

O MVP é a US1 mais a US2, que juntas cobrem o critério de pronto da issue. A US3 completa o contrato para o M2.
