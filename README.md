# 🍳 Kitchen Dash

Jogo arcade de culinária 2D em visão top-down, ambientado num bistrô parisiense. Colete ingredientes, use as estações de preparo e entregue os pedidos antes que os clientes percam a paciência.

> **Status:** em desenvolvimento do MVP ([plano](docs/PLANO_MVP.md) · [board](https://github.com/users/davi-domingues/projects/3)).

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

## Deploy (Cloudflare Pages)

- Produção sai da `main` em https://kitchen-dash-015.pages.dev e cada branch com push ganha um **preview** automático.
- Como abrir o preview de uma branch, variáveis de ambiente e headers: veja [docs/DEPLOY.md](docs/DEPLOY.md).
- `public/_redirects` faz o fallback da SPA e `public/_headers` define CSP, cabeçalhos de segurança e cache imutável de `/assets/*`. O `src/deploy/headers.test.js` valida esse arquivo.

## Contribuição

Veja o [guia de contribuição](.github/CONTRIBUTING.md). Para relatar vulnerabilidades, siga a [política de segurança](.github/SECURITY.md).

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).

Kitchen Dash é uma obra original. Não é afiliado nem endossado pela Disney/Pixar ou por qualquer outra marca.
