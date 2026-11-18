# Feature Specification: Cena Kitchen (KD-18)

**Feature Branch**: `feat/kd-18-cena-kitchen`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #17 — mapa, colisões, chefs P1/P2, estação alvo destacada e checagem de alcançabilidade.

## Clarifications

### Session 2026-11-18

Resolvidas pelo agente com base nos docs (sem perguntar à pessoa, conforme o briefing).

- Q: O destaque muda quando a ação não daria certo? → A: Sim: destaque forte se `canInteract`, fraco caso contrário (PRD: feedback claro de estação alvo).
- Q: "Ficar parado" de frente para uma estação dispara a ação sozinho? → A: Não no KD-18; a ação vem só da tecla. O auto-uso fica para issue futura se o PRD exigir.
- Q: Chefs se bloqueiam? → A: Sim, ocupam um tile cada (FR-002).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Andar pela cozinha (Priority: P1)

O jogador vê a cozinha (paredes, piso, estações) e move seu chef com as teclas; o chef não atravessa paredes, estações nem o outro chef.

**Why this priority**: sem movimento não há jogo.

**Independent Test**: abrir a cena, mover P1 contra uma parede e ver que ele para.

**Acceptance Scenarios**:

1. **Given** o chef ao lado de uma parede, **When** o jogador anda contra ela, **Then** o chef fica no mesmo tile.
2. **Given** dois jogadores, **When** a partida começa, **Then** cada chef aparece no seu spawn.
3. **Given** um jogador, **When** a partida começa, **Then** só o chef P1 aparece.

### User Story 2 - Interagir com a estação alvo (Priority: P1)

O chef olha para a direção do último movimento; a estação adjacente nessa direção fica destacada e recebe o toque ou o segurar da tecla de ação.

**Independent Test**: parar o chef de frente para uma caixa, ver o destaque, tocar a ação e ver o ingrediente na mão.

**Acceptance Scenarios**:

1. **Given** o chef de frente para uma estação, **When** nada acontece, **Then** ela é destacada.
2. **Given** o chef de frente para o piso, **When** toca a ação, **Then** nada é enviado ao core.
3. **Given** o chef de frente para a tábua com ingrediente cru, **When** segura a ação, **Then** o ingrediente é picado.

### User Story 3 - Cozinha jogável garantida (Priority: P2)

Toda estação de uma cozinha pode ser alcançada a partir dos spawns; uma cozinha inválida falha nos testes antes de chegar ao jogador.

**Independent Test**: teste sobre KITCHENS e sobre um mapa com estação isolada.

### Edge Cases

- Diagonais: movimento em grade, um eixo por passo (horizontal tem prioridade).
- Dois chefs tentando o mesmo tile: o segundo a mover fica parado.
- Tecla segurada: o chef continua andando a cada intervalo de passo.
- Perda de foco da janela: todas as teclas são soltas (`releaseAll`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A cena DEVE desenhar a cozinha a partir do conteúdo (tiles, legenda) sem layout hardcoded.
- **FR-002**: O movimento DEVE ser em grade; paredes, estações e o outro chef bloqueiam.
- **FR-003**: Cada chef DEVE guardar a direção do olhar; a estação alvo é o tile adjacente nessa direção, se for estação.
- **FR-004**: A estação alvo DEVE ser destacada visualmente para cada chef, forte se a ação daria certo e fraco se não.
- **FR-005**: Os eventos de ação do InputMap DEVEM virar entradas do sistema de estações com a estação alvo resolvida; `holdEnd` vai sem estação.
- **FR-006**: DEVE existir uma checagem pura de alcançabilidade (toda estação adjacente a um piso alcançável a partir dos spawns), testada sobre todas as cozinhas do conteúdo.
- **FR-007**: As regras (movimento, colisão, alvo, alcançabilidade) DEVEM ser funções puras do core com testes.
- **FR-008**: A cena DEVE remover listeners, timers e tweens no shutdown e não falar com o backend.
- **FR-009**: Textos visíveis via i18n; item na mão e estado de panela mostrados com placeholders.

### Key Entities

- **Chef posicionado**: id, x, y, facing, holding, workingAt.
- **Grade**: tiles com tipo (parede, piso, estação).

## Success Criteria *(mandatory)*

- **SC-001**: 100% das regras de movimento/alvo/alcançabilidade cobertas por teste.
- **SC-002**: Todas as cozinhas do conteúdo passam na checagem de alcançabilidade.
- **SC-003**: Um jogador consegue pegar, picar, cozinhar e servir uma receita usando só as teclas.

## Assumptions

- Spawns são `[x, y]` no tile (KD-10). P1 = spawn 0, P2 = spawn 1.
- Passo de movimento: 1 tile a cada 150 ms com tecla segurada (ajustável depois; sem física).
- O chef inicia olhando para baixo.
- `playerCount`, `seed` e modo chegam pelos dados da cena (padrão 1 jogador, seed fixa) até o KD-21/KD-15 ligarem a escolha.
- Pedidos, pontuação, HUD e `match:ended` ficam para KD-15/KD-20; a partida roda sem duração (`durationMs: null`).
