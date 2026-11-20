# Feature Specification: Migration automática de versão de conteúdo

**Feature Branch**: `ci/debito-56-versao-conteudo`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Débito #56: gerar automaticamente a migration de accepted_content_versions quando CONTENT_VERSION mudar (comando npm run db:content-version), mantendo o check do CI (#87) e fazendo sua falha apontar o comando."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar a nova versão com um comando (Priority: P1)

Quem altera conteúdo roda um único comando e recebe uma migration pronta, revisável, que passa a aceitar a nova versão sem rejeitar as anteriores.

**Why this priority**: Remove o passo manual que, esquecido, faz todo envio real sair como `unknown_content_version`.

**Independent Test**: Com conteúdo alterado, o comando cria uma migration; com o check rodando em seguida, ele passa.

**Acceptance Scenarios**:

1. **Given** a versão atual não está aceita, **When** a pessoa roda o comando, **Then** uma migration nova é criada com as versões anteriores mais a atual.
2. **Given** a versão atual já está aceita, **When** a pessoa roda o comando, **Then** nada é criado e o comando informa que está em dia.

### User Story 2 - Falha do CI indica a correção (Priority: P2)

Quando o check do CI falha, a mensagem diz exatamente qual comando rodar.

**Acceptance Scenarios**:

1. **Given** conteúdo alterado sem migration, **When** o CI roda, **Then** a falha cita `npm run db:content-version`.

### Edge Cases

- Não existe migration anterior com a lista: o comando falha com mensagem clara.
- Rodar o comando duas vezes seguidas não cria uma segunda migration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O comando MUST calcular a versão com o mesmo algoritmo do check e do jogo.
- **FR-002**: O comando MUST criar uma migration nova somente se a versão não estiver aceita.
- **FR-003**: A migration MUST manter as versões aceitas anteriores e acrescentar a atual, sem duplicar.
- **FR-004**: O nome da migration MUST seguir o padrão de timestamp do Supabase CLI.
- **FR-005**: A falha do check MUST indicar o comando de geração.
- **FR-006**: O CI MUST continuar apenas verificando; não gera nem commita migrations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Após rodar o comando, o check passa em 100% dos casos com conteúdo alterado.
- **SC-002**: Uma segunda execução seguida cria 0 arquivos.
- **SC-003**: 100% das falhas do check exibem o comando de correção.

## Assumptions

- Versões antigas permanecem aceitas para não rejeitar clientes com cache antigo (PWA); removê-las é decisão manual.
- A migration gerada é commitada pela pessoa no mesmo PR da mudança de conteúdo; o CI não escreve no repositório (mais simples e seguro que um bot).
