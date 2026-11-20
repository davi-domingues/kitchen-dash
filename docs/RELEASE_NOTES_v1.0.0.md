# Kitchen Dash v1.0.0 — notas de release

Primeira versão pública do MVP (marco **M3 · Lançamento** do [PLANO_MVP](PLANO_MVP.md)). Fecha a KD-46 (issue #39).

> A tag `v1.0.0` ainda **não** existe. Ela é criada por uma pessoa depois de todos os merges abaixo e da verificação em produção pelo [RELEASE_CHECKLIST](RELEASE_CHECKLIST.md).

## O que o MVP entrega

- **Jogo cooperativo na cozinha**, para 1 ou 2 jogadores no mesmo teclado, nos modos **Clássico** (3 min), **Livre** e **Desafio** (12 pedidos com seed fixa), mais o **Desafio do dia**.
- **Jogar sem login**, com progresso, recordes e cosméticos locais.
- **Login por OTP de e-mail** com Turnstile; ao entrar, os dados locais migram para a conta.
- **Ranking global** paginado, gravado só pela RPC `submit_score` com validação e rate limit.
- **Cosméticos** desbloqueados jogando, locais e na conta.
- **Acessibilidade e controles**: opções básicas e remapeamento de teclas.
- **Operação**: Sentry sem PII, CSP, orçamento de tamanho, CI com gates e deploy na Cloudflare Pages.

## Mergeado na `main`

| Área | Entregas |
|---|---|
| Base e harness | Harness do time #42 · constituição #43 · KD-02 scaffold #44 · KD-03 qualidade local #45 · KD-04 CI e Dependabot #46 · Bump minimatch/eslint #47 · KD-08 i18n #48 · KD-07 serviços base #49 · KD-42 orçamento de tamanho #50 · KD-06 Supabase local #51 · KD-05 Cloudflare Pages e CSP #53 · KD-40 Sentry #54 |
| Core do jogo | KD-10 conteúdo JSON #57 · KD-11 MatchState #58 · KD-12 estações #62 · KD-13 pedidos #63 · KD-14 pontuação #64 · KD-15 modos #77 · KD-24 desafio do dia #93 · auto-uso de estações (#89) #92 |
| Phaser e input | KD-16 base Phaser #52 · KD-17 InputMap #59 · KD-18 cena Kitchen #65 · KD-20 HUD #78 · KD-19 visual do protótipo #82 · remapeamento de teclas #85 e #88 |
| App e conta | KD-21 telas #60 · KD-22 progresso local #66 · KD-23 cosméticos locais #79 · KD-33 login OTP #68 · KD-35 envio de pontuação #69 · KD-37 migração local → conta #81 · KD-38 cosméticos na conta #80 · KD-43 acessibilidade #84 |
| Banco | KD-30 schema e RLS #61 · KD-31 RPC `submit_score` #67 · KD-32 exclusão de conta e retenção #86 · KD-36 ranking global #83 · versão de conteúdo no CI (#56) #87 |
| Documentação | Plano do MVP #40 · MCPs #41 · README de entrega #91 |

## Previstos nesta release (PRs abertos)

| PR | Entrega |
|---|---|
| #94 | Specs unificadas da tela de remapear teclas |
| #95 | Débito #73: migra partidas de visitante jogadas após a migração |
| #96 | Débito #56: gera a migration de versão de conteúdo por comando |
| #97 | KD-45: aplica migrations e envia source maps no deploy de produção |
| #98 | Débito #70: testes de componente das telas principais |
| #99 | Débito #72: estado de envio ao ranking no resultado |
| #100 | KD-41: PWA offline e aviso de atualização |
| #101 | Débito #90: volta ao menu e reporta ao Sentry erro no Phaser |
| #102 | KD-34: nome de exibição, sync e exclusão de conta no perfil |
| #103 | Débito #76: teste concorrente opcional de `submit_score` |
| #104 | Débito #74: fila de retry ao gravar o cosmético equipado |
| #105 | Débito #71: reporta ao Sentry partidas descartadas do envio |
| #106 | KD-44: política de privacidade (LGPD), empilhado no #102 |
| este PR | KD-46: checklist, QA, notas de release e versão 1.0.0 |

## Débitos resolvidos

#56, #70, #71, #72, #73, #74, #76 e #90, pelos PRs acima (os abertos contam quando mergeados).

## Riscos conhecidos

- **Backups**: sem PITR no plano gratuito do Supabase; um incidente pode perder até 24 h de dados.
- **Trapaça**: a validação de plausibilidade da RPC reduz, mas não elimina, pontuação forjada no cliente.
- **Pausa por inatividade** do projeto gratuito do Supabase.
- **LGPD**: controlador e encarregado (DPO) ainda a preencher na política.
- **Sem E2E automatizado** no MVP (decisão D4); o fluxo completo depende do [roteiro manual](QA_MANUAL_v1.0.0.md).
