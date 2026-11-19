# Feature Specification: Auto-uso de estações ao ficar parado (KD-18 / issue #89)

**Feature Branch**: `feat/kd-18-auto-uso-estacoes`

**Created**: 2026-11-19

**Status**: Draft

**Input**: Issue #89 — lacuna da revisão da KD-12 (#11), originada da KD-18 (#17). PRD, "Plataforma e controles (protótipo)", item 3: ficar parado olhando para a estação deve usá-la sozinha, sem precisar apertar o botão.

## Clarifications

### Session 2026-11-19

Decisões tomadas pela pessoa responsável nesta sessão:

- Q: Quanto tempo o chef precisa ficar parado antes de agir sozinho? → A: **250 ms** (acima dos ~220 ms do toque rápido).
- Q: Auto-uso deve avisar quando a ação é recusada? → A: **Não**. Só o botão do jogador emite aviso de recusa; auto-uso é silencioso.
- Q: Como evitar ação dupla com o botão? → A: **O botão prevalece**. Ao apertar a ação, qualquer auto-uso pendente é descartado; se o auto-uso já tiver disparado, um toque manual na mesma estação é ignorado até o chef sair ou o estado da estação mudar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Picar sem apertar o botão (Priority: P1)

O jogador para o chef de frente para uma tábua com ingrediente cru. Depois de um breve instante parado, o chef começa a picar sozinho e continua enquanto houver ingrediente cru e ele permanecer parado olhando para a tábua.

**Why this priority**: é o caso mais visível da mecânica e o que mais reduz esforço repetitivo do jogador; sem ele a promessa do PRD não é cumprida.

**Independent Test**: parar P1 de frente para uma tábua com tomate cru e observar que o corte avança sem nenhuma tecla de ação, e para no momento em que o chef se move.

**Acceptance Scenarios**:

1. **Given** um chef parado de frente para a tábua com ingrediente cru, **When** se passam 250 ms sem movimento nem ação manual, **Then** o corte começa automaticamente usando o mesmo sinal de "segurar" do botão.
2. **Given** o corte automático em andamento, **When** o chef continua parado e ainda há ingrediente cru, **Then** o corte continua até o ingrediente ficar pronto.
3. **Given** o corte automático em andamento, **When** o jogador move o chef ou o ingrediente deixa de estar cru, **Then** o corte para imediatamente.
4. **Given** um chef que acabou de mudar de direção ou de posição, **When** menos de 250 ms se passaram, **Then** nenhuma ação automática acontece.

---

### User Story 2 - Usar fogão e passe só quando dá certo (Priority: P1)

Ao ficar parado de frente para o fogão ou o passe, o chef realiza a ação sozinha apenas se ela daria certo. Se não daria, nada acontece e nenhum aviso é emitido, mesmo depois de muito tempo parado.

**Why this priority**: evita a pior experiência da mecânica — avisos repetidos e ações inválidas em loop enquanto o jogador apenas olha para a estação.

**Independent Test**: parar diante de um fogão vazio por vários segundos e confirmar que nenhuma ação ou aviso ocorre; repetir com uma panela pronta e confirmar uma única ação.

**Acceptance Scenarios**:

1. **Given** um chef parado de frente ao passe com um prato que atende a um pedido, **When** se passam 250 ms, **Then** o prato é entregue uma única vez com o mesmo sinal de "toque" do botão.
2. **Given** um chef parado de frente ao fogão ou ao passe com uma ação inválida, **When** o tempo parado ultrapassa 250 ms e continua passando, **Then** nenhuma ação e nenhum aviso de recusa são gerados.
3. **Given** uma ação automática já realizada no fogão ou no passe, **When** a estação e o chef não mudam de estado, **Then** a ação não se repete.
4. **Given** uma estação inválida que se torna válida enquanto o chef segue parado, **When** a ação passa a dar certo, **Then** uma única ação automática acontece.

---

### User Story 3 - Botão do jogador continua no controle (Priority: P1)

O jogador pode apertar o botão de ação a qualquer momento. O botão nunca disputa com o auto-uso: ele prevalece, e o mesmo gesto não produz duas ações na mesma estação.

**Why this priority**: a mecânica nova não pode quebrar o esquema de controle existente nem causar entregas ou cortes duplicados.

**Independent Test**: ficar parado diante de uma tábua e apertar a ação no mesmo instante em que o auto-uso dispararia; conferir que houve uma única ação e que o botão foi a origem dela.

**Acceptance Scenarios**:

1. **Given** um auto-uso ainda pendente, **When** o jogador aperta o botão de ação, **Then** o auto-uso pendente é cancelado e apenas a ação do botão acontece.
2. **Given** um auto-uso que já disparou numa estação, **When** o jogador toca o botão nessa mesma estação sem que nada tenha mudado, **Then** o toque é ignorado.
3. **Given** um toque manual em uma estação inválida, **When** a ação é recusada, **Then** o aviso de recusa continua sendo emitido normalmente.
4. **Given** um auto-uso ignorado, **When** o chef se move para outra estação ou a estação muda de estado, **Then** o botão volta a ter efeito normal.

---

### User Story 4 - Regra determinística e independente por chef (Priority: P2)

O tempo parado é uma regra do jogo, reproduzível a partir do estado e do tempo decorrido, e cada chef tem sua própria contagem — inclusive no modo de dois jogadores e após pausa.

**Why this priority**: garante teste determinístico e evita que um jogador dispare ações do outro.

**Independent Test**: avançar o relógio em passos fixos num teste e verificar a contagem de cada chef; pausar no meio da contagem e confirmar que ela não avança.

