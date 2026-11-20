# Implementation Plan: Auditoria de dependências de desenvolvimento no nível moderado

**Branch**: `ci/debito-55-audit-dev` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

Acrescentar ao job Qualidade (`.github/workflows/ci.yml`) um passo `npm audit --audit-level=moderate` (todas as dependências), logo após o passo existente `npm audit --audit-level=high --omit=dev`, com a mesma condição `steps.app.outputs.existe == 'true'`. Registrar a decisão em ESTUDOS_E_DECISOES §13.10 e atualizar a descrição dos gates em AGENTS §3 e SYSTEM_DESIGN.

## Technical Context

**Language/Version**: YAML do GitHub Actions; Node/npm já configurados no job
**Primary Dependencies**: nenhuma nova
**Testing**: execução local de `npm audit --audit-level=moderate` (0 vulnerabilidades) e o próprio CI do PR
**Project Type**: pipeline de CI
**Constraints**: sem novas actions; `permissions:` inalteradas; gate não afrouxado (só endurecido)

## Constitution Check

- Gates determinísticos não são afrouxados: o passo novo só endurece o check Qualidade. PASS
- Sem dependência nova. PASS
- Decisão registrada em ESTUDOS_E_DECISOES no mesmo PR. PASS

## Project Structure

```text
.github/workflows/ci.yml       # passo novo no job Qualidade
docs/ESTUDOS_E_DECISOES.md     # §13.10
docs/SYSTEM_DESIGN.md          # descrição do npm audit
AGENTS.md                      # tabela de gates
```

## Phase 0 / Phase 1

- [research.md](research.md); sem entidades de dados nem contratos externos (data-model e contracts não se aplicam). [quickstart.md](quickstart.md) descreve a validação.
