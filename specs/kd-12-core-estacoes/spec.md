# Feature Specification: Estações e ingredientes do core (KD-12)

**Feature Branch**: `feat/kd-12-core-estacoes`
**Created**: 2026-11-18
**Status**: Draft
**Input**: KD-12 · Core: estações e ingredientes (caixas, tábua, fogão com queima, balcão, pratos, lixeira, passe). Issue #11.

## Clarifications

### Session 2026-11-18

Resolvidas pelos docs (PRD "Experiência principal" e "Plataforma e controles"), sem perguntar à pessoa:

- Q: A panela é carregada pelo chef? → A: Não. Cada fogão tem uma panela fixa; o chef põe ingredientes nela e serve com um prato vazio. Reduz estados no MVP.
- Q: Quem decide a estação alvo e o "ficar parado"? → A: A cena (KD-18). O core recebe a ação já com a estação alvo; para "parado", a cena consulta `canInteract` e envia a ação só quando ela daria certo.
- Q: Ingrediente que não serve a nenhuma receita entra no prato ou na panela? → A: Não; a ação é recusada (evita prato impossível).
- Q: Onde a entrega no passe vira pedido/pontos? → A: Fora desta task. O core registra a entrega e emite evento; KD-13/KD-14 a consomem.
- Q: Segurar a ação fora da tábua faz o quê? → A: Vale como um toque rápido (PRD: um único botão; segurar só é contínuo na tábua).
- Q: Dois chefs picando na mesma tábua aceleram o corte? → A: Não; o corte avança uma vez por quadro. Ações do mesmo quadro são aplicadas na ordem recebida.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Preparar ingredientes (Priority: P1)

O chef pega um ingrediente cru na caixa, coloca na tábua e segura a ação até picar.

**Independent Test**: simular toque na caixa, toque na tábua, segurar pelo `chopMs` do ingrediente e pegar o ingrediente picado.

**Acceptance Scenarios**:

1. **Given** chef de mãos vazias, **When** toca uma caixa de tomate, **Then** passa a segurar um tomate cru.
2. **Given** tomate cru na tábua e o chef segurando a ação, **When** passa o `chopMs`, **Then** o tomate fica picado e um evento é emitido.
3. **Given** o chef solta a ação no meio, **When** volta a segurar, **Then** o progresso continua de onde parou.

### User Story 2 - Cozinhar e montar pratos (Priority: P1)

O chef monta pratos frios no balcão e pratos quentes no fogão, que queima se passar do ponto.

**Acceptance Scenarios**:

1. **Given** prato no balcão, **When** o chef coloca alface e tomate picados, **Then** o prato vira uma salada.
2. **Given** panela com 3 tomates picados, **When** passa o `cookMs`, **Then** a sopa fica pronta; **When** passa mais `stoveBurnAfterMs`, **Then** queima.
3. **Given** panela pronta e chef com prato vazio, **When** toca o fogão, **Then** o prato recebe o prato da receita e a panela esvazia.
4. **Given** panela queimada e chef de mãos vazias, **When** toca o fogão, **Then** a panela é limpa.

### User Story 3 - Descartar e entregar (Priority: P1)

**Acceptance Scenarios**:

1. **Given** chef com ingrediente, **When** toca a lixeira, **Then** o ingrediente some; com prato, o prato é esvaziado.
2. **Given** chef com prato pronto, **When** toca o passe, **Then** a entrega é registrada com a receita e o chef fica de mãos vazias.
3. **Given** chef com prato incompleto, **When** toca o passe, **Then** nada acontece.

### Edge Cases

- Ação inválida (estação ocupada, mão cheia, ingrediente incompatível) não muda o estado e emite evento de ação recusada.
- Chef ou estação desconhecidos: erro de programação (exceção).
- Pegar o ingrediente da tábua interrompe o corte.
- Dois chefs na mesma tábua não somam velocidade; ações do mesmo quadro seguem a ordem recebida.
- Segurar a ação em estação que não é tábua equivale a um toque.
- Panela só aceita ingredientes picados que ainda formam alguma receita de panela.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O core MUST montar as estações a partir do mapa de uma cozinha do conteúdo.
- **FR-002**: Caixas MUST entregar o ingrediente cru correspondente ao chef de mãos vazias.
- **FR-003**: A tábua MUST guardar um ingrediente cru e picá-lo enquanto um chef segura a ação, no tempo `chopMs`.
- **FR-004**: O fogão MUST cozinhar a panela cheia no `cookMs` da receita e queimá-la após `stoveBurnAfterMs` de pronta.
- **FR-005**: Balcões MUST guardar um item; prato + ingrediente picado compatível se combinam.
- **FR-006**: A pilha de pratos MUST entregar pratos vazios sem limite.
- **FR-007**: A lixeira MUST descartar ingredientes e esvaziar pratos.
- **FR-008**: O passe MUST aceitar só prato pronto, registrar a entrega e emitir evento.
- **FR-009**: Toda regra MUST ser determinística, pura e coberta por teste; o core MUST expor uma consulta "esta ação daria certo?".

### Key Entities

- **Estação**: id, tipo, posição, conteúdo (item), progresso.
- **Item**: ingrediente (cru/picado), prato (ingredientes, receita pronta).
- **Panela**: ingredientes, estado (vazia, enchendo, cozinhando, pronta, queimada), tempo.
- **Chef**: id (p1/p2), item na mão, estação em que segura a ação.
- **Entrega**: chef e receita, consumida pelos pedidos (KD-13).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: As 4 receitas do conteúdo podem ser preparadas e entregues do início ao fim em teste.
- **SC-002**: 100% das regras de estação têm teste.
- **SC-003**: Mesmas entradas produzem o mesmo estado e eventos em 100% das execuções.

## Assumptions

- Panela fixa no fogão (ver Clarifications); capacidade = maior receita de panela (3).
- Pratos infinitos; o prato entregue não volta sujo (fora do MVP).
- Posição, colisão e alvo são da cena (KD-18).
- Textos ao jogador ficam fora do core (só ids de evento).
