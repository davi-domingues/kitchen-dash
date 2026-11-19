# Research: Auto-uso de estações ao ficar parado

## 1. Onde mora a regra de tempo parado

- **Decisão**: módulo puro `src/game/core/idleSystem.js`, registrado em `createKitchenUpdate` entre o movimento e o sistema de estações.
- **Rationale**: o princípio III da constituição exige regra determinística no core; `createUpdate` já fornece `dtMs` discretizado (`MAX_DT_MS = 250`) e é no-op quando a partida não está `RUNNING`. O sistema pode ler `inputs` para saber se houve movimento ou ação manual e atualizar `chef.idleMs` sem relógio real.
- **Alternativas consideradas**: (a) timers do Phaser na cena — reprovado porque fogem do `dtMs` do core e quebram replay; (b) calcular tudo na cena a partir de `time.now` — reprovado pelo mesmo motivo e por espalhar regra fora do core; (c) emitir eventos do core para a cena — reprovado porque inventaria um canal novo quando o estado já é compartilhado.

## 2. Como a cena consome a decisão

- **Decisão**: o sistema grava `chef.autoAction` no estado; `selectAutoActions(state, busyActions)` devolve as entradas `{ chefId, action, stationId, auto: true }`. A cena concatená-las às entradas manuais em `update()`, chama `consumeAutoActions(state, autoActions)` e passa o estado resultante ao `step()`.
- **Rationale**: mantém `toStationInputs` e o EventBus inalterados; a decisão deriva somente do estado, então é reproduzível em teste. Consumir a decisão antes do `step` evita que a mesma entrada pendente seja reenviada no frame seguinte.
- **Alternativas consideradas**: injetar ações dentro do próprio `createUpdate` — reprovado porque todos os sistemas recebem os mesmos `inputs` e isso exigiria plumbagem entre sistemas; usar EventBus — reprovado por duplicar canal de comunicação já existente.

## 3. Gate por tipo de estação

- **Decisão**: CUTTING → `holdStart` contínuo quando há item cru na tábua e o chef não segura nada; STOVE/PASS → `tap` único quando `canInteract` é verdadeiro.
- **Rationale**: em `stations.js`, `canInteract` usa `resolveTap`; na CUTTING com item cru e mão vazia ele devolve "pegar o item" (verdadeiro), mas o `tap` tiraria o item da tábua. `holdStart` em CUTTING apenas seta `workingAt`, que é o que `advanceCutting` consome. Em STOVE/PASS, `resolveTap` já garante que a ação é válida, então `tap` é a única forma correta.
- **Alternativas consideradas**: usar `tap` na tábua — reprovado porque pegaria o item; usar `holdStart` no fogão/passe — reprovado porque o sistema de estações o converte em `interact` com as mesmas consequências de um `tap`, mas sem intenção semântica clara.
- **Implicação registrada**: o auto-uso **não** coloca na tábua um ingrediente que está na mão do chef; essa primeira colocação continua manual.

## 4. Avisos repetidos e ação dupla

- **Decisão**: o sistema de estações filtra `action:rejected` quando a entrada correspondente tem `auto: true`. Para o botão, `filterManualDuplicates(state, actions)` remove o toque manual na mesma estação **e com a mesma assinatura de estado** em que o auto já disparou; um toque manual em qualquer outra situação continua cancelando o auto pendente ao reiniciar `idleMs`.
- **Rationale**: `interact` emite `action:rejected` para qualquer tap inválido. Como as entradas automáticas são resolvidas um frame antes de serem aplicadas, outro chef pode mudar a estação nesse intervalo; o filtro evita o aviso sem alterar o comportamento do botão.
- **Alternativas consideradas**: não gerar `action:rejected` no `interact` — reprovado porque mudaria o contrato KD-12; filtrar eventos na cena — reprovado por acoplar a cena ao significado dos eventos do core.

## 5. Pausa, perda de foco e limiar de 250 ms

- **Decisão**: `update` já não avança quando o status não é `RUNNING`. Para blur/foco, `setIdleBlocked(state, true|false)` zera contadores e latches e bloqueia a acumulação; a cena chama essa função nos handlers de blur/foco e em `pause()`/`resume()`.
- **Rationale**: hoje `onBlur` só chama `releaseAll()`, o que faria o chef começar a acumular tempo parado em segundo plano. O limiar de 250 ms é igual a `MAX_DT_MS`; um único frame longo pode cruzar o limite, e a decisão é lida no frame seguinte — atraso de no máximo um frame, imperceptível e determinístico.
- **Alternativas consideradas**: pausar a partida no blur — reprovado porque muda o comportamento atual da partida; usar fake timers nos testes — reprovado porque o padrão do repositório é avançar `dtMs` fixo.

## 6. Limiar e balanceamento

- **Decisão**: 250 ms, definido pela pessoa responsável na sessão de 2026-11-19; maior que os ~220 ms do toque rápido do PRD.
- **Rationale**: valor curto o suficiente para parecer "automático" e longo o suficiente para não disparar durante trocas de direção.
- **Alternativas consideradas**: 500 ms e 1000 ms — ambas descartadas na decisão da sessão. O valor deve ser registrado em `docs/ESTUDOS_E_DECISOES.md` no PR desta feature.
