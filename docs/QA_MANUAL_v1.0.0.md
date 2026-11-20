# Roteiro de QA manual — Kitchen Dash v1.0.0

Roteiro da KD-46 (issue #39). Rode em produção, no Chrome e no Firefox atuais. Anote o resultado de cada item na issue #39.

## Parte automatizada

`src/game/core/twoPlayerMatch.test.js` joga, no core e com seed fixa, uma partida completa com 2 jogadores em cada modo (Clássico até 180 s, Livre até o botão Encerrar, Desafio até o 12º pedido) e avalia o Desafio do dia com o resumo. O roteiro abaixo cobre o que o teste não vê: teclado real, render e layout.

## 1. Dois jogadores no mesmo teclado

Para cada modo, escolha **2 jogadores** e use as teclas padrão dos dois chefs ao mesmo tempo.

| Modo | Passos | Esperado |
|---|---|---|
| Clássico | Jogue até o relógio zerar, os dois chefs entregando pratos | Fim aos 3 min; resultado com pontuação e pedidos dos dois |
| Livre | Entregue alguns pratos e use **Encerrar** | Sem fim automático e sem pedido expirando; resultado após encerrar |
| Desafio | Complete os 12 pedidos | Fim no 12º pedido; "Tentar de novo" repete a mesma sequência |
| Desafio do dia | Jogue o modo indicado pelo desafio do dia | Resultado mostra se o desafio foi cumprido |

Em todos os modos:

- [ ] As teclas de um jogador não movem o chef do outro, inclusive com as duas mãos pressionando juntas.
- [ ] Pausar e retomar funciona com a tecla de pausa e não perde o estado.
- [ ] Teclas remapeadas na configuração valem na partida.
- [ ] O auto-uso de estação com o chef parado funciona para os dois chefs.

## 2. Legibilidade em telas pequenas

Use o modo responsivo do DevTools nas larguras **360**, **768** e **1280** px.

- [ ] Menu, configuração de partida, resultado, ranking, login, perfil e política sem rolagem horizontal.
- [ ] HUD (tempo, pontuação, pedidos) legível e sem cortar comandas.
- [ ] O canvas do jogo mantém a proporção e cabe na tela.
- [ ] Botões com área de toque e foco visíveis.
- [ ] Textos com zoom de 200% continuam legíveis.

## 3. Fluxos de conta

- [ ] Partida de visitante, depois login: o progresso local migra para a conta.
- [ ] Ranking mostra a pontuação enviada e o estado de envio no resultado.
- [ ] Exclusão de conta de teste conclui e volta ao modo visitante.
