# Feature Specification: Reportar partidas descartadas do envio

**Feature Branch**: `feat/debito-71-sentry-descartadas`
**Created**: 2026-11-20
**Status**: Draft
**Input**: Débito #71 — partidas descartadas pela fila de envio (rejeitadas ou expiradas) não são reportadas.

## Clarifications

### Session 2026-11-20

- Q: Quais dados vão no relato? → A: Motivo, modo, tentativas, id aleatório da partida e versão do conteúdo; nunca usuário ou e-mail (AGENTS.md §6). Resolvido pelos docs, sem pergunta.
- Q: Qual severidade? → A: Aviso (não é erro do app; a partida foi recusada ou esgotou tentativas).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Equipe sabe quando partidas são perdidas (Priority: P1)

Quando uma partida autenticada sai da fila de envio sem ser aceita, a equipe recebe um relato no monitoramento com o motivo, para investigar rejeições e quedas.

**Independent Test**: simular rejeição e esgotamento de tentativas com monitoramento simulado e verificar um relato por partida.

**Acceptance Scenarios**:

1. **Given** uma partida na fila, **When** o servidor a recusa de forma permanente, **Then** um relato com motivo "rejected" é enviado.
2. **Given** uma partida na fila, **When** as tentativas se esgotam, **Then** um relato com motivo "expired" é enviado uma única vez.
3. **Given** uma falha transitória com tentativas restantes, **Then** nenhum relato é enviado.

### Edge Cases

- Monitoramento desligado: o descarte segue normal, sem relato.
- Sessão expirada interrompe o envio sem descartar: sem relato.

## Requirements *(mandatory)*

- **FR-001**: Todo descarte da fila DEVE gerar exatamente um relato com o motivo (rejeitada ou expirada).
- **FR-002**: O relato NÃO DEVE conter identificador do usuário, e-mail ou outro dado pessoal.
- **FR-003**: Falhas transitórias com tentativas restantes NÃO DEVEM gerar relato.

## Success Criteria *(mandatory)*

- **SC-001**: 100% dos descartes simulados geram um relato; 0 relatos em falhas transitórias.
- **SC-002**: 0 dados pessoais no relato, verificado em teste.

## Assumptions

- O id da partida é um UUID aleatório gerado pela cena e não identifica o jogador.
- A sanitização de PII do monitoramento (KD-40) segue ativa como segunda barreira.
