# Kitchen Dash — Estudos e Decisões

Registro dos estudos, comparações e previsões que embasaram a [ARQUITETURA.md](ARQUITETURA.md) e o [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md). Serve de histórico e de ponto de partida para revisões futuras.

**Data dos estudos:** novembro de 2026. Preços e limites de terceiros mudam; confira as fontes antes de reutilizar os números.

---

## 1. Revisão da arquitetura inicial

Problemas encontrados na v1.0 e como foram resolvidos:

| Achado | Impacto | Decisão |
|---|---|---|
| `signInWithOtp` envia *magic link* por padrão | O login por código não funcionaria | Template "Magic Link" alterado para conter `{{ .Token }}`; validação com `verifyOtp({ type: 'email' })` |
| O exemplo oficial de leaderboard usa `insert ... with check (true)` | Qualquer usuário logado grava qualquer pontuação | Escrita só via RPC `submit_score` com validação |
| O Axios duplicava o `supabase-js` | Dependência sem uso | Removido |
| GitHub Pages não reescreve rotas de SPA | F5 em rota interna dá 404 | Hospedagem trocada (§3) |
| "Ratatouille" é marca da Disney/Pixar | Risco legal ao publicar | Nome passa a ser só **Kitchen Dash** |
| O shadcn/ui é voltado a TypeScript | Atrito em projeto JS | Substituído por daisyUI 5 |
| Pix exige backend seguro (webhook) | Fora do alcance de um BaaS sem Edge Functions | Pix e desafios recorrentes vão para o ROADMAP |

**Phaser 3.90 × 4.x:** o Phaser 4 já é estável (v4.2.1), mas tem menos tutoriais e exemplos. A escolha foi o 3.90, priorizando o material de apoio. A integração segue o template oficial React + Vite (`PhaserGame` + `EventBus`).

---

## 2. APIs de receitas

**Conclusão central:** as APIs fornecem receitas reais (ingredientes, medidas, preparo em texto), não mecânica de jogo (estações, tempos, pontos). Sempre há uma etapa de curadoria.

| API | Acesso | Avaliação |
|---|---|---|
| TheMealDB | Chave gratuita (a de testes é `1`); sem cotas publicadas; ~670 pratos; filtro por culinária (`a=French`); conteúdo em inglês | ✅ Melhor opção gratuita |
| Spoonacular | Plano gratuito por pontos diários (~150/dia, ~1 req/s; responde 402 quando a cota acaba) | ❌ Cota compartilhada entre todos os jogadores e chave exposta no frontend |
| Edamam e similares | Chave obrigatória e plano gratuito restrito | ❌ Mesmos problemas da Spoonacular |

**Uso em tempo de execução, rejeitado:**
- Cria dependência de terceiros durante a partida.
- Quebra o jogo offline.
- Muda o conteúdo sem controle, o que deixa o ranking injusto.
- Ainda exigiria a curadoria da mecânica.

**Decisão:** TheMealDB **só no build**. O script `content:import` gera rascunhos, a mecânica é curada em JSON versionado e as fotos servem apenas de referência.

---

## 3. Hospedagem do frontend

| Opção | Plano gratuito | Observação |
|---|---|---|
| GitHub Pages | Gratuito | Sem rewrite de SPA; exige `HashRouter` ou o truque do `404.html` |
| Vercel (Hobby) | Gratuito | **Proíbe uso comercial**, o que conflita com a monetização prevista no PRD |
| **Cloudflare Pages** ✅ | 20.000 arquivos por site, 25 MiB por arquivo, 500 builds por mês, banda sem cobrança | SPA automática sem `404.html`; previews por branch; uso comercial permitido |

Os limites da Cloudflare definem o orçamento de tamanho do build (SYSTEM_DESIGN §8.5).

---

## 4. Volume de dados × planos do Supabase

**Premissas:**
- Apenas usuários autenticados contam como MAU e gravam dados. Por isso visitantes **não** usam *anonymous sign-in*: cada um viraria um MAU.
- Cada MAU faz ~10 sessões e ~30 partidas por mês.
- Tamanhos: ~250 B por partida (com índices), ~5 KB por usuário, ~30 MB de base vazia.
- Egress: ~25 KB por sessão, com ranking paginado e cache.

**Planos:**

