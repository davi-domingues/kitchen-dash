# Implementation Plan: QA final e release do MVP

**Branch**: `docs/kd-46-qa-release` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/030-qa-release/spec.md`

## Summary

Fechar o MVP com documentação de lançamento (checklist, roteiro de QA, notas de release), um teste do core que joga 2 jogadores até o fim em cada modo, a política de versão e a versão 1.0.0. A tag fica para a pessoa.

## Technical Context

**Language/Version**: JavaScript ESM (Node 22 no CI)
**Primary Dependencies**: nenhuma nova; Vitest para o teste
**Storage**: N/A (não toca o banco)
**Testing**: Vitest, seed fixa, sem rede
**Target Platform**: web (Cloudflare Pages)
**Project Type**: aplicação web única
**Performance Goals**: N/A; o orçamento de JS inicial (≤ 250 KiB) não muda
**Constraints**: sem dependência nova; core puro; sem criar tag
**Scale/Scope**: 3 documentos, 1 teste, 1 seção de decisão, versão

## Constitution Check

| Princípio | Situação |
|---|---|
| I. Funciona sem rede | O roteiro e o checklist verificam o offline (PWA). OK |
| II. Cliente não confiável | O checklist cobre a RPC, o Turnstile e os limites de OTP. OK |
| III. Regras separadas da renderização | O teste usa só `game/core`, sem Phaser. OK |
| IV. Conteúdo é dado | Nada hardcoded; o teste usa o conteúdo real. OK |
| V. Fornecedores atrás de interfaces | Não toca `services/`. OK |
| VI. Plano gratuito | Os riscos do plano gratuito (sem PITR, pausa) ficam registrados. OK |

Nenhuma violação. Reavaliado após o desenho: sem mudança.

## Project Structure

### Documentation (this feature)

```text
specs/030-qa-release/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

Sem `contracts/`: a entrega não expõe interface nova.

### Source Code (repository root)

```text
src/game/core/twoPlayerMatch.test.js
docs/RELEASE_CHECKLIST.md
docs/QA_MANUAL_v1.0.0.md
docs/RELEASE_NOTES_v1.0.0.md
docs/ESTUDOS_E_DECISOES.md   (§13.9)
package.json, package-lock.json   (1.0.0)
```

**Structure Decision**: projeto único; documentos de release em `docs/` e teste junto do core.

## Complexity Tracking

Nenhuma violação a justificar.
