# Quickstart: validação do auto-uso de estações

## Pré-requisitos

- Node 24 (`.nvmrc`) e dependências instaladas com `npm ci`.
- Hooks locais ativos: `git config core.hooksPath .githooks`.
- Contratos e modelo: [auto-use-api.md](contracts/auto-use-api.md) e [data-model.md](data-model.md).

## Comandos

```sh
npm test                 # todos os testes, incluindo idleSystem.test.js
npx vitest run src/game/core/idleSystem.test.js
npm run lint
npm run format:check
npm run build
npm run check-size
npm run dev              # validação manual em http://localhost:5173/jogar
```

## Validação automatizada

Os testes devem usar passos fixos de `dtMs` e uma seed fixa, sem relógio real:

1. Chef parado diante da tábua com item cru: nenhuma ação antes de 250 ms; `holdStart` contínuo depois disso; corte para ao mover ou ao item ficar picado.
2. Fogão/passe inválidos por vários passos: zero ações e zero `action:rejected`.
3. Passe com prato válido: exatamente um `dish:served` por transição de estado; toque manual imediato não duplica.
4. Ação manual apertada antes do limiar: auto pendente é cancelado.
5. Dois chefs com tempos parados distintos: decisões independentes e mesmo resultado para a mesma sequência de passos.
6. `setIdleBlocked(state, true)` durante blur/pausa: nenhuma ação e nenhum acúmulo.

## Validação manual (cena)

1. Iniciar uma partida de 1 jogador no modo Livre. pegar um tomate na caixa e colocá-lo na tábua com o botão de ação; parar de apertar qualquer tecla. O corte deve começar sozinho pouco depois de parar e terminar sem novos toques.
2. Mover o chef no meio do corte: o corte para imediatamente.
3. Ficar parado alguns segundos diante de um fogão vazio e do passe sem prato: nada acontece, nenhum aviso aparece.
4. Levar um prato pronto ao passe e parar: a entrega acontece uma única vez; apertar a ação em seguida não entrega nada nem duplica pontuação.
5. Repetir os passos com P1 e P2: o tempo parado de um não afeta o outro.
6. Pausar (P) e alternar o foco da janela enquanto parado diante da tábua: ao retomar, o chef não dispara ação herdada do tempo anterior.

## Resultado esperado

Todos os comandos passam e cada cenário manual acontece sem avisos repetidos, sem ação dupla e sem alteração do controle manual existente.