| | Free | Pro (US$ 25/mês) |
|---|---|---|
| MAU | 50 mil | 100 mil, depois US$ 0,00325 por MAU |
| Banco | 500 MB (disco fixo de 2 GB) | 8 GB de disco, depois US$ 0,125 por GB |
| Egress | 5 GB | 250 GB, depois US$ 0,09 por GB |
| Outros | Sem backups; pausa após 7 dias inativo; 2 projetos | Backups diários |

**Previsão:**

| MAU autenticados | Banco (retenção 90 d) | Egress/mês | Plano · custo |
|---|---|---|---|
| 5 mil | ~170 MB | ~1,3 GB | Free · US$ 0 |
| **~15 mil** | ~440 MB | ~3,8 GB | **Limite do Free** |
| 100 mil | ~2,8 GB | ~25 GB | Pro · ~US$ 25 |
| 500 mil | ~14 GB | ~125 GB | Pro + extras · ~US$ 1.400 |

**Conclusões:**
1. No Free, o primeiro limite atingido é o **tamanho do banco**. Sem retenção, ele aguenta ~10 mil MAU por poucos meses; com retenção de 90 dias, ~15 mil.
2. No Pro, o custo cresce com o **MAU**; disco e egress custam centavos.
3. A carga de requisições é irrelevante: ~2 envios de pontuação por segundo no pico com 20 mil MAU.
4. A ausência de backups no Free justifica migrar para o Pro antes da divulgação pública, independentemente do volume.

**Decisões derivadas:**
- Modelo `scores` (histórico de 90 dias via `pg_cron`) + `best_scores` (uma linha por jogador) + `player_stats` (agregados permanentes).
- Gatilhos de migração: banco acima de 350 MB, egress acima de 3,5 GB por mês ou MAU acima de 12 mil.

---

## 5. Monitoramento de erros: Sentry × Datadog

| | Sentry | Datadog |
|---|---|---|
| Foco | Erros de aplicação (frontend/JS) | Observabilidade completa (infraestrutura, APM, logs, RUM) |
| Gratuito | Plano Developer: cota mensal de erros (as fontes divergem entre 5 mil e 50 mil), ~50 replays, 1 usuário, 30 dias de retenção | Só infraestrutura (5 hosts); **RUM é pago** |
| Custo com 10 mil jogadores/mês | US$ 0 | ~US$ 150/mês (~US$ 1,50 por mil sessões, replay à parte) |
| Encaixe | Source maps pelo plugin do Vite; captura React e Phaser | Pontos fortes (APM, hosts) sem uso: não há servidor próprio |

**Decisão:** Sentry. Reavaliar o Datadog só se surgir backend próprio.

---

## 6. Analytics de interação

| Ferramenta | Plano gratuito | Uso |
|---|---|---|
| Cloudflare Web Analytics | Gratuito, sem cookies, sem cota de tráfego encontrada | Tráfego e páginas |
| PostHog | 1 milhão de eventos por mês; depois ~US$ 0,00005 por evento | Funil, retenção e eventos de jogo |
| Tabela própria no Supabase | — | Rejeitada: consome os 500 MB do banco e não tem painéis prontos |

**Estimativa:** com ~8 eventos por sessão, o PostHog gratuito cobre ~12 mil jogadores por mês. Com 30 mil jogadores, custaria ~US$ 70/mês.

**Decisão:** as duas ferramentas, atrás de `services/analytics.js`, no **ROADMAP com prioridade baixa**. O PostHog fica sem cookies até o consentimento (LGPD). Pendente: refinar o volume de eventos; `order_failed`, por exemplo, não deve gerar um evento por erro.

---

## 7. Demais decisões de qualidade

