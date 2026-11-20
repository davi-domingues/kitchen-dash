# Quickstart: validar a auditoria

1. `npm ci`
2. `npm audit --audit-level=moderate` → esperado: `found 0 vulnerabilities`, código de saída 0.
3. `npm audit --audit-level=high --omit=dev` → esperado: código de saída 0.
4. No PR, o check **Qualidade** mostra os dois passos de auditoria verdes.
