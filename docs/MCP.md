# Kitchen Dash — MCPs do time

Servidores MCP (Model Context Protocol) compartilhados pelo time para **Claude Code**, **OpenCode** e **Codex CLI**. Todos vêm **desabilitados por padrão**: cada pessoa liga só o que vai usar, na própria máquina.

Somente servidores **oficiais** dos fornecedores, preferindo os remotos (HTTP) com login OAuth. Nenhum token fica no repositório.

## Arquivos

| Ferramenta | Arquivo versionado | Como fica desligado |
|---|---|---|
| Claude Code | [`.mcp.json`](../.mcp.json) + [`.claude/settings.json`](../.claude/settings.json) | Servidores de projeto não conectam até cada pessoa aprová-los; o settings compartilhado fixa `enableAllProjectMcpServers: false` e não aprova nenhum |
| OpenCode | [`opencode.json`](../opencode.json) | `"enabled": false` em cada servidor |
| Codex CLI | [`.codex/config.toml`](../.codex/config.toml) | `enabled = false` em cada servidor |

## Servidores

| Nome | Para quê | Login | Risco | Claude | OpenCode | Codex |
|---|---|---|---|:-:|:-:|:-:|
| `context7` | Docs atualizadas de React, Phaser, Vite, Tailwind, daisyUI, Supabase etc. | Nenhum (API key opcional) | Baixo (só leitura) | ✅ | ✅ | ✅ |
| `supabase` | Consultar schema, logs, advisors, docs e gerar tipos | OAuth (conta Supabase) | **Alto** se apontar para produção. Configurado `read_only=true` | ✅ | ✅ | ✅ |
| `sentry` | Investigar erros de React/Phaser em produção | OAuth (conta Sentry) | Médio (lê dados de produção) | ✅ | ✅ | ✅ |
| `github` | Issues, PRs, Actions, código do repositório | PAT em `GITHUB_PAT` | Médio (escreve em issues/PRs) | ✅ | ✅ | ✅ |
| `linear` | Backlog e tarefas no Linear | OAuth (conta Linear) | Médio (escreve em issues) | ✅ | ✅ | ✅ |
| `cloudflare-docs` | Docs da Cloudflare (Pages, Turnstile, Workers) | Nenhum | Baixo | ✅ | ✅ | ✅ |
| `cloudflare` | API completa da Cloudflare (Pages, DNS, deploys) | OAuth (conta Cloudflare) | **Alto** (pode alterar a conta) | ✅ | ✅ | ✅ |
| `figma` | Ler designs e gerar código a partir do Figma | OAuth (conta Figma) | Baixo | ✅ | ❌¹ | ✅ |
| `playwright` | Controlar um navegador para testar o jogo (futuros testes E2E) | Nenhum (local, via `npx`) | Médio (navega e executa ações) | ✅ | ✅ | ✅ |

¹ O Figma só aceita clientes do catálogo oficial; o OpenCode não está listado.