| Tema | Escolha | Motivo principal |
|---|---|---|
| Anti-bot no OTP | Cloudflare Turnstile | Gratuito, invisível, nativo no Supabase Auth |
| Ambientes | Supabase CLI local + 1 projeto de produção; migrations no repo | Schema versionado e reprodutível sem gastar o 2º projeto gratuito |
| Estado React | TanStack Query + Context | Cache, retry e loading prontos |
| Testes | Vitest no core + lint no CI | Cobre as regras e a migração com custo baixo; E2E depois |
| Plataforma | Só desktop; joystick com prioridade baixíssima | Foco do MVP; o `InputMap` abstrai o input |
| Controles (KD-17) | Botão único de ação contextual (toque < 220 ms × segurar); P1 setas + Enter, P2 WASD + Espaço, P pausa | Segue o PRD; SYSTEM_DESIGN citava `drop` e `E`/`Esc`, o que daria dois botões e conflitaria com P2 |
| RNFs do MVP | i18n (pt-BR), acessibilidade básica, PWA, orçamento de tamanho | Performance de runtime vai para o ROADMAP |
| E-mail OTP | SMTP padrão agora, Resend antes do lançamento | O SMTP padrão tem limite baixo de envios por hora |
| Estado do RNG (KD-11) | `rngState` dentro do `MatchState`; `createRng` expõe `getState()` | Estado 100% serializável, base para salvar/retomar e replay por seed |
| Passo de tempo do core (KD-11) | Teto `MAX_DT_MS = 250` por `update` | Aba em segundo plano não encerra a partida de 3 min num único quadro |
| `match:ended` do core (KD-11) | Payload sem `matchId` (campos finais na linha da KD-15) | O id da partida não é regra de jogo e exigiria aleatoriedade não semeada; a cena/React o atribui |
| Validação de conteúdo (KD-10) | JSON Schema + ajv (dev) num plugin do Vite, mais checagens de referência e de mapa | O build falha com conteúdo inválido e o ajv não entra no bundle |
| `content_version` (KD-10) | FNV-1a 32 bits (8 hex) dos 3 JSON, calculado no loader | Determinístico e sem dependência; distingue versões, não é proteção criptográfica |
| Fila de pedidos (KD-13) | Padrões do Clássico: 4 comandas, fila 20, chegada 13–17 s, paciência 60 s; a paciência só corre em comandas visíveis | O PRD só fixa os números do Livre; a KD-15 ajusta por modo. A fila é espera da cozinha, não do cliente |
| Eventos de pedido (KD-13) | `order:delivered`/`order:expired` com `{ orderId, number, recipeId, points, patienceMs, remainingMs, elapsedMs }` e `order:wrong` `{ recipeId, elapsedMs }` | A pontuação (KD-14) calcula base, gorjeta, combo e penalidades só a partir dos eventos |
| Combo e gorjeta (KD-14) | Combo de +10 fixo a partir da 2ª entrega seguida, zerado por prato errado ou cliente perdido; gorjeta `round(40 × restante/paciência)`, 0 sem paciência | Leitura literal do PRD; um bônus limitado deixa o teto de plausibilidade calculável |
| Integração da pontuação (KD-14) | `withScoring(system)` envolve o sistema de pedidos; `applyScoreEvents` para os eventos de `deliverDish` | O contrato da KD-11 não repassa eventos entre sistemas; não muda `update` nem `orders` |
| Teto de plausibilidade (KD-14) | `max_points_per_second = 15` mais folga de 180 pontos: `score ≤ 180 + ⌈duração_s⌉ × 15` | Entrega máxima de 180 (130 + 40 + 10) ÷ 13 s de chegada mínima ≈ 13,8/s; a folga cobre partidas curtas. Se a KD-15 encurtar o intervalo de chegada, o teto precisa ser recalculado |
| Panela no fogão (KD-12) | Panela fixa em cada fogão; o chef serve com prato vazio | Menos estados e ações no MVP; panela carregável fica para depois |
| Conteúdo no core (KD-12) | `createStationsSystem({ recipes, ingredients, stoveBurnAfterMs })` recebe o conteúdo | Core testável com dados fictícios e sem acoplar ao loader |
| Entregas (KD-12) | O passe grava `state.deliveries` e emite `dish:served`; o KD-13 consome a lista | Sistemas só enxergam o estado, não os eventos de outros sistemas |
| Modos (KD-15) | `createMatch(config)` monta estado e sistemas; Clássico 180 s/paciência 60 s/4 comandas, Livre e Desafio sem tempo e sem paciência (6 e 3 comandas); chegada 13–17 s em todos | Ponto único para a cena; o intervalo igual mantém o teto da KD-14 (180 + s×15). Desafio sem paciência porque um cliente perdido impediria completar a sequência |
| Sequência do Desafio (KD-15) | 12 receitas sorteadas com `CHALLENGE_SEED` fixa sobre todas as receitas; a partida usa essa seed | Determinística sem mudar o JSON (CONTENT_VERSION); curadoria manual no conteúdo fica para decisão de produto |
| `match:ended` final (KD-15) | `{ mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs }` via `matchEndedPayload`; Livre encerra por `endMatch(state)` | Mesmo payload nos três jeitos de terminar (tempo, sequência, botão); `matchId` continua na cena |
| Payload de `match:ended` (KD-21) | `{ matchId, mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs }`; `matchId` UUID gerado pela cena | Cobre o `submit_score` (idempotência, plausibilidade), `player_stats.orders_completed` e o recorde do Desafio separado por nº de jogadores; `board`/`origin` ficam com o React |
| Progresso local (KD-22) | `kd:v1:progress` = `{ board, stats, pending }`; recorde = 1º do placar por modo e nº de jogadores (10 por grupo); Desafio por menor tempo e só com os 12 pedidos; `pending` (≤ 50) guarda o payload com `matchId`/`seed`/`contentVersion`/`endedAt` | Sem dado duplicado; a KD-35 envia e remove por `removePending`, a KD-37 revalida pelo mesmo payload. Idempotente por `matchId` |
| Fonte única de modos (KD-22) | `MATCH_MODES`, `PLAYER_COUNTS` e `CHALLENGE_LENGTH` em `core/matchModes.js`; `match.js` importa | O React lê os modos sem puxar o core e o conteúdo para o bundle inicial |
| Configurações locais (KD-22) | Só "apagar progresso"; `settings.keyBindings` continua com a KD-17 | Evita criar `services/settings.js` em paralelo à KD-17 (conflito e duplicação) |
| Cosméticos locais (KD-23) | `kd:v1:cosmetics` = `{ bestScore, unlocked, equipped }`, separado de `progress`; desbloqueio por `getUnlockedCosmetics(bestScore)` com a maior pontuação de qualquer partida | Mesma regra do `submit_score` (KD-31), sem migrar o formato da KD-22; o placar do Desafio não guarda o máximo de pontos. `unlocked` só cresce, para a KD-38 unir a lista da conta por `mergeUnlockedCosmetics` |
| Cosméticos na cena (KD-23) | O React lê `loadCosmeticLook()` e grava `{ hat, apron, theme }` (hex) em `registry` (`COSMETIC_LOOK_KEY`); o tema pinta as paredes | `game/phaser` não importa `services`; a cor do corpo ainda distingue P1/P2. Placeholder até a KD-19 |
| Cosmético por jogador (KD-23) | Decisão da pessoa: cada chef tem chapéu e avental próprios. P1 = `equipped` (local; conta na KD-38). P2 = `equippedP2` em `kd:v1:cosmetics`, só no navegador, entre os itens desbloqueados do P1. Tema único, do P1. Look = `{ theme, chefs: { p1, p2 } }`. Registro sem `equippedP2` é migrado na leitura copiando chapéu e avental do P1 | A conta é de uma pessoa só; o P2 local não exige schema nem migration. Migrar copiando o P1 mantém o visual que o P2 já tinha, sem perder dados nem subir a `STORAGE_VERSION` de todas as chaves |
| Movimento (KD-18) | Grade de tiles, 1 passo a cada `CHEF_STEP_MS = 150` ms, horizontal vence na diagonal; posições no `MatchState` | Determinístico e reproduzível por replay, sem física; colisão por tile |
| Teclas na cena (KD-18) | A cena recebe as teclas do React, que lê `services/settings` (via registry desde a KD-20) | `game/phaser` não importa `services` (§4) |
| Teclas e config na cena (KD-20) | O React grava `matchConfig` e `keyBindings` (`loadKeyBindings()`) no registry antes do boot | Boot e Preload iniciam a cozinha por `scene.start` sem dados; substitui o `init` da KD-18 |
| Composição da partida (KD-20) | `createMatch` monta `createKitchenMatch` + `createKitchenUpdate({ extraSystems })`, com os sistemas do modo depois das estações | Um ponto só para a cena; remove a duplicação entre `match.js` e `kitchenUpdate.js` |
| HUD (KD-20) | Faixa superior no Phaser a partir de `buildHudModel(state)`; paciência verde > 50%, amarela > 25%, vermelha ≤ 25%; relógio regressivo só com duração | Sem re-render do React por frame; o PRD só define as três cores |
| Encerrar do Livre (KD-20) | Botão no HUD e no menu de pausa; o React emite `match:endRequested` e a cena chama `endMatch` | Acessível por teclado no `<dialog>`, visível como o PRD pede |
| Login OTP (KD-33) | Template próprio (`supabase/templates/otp_code.html`) com `{{ .Token }}` em _magic link_ e _confirmation_; `[auth.captcha]` Turnstile desligado no local por padrão, secret via `env()`; sessão em Context (`useAuth`), sem TanStack Query | Conta nova recebe o template de confirmação; `supabase start` funciona sem a secret; a sessão não é dado remoto em cache |
| Outbox de pontuação (KD-35) | `kd:v1:outbox` guarda só `{ matchId, userId, attempts, nextAt }`; o payload vem de `progress.pending`. Backoff 2 s × 2ⁿ⁻¹ (teto 5 min) com _equal jitter_, 8 tentativas e descarte; 22023/23505 descartam, 28000/42501 param sem descartar | Sem payload duplicado; partida de uma conta nunca vai pela sessão de outra; reenvio no login, na abertura e no evento `online` |
| Board e origem (KD-35) | `p_board = <mode>_<players>p` (ex.: `classic_1p`); `origin = 'online'` só para partidas terminadas com sessão. Partidas de visitante ficam para a KD-37 (`local`) | Um placar por modo e nº de jogadores, como o recorde local da KD-22 |
| TanStack Query na KD-35 | Não usado | O retry precisa sobreviver ao fechamento da aba; `useMutation` retentaria só em memória e duplicaria a fila |
| Cosméticos na conta (KD-38) | `equipped` só pela RPC `set_equipped`, que valida posse (gratuito = fora de `cosmetic_unlocks`); `update(equipped)` revogado. No login, une `user_cosmetics` ao local e o equipado da conta vence slot a slot; desbloqueios do `submit_score` entram por `onSubmitted` da outbox; falha remota só avisa | AGENTS §6 (escrita de cosméticos só por RPC); antecipa a validação que a KD-31 deixou para a KD-34; offline primeiro, sem fila própria (a KD-37 usa `pushEquipped`) |

