# Feature Specification: Pipeline de produção (KD-45)

**Feature Branch**: `ci/kd-45-deploy-migrations-sourcemaps`
**Created**: 2026-11-20
**Status**: Draft
**Input**: KD-45 (#38): aplicar migrations em produção no merge da `main` e publicar source maps do Sentry com release igual ao SHA do commit (escopo herdado da KD-40, #33).

## Clarifications

### Session 2026-11-20

Resolvidas pelos docs (sem pergunta à pessoa, por orientação da sessão):

- Q: Onde roda o envio dos source maps? → A: No build da Cloudflare Pages (único build que gera o site publicado; docs/DEPLOY.md).
- Q: Previews enviam mapas? → A: Não; o token só existe no ambiente Production da Cloudflare.
- Q: Novo workflow ou job no ci.yml? → A: Workflow próprio, para não misturar permissões de produção com os checks de PR.

## User Scenarios & Testing

### User Story 1 - Merge aplica o schema em produção (Priority: P1)

Quem mantém o projeto faz merge de um PR com migration nova e o banco de produção recebe a migration sem nenhum passo manual, respeitando a aprovação configurada no ambiente de produção.

**Independent Test**: merge de uma migration na `main` gera uma execução que aplica só as migrations pendentes; um PR nunca dispara essa execução.

**Acceptance Scenarios**:

1. **Given** um push na `main`, **When** o pipeline roda, **Then** as migrations pendentes são aplicadas no projeto de produção e a execução fica registrada no ambiente `production`.
2. **Given** um pull request, **When** o CI roda, **Then** nenhuma etapa com acesso a produção é executada.
3. **Given** dois merges seguidos, **When** ambos disparam, **Then** as aplicações não rodam em paralelo.

### User Story 2 - Erros de produção com stack legível (Priority: P2)

Quem investiga um erro no Sentry vê arquivo, linha e função do código-fonte original, e o erro aponta para a release do commit publicado.

**Independent Test**: build com o token gera release = SHA, envia os mapas e não deixa nenhum `.map` no artefato publicado; build sem token funciona igual ao de hoje.

**Acceptance Scenarios**:

1. **Given** um build de produção com o token do Sentry, **When** termina, **Then** os mapas foram enviados para a release igual ao SHA do commit, o app reporta essa mesma release e `dist/` não contém `.map`.
2. **Given** um build local ou de PR sem token, **When** roda, **Then** conclui sem tentar enviar nada.

### Edge Cases

- Sem migration pendente: a aplicação termina sem mudanças.
- Falha da migration: a execução falha visivelmente e o deploy do banco não é marcado como sucesso.
- `.map` remanescente no `dist/` não pode inflar o orçamento de tamanho.

## Requirements

### Functional Requirements

- **FR-001**: Migrations são aplicadas em produção apenas em push na `main`, nunca em PR.
- **FR-002**: A aplicação roda no ambiente `production`, permitindo aprovação manual configurável.
- **FR-003**: Execuções de produção são serializadas, sem cancelar uma em andamento.
- **FR-004**: Credenciais ficam apenas em segredos e nunca são impressas.
- **FR-005**: O envio de source maps só ocorre quando o token existe.
- **FR-006**: A release enviada e a release reportada pelo app são o SHA do commit.
- **FR-007**: Nenhum `.map` é publicado; o orçamento de tamanho ignora `.map`.

## Success Criteria

- **SC-001**: 100% dos merges na `main` com migration resultam em schema de produção atualizado sem passo manual além da aprovação opcional.
- **SC-002**: 0 execuções com acesso a produção disparadas por PR.
- **SC-003**: Erros de produção mostram nome de arquivo e linha originais.
- **SC-004**: 0 arquivos `.map` no site publicado.

## Assumptions

- O front continua publicado pela integração Git da Cloudflare Pages (docs/DEPLOY.md); o envio de mapas roda no build da Cloudflare, que conhece o SHA (`CF_PAGES_COMMIT_SHA`).
- Segredos e variáveis do GitHub já cadastrados pela pessoa; o token do Sentry na Cloudflare é passo manual.
- Previews sem token não enviam mapas (só produção recebe o token).
