# Feature Specification: Migração dos dados locais para a conta (KD-37)

**Feature Branch**: `feat/kd-37-migracao-local-conta`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #32: no login, migrar para a conta os recordes de visitante (revalidados pela mesma validação das partidas online e marcados como origem local), os cosméticos e as configurações (ARQUITETURA §5.1).

## Clarifications

### Session 2026-11-18

Resolvidas pelos docs (o agente não pergunta à pessoa nesta rodada):

- Q: Quais partidas migram? → A: As pendentes locais que não estão na fila de envio de nenhum usuário (partidas jogadas como visitante). As da fila já são da conta e seguem pela fila normal.
- Q: Quem vence nas configurações quando local e conta divergem? → A: A conta, se já tiver o campo salvo; senão o local é enviado para a conta. É a mesma regra do equipado (KD-38: "a conta vence"), e a ARQUITETURA §5.1 diz que "o armazenamento local passa a refletir a conta".
- Q: Cosméticos ganhos só localmente são gravados na conta? → A: Não diretamente, porque a conta só ganha item pelo servidor. Ao revalidar os recordes locais, o servidor libera os itens merecidos; depois a conta é lida e unida ao local.
- Q: A migração roda de novo para o mesmo usuário no mesmo dispositivo? → A: Não. Um marcador local por usuário encerra a migração. Partidas de visitante feitas depois disso não são migradas automaticamente (fora do escopo).
- Q: Se duas contas logam no mesmo dispositivo, quem recebe as partidas de visitante? → A: A primeira que logar depois delas; ao serem aceitas, saem do local e não vão para outra conta.
- Q: Limite de envios? → A: O servidor aceita 10 envios por minuto. A migração envia em lotes de até 10 e espera a janela antes do próximo lote.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recordes de visitante vão para a conta (Priority: P1)

O visitante joga, cria a conta e vê seus recordes válidos contarem na conta.

**Independent Test**: com partidas de visitante salvas, ao logar, todas são enviadas uma única vez como origem local.

**Acceptance Scenarios**:

1. **Given** 3 partidas de visitante, **When** o jogador loga, **Then** as 3 são enviadas com origem local e saem da lista local de pendentes.
2. **Given** 25 partidas, **When** loga, **Then** elas são enviadas em lotes de no máximo 10 por minuto.
3. **Given** uma partida recusada pela validação (ex.: versão de conteúdo antiga), **When** migra, **Then** ela é descartada, as outras seguem e o jogador vê um aviso não bloqueante.
4. **Given** a migração interrompida (aba fechada, rede caiu, limite atingido), **When** o app abre de novo com sessão, **Then** ela continua de onde parou sem duplicar.

### User Story 2 - Cosméticos e configurações associados ao perfil (Priority: P2)

**Acceptance Scenarios**:

1. **Given** itens liberados pelo servidor na revalidação, **When** a migração termina, **Then** os itens da conta e do local ficam unidos e o equipado local que a conta não tinha é gravado na conta.
2. **Given** teclas personalizadas localmente e conta sem teclas salvas, **When** migra, **Then** a conta passa a ter as teclas locais.
3. **Given** conta com teclas salvas, **When** migra, **Then** o local passa a usar as teclas da conta.

### User Story 3 - Aviso discreto (Priority: P3)

O jogador vê um aviso de progresso ("enviando N partidas") e de conclusão, anunciado a leitores de tela, sem bloquear a navegação, e pode dispensá-lo pelo teclado.

### Edge Cases

- Sem backend configurado ou offline: nada é feito; tenta de novo na próxima abertura.
- Sessão expirada no meio: para e retoma depois.
- Partida já enviada antes (mesmo identificador): o servidor a ignora (idempotência) e ela conta como enviada.
- Falha na leitura ou gravação de cosméticos ou configurações: não apaga nada local; a etapa é refeita depois.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No login (ou abertura com sessão), enviar as partidas de visitante pela validação normal, com origem `local`.
- **FR-002**: Respeitar o limite de 10 envios por 60 s; um erro de limite leva a uma espera com backoff e a nova tentativa.
- **FR-003**: Partida aceita ou recusada definitivamente sai da lista local; falha transitória fica para a próxima tentativa.
- **FR-004**: Depois das partidas, unir os cosméticos (conta + local) e gravar o equipado na conta.
- **FR-005**: Configurações: a conta vence se tiver o campo; senão o local é gravado na conta.
- **FR-006**: Marcador local versionado por usuário: concluída, a migração não roda de novo; incompleta, é retomada.
- **FR-007**: Aviso de progresso, conclusão e descartes, com textos traduzíveis, acessível e não bloqueante.
- **FR-008**: Nenhuma etapa apaga dados locais em caso de falha.

### Key Entities

- **Marcador de migração**: por usuário; versão, etapas concluídas, totais enviados e descartados.
- **Configurações da conta**: preferências privadas do jogador (teclas).

## Success Criteria *(mandatory)*

- **SC-001**: 100% das partidas de visitante válidas chegam à conta exatamente uma vez.
- **SC-002**: Nenhum minuto da migração tem mais de 10 envios.
- **SC-003**: A migração completa nunca roda duas vezes para o mesmo usuário e dispositivo.
- **SC-004**: O jogador continua navegando e jogando durante a migração.

## Assumptions

- Contratos existentes: envio de pontuação (KD-35), cosméticos da conta (KD-38), tabela de configurações com a linha do usuário criada no cadastro (KD-30). Nenhuma mudança de banco é necessária.
- A única configuração local hoje são as teclas (`keyBindings`).