---

## 8. Acompanhamento de tasks: GitHub Issues × Linear

| | GitHub Issues + Projects | Linear |
|---|---|---|
| Custo | Gratuito, sem limite de issues | Free: membros ilimitados, **2 times e 250 issues**; Basic ~US$ 10/usuário/mês |
| Onde vive | No próprio repositório, ao lado do código e dos PRs | Ferramenta separada, sincronizada com o GitHub por integração |
| Vínculo com código | Nativo: `Closes #12` fecha a issue no merge; PRs, branches e CI na mesma tela | Bom (branch e PR mudam o status), mas exige instalar e manter a integração |
| Dependências | Nativas (*blocked by* / *blocking*), sub-issues e milestones | Nativas (*blocks*, sub-issues, projetos, ciclos) |
| Board e planejamento | Projects: board, tabela, roadmap, campos customizados | Melhor UX: ciclos (sprints), triagem, atalhos, métricas de velocidade |
| Acesso | Qualquer colaborador do repo já tem; repo público dá visibilidade a terceiros | Cada pessoa cria conta e entra no workspace; backlog fica privado |
| Spec Kit | Os `tasks.md` e PRs já estão no GitHub; há automação comunitária para converter tasks em issues | Sem integração direta |
| Agentes (MCP/CLI) | `gh` CLI e MCP oficial do GitHub, já usados localmente | MCP oficial do Linear (OAuth) |
| Curva de aprendizado | Baixa: o time já usa GitHub | Baixa, mas é mais uma ferramenta |

