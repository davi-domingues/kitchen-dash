# Feature Specification: Erro no jogo volta ao menu e é reportado

**Feature Branch**: `fix/debito-90-erro-phaser`
**Created**: 2026-11-20
**Status**: Draft
**Input**: Débito #90 — erro em cena do jogo é reportado ao monitoramento e o jogador volta ao menu com aviso acessível.

## Clarifications

### Session 2026-11-20

- Q: Para onde o jogador volta após a falha? → A: Configuração da partida na página de jogo (suposição pelos docs, sem pergunta à pessoa).
- Q: O relato inclui dados do jogador? → A: Não; só erro e nome da cena (AGENTS.md §6, `sendDefaultPii: false`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogo quebra e o jogador volta ao menu (Priority: P1)

Durante uma partida, uma falha inesperada acontece dentro do jogo. Em vez de a tela congelar, o jogador volta à tela de configuração da partida e lê um aviso dizendo que a partida foi interrompida por um erro.

**Independent Test**: simular uma falha na cena e verificar que a tela volta ao menu com o aviso.

**Acceptance Scenarios**:

1. **Given** uma partida em andamento, **When** a cena falha, **Then** o jogador vê a configuração da partida e um aviso anunciado por leitores de tela.
2. **Given** o aviso visível, **When** o jogador inicia outra partida, **Then** o aviso some.

### User Story 2 - Equipe recebe o erro (Priority: P1)

A falha é enviada ao monitoramento com o nome da cena, sem dados pessoais.

**Acceptance Scenarios**:

1. **Given** uma falha na cena, **When** ela acontece, **Then** um único relato é enviado com o erro e a cena.

### Edge Cases

- Falha repetida a cada quadro: só um relato e uma volta ao menu.
- Falha antes de a cena terminar de montar: mesmo comportamento.
- Monitoramento desligado (sem DSN): o jogador ainda volta ao menu.

## Requirements *(mandatory)*

- **FR-001**: Falhas nas etapas de preparo, montagem e atualização das cenas DEVEM ser capturadas.
- **FR-002**: A falha DEVE ser comunicada ao app pela ponte de eventos do jogo; o jogo não fala com serviços.
- **FR-003**: O app DEVE reportar a falha ao monitoramento uma vez por partida, com o nome da cena.
- **FR-004**: O app DEVE voltar à configuração da partida e mostrar aviso acessível (anunciado, texto traduzível).
- **FR-005**: Após a falha a cena DEVE parar de processar; os listeners são removidos no encerramento da cena.

## Success Criteria *(mandatory)*

- **SC-001**: 100% das falhas simuladas em teste levam ao menu com aviso.
- **SC-002**: Exatamente 1 relato por falha, verificado com monitoramento simulado.
- **SC-003**: Nenhum dado pessoal no relato (sanitização existente do monitoramento).

## Assumptions

- "Menu" é a tela de configuração da partida na página de jogo (fase `setup`).
- Falhas em handlers de teclado ficam fora do escopo (já protegidos pelo encerramento do jogo no React).
- A sanitização de PII de `services/monitoring.js` (KD-40) é reaproveitada.
