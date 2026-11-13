# PRD --- Kitchen Dash

> Versão atualizada para refletir o protótipo `prototipo.html` (preservado no histórico da branch `init/spec-kit`).
> Itens marcados como **(protótipo)** já estão implementados; os demais são
> intenções de produto para versões futuras.

## Visão geral

**Kitchen Dash** é um jogo casual de culinária inspirado na
atmosfera de uma cozinha francesa movimentada. O jogador entra numa cozinha
vista de cima e precisa atender pedidos com agilidade, organização e
reflexos rápidos, sozinho ou em dupla no mesmo teclado.

## Conceito do produto

O jogador assume o papel de um cozinheiro de um bistrô em Paris (no protótipo,
*Le Petit Rongeur*). Ele circula pela cozinha, recolhe ingredientes, pica,
cozinha, monta os pratos e entrega no **passe** antes que os clientes percam
a paciência.

A diversão nasce da pressão e da cooperação: vários pedidos podem estar em
andamento ao mesmo tempo, e no modo de 2 jogadores os chefs dividem a
cozinha, os pedidos e a pontuação.

## Problema e oportunidade

Jogos casuais de partidas rápidas são fáceis de entender e difíceis de
dominar. Kitchen Dash explora essa combinação com uma fantasia familiar:
sobreviver ao ritmo de uma cozinha profissional, sozinho ou com um amigo.

A proposta transforma tarefas culinárias em desafios dinâmicos, com partidas
curtas que convidam a tentar de novo e melhorar o desempenho.

## Público e contexto de uso

Pessoas que gostam de jogos casuais, desafios de reflexo, gerenciamento de
tempo e experiências competitivas, inclusive em dupla. O produto favorece
sessões curtas (ou longas, no modo livre), jogadas em momentos livres, e
incentiva repetição para bater recordes.

## Plataforma e controles (protótipo)

- **Desktop, teclado:**
  - **Jogador 1:** setas para andar e **Enter** como botão de ação.
  - **Jogador 2:** **WASD** para andar e **Espaço** como botão de ação.
  - **P** pausa a partida.
  - No modo de 1 jogador, qualquer um dos dois conjuntos controla o mesmo chef.
- **Mobile (celular/tablet):** apenas 1 jogador, com direcional na tela e um
  botão **AÇÃO**. O toque no mapa para andar foi removido.
- **Um único botão de ação, com três formas de uso:**
  1. **Toque rápido** (menos de ~0,22 s): pegar, soltar, montar, servir,
     entregar ou limpar a panela, conforme a estação.
  2. **Segurar:** picar na tábua de corte (ação contínua).
  3. **Ficar parado olhando para a estação:** a estação é usada sozinha, sem
     precisar empurrar. Na tábua, o chef pica enquanto estiver parado com
     ingrediente cru. No fogão e no passe, só age quando a ação daria certo
     (evita avisos repetidos).
- **Direção e alvo:** cada chef guarda a direção para onde olha, marcada por
  um ponto colorido. A estação alvo fica destacada na cor do chef.
- **Chefs:** P1 em vinho, P2 em azul, com rótulo P1/P2. Os chefs colidem entre
  si.

## Experiência principal

A partida acontece numa cozinha vista de cima, com:

- **Caixas de ingredientes:** tomate, alface, berinjela, abobrinha, pão e queijo.
- **Tábua de corte:** pica o ingrediente segurando a ação.
- **Fogões:** cozinham a panela; se passar do ponto, queimam e precisam ser limpos.
- **Balcões de montagem:** onde o prato é montado.
- **Pilha de pratos e lixeira.**
- **Passe:** onde os pedidos prontos são entregues.

O mapa foi desenhado para que **toda estação seja alcançável**: cada uma tem
pelo menos uma célula de chão livre de onde o chef pode usá-la. O protótipo
confere isso automaticamente ao carregar e avisa no console se alguma estação
ficar inacessível.

Os pedidos aparecem como comandas com barra de paciência (verde, amarela e
vermelha). Cada cliente tem um prazo; entregas rápidas e corretas rendem mais
pontos e gorjeta, e atrasos ou erros tiram pontos.

### Receitas (protótipo)

| Receita | Montagem | Pontos base |
|---|---|---|
| 🥗 Salada | 🥬 + 🍅 picados no prato | 60 |
| 🥖 Tartine | 🥖 + 🧀 picados no prato | 60 |
| 🍲 Sopa de Tomate | 3× 🍅 picado na panela | 90 |
| 🫕 Ratatouille | 🍅 + 🍆 + 🥒 picados na panela | 130 |

A Salada está disponível desde o início. As demais são liberadas conforme o
tempo decorrido na partida: Tartine aos 20 s, Sopa de Tomate aos 45 s e
Ratatouille aos 70 s. No modo Desafio a sequência de pedidos é fixa e não
depende desse desbloqueio.

### Pontuação (protótipo)

