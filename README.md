# 🍳 Kitchen Dash

Jogo arcade de culinária 2D em visão top-down, ambientado num bistrô parisiense. Colete ingredientes, use as estações de preparo e entregue os pedidos antes que os clientes percam a paciência.

> **Status:** em desenvolvimento do MVP ([plano](docs/PLANO_MVP.md) · [board](https://github.com/users/davi-domingues/projects/3)).

## Projeto e integrantes

- **Tema:** jogo arcade de culinária para navegador, em partidas curtas, com ranking global e cosméticos.
- **Problema que resolve:** jogos casuais de cozinha costumam exigir instalação, conta e loja. O Kitchen Dash roda direto no navegador e também offline (PWA), deixa jogar sem criar conta e só pede login (código por e-mail, sem senha) para quem quer ranking e progresso sincronizado. As pontuações são validadas no servidor para manter o ranking confiável.
- **Integrantes:**
  - Davi Domingues ([@davi-domingues](https://github.com/davi-domingues))
  - Davi Caproni ([@davicaproni](https://github.com/davicaproni))
  - Felipe Lima ([@FelipeLima24](https://github.com/FelipeLima24))
  - Pedro Sakaue ([@pedrosakaue](https://github.com/pedrosakaue))

## Framework utilizado

O grupo usou o **[GitHub Spec Kit](https://github.com/github/spec-kit)**, um framework de desenvolvimento orientado a especificação (SDD). O fluxo é `constitution → specify → clarify → plan → tasks → analyze → implement`, e está detalhado na seção [Desenvolvimento orientado a especificação](#desenvolvimento-orientado-a-especificação).

Por que o grupo o escolheu:

- **Funciona com vários agentes.** O time usa Claude Code, OpenCode e Codex CLI, e o Spec Kit tem integração para os três. Os artefatos ficam em Markdown, então não dependem da ferramenta.
- **Spec antes do código.** Cada task KD-XX ganha spec, plano e tarefas antes da implementação. Isso reduz decisões tomadas sozinhas pelo agente (AGENTS.md, regra 1: "não assuma, pergunte").
- **Constituição única.** Os princípios do projeto, como core determinístico, RLS e conteúdo como dado, ficam em [`.specify/memory/constitution.md`](.specify/memory/constitution.md), e todo plano é checado contra eles.
- **Rastreabilidade.** Cada pasta em `specs/` tem o mesmo nome da issue e da branch, o que facilita a revisão do PR.

## Funcionalidades previstas (MVP)

- Partidas rápidas sem precisar criar conta.
- Login sem senha, por código enviado ao e-mail (OTP).
- Ranking global com validação das pontuações no servidor.
- Cosméticos desbloqueados jogando.
- Jogo offline (PWA) e interface preparada para tradução (pt-BR primeiro).

## Stack

| Camada | Tecnologia |
|---|---|
| Aplicação | React + JavaScript + Vite |
| Jogo | Phaser 3.90 |
| Interface | Tailwind CSS v4, daisyUI 5, Lucide, React Router |
| Dados remotos | TanStack Query |
| Backend (BaaS) | Supabase: Auth (OTP), PostgreSQL, RLS, RPC |
| Hospedagem | Cloudflare Pages |
| Qualidade | Vitest, ESLint, Prettier, Sentry |

## Documentação

| Documento | Conteúdo |
|---|---|
| [PRD](docs/PRD.md) | Visão de produto, mecânicas e modos de jogo |
| [Arquitetura](docs/ARQUITETURA.md) | Visão de alto nível e decisões de stack |
| [System Design](docs/SYSTEM_DESIGN.md) | Decisões técnicas: dados, segurança, confiabilidade, custos |
| [Estudos e Decisões](docs/ESTUDOS_E_DECISOES.md) | Comparações, previsões e referências que embasaram as escolhas |
| [Plano do MVP](docs/PLANO_MVP.md) | Tasks do MVP, dependências, ordem e paralelização |
| [Roadmap](docs/ROADMAP.md) | Itens fora do MVP, por prioridade |
| [AGENTS.md](AGENTS.md) | Contrato de trabalho para pessoas e agentes de IA: workflow, padrões e gates |
| [Deploy](docs/DEPLOY.md) | Cloudflare Pages: produção, previews por branch, variáveis e headers |
| [MCPs](docs/MCP.md) | Servidores MCP do time (Claude Code, OpenCode, Codex), desabilitados por padrão |

## Desenvolvimento orientado a especificação

O projeto usa o [GitHub Spec Kit](https://github.com/github/spec-kit), com integrações para **Claude Code** (padrão), **OpenCode** e **Codex CLI**.

| Etapa | Comando |
|---|---|
| Princípios do projeto | `/speckit-constitution` |
| Especificar uma funcionalidade | `/speckit-specify` |
| Esclarecer ambiguidades (opcional) | `/speckit-clarify` |
| Planejar a implementação | `/speckit-plan` |
| Gerar tarefas | `/speckit-tasks` |
| Checar consistência (opcional) | `/speckit-analyze` |
| Implementar | `/speckit-implement` |

Pré-requisitos para rodar o CLI: Python 3.11+, [uv](https://docs.astral.sh/uv/) e `uv tool install specify-cli`.

## Como rodar

O projeto não tem uma API própria: o backend é o **Supabase** (Auth, Postgres, RLS e RPC). Para subir tudo localmente:

1. Suba a "API" com `npm run db:start` e `npm run db:reset` (veja [Banco local](#banco-local-supabase)).
2. Suba o front com `npm run dev`.

Sem o banco local o jogo também roda, mas só no modo visitante.

Pré-requisito: Node 24 (veja `.nvmrc`).

```sh
npm ci                                # instala as dependências exatas do lockfile
git config core.hooksPath .githooks   # ativa os gates locais (uma vez por clone)
npm run dev                           # http://localhost:5173 (home) e /jogar (canvas do Phaser)
npm run build                         # build de produção em dist/
npm run preview                       # serve o build localmente
```

### Banco local (Supabase)

Pré-requisito: Docker Desktop aberto, com cerca de 8 GB livres em disco para as imagens. O Supabase CLI já vem nas devDependencies.

```sh
npm run db:start    # sobe Postgres, Auth, Studio e Mailpit; imprime URL e chaves locais
npm run db:reset    # recria o banco aplicando supabase/migrations/ e supabase/seed.sql
npm run db:status   # mostra as URLs e chaves da stack local
npm run db:stop     # para os containers
```

- Copie a URL da API e a chave publicável do `db:status` para o seu arquivo de ambiente local (veja `.env.example`). As chaves locais são de desenvolvimento e não valem em produção.
- O Studio fica em http://127.0.0.1:54323 e os e-mails de OTP chegam no Mailpit, em http://127.0.0.1:54324.
- Schema muda só por migration: `npx supabase migration new <nome>`, depois `npm run db:reset` para testar (AGENTS.md §6).

## Onde estão os artefatos

| Artefato | Caminho |
|---|---|
| Constituição (princípios do Spec Kit) | [`.specify/memory/constitution.md`](.specify/memory/constitution.md) |
| Specs por task | [`specs/<task>/spec.md`](specs/) (ex.: [`specs/kd-14-core-pontuacao/spec.md`](specs/kd-14-core-pontuacao/spec.md)) |
| Planos por task | `specs/<task>/plan.md`, com `research.md`, `data-model.md`, `contracts/` e `quickstart.md` |
| Tarefas por task | `specs/<task>/tasks.md` |
| Checklists de qualidade da spec | `specs/<task>/checklists/` |
| Plano geral do MVP (tasks KD-XX, ondas, dependências) | [`docs/PLANO_MVP.md`](docs/PLANO_MVP.md) |
| Board (status e responsável de cada task) | [GitHub Projects](https://github.com/users/davi-domingues/projects/3) |
| Issues | [github.com/davi-domingues/kitchen-dash/issues](https://github.com/davi-domingues/kitchen-dash/issues) |
| Pull requests (quem implementou e quem revisou) | [github.com/davi-domingues/kitchen-dash/pulls](https://github.com/davi-domingues/kitchen-dash/pulls?q=is%3Apr) |

Quem fez cada tarefa aparece no responsável da issue, no board e no autor do PR que a fecha (`Closes #N`).

## Reflexão

**Que decisão o agente teria tomado sozinho e a spec evitou?**
As regras de pontuação. O PRD diz só "combo de +10" e "gorjeta por rapidez". Sem a etapa `/speckit-clarify`, o agente teria escolhido sozinho se o combo cresce a cada entrega e quanto vale a gorjeta no modo Livre, que não tem paciência. A spec da KD-14 fixou as três respostas: combo fixo de +10, gorjeta 0 no Livre e teto de 15 pontos/s mais folga. Esse teto virou a validação de plausibilidade da RPC `submit_score`. Se o agente tivesse escolhido um combo crescente, o servidor rejeitaria pontuações legítimas. Outros exemplos parecidos: a panela fixa no fogão (KD-12) e a paciência só para comandas visíveis (KD-13).

**Que inconsistência a validação encontrou? Estava na spec ou no código?**
Houve dos dois tipos:
- **Na documentação/spec:** o plano da KD-13 tinha o limite de pedidos ativos errado (corrigido em `e21cd71`), e o SYSTEM_DESIGN descrevia controles diferentes dos do PRD (corrigido em `137ac1c`).
- **No código:** a tabela `game_rules` do banco estava fora de sincronia com o conteúdo JSON e com a `CONTENT_VERSION` da KD-10 (corrigido em `747c284`).

O ponto em comum é que a mesma regra estava escrita em dois lugares. A validação cruzada (`/speckit-analyze`, revisão de PR e os testes) foi o que expôs a divergência.

**Como o framework ajudou (ou atrapalhou) a coordenação do grupo?**
- **Ajudou:**
  - Cada task virou uma pasta `specs/<task>` com contrato explícito (`contracts/`). Assim, quem pegava uma task dependente, como a cena Phaser (KD-18) consumindo o core (KD-11 a KD-15), sabia exatamente o que esperar sem reunião.
  - O mesmo fluxo funcionou em Claude Code, OpenCode e Codex.
- **Atrapalhou:**
  - O custo inicial por task é alto: são cerca de 8 arquivos antes do primeiro código. Por isso a maior parte das specs ficou concentrada em quem mais dominava o fluxo.
  - A numeração automática gerou nomes fora do padrão (`001-kd17-inputmap`, `001-rpc-submit-score`, `002-global-ranking`) até o grupo padronizar em `kd-XX-...`.
  - Specs paralelas que mexiam no mesmo arquivo geraram merges da `main` com conflitos, por exemplo nas chaves de i18n (`9bcff67`).

**O que fariam diferente com outro framework?**
- Com um framework mais leve, ou com o Spec Kit em modo reduzido, as tasks pequenas (HUD, ajustes visuais) usariam só spec e tarefas, e o fluxo completo ficaria reservado para core, banco e segurança.
- O grupo também dividiria a escrita das specs desde o início, para que cada integrante dominasse o fluxo, e geraria parte da documentação a partir de uma fonte única (ex.: `game_rules` derivada do `content/*.json`). Assim a mesma regra não ficaria escrita em dois lugares.

> Reflexão escrita a partir das evidências do repositório (clarificações nas specs e commits de correção). Ainda está pendente de revisão do grupo.

## Deploy (Cloudflare Pages)

- Produção sai da `main` em https://kitchen-dash-015.pages.dev e cada branch com push ganha um **preview** automático.
- Como abrir o preview de uma branch, variáveis de ambiente e headers: veja [docs/DEPLOY.md](docs/DEPLOY.md).
- `public/_redirects` faz o fallback da SPA e `public/_headers` define CSP, cabeçalhos de segurança e cache imutável de `/assets/*`. O `src/deploy/headers.test.js` valida esse arquivo.

## Contribuição

Veja o [guia de contribuição](.github/CONTRIBUTING.md). Para relatar vulnerabilidades, siga a [política de segurança](.github/SECURITY.md).

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).

Kitchen Dash é uma obra original. Não é afiliado nem endossado pela Disney/Pixar ou por qualquer outra marca.