**Leitura:** o Linear é a ferramenta de gestão mais agradável, e brilha com times maiores fazendo sprints contínuos. Para um time acadêmico pequeno, com repositório público e um MVP de ~40 tasks, o ganho de UX não compensa ter uma segunda fonte da verdade, mais uma conta por pessoa e o teto de 250 issues no plano gratuito (o backlog do MVP + bugs + roadmap chega perto disso em um semestre).

**Decisão:** GitHub Issues + GitHub Projects, com milestones por marco, labels por trilha e dependências nativas. Reavaliar o Linear se o time crescer ou passar a trabalhar em ciclos com métricas de velocidade.

---

## 9. Schema do banco (KD-30)

- **`public_profiles` com `security_invoker`:** uma view `security definer` é apontada como erro pelos advisors do Supabase. Em vez disso, `anon` recebe `select` só nas colunas `id`, `display_name` e `equipped` de `profiles` (grant por coluna) e a view herda essa permissão.
- **`settings` em `user_settings`:** o ranking exige que autenticados leiam todos os profiles e o grant por coluna não distingue linhas. Para não expor preferências de outros jogadores, `settings` saiu de `profiles` para `user_settings` (PK `user_id`, RLS só da própria linha, criada pelo mesmo trigger). Diverge da §5 da SYSTEM_DESIGN, atualizada neste PR.
- **`best_scores.match_id` sem FK:** `scores` expira em 90 dias e o recorde precisa sobreviver.
- **`game_rules` de plausibilidade:** duração aceita de 170 s a 200 s (turno de 3 min). A KD-31 aplica a regra fechada na KD-14: `max_points_per_second = 15` e folga fixa `score_allowance = 180`, com `score ≤ 180 + ceil(duration_s) × 15`.
- **`display_name` padrão:** o trigger gera `player_<12 hex do id>`; a regra é `^[A-Za-z0-9_]{3,20}$`.

