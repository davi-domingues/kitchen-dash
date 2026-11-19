# Feature Specification: Visual do protótipo na cozinha (KD-19, parte 1)

**Feature Branch**: `feat/kd-19-visual-prototipo`
**Created**: 2026-11-18
**Status**: Draft
**Input**: KD-19 parte 1 (issue #18): deixar a cozinha, os chefs e o HUD visualmente próximos do protótipo original (desenho procedural, sem arquivos de imagem), com a paleta bistrô; corrigir o rótulo "undefined" nos balcões.

## Clarifications

### Session 2026-11-18

Modo autônomo (decidido pelos docs, sem perguntar à pessoa):

- Q: Quando o aviso ⚠️ de queima começa a piscar? → A: Nos últimos 1/3 do tempo até queimar (protótipo: 8 s de 12 s), piscando a ~3 Hz.
- Q: Como a cena sabe a paleta do tema, se o registry só leva uma cor? → A: O visual passa a levar também o id do tema equipado; id desconhecido cai no Bistrô.
- Q: O mascote ratinho entra? → A: Não nesta parte; PRD exige arte própria e o brief proíbe elementos de obras existentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cozinha legível e com cara de bistrô (Priority: P1)

O jogador abre uma partida e vê o piso quadriculado, paredes, balcões com tampo e cada estação com um desenho próprio (caixote de ingrediente, tábua com faca, fogão com boca e panela, pilha de pratos, lixeira, passe dourado com sino e o texto "PASSE"). Nenhum balcão mostra texto quebrado.

**Why this priority**: É a primeira impressão do jogo e o bug "undefined" é visível em toda partida.

**Independent Test**: Iniciar uma partida no modo Clássico 1P e comparar a cozinha com o protótipo; verificar que balcões vazios não exibem texto.

**Acceptance Scenarios**:

1. **Given** uma partida iniciada, **When** a cozinha aparece, **Then** os balcões vazios não exibem nenhum texto e os que têm item mostram só o item.
2. **Given** um fogão cozinhando, **When** o tempo passa, **Then** a boca aparece acesa e uma barra de progresso enche; com a sopa pronta, uma barra de queima esvazia e, perto de queimar, um ⚠️ pisca.
3. **Given** o tema equipado, **When** a partida começa, **Then** piso, paredes e balcões usam a paleta desse tema.

---

### User Story 2 - Chefs e itens reconhecíveis (Priority: P2)

Cada chef aparece com sombra, jaleco, avental e chapéu nas cores dos cosméticos equipados, olhos voltados para a direção em que anda, item segurado à frente e um leve balanço ao andar. No 2P, cada chef tem anel e rótulo (P1/P2) na cor do jogador. Ingrediente inteiro, picado (num pratinho com dois emojis) e prato (elipse branca com borda) são distinguíveis.

**Why this priority**: O jogador precisa saber onde está e o que segura.

**Independent Test**: Partida 2P: mover os chefs, pegar e picar um ingrediente, montar um prato.

**Acceptance Scenarios**:

1. **Given** modo 1P, **When** a partida começa, **Then** não há rótulo nem anel de jogador.
2. **Given** modo 2P, **When** a partida começa, **Then** P1 e P2 têm anéis e rótulos em cores diferentes.
3. **Given** um chef virado para uma estação, **When** ela é o alvo, **Then** um retângulo tracejado arredondado a contorna (branco no 1P, cor do jogador no 2P).

---

### User Story 3 - HUD em fichas de papel (Priority: P3)

As comandas aparecem como fichas de papel com borda superior vinho, emoji da receita e barra de paciência; pontos e tempo aparecem em caixas creme com valores em vinho.

**Independent Test**: Jogar até haver três pedidos e observar as cores da paciência mudarem.

**Acceptance Scenarios**:

1. **Given** um pedido com paciência baixa, **When** ela cai, **Then** a borda e a barra da ficha mudam de verde para dourado e para vermelho.

### Edge Cases

- Tema ou cosmético desconhecido no registry: usa a paleta Bistrô e as cores padrão.
- Estação de tipo desconhecido: nenhum texto, nunca "undefined".
- Fim da cena: nenhum gráfico ou texto sobrevive (sem vazamento ao jogar de novo).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Balcões (e qualquer estação sem ícone) MUST NOT exibir "undefined"; exibem só o item que contêm.
- **FR-002**: A cozinha MUST ser desenhada proceduralmente (sem imagens) com piso quadriculado em duas cores, parede, balcão arredondado com tampo e o desenho específico de cada estação descrito na US1.
- **FR-003**: A paleta da cozinha MUST vir do tema equipado (Bistrô, Mármore, Provence), com Bistrô como padrão.
- **FR-004**: O fogão MUST mostrar boca acesa/apagada, conteúdo da panela, barra de cozimento e barra de queima com aviso piscante.
- **FR-005**: Os chefs MUST ser desenhados conforme a US2, com chapéu e avental dos cosméticos equipados de cada jogador.
- **FR-006**: O alvo de interação MUST ser um retângulo tracejado arredondado (branco 1P, cor do jogador 2P).
- **FR-007**: O HUD MUST usar fichas de papel e a paleta vinho/creme/dourado.
- **FR-008**: Todo texto visível (PASSE, P1/P2, HUD) MUST vir do i18n.
- **FR-009**: As telas React SHOULD usar a paleta bistrô nos tokens do tema.
- **FR-010**: Cálculos de rótulo, cor e layout MUST ser funções puras testadas; a cena só desenha.

### Key Entities

- **Paleta de tema**: cores de piso (2), parede, balcão e tampo por id de tema.
- **Visual do chef**: chapéu, avental, cor do jogador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 ocorrências de "undefined" em qualquer estação durante uma partida.
- **SC-002**: Os 3 temas produzem paletas distintas na cozinha.
- **SC-003**: O carregamento inicial continua dentro do orçamento (≤ 250 KiB gzip de JS inicial).
- **SC-004**: Uma pessoa que conhece o protótipo reconhece todas as 7 estações e os 2 chefs sem explicação.

## Assumptions

- Fontes Playfair Display/Nunito não são carregadas (CSP e regra de dependência); usa-se Georgia/serif e system-ui. Pendência: auto-hospedar exige aprovação.
- O mascote ratinho do protótipo fica de fora desta parte (sem arte própria aprovada); nada de elementos de obras existentes.
- Chef P2 usa os cosméticos do P2 (não as cores fixas azuis do protótipo); a cor de jogador P2 é azul #2f6fb0, P1 vinho #7a1f2b.
- Animações de entrada/tremor das fichas, fumaça e textos flutuantes de pontos ficam para a parte 2.
- Parte 1 de #18: o PR usa `Refs #18`.
