# Origem das skills

As skills de terceiros são copiadas **sem modificação** de um commit fixo e espelhadas em `.claude/skills/`. Para atualizar uma delas:

1. Baixe a pasta do novo commit fora do repo.
2. Revise o diff, olhando scripts, hooks, `allowed-tools`, URLs e instruções de buscar conteúdo remoto.
3. Atualize as duas cópias e esta tabela no mesmo commit.

Skills `speckit-*` são geradas pelo [Spec Kit](https://github.com/github/spec-kit) e não entram aqui.

| Skill | Origem | Commit | Licença | Observação da auditoria (2026-11-13) |
|---|---|---|---|---|
| `supabase` | [supabase/agent-skills](https://github.com/supabase/agent-skills/tree/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase) | `c9be0e9` | MIT | Só texto. Sugere configurar o MCP, mas não instala nada |
| `supabase-postgres-best-practices` | [supabase/agent-skills](https://github.com/supabase/agent-skills/tree/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase-postgres-best-practices) | `c9be0e9` | MIT | Só texto; 35 referências sob demanda |
| `verification-before-completion` | [obra/superpowers](https://github.com/obra/superpowers/tree/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion) | `22f0b46` | MIT | Só texto. Sem o plugin e sem o hook `SessionStart` |
| `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-best-practices) | `1a2c79d` | MIT | Só texto. Ignore as regras específicas de Next.js/RSC |
| `composition-patterns` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/composition-patterns) | `1a2c79d` | MIT | Só texto |
| `gha-security-review` | [getsentry/skills](https://github.com/getsentry/skills/tree/e94f22214528d69899d09c627b3315ddc3544816/skills/gha-security-review) | `e94f222` | Apache-2.0 | `allowed-tools: Read Grep Glob Bash Task`. Os payloads `curl \| bash` nas referências são exemplos de ataque |
| `security-best-practices` | [tech-leads-club/agent-skills](https://github.com/tech-leads-club/agent-skills/tree/e74dc8a7e8d59bb36f267afd089580e0858e224a/packages/skills-catalog/skills/(security)/security-best-practices) | `e74dc8a` | Apache-2.0 (`LICENSE.txt`), autor original openai/skills | Só texto |
| `web-accessibility` | [tech-leads-club/agent-skills](https://github.com/tech-leads-club/agent-skills/tree/e74dc8a7e8d59bb36f267afd089580e0858e224a/packages/skills-catalog/skills/(quality)/web-accessibility) | `e74dc8a` | MIT | Só texto |
| `gh-fix-ci` | [tech-leads-club/agent-skills](https://github.com/tech-leads-club/agent-skills/tree/e74dc8a7e8d59bb36f267afd089580e0858e224a/packages/skills-catalog/skills/(tooling)/gh-fix-ci) | `e74dc8a` | Apache-2.0 (`LICENSE.txt`), autor original openai/skills | `scripts/inspect_pr_checks.py` só roda `gh` de leitura (`pr checks`, `run view`, `api` GET). Requer Python |
| `web-perf` | [cloudflare/skills](https://github.com/cloudflare/skills/tree/cbf893b954222276bf1af57e5f23379231e0efb9/skills/web-perf) | `cbf893b` | Apache-2.0 | Só texto |

Avaliadas e **não** incluídas: `supabase` via plugin (traz MCP), superpowers `test-driven-development` e `systematic-debugging`, `web-design-guidelines` (baixa regras remotas sem versão a cada uso), `skill-scanner`, `sentry-instrument` e `sentry-debug-issue` (reavaliar na KD-40), `webapp-testing`, `cloudflare`, além de uma skill própria de Phaser.
