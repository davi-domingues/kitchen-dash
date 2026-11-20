# Feature Specification: QA final e release do MVP

**Feature Branch**: `docs/kd-46-qa-release`
**Created**: 2026-11-20
**Status**: Implementada
**Input**: KD-46 (issue #39): QA final e release do MVP. Checklist de lançamento, roteiro de QA com 2 jogadores em todos os modos e telas pequenas, notas de release v1.0.0, versão 1.0.0 e política de versão.

## Clarifications

### Session 2026-11-20

Resolvidas pelos docs, sem perguntar (suposições registradas):

- Q: O que fica fora do escopo desta entrega? → A: Criar a tag, fazer merge ou deploy e corrigir falhas achadas no QA; cada falha vira issue (AGENTS.md, regra 3).
- Q: Em quais navegadores o roteiro manual roda? → A: Chrome e Firefox atuais, em produção.
- Q: Onde fica a evidência de cada verificação? → A: Em comentário na issue #39.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Checklist de lançamento (Priority: P1)

A pessoa responsável pelo lançamento verifica a produção item a item antes de criar a tag, sem depender da memória de quem fez cada entrega.

**Why this priority**: sem a verificação em produção, a issue não fecha e a versão não pode ser marcada.

**Independent Test**: abrir o checklist e conferir que cada item do escopo do MVP e da issue tem uma caixa e um "como verificar".

**Acceptance Scenarios**:

1. **Given** o checklist, **When** a pessoa lê a seção de escopo, **Then** encontra um item para cada um dos 4 pontos da ARQUITETURA §9.
2. **Given** o checklist, **When** a pessoa procura os temas da issue, **Then** encontra Turnstile, limites de OTP, CSP, Sentry (DSN, source maps, sem PII), backups e riscos aceitos, environment de produção, migrations e advisors remotos, PWA, LGPD (controlador e DPO a preencher) e acessibilidade.
3. **Given** qualquer item, **When** ainda não foi verificado em produção, **Then** fica desmarcado.

---

### User Story 2 - Partida de 2 jogadores em todos os modos (Priority: P1)

Dois jogadores no mesmo teclado jogam uma partida completa em Clássico, Livre, Desafio e Desafio do dia, e o jogo fica legível em telas pequenas.

**Why this priority**: o modo cooperativo local é o centro do produto.

**Independent Test**: a verificação automatizada joga cada modo com 2 jogadores até o fim; o roteiro manual cobre o teclado real e as larguras 360, 768 e 1280.

**Acceptance Scenarios**:

1. **Given** uma partida Clássica de 2 jogadores, **When** o tempo acaba, **Then** a partida termina uma única vez com o resumo dos dois.
2. **Given** uma partida Livre de 2 jogadores, **When** ninguém encerra, **Then** ela continua; **When** alguém encerra, **Then** termina com o resumo.
3. **Given** um Desafio de 2 jogadores, **When** o 12º pedido é entregue, **Then** a partida termina sem pedidos perdidos.
4. **Given** o resumo de uma partida, **When** o Desafio do dia é avaliado, **Then** o resultado diz se foi cumprido.
5. **Given** larguras de 360, 768 e 1280 px, **When** a pessoa percorre as telas, **Then** não há rolagem horizontal e o HUD fica legível.

---

### User Story 3 - Notas de release e versão (Priority: P2)

Quem acompanha o projeto sabe o que a v1.0.0 entrega, o que ainda falta mergear e quais riscos foram aceitos.

**Why this priority**: comunica a entrega, mas depende das outras histórias.

**Independent Test**: ler as notas e conferir as entregas mergeadas, os PRs previstos, os débitos e os riscos; a versão do app é 1.0.0.

**Acceptance Scenarios**:

1. **Given** as notas, **When** a pessoa lê, **Then** encontra as entregas com issue KD e PR, os PRs abertos #94 a #106 como previstos, os débitos resolvidos e os riscos conhecidos.
2. **Given** a versão do app, **When** conferida, **Then** é 1.0.0, e a tag só existe depois dos merges e da verificação em produção.

### Edge Cases

- Um PR previsto não é mergeado: a tag não é criada e as notas são atualizadas.
- Um item do checklist falha em produção: abre-se uma issue e a tag espera.
- Os dados de controlador ou DPO não estão definidos: o item da LGPD fica pendente com a pessoa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O checklist DEVE cobrir os 4 pontos da ARQUITETURA §9 e todos os temas do escopo da issue, cada um com o modo de verificar.
- **FR-002**: Todo item que depende de produção DEVE ficar desmarcado até ser verificado lá.
- **FR-003**: DEVE existir uma verificação automatizada e determinística de uma partida completa com 2 jogadores em cada modo, sem dependência nova.
- **FR-004**: DEVE existir um roteiro manual para teclado real e para as larguras 360, 768 e 1280 px.
- **FR-005**: As notas de release DEVEM listar entregas mergeadas, PRs previstos, débitos e riscos.
- **FR-006**: A versão do app DEVE ser 1.0.0, e a tag DEVE ser criada só por uma pessoa.
- **FR-007**: A política de versão DEVE ser registrada no documento de decisões, numa seção que não colida com as de outros PRs.
- **FR-008**: Falhas achadas no QA DEVEM virar issue, sem correção neste PR.
- **FR-009**: A evidência de cada verificação DEVE ser registrada na issue #39.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos pontos da ARQUITETURA §9 e dos temas da issue aparecem no checklist.
- **SC-002**: A verificação automatizada termina a partida nos 3 modos com 2 jogadores e avalia o Desafio do dia.
- **SC-003**: Todas as verificações de qualidade do projeto passam antes do merge.
- **SC-004**: A tag v1.0.0 só é criada depois de 100% dos itens do checklist marcados.

## Assumptions

- "Verificado em produção" depende dos merges; fica pendente no checklist e no PR.
- Controlador e DPO da LGPD ficam a preencher pela pessoa responsável.
- O MVP não tem E2E automatizado (decisão D4), então o fluxo com teclado real é manual.
- A política de versão fica na seção 13.9, para não colidir com 13.1 e 13.2 usadas em outros PRs.
