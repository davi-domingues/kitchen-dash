# Feature Specification: Estado de envio ao ranking no resultado

**Feature Branch**: `feat/debito-72-estado-envio-ranking`
**Created**: 2026-11-20
**Status**: Draft
**Input**: Débito #72 (origem PR #69, KD-35): a tela de resultado não indica se a pontuação foi enviada, está pendente ou falhou.

## Clarifications

### Session 2026-11-20

- Q: Erro de rede ou sessão expirada conta como "falhou"? → A: Não; é "pendente", pois a fila reenvia (SYSTEM_DESIGN §7.1). "Falhou" só para descarte definitivo ou erro inesperado.
- Q: Backend não configurado mostra qual estado? → A: Visitante (nada é enviado).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Saber se a pontuação entrou no ranking (Priority: P1)

Jogador conectado termina uma partida e, na tela de resultado, vê se a pontuação está sendo enviada, foi enviada, ficou pendente (sem conexão, vai reenviar sozinha) ou falhou de vez.

**Why this priority**: É o critério de pronto do débito; sem isso o jogador não sabe se o recorde conta.

**Independent Test**: Terminar uma partida logado, online e offline, e ler a mensagem do resultado.

**Acceptance Scenarios**:

1. **Given** jogador conectado e online, **When** a partida termina, **Then** aparece "Enviando ao ranking…" e, em seguida, "Pontuação enviada ao ranking".
2. **Given** jogador conectado e offline, **When** a partida termina, **Then** aparece "Pendente: será enviada quando a conexão voltar".
3. **Given** o servidor recusa a pontuação de forma definitiva, **When** o envio termina, **Then** aparece "Não foi possível enviar ao ranking".

### User Story 2 - Visitante entende por que não está no ranking (Priority: P2)

Visitante (ou app sem backend configurado) vê que a partida ficou só neste aparelho e que entrar na conta leva o progresso ao ranking.

**Independent Test**: Terminar partida sem login e ler a mensagem.

**Acceptance Scenarios**:

1. **Given** visitante, **When** a partida termina, **Then** aparece a mensagem de visitante e nenhum envio é feito.

### Edge Cases

- Sessão ainda carregando no fim da partida: mostra "enviando" até resolver.
- Envio já em andamento (reenvio da fila) quando a partida acaba: se a partida não foi incluída, fica "pendente" (a fila reenvia).
- Sessão expirada (erro de autenticação): fica "pendente", pois a fila tenta de novo após novo login.
- Erro inesperado ao enviar: tratado como "falhou", sem quebrar a tela.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O resultado MUST mostrar um de cinco estados: enviando, enviado, pendente, falhou, visitante.
- **FR-002**: A mudança de estado MUST ser anunciada por leitor de tela sem roubar o foco do título.
- **FR-003**: Todos os textos MUST vir do catálogo de traduções.
- **FR-004**: O estado MUST derivar da fila de envio existente (KD-35), sem novo caminho de envio.
- **FR-005**: Visitante MUST NOT disparar envio.

### Key Entities

- **Estado de envio**: valor por partida (`sending | sent | pending | failed | guest`), derivado do resultado da rodada da fila.

## Success Criteria *(mandatory)*

- **SC-001**: Em 100% dos fins de partida o resultado exibe exatamente um estado de envio.
- **SC-002**: Leitor de tela anuncia o estado final sem ação do jogador.
- **SC-003**: Nenhum texto novo fora do catálogo de traduções (teste de i18n verde).

## Assumptions

- "Falhou" = descarte definitivo (validação recusada, duplicada, ou limite de tentativas); falha transitória e de autenticação = "pendente" (SYSTEM_DESIGN §7.1).
- App sem backend configurado (`disabled`) é tratado como visitante.
- O estado não é atualizado depois que a fila reenvia em segundo plano após sair da tela; reflete a rodada do fim da partida.
