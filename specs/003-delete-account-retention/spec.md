# Feature Specification: Exclusão de conta e retenção

**Feature Branch**: `feat/kd-32-exclusao-conta-retencao`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "KD-32: excluir por completo os dados de uma conta e reter o histórico de pontuações por 90 dias."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Excluir a própria conta (Priority: P1)

Um jogador autenticado pode solicitar a exclusão da própria conta para que os seus dados pessoais e de jogo deixem de existir.

**Why this priority**: Atende à exigência de exclusão de dados do MVP e à privacidade do jogador.

**Independent Test**: Uma conta fictícia com perfil, preferências, pontuações, recordes, estatísticas e cosméticos é excluída; nenhuma dessas informações, nem a conta de autenticação, permanece acessível.

**Acceptance Scenarios**:

1. **Given** uma sessão autenticada e uma conta com dados de jogo, **When** o jogador solicita a exclusão, **Then** a conta e todos os seus dados associados são removidos.
2. **Given** uma chamada sem jogador autenticado, **When** a exclusão é solicitada, **Then** ela é recusada e nenhum dado é alterado.
3. **Given** uma conta de outro jogador, **When** um jogador solicita a exclusão, **Then** apenas a própria conta pode ser removida.

---

### User Story 2 - Manter apenas histórico recente (Priority: P2)

O produto elimina automaticamente pontuações históricas que ultrapassaram 90 dias, preservando recordes e estatísticas enquanto a conta existir.

**Why this priority**: Mantém o consumo do banco compatível com a projeção de custo do MVP sem perder o progresso duradouro do jogador.

**Independent Test**: Ao executar a limpeza com dados fictícios de idades diferentes, apenas as pontuações com mais de 90 dias são removidas; as recentes, os recordes e as estatísticas permanecem.

**Acceptance Scenarios**:

1. **Given** pontuações com 90 dias ou menos, **When** a limpeza é executada, **Then** elas permanecem disponíveis.
2. **Given** pontuações com mais de 90 dias, **When** a limpeza é executada, **Then** elas são removidas.
3. **Given** recordes e estatísticas ligados a uma conta ativa, **When** a limpeza remove pontuações antigas, **Then** recordes e estatísticas permanecem.

### Edge Cases

- A solicitação de exclusão sem sessão autenticada não altera dados.
- A exclusão de uma conta sem pontuações ou cosméticos ainda remove a conta e seus registros associados.
- A limpeza não remove pontuações exatamente no limite de 90 dias.
- A limpeza de pontuações não remove recordes ou estatísticas de contas ativas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um jogador autenticado exclua somente a própria conta.
- **FR-002**: O sistema MUST recusar solicitação de exclusão sem jogador autenticado, sem alterar dados.
- **FR-003**: Ao excluir uma conta, o sistema MUST remover a identidade de autenticação e todos os dados de jogo associados ao jogador.
- **FR-004**: O sistema MUST remover automaticamente as pontuações históricas com mais de 90 dias uma vez por dia, às 03:00 UTC.
- **FR-005**: A limpeza de pontuações MUST preservar recordes e estatísticas de jogadores com conta ativa.
- **FR-006**: O sistema MUST manter a agenda de limpeza versionada e documentada junto da alteração.

### Key Entities *(include if feature involves data)*

- **Conta do jogador**: Identidade de acesso vinculada a um perfil e a dados de jogo.
- **Perfil e progresso**: Nome de exibição, preferências, recordes, estatísticas e cosméticos que pertencem a uma conta.
- **Pontuação histórica**: Registro individual de uma partida, mantido por até 90 dias.
- **Agenda de retenção**: Regra recorrente que executa a limpeza diária das pontuações expiradas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma solicitação autenticada remove 100% dos dados associados à conta fictícia usada na verificação.
- **SC-002**: Uma solicitação sem autenticação deixa 100% dos dados de teste inalterados.
- **SC-003**: A limpeza remove 100% das pontuações de teste com mais de 90 dias e preserva 100% das demais.
- **SC-004**: A agenda de limpeza fica registrada como execução diária às 03:00 UTC.

## Assumptions

- A conta de autenticação existente é a fonte de identidade do jogador e sua exclusão remove os registros de jogo dependentes.
- A retenção de 90 dias se aplica somente ao histórico de partidas; recordes e estatísticas permanecem até a exclusão da conta.
- O horário aprovado para a limpeza diária é 03:00 UTC.
