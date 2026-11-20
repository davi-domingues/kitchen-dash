# Feature Specification: Teste concorrente do envio de pontuação

**Feature Branch**: `test/debito-76-submit-score-concorrente`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Débito #76: teste concorrente opcional de submit_score; N envios simultâneos do mesmo match_id contra o Supabase local gravam uma só linha; comando npm run db:test:concurrency fora do npm test."

## Clarifications

### Session 2026-11-20

- Q: Quantos envios simultâneos o teste dispara, dado o limite de 10 envios/min? → A: 8; o reenvio idempotente é checado antes do limite (migration do submit_score), mas 8 mantém margem mesmo sem isso.
- Q: O teste roda no CI? → A: Não; o CI não sobe Supabase e os testes padrão não usam banco real (AGENTS.md §5). Execução manual documentada.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provar a idempotência sob envios simultâneos (Priority: P1)

Quem mexe no envio de pontuação roda um comando e confirma que vários envios simultâneos da mesma partida contam como uma só partida.

**Why this priority**: A outbox pode reenviar enquanto o primeiro envio ainda está em curso; duplicar a partida inflaria ranking e estatísticas.

**Independent Test**: Com o banco local no ar, o comando termina com sucesso e informa uma única partida gravada.

**Acceptance Scenarios**:

1. **Given** o banco local com as migrations, **When** 8 envios simultâneos da mesma partida acontecem, **Then** todos respondem sem erro, existe 1 registro da partida e as estatísticas contam 1 partida.
2. **Given** um endereço que não é o banco local, **When** o comando roda, **Then** ele recusa antes de enviar qualquer coisa.

### Edge Cases

- Banco local desligado: o comando falha com mensagem clara, sem efeito colateral.
- A suíte padrão de testes não depende do banco local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O comando MUST criar um jogador fictício `@example.com` a cada execução.
- **FR-002**: O comando MUST disparar ao menos 2 envios simultâneos com o mesmo identificador de partida (padrão: 8, abaixo do limite de 10 envios/min).
- **FR-003**: O comando MUST falhar se houver mais de um registro da partida ou se as estatísticas contarem mais de uma partida.
- **FR-004**: O comando MUST recusar qualquer alvo que não seja o banco local.
- **FR-005**: O teste MUST ficar fora da suíte padrão e ser executado por um comando próprio documentado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das execuções contra o banco local, envios simultâneos resultam em exatamente 1 partida gravada.
- **SC-002**: 0 execuções atingem um ambiente que não seja o local.
- **SC-003**: A suíte padrão continua rodando sem banco.

## Assumptions

- pgTAP roda numa única transação e não reproduz concorrência real; `dblink` não está habilitado no projeto.
- O cadastro por e-mail e senha está habilitado no banco local, sem confirmação de e-mail nem captcha.
