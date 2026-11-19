# 🍳 Kitchen Dash

Jogo arcade de culinária 2D em visão top-down, ambientado num bistrô parisiense. Colete ingredientes, use as estações de preparo e entregue os pedidos antes que os clientes percam a paciência.

> **Status:** em desenvolvimento do MVP ([plano](docs/PLANO_MVP.md) · [board](https://github.com/users/davi-domingues/projects/3)).

## Projeto e integrantes

- **Tema:** jogo arcade de culinária para navegador, em partidas curtas, com ranking global e cosméticos.
- **Problema que resolve:** jogos casuais de cozinha costumam exigir instalação, conta e loja. O Kitchen Dash roda direto no navegador e também offline (PWA), deixa jogar sem criar conta e só pede login (código por e-mail, sem senha) para quem quer ranking e progresso sincronizado. As pontuações são validadas no servidor para manter o ranking confiável.
- **Integrantes** (grupo da organização Doceterapia, todos colaboradores do repositório):
  - Davi Domingues ([@davi-domingues](https://github.com/davi-domingues))
  - Davi Caproni ([@davicaproni](https://github.com/davicaproni))
  - Felipe Lima ([@FelipeLima24](https://github.com/FelipeLima24))
  - Gwen Raldes ([@gwenraldes](https://github.com/gwenraldes))
  - Maria Luiza Costa Góes ([@MariaLuizaCostaGoes](https://github.com/MariaLuizaCostaGoes))
  - Pedro Guimarães Sakaue ([@pedrosakaue](https://github.com/pedrosakaue))

A proposta da atividade está em [`docs/ATIVIDADE_SDD.md`](docs/ATIVIDADE_SDD.md).

## Framework utilizado

O grupo usou o **[GitHub Spec Kit](https://github.com/github/spec-kit)**, um framework de desenvolvimento orientado a especificação (SDD). O fluxo é `constitution → specify → clarify → plan → tasks → analyze → implement`, e está detalhado na seção [Desenvolvimento orientado a especificação](#desenvolvimento-orientado-a-especificação).

Por que o grupo o escolheu:

- **Funciona com vários agentes.** O time usa Claude Code, OpenCode, Codex CLI e GitHub Copilot, e o Spec Kit tem integração com todos eles. Os artefatos ficam em Markdown, então não dependem da ferramenta.
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
| [Atividade SDD](docs/ATIVIDADE_SDD.md) | Proposta da atividade da disciplina que orienta a entrega |
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

### Opção recomendada: versão publicada

O jogo já está publicado em **https://kitchen-dash-015.pages.dev**, com o front e a API (Supabase) de produção ligados. É o jeito mais simples de testar: basta abrir o link, sem instalar nada.

### Opção alternativa: rodar localmente

O projeto não tem uma API própria: o backend é o **Supabase** (Auth, Postgres, RLS e RPC). Para subir tudo na sua máquina:

1. Suba a API com `npm run db:start` e `npm run db:reset` (veja [Banco local](#banco-local-supabase)).
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
A forma de contar os pontos. O documento do jogo dizia apenas que havia "bônus de combo" e "gorjeta por rapidez", sem detalhar. Se deixássemos o agente decidir, ele teria inventado as regras: se o combo aumenta a cada entrega, quanto vale a gorjeta num modo sem cronômetro, qual pontuação é alta demais para ser verdade. Na etapa de esclarecimento, o próprio framework fez essas perguntas e nós respondemos juntos. Isso importou porque o servidor usa essas mesmas regras para recusar pontuações falsas no ranking. Uma escolha errada do agente faria o jogo rejeitar partidas legítimas. O mesmo aconteceu em outras partes, como decidir se o chef carrega a panela ou se ela fica presa no fogão.

**Que inconsistência a validação encontrou? Estava na spec ou no código?**
Encontramos dos dois tipos. Na documentação, o plano de uma tarefa trazia um limite de pedidos diferente do que o jogo precisava, e um documento técnico descrevia os controles de um jeito diferente do documento do jogo. No código, as regras salvas no banco de dados não batiam com os arquivos de conteúdo do jogo. Nos três casos, a causa foi a mesma informação estar escrita em dois lugares, e um deles ficou desatualizado. A validação, junto com a revisão dos pull requests e os testes, revelou essas diferenças antes de chegarem ao jogador.

**Como o framework ajudou (ou atrapalhou) a coordenação do grupo?**
Ajudou porque cada tarefa ganhou sua própria pasta com o que precisa ser feito, o plano e a lista de passos. Quem pegava uma tarefa que dependia do trabalho de outra pessoa já sabia o que esperar, sem precisar marcar reunião. Também funcionou bem com as diferentes ferramentas de IA que cada um usa.

Por outro lado, o processo é pesado no começo: cada tarefa gera vários arquivos antes da primeira linha de código. Por isso a escrita das specs acabou concentrada em quem já dominava o fluxo. No início, os nomes das pastas também ficaram sem padrão, e tarefas feitas ao mesmo tempo às vezes mexiam nos mesmos arquivos e geravam conflitos.

**O que fariam diferente com outro framework?**
Usaríamos o fluxo completo só onde ele faz diferença: regras do jogo, banco de dados e segurança. Para tarefas pequenas, como ajustes visuais, um framework mais leve como o OpenSpec seria suficiente. Também dividiríamos a escrita das specs entre todos desde o começo, para que ninguém ficasse sobrecarregado. Por fim, manteríamos cada regra em um único lugar, para não ter que corrigir a mesma coisa duas vezes.

## Deploy (Cloudflare Pages)

- Produção sai da `main` em https://kitchen-dash-015.pages.dev e cada branch com push ganha um **preview** automático.
- Como abrir o preview de uma branch, variáveis de ambiente e headers: veja [docs/DEPLOY.md](docs/DEPLOY.md).
- `public/_redirects` faz o fallback da SPA e `public/_headers` define CSP, cabeçalhos de segurança e cache imutável de `/assets/*`. O `src/deploy/headers.test.js` valida esse arquivo.

## Contribuição

Veja o [guia de contribuição](.github/CONTRIBUTING.md). Para relatar vulnerabilidades, siga a [política de segurança](.github/SECURITY.md).

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).

Kitchen Dash é uma obra original. Não é afiliado nem endossado pela Disney/Pixar ou por qualquer outra marca.
