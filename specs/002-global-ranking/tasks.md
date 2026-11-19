---
description: "Tarefas executáveis para KD-36"
---

# Tasks: Ranking global paginado

**Input**: Artefatos de design em `specs/002-global-ranking/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md` e contrato de leitura.

**Tests**: Incluídos porque a especificação requer validação de paginação, ordenação, privacidade e estados de rede/cache.

**Organization**: Tarefas agrupadas por história; as duas têm prioridade P1.

## Phase 1: Setup

**Purpose**: Instalar a dependência aprovada e exata para cache remoto.

- [X] T001 Adicionar `@tanstack/react-query@5.108.0` como dependência exata em `package.json` e atualizar `package-lock.json`

---

## Phase 2: Foundational

**Purpose**: Disponibilizar o cliente de consulta para toda a árvore React.

- [X] T002 Criar uma instância estável de `QueryClient` e envolver a aplicação com `QueryClientProvider` em `src/main.jsx`

**Checkpoint**: KD-21 (#20) e KD-30 (#24) estão concluídas; a rota React e as tabelas/RLS já existem na base. O serviço de ranking pode ser integrado após T002.

---

## Phase 3: User Story 1 - Consultar o ranking (Priority: P1) — MVP

**Goal**: Exibir os seis quadros públicos com nomes e pontuações, paginação de 20 posições, desempate estável e destaque da própria linha quando visível.

**Independent Test**: Sem sessão, consultar cada quadro com dados fictícios; provar ordem `score DESC`, `achieved_at ASC`, `user_id ASC`, páginas sem repetição e ausência de dados privados. Com sessão, destacar somente a própria linha se estiver na página atual.

### Tests for User Story 1

- [X] T003 [US1] Escrever testes Vitest com Supabase mockado para os seis quadros, leituras de `best_scores` e `public_profiles`, projeção pública, ordenação, paginação/posição e propagação de erro em `src/features/ranking/rankingService.test.js`

### Implementation for User Story 1

- [X] T004 [US1] Implementar leitura validada de `best_scores` e busca dos nomes correspondentes em `public_profiles`, sem consultar perfil privado, em `src/features/ranking/rankingService.js`
- [X] T005 [US1] Implementar query key por quadro/página, `staleTime: 60_000`, consulta de até 21 registros para calcular `hasNextPage` e exibição de dados prévios durante a troca de página em `src/features/ranking/rankingQueries.js`
- [X] T006 [US1] Implementar seleção dos seis quadros, lista ordenada de até 20 posições, navegação anterior/próxima e realce textual e visual da própria linha visível em `src/features/ranking/RankingPageContent.jsx`, integrando a rota existente em `src/app/RankingPage.jsx` e adicionando textos em `src/i18n/pt-BR.json`

**Checkpoint**: Consulta pública paginada funciona sem login; a linha própria nunca é inferida por posição ou cor isolada.

---

## Phase 4: User Story 2 - Usar o ranking com conexão instável (Priority: P1)

**Goal**: Diferenciar offline inicial, erro, cache desatualizado e recuperação por retry sem tratar falha como lista vazia.

**Independent Test**: Abrir offline sem cache e confirmar aviso/retry; depois carregar online, ficar offline e confirmar que os dados anteriores continuam visíveis e identificados como desatualizados; restaurar a conexão e confirmar atualização por retry.

### Tests for User Story 2

- [X] T007 [US2] Adicionar casos Vitest para consulta offline inicial, falha de atualização com dados em cache e recuperação por retry em `src/features/ranking/rankingQueries.test.js`

### Implementation for User Story 2

- [X] T008 [US2] Implementar estados acessíveis de offline inicial, erro, cache desatualizado, transição de página e retry em `src/features/ranking/RankingPageContent.jsx` e adicionar as mensagens necessárias em `src/i18n/pt-BR.json`

**Checkpoint**: Indisponibilidade nunca aparece como lista vazia e a tentativa de recuperação não exige recarregar a aplicação.

---

## Phase 5: Polish e validação cruzada

**Purpose**: Alinhar a documentação do produto e comprovar os gates da feature.

- [X] T009 [P] Executar a validação manual de rede dos cenários offline/cache/retry descritos em `specs/002-global-ranking/quickstart.md` na rota `/ranking`, sem sessão e após uma consulta bem-sucedida
- [X] T010 [P] Alinhar o acesso público e a métrica de pontuação do Desafio em `docs/ARQUITETURA.md` e `docs/PRD.md`, registrar a decisão em `docs/ESTUDOS_E_DECISOES.md` e refletir o realce da própria linha em `docs/SYSTEM_DESIGN.md` se necessário
- [X] T011 Executar os cenários restantes de `specs/002-global-ranking/quickstart.md` e os comandos `npm test`, `npm run lint`, `npm run format:check`, `npm run build` e `npm run check-size`; resolver falhas antes do PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: T001 adiciona a dependência aprovada e atualiza o lockfile.
- **Foundational**: T002 depende de T001 e disponibiliza o provider.
- **User Story 1**: depende de T002; testes precedem os módulos de serviço e consulta.
- **User Story 2**: depende da consulta e da tela de US1; adiciona os estados de conectividade no mesmo componente.
- **Polish**: depende das histórias; executar gates depois da documentação e da validação manual.

### User Story Dependencies

- **US1 (P1)**: independente da US2 depois da fundação.
- **US2 (P1)**: depende da query e da tela criadas em US1 para distinguir cache, falhas e retry.
- **Pré-requisitos externos**: KD-21 (#20) e KD-30 (#24) estão concluídas e suas entregas devem permanecer na base da branch.

### Parallel Opportunities

- Não há paralelismo seguro entre tarefas de UI/consulta: elas compartilham `RankingPageContent.jsx`, `rankingService.test.js` e dependem da fundação.
- T009 (validação manual) e T010 (documentação) podem ocorrer em paralelo depois de US1/US2, pois a primeira não altera arquivos e a segunda altera somente `docs/`.
- T011 deve rodar após T009 e T010 para validar o estado final de todos os arquivos.

---

## Parallel Example

Após US1 e US2 implementadas:

```text
T009: validação manual de rede/cache na rota /ranking
T010: alinhamento documental em docs/
```

## Implementation Strategy

### MVP

1. Completar T001–T002 (dependência e provider).
2. Completar e testar US1 (T003–T006) para disponibilizar os quadros públicos.
3. Completar US2 (T007–T009) antes de considerar a KD-36 pronta, pois offline/cache/retry fazem parte dos critérios P1 da issue.

### Incremental Delivery

Validar primeiro a consulta e paginação públicas de US1. Depois integrar os estados de conexão de US2 sem alterar a consulta pública. Alinhar documentação e rodar todos os gates antes do PR.

## Notes

- O destaque usa a identidade da sessão existente, mas o ranking continua público e não filtra posições por usuário.
- O serviço lê somente as colunas de pontuação necessárias e `id`/`display_name` de `public_profiles`; não consulta e-mail nem `user_settings`.
- Não instalar ambiente DOM ou outra dependência de teste sem aprovação; a interface é validada manualmente conforme a decisão registrada na pesquisa.