Fontes oficiais: [Context7](https://context7.com/docs/resources/all-clients) · [Supabase](https://supabase.com/docs/guides/getting-started/mcp) · [Sentry](https://mcp.sentry.dev/) · [GitHub](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md) · [Linear](https://linear.app/docs/mcp) · [Cloudflare](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/) · [Figma](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) · [Playwright](https://github.com/microsoft/playwright-mcp)

## Como habilitar

### Claude Code

Docs: [MCP](https://code.claude.com/docs/en/mcp) · [settings](https://code.claude.com/docs/en/settings-reference).

1. Rode `claude` na raiz do projeto e aceite o diálogo de confiança da pasta.
2. No diálogo de servidores do `.mcp.json`, marque **apenas** os que vai usar. A escolha fica no seu `.claude/settings.local.json` (fora do git).
   - Alternativa: crie/edite `.claude/settings.local.json`:
     ```json
     { "enabledMcpjsonServers": ["context7", "supabase"] }
     ```
3. Para servidores com OAuth, rode `/mcp`, escolha o servidor e **Authenticate**.
4. Para desligar de novo: toggle no `/mcp`, ou `claude mcp reset-project-choices` para refazer todas as escolhas.

> **Não** adicione `disabledMcpjsonServers` ao `.claude/settings.json` compartilhado: uma rejeição em qualquer arquivo vence, e ninguém conseguiria religar o servidor localmente. Use essa chave só no seu `settings.local.json`.
>
> Em `claude -p`/Agent SDK não há diálogo e os servidores de projeto carregam sem perguntar. Em execuções automatizadas use `--strict-mcp-config` ou `disabledMcpjsonServers` no seu `settings.local.json`.

### OpenCode

Docs: [MCP servers](https://opencode.ai/docs/mcp-servers/).

Não edite o `opencode.json` versionado para ligar um servidor. Sobrescreva no seu config global (`~/.config/opencode/opencode.json[c]`):

```jsonc
{
  "mcp": {
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp", "oauth": false, "enabled": true }
  }
}
```

Se o merge não ficar como esperado, altere `"enabled": false` → `true` no `opencode.json` do projeto **sem commitar** a mudança. Para OAuth: `opencode mcp auth <servidor>`. Confira com `opencode mcp list`.

> O arquivo usa o formato `mcp.<nome>` + `enabled`, aceito pelo OpenCode 1.x e 2.x. O 2.x também tem o formato novo `mcp.servers.<nome>` + `disabled`, mas na 2.2.2 o `opencode mcp list` não mostra servidores declarados nele; por isso ficamos com o formato compatível.

### Codex CLI

Docs: [MCP no Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

1. Marque o projeto como confiável (o Codex só lê `.codex/config.toml` em projetos *trusted*).
2. Ligue o servidor no seu `~/.codex/config.toml`, repetindo o bloco com `enabled = true`, ou mude `enabled = true` no arquivo do projeto **sem commitar**.
3. Para OAuth: `codex mcp login <servidor>`. Confira com `/mcp` dentro do Codex.

## Variáveis de ambiente

Ficam no ambiente do seu terminal (ou num gerenciador de segredos), **nunca** em arquivos versionados. Nomes em [`.env.example`](../.env.example).

| Variável | Usada por | Como obter |
|---|---|---|
| `GITHUB_PAT` | `github` | GitHub → Settings → Developer settings → *Fine-grained token*, só neste repositório, com Issues/PRs/Contents conforme a necessidade |
| `CONTEXT7_API_KEY` (opcional) | `context7` | [context7.com/dashboard](https://context7.com/dashboard). Sem chave funciona com limite menor. Para usar, adicione o header `Authorization: Bearer ...` no seu escopo local |

Os demais servidores usam OAuth no navegador e guardam o login na própria ferramenta.

## Segurança

- **Supabase:** só aponte para o projeto de **desenvolvimento**. Mantenha `read_only=true`; para escopar a um projeto, adicione `&project_ref=<ref-do-projeto-dev>` à URL no seu escopo local. Migrations passam pelo Supabase CLI e por revisão de PR, não pelo MCP.
- **Sentry:** prefira escopar a URL a `/mcp/<org>/<projeto>` quando o projeto existir.
- **Cloudflare (`cloudflare`):** tem acesso de escrita à conta. Ligue só quando precisar e desligue depois; para consulta use `cloudflare-docs`.
- **GitHub:** token *fine-grained*, só deste repositório, com expiração curta. Para só leitura, adicione o header `X-MCP-Readonly: true`.
- **Aprovação manual:** mantenha a confirmação de cada chamada de ferramenta ligada. Dados vindos de issues, logs e páginas podem conter *prompt injection*.
- **Nunca** commite tokens, `.env` ou `.claude/settings.local.json`.
- Antes de adicionar um MCP novo: precisa ser oficial do fornecedor e entrar aqui desabilitado, com risco documentado.
