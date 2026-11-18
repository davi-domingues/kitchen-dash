# Spec — KD-21 · Telas React: home, escolha de modo, pausa e resultado

Issue: #20 · Trilha `app` · Onda 2 · Referências: ARQUITETURA §3.1, SYSTEM_DESIGN §3 e §6.2, PRD "Modos de jogo".

## Histórias

1. **Como jogador**, abro a home, entendo o jogo e chego à escolha de partida com um clique ou `Enter`.
2. **Como jogador**, escolho 1 ou 2 jogadores e um modo (Clássico, Livre, Desafio) e inicio a partida.
3. **Como jogador**, quando a cena pausa (`match:paused`), vejo um menu de pausa e posso continuar (`Esc` ou botão) ou sair.
4. **Como jogador**, ao fim da partida (`match:ended`), vejo pontuação, pedidos entregues e perdidos e a duração, e posso jogar de novo com a mesma configuração, trocar de modo ou voltar ao início.

## Requisitos funcionais

- **FR-01** Rotas: `/` (home), `/jogar`, `/ranking`, `/perfil`, `/privacidade` e uma rota de "página não encontrada". Ranking, perfil e privacidade são placeholders até KD-36, KD-41 e KD-43.
- **FR-02** A escolha de partida oferece jogadores ∈ {1, 2} e modo ∈ {`classic`, `free`, `challenge`}, com padrão 1 jogador + Clássico.
- **FR-03** A configuração escolhida chega à cena pelo `registry` do Phaser (`matchConfig`), sem o React tocar no loop do jogo.
- **FR-04** O overlay de pausa abre com `match:paused` e, ao continuar, o React emite `match:resumed`.
- **FR-05** A tela de resultado valida o payload de `match:ended`; payload inválido mostra estado de erro com saída para a escolha de partida.
- **FR-06** "Jogar de novo" remonta a partida com a mesma configuração (nova instância do Phaser).
- **FR-07** Todo texto visível passa pelo i18n; menus navegáveis só com teclado e foco visível; diálogos com foco inicial.

## Contrato `match:ended` (fechado nesta task)

```js
{
  matchId: string,         // UUID v4 gerado pela cena; chave de idempotência do submit_score
  mode: 'classic' | 'free' | 'challenge',
  players: 1 | 2,
  seed: number,            // inteiro uint32 usado no rng
  contentVersion: string,  // versão de content/*.json
  score: number,           // inteiro ≥ 0
  ordersCompleted: number, // inteiro ≥ 0, alimenta player_stats.orders_completed
  ordersFailed: number,    // inteiro ≥ 0 (prato errado ou cliente perdido)
  durationMs: number,      // inteiro > 0
}
```

`board` e `origin` do `submit_score` continuam decididos pelo React (KD-35), derivados de `mode` e `players`.

## Esclarecimentos (resolvidos com os docs, sem perguntar)

- *Quem gera o `matchId`?* A cena, no início da partida, para o mesmo id valer em retries do outbox (SYSTEM_DESIGN §7.1).
- *Por que `players`?* O PRD guarda o melhor tempo do Desafio separado para 1 e 2 jogadores; o `board` depende disso.
- *Por que `ordersCompleted`?* `player_stats.orders_completed` (SYSTEM_DESIGN §5) é alimentado pela RPC.
- *Testes de componente?* Exigem jsdom/happy-dom, que não estão aprovados; a lógica fica em módulos puros testados e as telas têm verificação manual.
- *Mobile com 2 jogadores?* Fora do escopo: o MVP é desktop (ESTUDOS §7).

## Critérios de pronto

- Fluxo home → partida → resultado → jogar de novo (teste do `playFlow` + verificação manual).
- Menus navegáveis por teclado (verificação manual).
- Payload validado (teste do `matchEnded`).