---

## 10. RPC `submit_score` (KD-31)

- **Assinatura validada contra `match:ended`:** entram `matchId`, `score`, `durationMs`, `seed`, `contentVersion` e `ordersCompleted` (este último porque `player_stats.orders_completed` precisa dele); `board` e `origin` vêm do React. `mode`, `players` e `ordersFailed` não vão ao banco: o `board` já os codifica e o schema não os guarda.
- **Erros por exceção com SQLSTATE estável** (`28000`, `22023`, `23505`, `54000`) e mensagem fixa: a outbox (KD-35) só reenvia em `54000` e descarta o resto.
- **Idempotência antes do rate limit:** o reenvio de uma partida já aceita nunca é barrado e devolve o estado atual sem novos desbloqueios. `match_id` de outro usuário dá `match_conflict`, sem revelar o resultado.
- **Rate limit contando `scores` dos últimos 60 s**, com `pg_advisory_xact_lock` por usuário para serializar envios concorrentes. Sem tabela extra.
- **Desbloqueio pelo maior recorde pessoal** (qualquer placar): `game_rules.cosmetic_unlocks` repete os ids e `unlockScore` de `src/content/cosmetics.json` (KD-10), sem os itens grátis.
- **`content_version` só por pertinência** à lista aceita, que começa com o `CONTENT_VERSION` da KD-10 (`7691008a`). Toda mudança em `src/content/*.json` exige uma migration atualizando a lista (automação em issue `débito`).

---

## 11. Referências

**Documentação oficial**
- Supabase: [Pricing](https://supabase.com/pricing) · [Billing](https://supabase.com/docs/guides/platform/billing-on-supabase) · [Database size](https://supabase.com/docs/guides/platform/database-size) · [Disk size](https://supabase.com/docs/guides/platform/manage-your-usage/disk-size) · [MAU](https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users) · [Egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress.md) · [Passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless) · [Auth CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) · [API quickstart (leaderboard)](https://supabase.com/docs/guides/api/quickstart)
- Cloudflare: [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [Web Analytics](https://developers.cloudflare.com/analytics/web-analytics)
- [Vite — Static deploy](https://vite.dev/guide/static-deploy.html)
- [Phaser — template React](https://github.com/phaserjs/template-react)
- [PostHog — Pricing](https://posthog.com/pricing)
- [Sentry — Pricing](https://sentry.io/pricing/) · [Datadog — Pricing](https://www.datadoghq.com/pricing/)
- [TheMealDB API](https://www.themealdb.com/api.php)
- [Linear — Pricing](https://linear.app/pricing) · [GitHub — Issue dependencies (REST)](https://docs.github.com/en/rest/issues/issue-dependencies) · [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

**Fontes secundárias (agregadores, números divergentes, a confirmar nas páginas oficiais)**
- [Sentry vs Datadog — agentdeals](https://agentdeals.dev/datadog-vs-sentry)
- [RUM pricing compared](https://observability-pricing.pages.dev/category/rum/)
- [TheMealDB rate limits — apis.io](https://apis.io/rate-limits/mealdb/mealdb-rate-limits/)
- [Spoonacular rate limits — apis.io](https://apis.io/rate-limits/spoonacular/spoonacular-rate-limits/)

**Pesquisa de documentação:** context7 (`/supabase/supabase`, `/phaserjs/phaser/v4.2.1`, `/vitejs/vite`).
