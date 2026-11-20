# Research: Auditoria de dependências de desenvolvimento

- **Decision**: passo adicional `npm audit --audit-level=moderate` sem `--omit=dev`.
  **Rationale**: ferramentas de dev (eslint, vite, vitest) rodam no CI e na máquina de quem contribui; advisories moderados nelas (caso do `minimatch`, #55) ficaram invisíveis com `--omit=dev` + `high`.
  **Alternatives considered**: trocar o passo existente por um só (rejeitado: o pedido manda manter o gate original explícito); nível `low` (rejeitado: ruído alto, pouco valor); depender só do Dependabot (rejeitado: não barra merge).
