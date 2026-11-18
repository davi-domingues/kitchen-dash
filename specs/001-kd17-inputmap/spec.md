# Feature Specification: InputMap — controles de teclado para 1 e 2 jogadores

**Feature Branch**: `feat/kd-17-inputmap`
**Created**: 2026-11-18
**Status**: Ready for planning
**Input**: Issue #16 (KD-17). Ações abstratas move/interact/pause; P1 setas + Enter, P2 WASD + Espaço, P pausa; em 1 jogador os dois conjuntos controlam o mesmo chef; toque rápido (< 0,22 s) × segurar; teclas remapeáveis salvas em `settings`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dois jogadores no mesmo teclado (Priority: P1)

Duas pessoas jogam juntas: P1 usa as setas e Enter, P2 usa WASD e Espaço. Cada uma move só o seu chef.

**Why this priority**: É o modo cooperativo, central no PRD; sem ele o jogo não é jogável a dois.

**Independent Test**: Pressionar setas e WASD ao mesmo tempo e verificar que cada chef recebe só a sua direção.

**Acceptance Scenarios**:

1. **Given** partida de 2 jogadores, **When** P1 segura → e P2 segura W, **Then** P1 vai para a direita e P2 para cima.
2. **Given** partida de 2 jogadores, **When** P1 aperta e solta Enter rápido, **Then** só P1 executa a ação.

---

### User Story 2 - Toque rápido × segurar (Priority: P1)

O botão de ação tem duas formas: toque rápido (pegar, soltar, servir) e segurar (picar).

**Why this priority**: Toda interação com estações depende dessa distinção.

**Independent Test**: Medir a duração do aperto e verificar se gerou toque ou segurar.

**Acceptance Scenarios**:

1. **Given** um jogador, **When** aperta e solta a ação em menos de 0,22 s, **Then** ocorre um toque.
2. **Given** um jogador, **When** mantém a ação por 0,22 s ou mais, **Then** começa um segurar, que termina ao soltar.
3. **Given** o sistema repete a tecla mantida, **When** chegam novos apertos repetidos, **Then** o segurar não reinicia.

---

### User Story 3 - Um jogador com qualquer conjunto (Priority: P2)

Sozinho, o jogador usa setas ou WASD, Enter ou Espaço, e todos controlam o mesmo chef.

**Independent Test**: Em 1 jogador, pressionar D e ↓ juntos move o chef na diagonal.

**Acceptance Scenarios**:

1. **Given** 1 jogador, **When** usa WASD, **Then** o único chef se move.
2. **Given** 1 jogador, **When** segura Enter e Espaço juntos e solta os dois, **Then** conta como um único toque.

---

### User Story 4 - Pausar (Priority: P2)

**Acceptance Scenarios**:

1. **Given** partida em andamento, **When** alguém aperta P, **Then** a partida recebe um pedido de pausa, uma vez por aperto.

---

### User Story 5 - Remapear teclas (Priority: P3)

O jogador troca a tecla de um controle e a escolha permanece na próxima visita.

**Acceptance Scenarios**:

1. **Given** Enter na ação de P1, **When** remapeia para L, **Then** L passa a agir e a escolha é salva.
2. **Given** a nova tecla já pertence a outro controle, **When** remapeia, **Then** as duas teclas trocam de lugar.
3. **Given** preferências salvas corrompidas, **When** o jogo abre, **Then** volta ao padrão.

### Edge Cases

- Teclas opostas juntas (← e →) se anulam.
- Janela perde o foco com tecla pressionada: tudo é solto sem gerar ação.
- Tecla sem mapeamento é ignorada.
- Armazenamento local bloqueado: o jogo usa o padrão sem quebrar.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema MUST traduzir teclas em ações abstratas por jogador: mover (direção em cada eixo -1, 0 ou 1), interagir e pausar.
- **FR-002**: Padrão MUST ser P1 setas + Enter, P2 WASD + Espaço, P para pausar.
- **FR-003**: Em 1 jogador, os dois conjuntos MUST controlar o mesmo chef.
- **FR-004**: O botão de ação MUST distinguir toque (solto antes de 0,22 s) de segurar (início ao atingir 0,22 s; fim ao soltar).
- **FR-005**: Repetição automática de tecla MUST ser ignorada.
- **FR-006**: Teclas MUST ser remapeáveis sem que uma tecla tenha duas funções (troca em conflito).
- **FR-007**: O mapeamento MUST ser salvo nas preferências locais e validado ao carregar, voltando ao padrão se inválido.
- **FR-008**: Ao perder o foco, o sistema MUST soltar todas as teclas sem emitir ações.
- **FR-009**: A lógica MUST ser testável sem o motor de jogo e sem navegador (tempo recebido como entrada).

### Key Entities

- **Mapeamento de teclas**: para cada jogador, teclas de cima, baixo, esquerda, direita e ação; mais a tecla de pausa.
- **Evento de entrada**: toque, início de segurar, fim de segurar (com jogador) ou pausa.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% dos cenários de aceitação cobertos por testes automatizados.
- **SC-002**: Aperto abaixo de 0,22 s nunca vira segurar; a partir de 0,22 s nunca vira toque.
- **SC-003**: Remapeamento sobrevive a recarregar a página em 100% dos casos com armazenamento disponível.
- **SC-004**: Dois jogadores conseguem mover-se simultaneamente sem interferência.

## Assumptions

Decididas pelos docs (clarify sem perguntar à pessoa):

- **Sem ação `drop` separada**: o PRD define um botão único contextual; soltar é um toque. SYSTEM_DESIGN §3/§8.1 foram alinhados ao PRD neste PR.
- **Teclas do PRD** (Enter/Espaço/P) prevalecem sobre E/Esc citados antes em SYSTEM_DESIGN §8.1.
- **"Ficar parado olhando para a estação"** depende de posição e estação: regra do core (KD-18+), fora deste escopo.
- **Teclas identificadas pela posição física** (independem do layout ABNT2/US).
- **Tela de remapeamento (UI)** fica para a tela de configurações; aqui entram o modelo e a persistência.
- Mobile/joystick virtual fora do MVP (ROADMAP).
