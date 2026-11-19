# Feature Specification: HUD e jogo jogável (KD-20)

**Feature Branch**: `feat/kd-20-hud`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #19 — KD-20 · HUD: comandas com paciência (ícone + barra), placar, cronômetro e pausa. Também integra modos (KD-15), cena da cozinha (KD-18) e telas React (KD-21) num jogo jogável.

## Clarifications

### Session 2026-11-18

- Q: Onde fica o "Encerrar" do Livre? → A: No menu de pausa (teclado) e como botão clicável no HUD (resolvido pelo PRD + SYSTEM_DESIGN §8.2).
- Q: Quais limites das cores da paciência? → A: verde > 50%, amarela > 25%, vermelha ≤ 25% (suposição; PRD só cita as cores).
- Q: O relógio do Clássico é regressivo? → A: Sim, tempo restante; Livre e Desafio crescentes (PRD "Modos de jogo").

## User Scenarios & Testing

### User Story 1 - Jogar uma partida completa no modo escolhido (Priority: P1)

O jogador escolhe modo (Clássico, Livre, Desafio) e 1 ou 2 jogadores, joga na cozinha, recebe pedidos, entrega pratos e vê o resumo no fim.

**Why this priority**: sem isso não existe jogo jogável (caminho crítico do MVP).

**Independent Test**: escolher cada modo, entregar uma Salada e terminar a partida; o resumo mostra pontos e pedidos.

**Acceptance Scenarios**:

1. **Given** o Clássico iniciado, **When** passam 3 minutos, **Then** a partida termina e o resumo aparece com pontos, pedidos concluídos e perdidos.
2. **Given** o Desafio iniciado, **When** o 12º pedido é entregue, **Then** a partida termina e o tempo total aparece.
3. **Given** o Livre iniciado, **When** o jogador aciona "Encerrar", **Then** a partida termina e o resumo aparece.
4. **Given** qualquer fim de partida, **Then** o resultado carrega um identificador único da partida, o modo, os jogadores, a seed, a versão do conteúdo, a pontuação, os pedidos e a duração.

### User Story 2 - Ler o estado da partida pelo HUD (Priority: P1)

Durante a partida o jogador vê as comandas (ícone da receita, número e barra de paciência verde/amarela/vermelha), o placar e o relógio (regressivo no Clássico, crescente nos outros), e a fila de pedidos em espera.

**Independent Test**: no Clássico, a barra de uma comanda muda de verde para amarelo e vermelho com o tempo; o relógio desce de 3:00.

**Acceptance Scenarios**:

1. **Given** uma comanda com mais de 50% de paciência, **Then** a barra é verde; entre 25% e 50% amarela; abaixo de 25% vermelha.
2. **Given** Livre ou Desafio (sem paciência), **Then** a comanda mostra o ícone e o número sem barra.
3. **Given** o Clássico, **Then** o relógio mostra o tempo restante em m:ss; nos outros modos, o tempo decorrido.
4. **Given** pedidos na fila, **Then** o HUD mostra quantos estão esperando.

### User Story 3 - Pausar e retomar (Priority: P2)

O jogador aperta a tecla de pausa; o jogo congela e o menu de pausa abre; ao retomar, o jogo continua do mesmo ponto.

**Acceptance Scenarios**:

1. **Given** a partida em andamento, **When** a tecla de pausa é pressionada, **Then** o tempo, a paciência e o movimento param e o menu de pausa abre.
2. **Given** o menu de pausa, **When** o jogador retoma, **Then** a partida continua sem perder tempo nem pedidos.
3. **Given** a pausa no Livre, **Then** o menu oferece "Encerrar", que fecha o turno com o resumo.

### Edge Cases

- Teclas soltas no momento da pausa não ficam "presas" ao retomar.
- O fim da partida é anunciado uma única vez, mesmo com quadros extras.
- Sair da tela no meio da partida não deixa ouvintes nem temporizadores vivos.

## Requirements

### Functional Requirements

- **FR-001**: A partida MUST usar o modo, o nº de jogadores e as teclas escolhidas no menu.
- **FR-002**: O HUD MUST mostrar até o máximo de comandas visíveis do modo, cada uma com ícone, número e (se houver paciência) barra colorida em 3 faixas.
- **FR-003**: O HUD MUST mostrar a pontuação atual e o relógio (regressivo com duração, crescente sem duração) em m:ss.
- **FR-004**: O HUD MUST mostrar o tamanho da fila de espera quando maior que zero.
- **FR-005**: A tecla de pausa MUST congelar a partida e abrir o menu; retomar MUST continuar do mesmo estado.
- **FR-006**: O Livre MUST ter "Encerrar" que fecha o turno.
- **FR-007**: No fim, o jogo MUST anunciar uma vez o resultado completo, com identificador único da partida.
- **FR-008**: Todo texto do HUD MUST vir das traduções.
- **FR-009**: A formatação e a derivação do HUD MUST ser regras puras, testadas.

### Key Entities

- **Comanda no HUD**: número, receita (ícone), fração de paciência restante (ou nenhuma), faixa de cor.
- **Resultado da partida**: identificador, modo, jogadores, seed, versão do conteúdo, pontos, concluídos, perdidos, duração.

## Success Criteria

- **SC-001**: Os 3 modos, com 1 e 2 jogadores, podem ser jogados do menu até o resumo sem erro (verificação manual).
- **SC-002**: 100% das regras de formatação do HUD (relógio, faixas de paciência, comandas) cobertas por teste.
- **SC-003**: Pausar e retomar 5 vezes não altera o tempo de jogo além do tempo efetivamente jogado.

## Assumptions

- Arte placeholder (texto e retângulos) até a KD-19.
- Faixas de paciência: verde > 50%, amarela > 25%, vermelha ≤ 25% (PRD só cita as 3 cores).
- "Encerrar" do Livre fica no menu de pausa (acessível por teclado) e também como botão clicável no HUD.
- "Sair" do menu de pausa em outros modos volta ao menu sem registrar resultado (contrato da KD-21).
- O HUD fica sobre a cozinha, numa faixa superior; a cozinha é reduzida para caber.