**Acceptance Scenarios**:

1. **Given** dois chefs com tempos parados diferentes, **When** o sistema avança um passo de tempo, **Then** cada contagem evolui de forma independente.
2. **Given** a partida pausada ou a janela sem foco, **When** essa condição durar, **Then** o tempo parado não avança e nenhuma ação automática dispara.
3. **Given** o mesmo estado inicial e a mesma sequência de passos de tempo, **When** a regra é executada duas vezes, **Then** produz exatamente as mesmas decisões.

---

### Edge Cases

- Chef parado de frente ao piso, parede ou estação fora do escopo (caixa, balcão, pratos, lixeira): nenhuma ação automática.
- Direção trocada sem sair do lugar: a contagem reinicia; olhar para outra estação não herda o tempo da anterior.
- Estação alvo muda porque outro chef interagiu: a contagem reinicia para a nova estação.
- Dois chefs ao mesmo tempo: se dois chefs ficam parados diante da mesma estação, cada um aplica sua própria regra e a estação resolve as ações na ordem em que chegam, sem duplicar o efeito de uma mesma transição.
- Tecla de ação apertada e solta rapidamente antes dos 250 ms: é toque manual normal; não deve gerar ação automática depois.
- Fim de partida enquanto o chef está parado: nenhuma ação automática após o término.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE registrar, por chef, quanto tempo ele permaneceu sem movimento nem comando de ação, reiniciando a contagem a qualquer movimento, mudança de direção ou ação manual.
- **FR-002**: Ao completar 250 ms parado, a cena DEVE resolver a estação alvo e acionar o auto-uso, usando o vocabulário de entradas definido no contrato de estações: sinal contínuo de segurar (`holdStart`) na tábua e sinal de toque (`tap`) no fogão e no passe, sempre com `canInteract` verdadeiro.
- **FR-003**: Na tábua, o auto-uso DEVE permanecer ativo enquanto o chef continuar parado e houver ingrediente cru, e DEVE ser encerrado assim que o chef se move ou o ingrediente deixa de estar cru.
- **FR-004**: No fogão e no passe, o auto-uso DEVE gerar no máximo uma ação por permanência ou mudança de estado que torne a ação possível; não DEVE se repetir enquanto estado do chef e da estação permanecem os mesmos.
- **FR-005**: O auto-uso NÃO DEVE gerar evento de ação recusada. A recusa por botão manual continua com o comportamento atual.
- **FR-006**: Uma ação manual DEVE cancelar qualquer auto-uso pendente para aquele chef. Após um auto-uso ter disparado, um toque manual na mesma estação DEVE ser suprimido até que o chef se mova, mude de alvo ou o estado da estação mude.
- **FR-007**: Nenhuma ação automática DEVE ser enviada quando não há estação alvo ou quando a estação alvo não é tábua, fogão ou passe.
- **FR-008**: Pausa, perda de foco da janela e fim de partida DEVEM impedir o avanço do tempo parado e o disparo de ações automáticas.
- **FR-009**: A decisão de auto-uso DEVE ser reproduzível apenas com o estado do chef, da estação e o tempo decorrido em passos discretos, sem depender de relógio real nem de timers isolados na cena.
- **FR-010**: A regra de tempo parado DEVE residir na camada de regras do jogo, ser determinística e vir acompanhada de testes que cubram os limites de 250 ms, a reinicialização e a independência entre chefs.
- **FR-011**: O comportamento manual existente (toque rápido, segurar e soltar) DEVE permanecer inalterado fora das situações descritas em FR-005 e FR-006.

### Key Entities

- **Chef parado**: identificação do chef, posição, direção do olhar, tempo acumulado parado e registro da última estação em que houve auto-uso.
- **Estação alvo**: tipo da estação (tábua, fogão, passe ou outra), estado atual e indicação de que a ação daria certo.
- **Ação de estação**: sinal de toque ou de segurar, com origem manual ou automática; é a unidade que o sistema de estações consome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com ingrediente cru na tábua, o corte automático começa entre 250 ms e 300 ms depois que o chef para, sem nenhuma tecla de ação.
- **SC-002**: Em 10 segundos de chef parado diante de fogão ou passe inválidos, a quantidade de ações e de avisos de recusa gerados pelo auto-uso é zero.
- **SC-003**: Em 100 repetições do cenário "auto-uso seguido de toque manual na mesma estação", ocorrem zero ações duplicadas.
- **SC-004**: 100% dos ramos da regra de tempo parado (limiar, reinício, pausa, dois chefs) são cobertos por testes determinísticos que não usam relógio real.
- **SC-005**: Os fluxos manuais de pegar, picar, cozinhar e servir continuam funcionando sem alteração de comportamento.

## Assumptions

- O limiar de 250 ms foi decidido nesta sessão (2026-11-19) e é superior aos ~220 ms definidos para o toque rápido no PRD.
- Escopo do auto-uso: somente tábua, fogão e passe. Caixas, balcão, pilha de pratos e lixeira continuam exigindo o botão, conforme o critério de pronto da issue.
- "Parado" significa ausência de comandos de movimento e de ação do jogador; pressionar a direção contra uma parede não conta como parado.
- Uma estação que se torna elegível enquanto o chef já está parado (por exemplo, panela que termina de cozinhar) pode gerar uma única ação automática na transição para "dá certo".
- O destaque da estação alvo, as regras de movimentação e o contrato de estações (KD-12) já existem e não mudam de forma; esta feature consome esses contratos.
- Funciona tanto para um quanto para dois chefs, com contagens independentes.
