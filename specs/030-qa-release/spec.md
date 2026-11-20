# Feature Specification: QA final e release do MVP

**Feature Branch**: `docs/kd-46-qa-release` · **Issue**: #39 (KD-46) · **Status**: Implementada

## User Scenarios & Testing

### US1 — Checklist de lançamento (P1)
A pessoa responsável verifica a produção item a item antes da tag.
**Acceptance**: `docs/RELEASE_CHECKLIST.md` cobre os 4 itens da ARQUITETURA §9, Turnstile, limites de OTP, CSP, Sentry (DSN, source maps, sem PII), backups e riscos aceitos, environment production, migrations e advisors remotos, PWA, LGPD e acessibilidade; cada item é `- [ ]` com o como verificar.

### US2 — Partida de 2 jogadores em todos os modos (P1)
**Acceptance**: teste do core joga 2 jogadores até o fim no Clássico, Livre e Desafio e avalia o Desafio do dia; roteiro manual cobre teclado real e larguras 360/768/1280.

### US3 — Notas de release e versão (P2)
**Acceptance**: `docs/RELEASE_NOTES_v1.0.0.md` lista entregas KD/PR mergeadas e as previstas (PRs abertos #94–#106), débitos e riscos; `package.json` e lockfile em 1.0.0; a tag fica como `- [ ]` para a pessoa.

## Requirements
- **FR-001** Checklist ligado à ARQUITETURA §9 e ao escopo da issue.
- **FR-002** Teste automatizado sem dependência nova, determinístico (seed fixa).
- **FR-003** Política de versão registrada em ESTUDOS_E_DECISOES §13.9.
- **FR-004** Nenhum agente cria a tag.

## Assumptions (clarify resolvido pelos docs)
- "Verificado em produção" depende dos merges; fica `- [ ]` no checklist e no PR.
- Controlador e DPO da LGPD ficam a preencher pela pessoa.
- Sem E2E (D4): o fluxo com teclado real é manual.

## Success Criteria
- **SC-001** Gates locais e CI verdes.
- **SC-002** O teste novo passa nos 3 modos com 2 jogadores.
