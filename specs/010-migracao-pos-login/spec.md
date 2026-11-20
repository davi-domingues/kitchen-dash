# Feature Specification: Migração de partidas de visitante pós-login

**Feature Branch**: `fix/debito-73-migracao-pos-login`
**Created**: 2026-11-20
**Status**: Draft
**Input**: Débito #73 (origem KD-37): partidas de visitante jogadas depois da migração inicial, no mesmo dispositivo, não sobem para a conta.

## Clarifications

### Session 2026-11-20

Resolvidas pelos docs e pelo código da KD-37, sem perguntar (suposições registradas):

- Q: Quais etapas se repetem numa rodada pós-login? → A: Partidas e cosméticos (o servidor libera itens ao revalidar partidas); configurações não.
- Q: O aviso de conclusão soma rodadas anteriores? → A: Não, conta só a rodada atual (FR-003).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Partidas novas de visitante migram no próximo login (Priority: P1)

A pessoa entra na conta (a migração inicial roda), sai, joga como visitante no mesmo dispositivo e entra de novo. As partidas jogadas como visitante sobem para a conta nesse login, sem perda silenciosa.

**Why this priority**: hoje essas partidas se perdem em silêncio (prioridade alta na issue).

**Independent Test**: migração concluída para o usuário; registrar novas partidas de visitante; rodar a migração de novo; as partidas novas são enviadas com origem `local` e saem do pendente.

**Acceptance Scenarios**:

1. **Given** migração concluída e 2 partidas novas de visitante, **When** a pessoa entra de novo, **Then** as 2 são enviadas uma única vez e o aviso mostra 2 partidas migradas.
2. **Given** migração concluída e nenhuma partida nova, **When** a pessoa entra de novo, **Then** nada é enviado (rodada ignorada).
3. **Given** uma rodada pós-login interrompida no meio, **When** a pessoa entra de novo, **Then** só as partidas restantes são enviadas (idempotente por matchId).

### Edge Cases

- Partidas na outbox de uma conta (KD-35) não são de visitante e não entram.
- A etapa de configurações não se repete: ela concilia preferências, não partidas.
- Os cosméticos da conta são relidos após o envio, pois o servidor pode liberar itens novos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A migração DEVE ser considerada pendente sempre que houver partida de visitante no dispositivo, mesmo que uma rodada anterior tenha terminado.
- **FR-002**: Cada partida DEVE ser enviada no máximo uma vez por resposta definitiva (identidade por matchId) e removida do local logo depois.
- **FR-003**: O aviso de conclusão DEVE contar só as partidas da rodada atual.
- **FR-004**: Sem partidas novas, a rodada DEVE ser ignorada, sem chamadas remotas.

### Key Entities

- **Marcador de migração** (`kd:v1:migration`, por usuário): etapas concluídas e contadores da rodada.
- **Partida de visitante**: item de `progress.pending` fora da outbox.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das partidas de visitante jogadas após a migração inicial chegam à conta no login seguinte com rede.
- **SC-002**: 0 envios duplicados de uma mesma partida em rodadas repetidas ou interrompidas.

## Assumptions

- "Próximo login" inclui a restauração de sessão ao recarregar a página (o gatilho atual da KD-37).
- Partidas de visitante pertencem a quem entrar primeiro no dispositivo, como já é na KD-37.
