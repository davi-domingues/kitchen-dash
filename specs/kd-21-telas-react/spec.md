# Feature Specification: Telas de partida (home, escolha de modo, pausa e resultado)

**Feature Branch**: `feat/kd-21-telas-react`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "KD-21 (issue #20): Telas React do Kitchen Dash — home com apresentação, escolha de 1/2 jogadores e modo (classic/free/challenge), overlay de pausa via match:paused/match:resumed, tela de resultado a partir de match:ended, rotas home, jogar, ranking, perfil, privacidade e 404. Loading/vazio/erro, teclado, i18n."

## Clarifications

### Session 2026-11-18

Resolvidas com os docs, sem perguntar à pessoa (BRIEF):

- Q: Quem gera o id único da partida? → A: O jogo, no início da partida (SYSTEM_DESIGN §7.1: o mesmo id vale nos reenvios do outbox).
- Q: O resultado precisa do nº de jogadores e dos pedidos? → A: Sim: nº de jogadores (PRD: melhor tempo do Desafio separado por 1/2 jogadores), pedidos entregues (`player_stats.orders_completed`, SYSTEM_DESIGN §5) e pedidos perdidos (resumo do turno).
- Q: O que acontece se o fim chegar com o jogo pausado? → A: Mostra o resultado normalmente (o turno acabou).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Iniciar uma partida a partir da home (Priority: P1)

O jogador abre o jogo, entende do que se trata e escolhe quantos jogadores (1 ou 2) e qual modo (Clássico, Livre ou Desafio) quer jogar antes de começar.

**Why this priority**: Sem isso não há como jogar; é a porta de entrada do produto.

**Independent Test**: Abrir a home, ir para "Jogar", escolher 2 jogadores e Desafio e começar; a partida abre com essa configuração.

**Acceptance Scenarios**:

1. **Given** a home aberta, **When** o jogador ativa "Jogar", **Then** vê a escolha de partida com 1 jogador e Clássico pré-selecionados.
2. **Given** a escolha de partida, **When** o jogador escolhe 2 jogadores e Desafio e confirma, **Then** a partida começa com essa configuração.
3. **Given** só o teclado, **When** o jogador navega da home até o início da partida, **Then** consegue concluir sem mouse, com foco sempre visível.

---

### User Story 2 - Ver o resultado e jogar de novo (Priority: P1)

Ao fim do turno, o jogador vê pontos, pedidos entregues e perdidos e a duração, e pode jogar de novo com a mesma configuração, trocar o modo ou voltar ao início.

**Why this priority**: Fecha o ciclo de jogo pedido no critério de pronto (home → partida → resultado → jogar de novo).

**Independent Test**: Simular o fim de partida com um resultado válido e conferir a tela e os três caminhos de saída.

**Acceptance Scenarios**:

1. **Given** uma partida em andamento, **When** ela termina com um resultado válido, **Then** a tela mostra pontos, entregues, perdidos e duração (m:ss).
2. **Given** a tela de resultado, **When** o jogador ativa "Jogar de novo", **Then** uma nova partida começa com o mesmo modo e o mesmo nº de jogadores.
3. **Given** a tela de resultado, **When** o jogador ativa "Trocar modo", **Then** volta à escolha de partida com a última configuração marcada.
4. **Given** nenhum pedido entregue, **When** o resultado aparece, **Then** há uma mensagem de incentivo (estado vazio).

---

### User Story 3 - Pausar e retomar (Priority: P2)

Quando o jogo pausa, o jogador vê um menu de pausa e pode continuar ou sair da partida.

**Why this priority**: Essencial para conforto, mas o ciclo principal funciona sem ele.

**Independent Test**: Disparar a pausa durante a partida e verificar o menu, o foco e o retorno.

**Acceptance Scenarios**:

1. **Given** uma partida em andamento, **When** o jogo pausa, **Then** abre um menu com foco em "Continuar".
2. **Given** o menu de pausa, **When** o jogador ativa "Continuar" ou aperta Esc, **Then** o menu fecha e o jogo é avisado para retomar.
3. **Given** o menu de pausa, **When** o jogador ativa "Sair da partida", **Then** volta à escolha de partida.

---

### User Story 4 - Navegar entre as páginas do app (Priority: P3)

O jogador acessa Ranking, Perfil e Privacidade pela home; endereços inexistentes mostram uma página de "não encontrada".

**Why this priority**: Prepara as rotas usadas por tasks futuras; hoje são cascas.

**Independent Test**: Visitar cada endereço e um endereço inválido.

**Acceptance Scenarios**:

1. **Given** a home, **When** o jogador ativa Ranking, Perfil ou Privacidade, **Then** vê a página correspondente com aviso de "em breve" e caminho de volta.
2. **Given** um endereço inexistente, **When** ele é aberto, **Then** aparece "Página não encontrada" com caminho para o início.

### Edge Cases

- O fim de partida chega com dados incompletos ou inválidos: mostrar mensagem de erro e caminho para a escolha de partida, sem exibir números.
- O fim de partida chega enquanto o jogo está pausado: mostrar o resultado normalmente.
- Avisos de pausa ou de fim chegam fora de uma partida: ignorar.
- A página do jogo ainda está carregando: mostrar indicador de carregamento acessível.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O app MUST oferecer as páginas Início, Jogar, Ranking, Perfil, Privacidade e uma página de "não encontrada".
- **FR-002**: A escolha de partida MUST oferecer 1 ou 2 jogadores e os modos Clássico, Livre e Desafio, com padrão 1 jogador + Clássico.
- **FR-003**: A configuração escolhida MUST chegar ao jogo antes de a partida começar.
- **FR-004**: O app MUST abrir o menu de pausa quando o jogo avisar que pausou e MUST avisar o jogo quando o jogador retomar.
- **FR-005**: O app MUST validar o resultado recebido do jogo e mostrar erro se ele for inválido.
- **FR-006**: "Jogar de novo" MUST iniciar uma partida nova com a mesma configuração.
- **FR-007**: Todo texto visível MUST vir do dicionário de idioma (pt-BR).
- **FR-008**: Todos os menus MUST ser operáveis só pelo teclado, com foco visível e foco inicial nos diálogos.
- **FR-009**: Toda tela MUST tratar carregamento, vazio e erro quando aplicável.

### Key Entities

- **Configuração da partida**: modo (classic, free, challenge) e nº de jogadores (1 ou 2).
- **Resultado da partida**: id único da partida (para envio sem duplicar), modo, nº de jogadores, semente, versão do conteúdo, pontos, pedidos entregues, pedidos perdidos e duração. É o contrato com o envio de pontuação (KD-31/KD-35).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Um jogador sai da home e começa uma partida em até 3 interações.
- **SC-002**: 100% dos menus podem ser concluídos sem mouse.
- **SC-003**: 100% dos resultados inválidos geram a mensagem de erro, sem números incorretos na tela.
- **SC-004**: "Jogar de novo" inicia a nova partida em 1 interação, mantendo a configuração.
- **SC-005**: Nenhum texto visível fica fora do dicionário de idioma.

## Assumptions

- A cena ainda não emite o fim de partida (KD-18 e seguintes); o fluxo é validado por testes da lógica e simulação manual dos avisos.
- O MVP é desktop; 2 jogadores no celular está fora de escopo.
- Ranking, Perfil e Privacidade são cascas até KD-36, KD-41 e KD-43.
- O id da partida é gerado pelo jogo no início, para valer em reenvios (SYSTEM_DESIGN §7.1).
- Testes de componente exigem um ambiente de DOM não aprovado; a lógica das telas fica em módulos puros testados.
