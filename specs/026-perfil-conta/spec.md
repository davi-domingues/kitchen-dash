# Feature Specification: Perfil da conta — nome de exibição, configurações e exclusão

**Feature Branch**: `feat/kd-34-perfil-conta`
**Created**: 2026-11-20
**Status**: Draft
**Input**: KD-34 (issue #28): editar `display_name` (3–20, letras, dígitos e `_`, único) com erros claros; sincronizar as configurações locais com a conta; excluir a conta com confirmação.

## Clarifications

### Session 2026-11-20

Resolvidas pelos docs, sem perguntar à pessoa (suposições registradas):

- Q: A unicidade do nome ignora maiúsculas? → A: Não; vale a restrição `unique` do schema (KD-30), sensível a maiúsculas.
- Q: A confirmação da exclusão exige digitar algo? → A: Não; um diálogo com aviso irreversível e botão de confirmar (SC-003, 2 ações).
- Q: Excluir a conta apaga o progresso local? → A: Não; o local é do visitante (D13/offline primeiro) e tem botão próprio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trocar o nome de exibição (Priority: P1)

O jogador logado abre o perfil, vê o nome atual (o que aparece no ranking) e o troca por outro.

**Why this priority**: o nome gerado no cadastro é automático; é o primeiro ajuste que o jogador quer fazer e é o que aparece publicamente.

**Independent Test**: logado, digitar um nome válido e salvar; o perfil e o ranking mostram o novo nome.

**Acceptance Scenarios**:

1. **Given** jogador logado, **When** salva `Chef_Ana`, **Then** vê confirmação e o nome novo.
2. **Given** nome com 2 caracteres, espaço ou acento, **When** tenta salvar, **Then** vê erro de formato sem envio ao servidor.
3. **Given** nome já usado por outra conta, **When** salva, **Then** vê "nome já em uso".
4. **Given** sem rede, **When** salva, **Then** vê erro genérico e o nome anterior continua.

### User Story 2 - Configurações acompanham a conta (Priority: P2)

Teclas remapeadas e "reduzir efeitos" mudados com sessão ativa são gravados na conta; ao entrar em outro navegador, as configurações da conta são aplicadas.

**Independent Test**: logado, mudar uma tecla; em outro navegador, entrar e ver a tecla mudada.

**Acceptance Scenarios**:

1. **Given** sessão ativa, **When** o jogador muda uma configuração, **Then** ela é salva localmente na hora e enviada à conta em segundo plano.
2. **Given** login em novo dispositivo, **When** a sessão abre, **Then** os campos da conta substituem os locais e os campos só locais vão para a conta.
3. **Given** falha de rede, **When** uma configuração muda, **Then** o local continua valendo (offline primeiro).

### User Story 3 - Excluir a conta (Priority: P1)

O jogador pede a exclusão da conta, confirma e todos os dados dela são apagados; ele volta a ser visitante.

**Independent Test**: logado, excluir a conta confirmando; a sessão termina e o nome some do ranking.

**Acceptance Scenarios**:

1. **Given** jogador logado, **When** clica em excluir, **Then** um diálogo explica o que será apagado e pede confirmação.
2. **Given** diálogo aberto, **When** cancela, **Then** nada acontece.
3. **Given** confirmação, **When** a exclusão termina, **Then** a sessão é encerrada e ele volta à tela inicial como visitante.
4. **Given** falha, **When** confirma, **Then** vê erro e a conta continua.

### Edge Cases

- Visitante (ou app sem backend) no perfil: não vê as seções de conta.
- Nome igual ao atual: nada é enviado.
- Espaços nas pontas são removidos antes de validar.
- O progresso local do navegador não é apagado pela exclusão da conta (pertence ao visitante e tem botão próprio).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O perfil MUST mostrar o nome de exibição atual da conta logada.
- **FR-002**: O sistema MUST validar o nome localmente: 3 a 20 caracteres, só letras sem acento, dígitos e `_`.
- **FR-003**: O sistema MUST distinguir os erros "formato inválido", "nome em uso" e "falha genérica".
- **FR-004**: Mudança de configuração com sessão MUST ser enviada à conta sem bloquear a interface.
- **FR-005**: No login, as configurações MUST ser conciliadas pela regra já decidida na KD-37 (a conta vence por campo).
- **FR-006**: A exclusão MUST exigir confirmação explícita num diálogo acessível por teclado.
- **FR-007**: Após excluir, o sistema MUST encerrar a sessão local e levar à tela inicial.
- **FR-008**: Todo texto MUST passar pelo i18n.

### Key Entities

- **Perfil**: nome de exibição público, único.
- **Configurações da conta**: objeto de preferências (teclas, reduzir efeitos).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos nomes inválidos são barrados antes do envio.
- **SC-002**: Os três tipos de erro de nome geram mensagens distintas.
- **SC-003**: Excluir a conta leva no máximo 2 ações (abrir o diálogo e confirmar).
- **SC-004**: Nenhuma falha remota apaga ou bloqueia configuração local.

## Assumptions

- O banco já tem a RPC `delete_my_account` e a permissão de update de `display_name` (KD-30/KD-32); não há migration nova.
- A regra de conflito das configurações é a da KD-37 (ESTUDOS_E_DECISOES).
- O teste de ponta a ponta é manual no PR (sem E2E no MVP, D4); a lógica tem testes unitários.
