# Feature Specification: Envio validado de pontuação (submit_score)

**Feature Branch**: `feat/kd-31-rpc-submit-score`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "KD-31 (#25): RPC submit_score com auth obrigatória, idempotência por match_id, rate limit por usuário, plausibilidade (duração, pontos por segundo, content_version aceita), insert em scores, upsert em best_scores, atualização de player_stats e desbloqueio de cosméticos pelo recorde pessoal. Assinatura validada contra o payload de match:ended (KD-21)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar uma partida válida (Priority: P1)

Um jogador com conta termina uma partida; o resultado é gravado, o recorde do placar é atualizado se for maior e as estatísticas acumuladas crescem.

**Why this priority**: Sem isso não existe ranking nem progresso online.

**Independent Test**: Enviar uma partida plausível de um usuário autenticado e conferir histórico, recorde e estatísticas.

**Acceptance Scenarios**:

1. **Given** um jogador autenticado sem recorde, **When** envia uma partida válida, **Then** a partida é gravada, vira o recorde do placar e as estatísticas somam 1 partida, a pontuação, os pedidos concluídos e o tempo.
2. **Given** um recorde de 500, **When** envia uma partida de 300, **Then** o recorde continua 500 e as estatísticas somam a partida.

---

### User Story 2 - Reenvio seguro (Priority: P1)

A fila offline pode reenviar a mesma partida; o reenvio não duplica nada e devolve o mesmo resultado.

**Why this priority**: A outbox (KD-35) depende de reenvio idempotente.

**Independent Test**: Enviar a mesma partida duas vezes e conferir uma única linha e estatísticas inalteradas.

**Acceptance Scenarios**:

1. **Given** uma partida já aceita, **When** é reenviada, **Then** a resposta é a mesma e nada é somado de novo, mesmo que o limite de frequência tenha sido atingido.

---

### User Story 3 - Barrar envios inválidos ou abusivos (Priority: P1)

Envios sem conta, com duração ou pontuação impossíveis, versão de conteúdo desconhecida ou em frequência excessiva são recusados com um código de erro estável.

**Independent Test**: Cada caso de recusa produz o código esperado e não grava nada.

**Acceptance Scenarios**:

1. **Given** um visitante sem sessão, **When** tenta enviar, **Then** é recusado.
2. **Given** duração fora da faixa aceita, **When** envia, **Then** é recusado.
3. **Given** pontuação acima do teto por segundo, **When** envia, **Then** é recusado.
4. **Given** versão de conteúdo fora da lista aceita, **When** envia, **Then** é recusado.
5. **Given** o limite por minuto atingido, **When** envia uma partida nova, **Then** é recusado.

---

### User Story 4 - Desbloquear cosméticos pelo recorde (Priority: P2)

Ao atingir um recorde pessoal que alcança o limiar de um cosmético, o item fica desbloqueado na conta e a resposta lista o que foi desbloqueado agora.

**Independent Test**: Enviar partida com pontuação ≥ limiar e conferir o item na conta.

**Acceptance Scenarios**:

1. **Given** limiar de 300 para um chapéu, **When** o recorde passa a 320, **Then** o chapéu é desbloqueado e aparece na resposta.
2. **Given** o item já desbloqueado, **When** outro recorde ocorre, **Then** não há duplicata.

### Edge Cases

- Mesmo `match_id` enviado por outro usuário: recusado (não revela o resultado alheio).
- Pontuação zero: aceita.
- Semente fora do intervalo de 32 bits sem sinal ou parâmetros nulos: recusados.
- Envios concorrentes da mesma partida: só um grava.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Rejeitar envio sem usuário autenticado.
- **FR-002**: Ser idempotente por identificador de partida, devolvendo o resultado anterior ao mesmo dono, antes de aplicar o limite de frequência.
- **FR-003**: Limitar envios novos por usuário numa janela de 60 s ao valor configurado.
- **FR-004**: Aceitar só duração entre mínimo e máximo configurados, pontuação ≤ duração em segundos × teto de pontos por segundo e versão de conteúdo da lista aceita.
- **FR-005**: Gravar a partida, atualizar o recorde do placar só se for maior e somar partidas, pontuação, pedidos concluídos e tempo nas estatísticas.
- **FR-006**: Desbloquear cosméticos cujo limiar seja ≤ ao maior recorde pessoal, sem duplicar.
- **FR-007**: Devolver: se é novo recorde, o recorde do placar e a lista de cosméticos desbloqueados nesta chamada.
- **FR-008**: Ler todas as constantes de configuração editável, sem mudança de código para ajustá-las.
- **FR-009**: Visitantes não podem chamar a operação; os parâmetros cobrem o payload de fim de partida mais placar e origem.

### Key Entities

- **Partida enviada**: identificador, placar, pontuação, duração, semente, versão de conteúdo, origem, pedidos concluídos.
- **Recorde por placar**, **Estatísticas do jogador**, **Cosmético desbloqueado**, **Regras do jogo** (constantes).

## Success Criteria *(mandatory)*

- **SC-001**: 100% dos casos de recusa da issue (duplicado, acima do limite, sem auth, frequência excedida) cobertos por teste automatizado.
- **SC-002**: Reenviar a mesma partida N vezes deixa exatamente 1 registro.
- **SC-003**: Nenhum envio recusado altera dados.
- **SC-004**: O app tem a assinatura documentada para integrar (KD-35).

## Assumptions

- `players`, `mode` e `ordersFailed` do payload não são gravados: o `board` (decidido pelo React) já distingue modo/jogadores, e o schema da KD-30 não tem colunas para eles.
- `ordersCompleted` entra como parâmetro, porque `player_stats.orders_completed` precisa dele (ajuste da assinatura de SYSTEM_DESIGN §6.2).
- "Recorde pessoal" = maior pontuação do jogador em qualquer placar (PRD: cosméticos liberados pelo recorde de pontos).
- Limiares de cosméticos ficam em `game_rules.cosmetic_unlocks` com os valores do PRD; ids provisórios até o catálogo (KD-23) existir. Itens grátis não geram linha.
- A RPC valida só a pertinência da versão à lista `accepted_content_versions`, sem impor formato. A lista precisa receber o hash real de 8 hex quando o conteúdo for versionado (KD-21/KD-14); até lá vale o `"1"` da KD-30 (pendência registrada).
- Partidas com `origin = 'local'` (migração, KD-37) passam pela mesma validação e pelo mesmo rate limit.
