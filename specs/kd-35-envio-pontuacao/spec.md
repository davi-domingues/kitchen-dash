# Feature Specification: Envio de pontuação com outbox e retry (KD-35)

**Feature Branch**: `feat/kd-35-envio-pontuacao`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #29 — KD-35 · Envio de pontuação com outbox e retry.

## Clarifications

### Session 2026-11-18 (resolvido pelos docs, sem perguntar)

- Q: Quais pendentes são enviados com origem `online`? → A: Só partidas terminadas com sessão ativa, marcadas na fila com o id do jogador; as de visitante ficam para a KD-37 (SYSTEM_DESIGN §7.1).
- Q: O que fazer após o teto de tentativas? → A: Descartar da fila e dos pendentes (spec da issue: "tentativas limitadas").
- Q: Como mapear o placar? → A: `<mode>_<players>p` (ex.: `classic_1p`, `challenge_2p`), compatível com `^[a-z0-9_-]{1,40}$`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Partida de quem está logado vai para o ranking (Priority: P1)

Quem está conectado termina uma partida e o resultado é enviado ao servidor sem nenhuma ação extra.

**Independent Test**: com cliente fake, terminar uma partida autenticado gera uma chamada de envio com os dados da partida e, ao ser aceita, a partida sai da lista de pendentes.

**Acceptance Scenarios**:

1. **Given** jogador conectado, **When** a partida termina, **Then** o resultado é enviado e removido dos pendentes após aceito.
2. **Given** o mesmo resultado reenviado, **When** o servidor responde que já o tinha, **Then** ele é tratado como aceito (idempotência).

### User Story 2 — Sem conexão, o resultado espera e é reenviado (Priority: P1)

**Independent Test**: falha transitória agenda nova tentativa com espera crescente; a tentativa seguinte, ao ter sucesso, remove o pendente.

**Acceptance Scenarios**:

1. **Given** falha de rede ou limite de envios, **When** o envio falha, **Then** nova tentativa é agendada com espera exponencial e variação aleatória.
2. **Given** o app volta a ficar online, abre de novo ou o jogador faz login, **When** há pendentes do jogador, **Then** eles são reenviados.
3. **Given** o limite de tentativas atingido, **Then** o item é descartado.

### User Story 3 — Resultado rejeitado não fica preso (Priority: P2)

**Acceptance Scenarios**:

1. **Given** o servidor rejeita por dado inválido, implausível, versão de conteúdo desconhecida ou conflito, **Then** o item é descartado sem novas tentativas.
2. **Given** sessão expirada, **Then** o envio para e o item fica guardado até o próximo login.

### Edge Cases

- Partidas jogadas como visitante não são enviadas aqui (ficam para a migração local → conta, KD-37, com origem `local`).
- Troca de conta: um pendente de um jogador nunca é enviado pela sessão de outro.
- Pendente removido pelo limite de 50 partidas some também da fila de envio.
- Sem backend configurado, nada é enviado e o jogo segue offline.

## Requirements *(mandatory)*

- **FR-001**: Ao fim de partida com jogador conectado, o resultado entra na fila de envio associada ao jogador e um envio é disparado.
- **FR-002**: Envio aceito (novo ou repetido) remove a partida dos pendentes locais.
- **FR-003**: Falhas transitórias (rede, servidor, limite de envios) reagendam com espera exponencial com variação aleatória, até um teto de tentativas.
- **FR-004**: Rejeições permanentes descartam o item da fila e dos pendentes.
- **FR-005**: Falta de sessão interrompe o envio sem descartar.
- **FR-006**: A fila é reprocessada no login, na abertura do app e quando a conexão volta.
- **FR-007**: O placar remoto é identificado por modo e número de jogadores (ex.: `classic_1p`).
- **FR-008**: Nenhum envio ocorre em paralelo para a mesma fila; o acesso ao servidor é carregado sob demanda.

### Key Entities

- **Item da fila**: id da partida, id do jogador, tentativas, próximo horário de envio. Os dados da partida vêm do pendente local (KD-22).

## Success Criteria *(mandatory)*

- **SC-001**: 100% das partidas de jogador conectado aceitas pelo servidor saem dos pendentes.
- **SC-002**: Nenhuma partida rejeitada permanentemente é tentada mais de uma vez.
- **SC-003**: Uma partida com falha transitória é tentada no máximo 8 vezes.
- **SC-004**: O jogo continua 100% jogável sem rede.

## Assumptions

- Pendentes vêm de `kd:v1:progress.pending` (KD-22); metadados de retry ficam em `kd:v1:outbox`.
- Teto de 8 tentativas, base 2 s, teto de espera 5 min; variação "equal jitter" (50–100% da espera).
- Descarte não é reportado ao Sentry nesta task (KD-40 ainda não integrada nesta cadeia).
- TanStack Query não é usado: o envio é uma fila com retry próprio; uma mutation duplicaria o retry.
