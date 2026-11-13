# 🍳 Kitchen Dash

Jogo arcade de culinária 2D em visão top-down, ambientado num bistrô parisiense. Colete ingredientes, use as estações de preparo e entregue os pedidos antes que os clientes percam a paciência.

> **Status:** em especificação (Spec Driven Development). Ainda não há código da aplicação.

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

As instruções de instalação e execução serão adicionadas quando a primeira funcionalidade for implementada.

## Contribuição

Veja o [guia de contribuição](.github/CONTRIBUTING.md). Para relatar vulnerabilidades, siga a [política de segurança](.github/SECURITY.md).

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).

Kitchen Dash é uma obra original. Não é afiliado nem endossado pela Disney/Pixar ou por qualquer outra marca.
