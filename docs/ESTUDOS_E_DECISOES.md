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
| RNFs do MVP | i18n (pt-BR), acessibilidade básica, PWA, orçamento de tamanho | Performance de runtime vai para o ROADMAP |
| E-mail OTP | SMTP padrão agora, Resend antes do lançamento | O SMTP padrão tem limite baixo de envios por hora |

---

## 8. Referências

**Documentação oficial**
- Supabase: [Pricing](https://supabase.com/pricing) · [Billing](https://supabase.com/docs/guides/platform/billing-on-supabase) · [Database size](https://supabase.com/docs/guides/platform/database-size) · [Disk size](https://supabase.com/docs/guides/platform/manage-your-usage/disk-size) · [MAU](https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users) · [Egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress.md) · [Passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless) · [Auth CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) · [API quickstart (leaderboard)](https://supabase.com/docs/guides/api/quickstart)
- Cloudflare: [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [Web Analytics](https://developers.cloudflare.com/analytics/web-analytics)
- [Vite — Static deploy](https://vite.dev/guide/static-deploy.html)
- [Phaser — template React](https://github.com/phaserjs/template-react)
- [PostHog — Pricing](https://posthog.com/pricing)
- [Sentry — Pricing](https://sentry.io/pricing/) · [Datadog — Pricing](https://www.datadoghq.com/pricing/)
- [TheMealDB API](https://www.themealdb.com/api.php)

**Fontes secundárias (agregadores, números divergentes, a confirmar nas páginas oficiais)**
- [Sentry vs Datadog — agentdeals](https://agentdeals.dev/datadog-vs-sentry)
- [RUM pricing compared](https://observability-pricing.pages.dev/category/rum/)
- [TheMealDB rate limits — apis.io](https://apis.io/rate-limits/mealdb/mealdb-rate-limits/)
- [Spoonacular rate limits — apis.io](https://apis.io/rate-limits/spoonacular/spoonacular-rate-limits/)

**Pesquisa de documentação:** context7 (`/supabase/supabase`, `/phaserjs/phaser/v4.2.1`, `/vitejs/vite`).