- Pontos base da receita, mais gorjeta pela rapidez (até 40 pontos).
- **Combo:** +10 pontos por entrega consecutiva acima de uma.
- **Penalidades:** prato errado −20; cliente que vai embora −30. A pontuação
  não fica abaixo de zero.

## Modos de jogo (protótipo)

O jogador escolhe o número de jogadores (1 ou 2) e um dos três modos no menu.

### Clássico
- Turno de **3 minutos** com pressão crescente.
- Os clientes perdem a paciência e vão embora se não forem atendidos.
- Objetivo: fazer o máximo de pontos. O placar guarda as melhores partidas.

### Livre
- **Sem limite de tempo** e sem perda de paciência.
- Um pedido novo chega a cada 13 a 17 segundos. Aparecem até 6 comandas
  ao mesmo tempo; as demais entram numa fila visível (até 20).
- Um relógio crescente mostra quanto tempo passou.
- O botão **⏹ Encerrar** fecha o turno e mostra o resumo.

### Desafio
- **12 pedidos fixos**, sempre na mesma ordem e numerados de #1 a #12, com
  3 visíveis por vez.
- Cronômetro crescente; o turno termina quando o último pedido é entregue.
- Objetivo: completar tudo no **menor tempo**.
- O melhor tempo é salvo separadamente para 1 e 2 jogadores, e aparece no menu
  e no placar.
- O botão **Tentar de novo** reinicia com a mesma sequência.

### Desafio do dia
Um desafio diário, escolhido pela data, vale em qualquer modo (por exemplo:
"Entregue 3 Ratatouilles em um turno", "Termine sem nenhum pedido perdido").

## Engajamento e progressão

A motivação para continuar jogando vem de:

- **Recordes pessoais** (pontuação no Clássico e tempo no Desafio).
- **Placar dos chefs** com as melhores partidas salvas, identificadas pelo
  modo e pelo número de jogadores.
- **Desafio do dia.**
- **Desbloqueio de estilo** (ver próxima seção), que recompensa a habilidade.

O progresso é salvo no próprio navegador (sem servidor). O protótipo não tem
contas nem sincronização entre dispositivos.

## Personalização e monetização

### Personalização (protótipo)

Chapéus, aventais e temas da cozinha são **liberados pelo recorde pessoal de
pontos**, não comprados:

- **Chapéus:** Clássico (grátis), Bordeaux (300), Marinho (600), Dourado (1000).
- **Aventais:** Creme (grátis), Ervas (200), Bistrô (500), Macaron (800).
- **Temas da cozinha:** Bistrô (grátis), Mármore (400), Provence (700).

Assim nenhum item dá vantagem competitiva. Esta é uma decisão de produto: a
progressão valoriza a habilidade e não o pagamento.

### Monetização (planejada, não implementada)

A intenção é oferecer **itens cosméticos opcionais** por pagamentos de pequeno
valor, incluindo **Pix**. No protótipo, a loja aparece apenas como
**"em breve"**, com a nota de que nenhum item comprado afetará a pontuação e
que nenhum pagamento é processado nessa versão.

Regras que valem para qualquer versão futura:
- A experiência principal deve continuar acessível e justa para todos.
- Nenhum cosmético altera pontuação, tempo ou dificuldade.

## Identidade e atmosfera

O produto busca transmitir o ritmo acelerado, o charme e a energia de uma
cozinha parisiense. No protótipo:

- Visual de bistrô, com paleta de vinho, creme e dourado.
- Mascote de um ratinho de chapéu de chef, com nome original (*Le Petit Rongeur*).
- Fontes Playfair Display e Nunito (Google Fonts), únicas dependências externas.
- Personagens, nomes e elementos visuais próprios, sem reproduzir obras existentes.

## Requisitos técnicos (protótipo)

- Arquivo HTML único, com CSS e JavaScript embutidos.
- Renderização em canvas, com a cozinha escalada para caber inteira na janela
  (desktop e mobile), sem precisar de zoom.
- Layout responsivo para celular e tablet.
- Dados salvos no `localStorage`, com tratamento de erro caso não esteja disponível.
- Sem servidor, sem contas e sem pagamentos reais.

## Itens em aberto

- Testar a partida completa de 2 jogadores no mesmo teclado em todos os modos.
- Validar em telas pequenas se a cozinha continua legível sem zoom.
- Decidir se o modo Clássico continua com esse nome ou passa a se chamar "Turno".
- Definir se a loja Pix entra numa versão futura e com quais itens.

## Visão de evolução

Kitchen Dash pode crescer com novas cozinhas, receitas, desafios semanais,
personagens, eventos e opções cosméticas. Placares online e desafios
periódicos podem ampliar o envolvimento da comunidade.

## Resumo

**Kitchen Dash** é um jogo arcade de culinária em que o jogador atravessa uma
cozinha movimentada, prepara pedidos e os entrega antes que o tempo ou a
paciência dos clientes acabem. Ele pode ser jogado sozinho ou em dupla, em
três modos (Clássico, Livre e Desafio), com recordes pessoais, desafio do dia
e personalização conquistada com habilidade.
