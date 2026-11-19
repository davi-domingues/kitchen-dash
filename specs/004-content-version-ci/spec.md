# Feature Specification: Versão de conteúdo no CI

**Feature Branch**: `ci/kd-56-versao-conteudo`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Falhar no CI quando a versão calculada dos JSONs de conteúdo não estiver aceita pela migration mais recente que altera a lista de versões."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Proteger envio após mudança de conteúdo (Priority: P1)

Uma pessoa que altera conteúdo recebe uma falha clara no CI se esquecer de registrar a versão calculada na migration de versões aceitas.

**Why this priority**: Evita que partidas reais sejam rejeitadas por incompatibilidade entre o conteúdo publicado e as versões aceitas pelo banco.

**Independent Test**: O check passa com o conteúdo e migration atuais e falha quando a versão atual não aparece na última alteração versionada da lista aceita.

**Acceptance Scenarios**:

1. **Given** a versão atual consta na alteração mais recente da lista aceita, **When** o CI executa, **Then** o check passa.
2. **Given** uma mudança de conteúdo sem atualização da lista aceita, **When** o CI executa, **Then** o check falha e informa a versão ausente.
3. **Given** uma migration posterior que não altera a lista aceita, **When** o CI executa, **Then** o check continua usando a última migration relevante.

### Edge Cases

- Não há migration que altere a lista de versões aceitas.
- A migration relevante não contém a versão calculada.
- A migration contém texto parecido fora da atualização da lista aceita.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST calcular a versão atual a partir dos três arquivos JSON de conteúdo, com o mesmo algoritmo usado pelo jogo.
- **FR-002**: O sistema MUST localizar a última migration que altera `accepted_content_versions`.
- **FR-003**: O sistema MUST falhar se a versão atual não constar nessa alteração de lista.
- **FR-004**: A falha MUST informar a versão calculada e indicar que uma migration é necessária.
- **FR-005**: O check MUST executar no CI de pull request, push para `main` e merge queue.
- **FR-006**: O check MUST passar com o conteúdo e migrations já existentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Toda execução de CI avalia uma única versão calculada e uma única migration relevante.
- **SC-002**: O check falha para 100% dos fixtures em que a versão atual está ausente.
- **SC-003**: O check passa para 100% dos fixtures em que a versão atual está presente.

## Assumptions

- A última migration que contém `accepted_content_versions` é a fonte versionada da lista aceita.
- Uma migration posterior sem essa lista não modifica sua configuração.
- O CI continua sendo apenas um bloqueio; não gera nem altera migrations automaticamente.
