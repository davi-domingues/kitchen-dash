# Feature Specification: Privacidade (LGPD) — política e exclusão acessível

**Feature Branch**: `feat/kd-44-privacidade-lgpd`
**Created**: 2026-11-20
**Status**: Draft
**Input**: KD-44 (issue #37): página de política de privacidade (dados coletados: e-mail e nome), link no rodapé e link para a exclusão de conta no perfil e na política.

## Clarifications

### Session 2026-11-20

Resolvidas pelos docs (SYSTEM_DESIGN D7, D9, D11, D13 e §6.4), sem perguntar:

- Q: Quem é o controlador e qual o contato do encarregado? → A: Não inventar. A página mostra marcadores "[a definir]" e o PR lista os itens para a pessoa preencher.
- Q: A política precisa de banner de cookies? → A: Não; o MVP não usa cookies de analytics (D13). A política diz isso.
- Q: Onde fica o rodapé? → A: Na tela inicial e no perfil (telas de navegação); a partida não ganha rodapé para não poluir o jogo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler a política (Priority: P1)

Qualquer pessoa abre "Privacidade" pelo rodapé e entende quais dados o jogo guarda, por quanto tempo, com quem compartilha e quais são seus direitos.

**Independent Test**: na tela inicial, seguir o link do rodapé e ver as seções da política.

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** a pessoa ativa "Privacidade" no rodapé, **Then** a política abre.
2. **Given** a política, **When** a pessoa lê, **Then** encontra: dados coletados (e-mail e nome de exibição), dados do jogo (pontuações por 90 dias, recordes e estatísticas), dados só do navegador, fornecedores (banco/autenticação, anti-robô, relatório de erros sem dados pessoais), cookies, direitos do titular e contato.

### User Story 2 - Chegar à exclusão de conta (Priority: P1)

A partir da política, a pessoa chega à exclusão da conta em um clique.

**Independent Test**: na política, seguir "excluir a conta" e cair na seção de exclusão do perfil.

**Acceptance Scenarios**:

1. **Given** a política, **When** ativa o link de exclusão, **Then** vai ao perfil já na seção "Excluir conta".
2. **Given** visitante, **When** chega ao perfil por esse link, **Then** vê um aviso de que precisa entrar para excluir a conta.
3. **Given** o perfil logado, **When** olha a seção de exclusão, **Then** encontra o link para a política.

### Edge Cases

- App sem backend: a política continua acessível (é estática).
- Marcadores "[a definir]" ficam visíveis até a pessoa preencher (não podem parecer dados reais).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Rodapé com link "Privacidade" na tela inicial e no perfil.
- **FR-002**: A política MUST listar dados coletados, finalidade, retenção, compartilhamento, cookies, direitos e contato.
- **FR-003**: Controlador e contato do encarregado MUST aparecer como "[a definir]" até a pessoa responsável preencher.
- **FR-004**: A política MUST ter link para a exclusão de conta no perfil; o perfil MUST ter link para a política.
- **FR-005**: O visitante que chega ao link de exclusão MUST ver como entrar.
- **FR-006**: Todo texto MUST passar pelo i18n; a página é navegável por teclado com títulos em ordem.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A política está a 1 clique da tela inicial e a exclusão a 1 clique da política.
- **SC-002**: As 7 seções do FR-002 estão presentes.
- **SC-003**: Nenhum dado real da empresa é inventado (2 marcadores explícitos).

## Assumptions

- O texto é informativo para o MVP e precisa de revisão jurídica antes do lançamento (pendência no PR).
- Depende da KD-34 (#28) para a seção de exclusão no perfil; PR empilhado.
