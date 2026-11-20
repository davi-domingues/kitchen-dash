# Feature Specification: Reenvio do equipado para a conta

**Feature Branch**: `feat/debito-74-retry-equipado`
**Created**: 2026-11-20
**Status**: Draft
**Input**: Débito #74 (origem KD-38): se gravar o equipado na conta falhar (offline), ele fica só no local e não é reenviado.

## Clarifications

### Session 2026-11-20

Resolvidas pelos docs (SYSTEM_DESIGN §7.1, KD-35/KD-38), sem perguntar (suposições registradas):

- Q: Quantas tentativas e qual espera? → A: As da outbox de pontuação: até 8 tentativas, espera exponencial com jitter de 2 s até 5 min.
- Q: Com pendência, o login ainda lê os cosméticos da conta? → A: Tenta o reenvio primeiro; se a pendência continuar, não lê, para não reverter a escolha local (FR-004).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - O equipado chega à conta quando a rede volta (Priority: P1)

A pessoa, com sessão, equipa um cosmético sem conexão. A escolha vale na hora neste dispositivo e é gravada na conta assim que possível, sem ela precisar equipar de novo.

**Why this priority**: sem isso a escolha se perde ao trocar de dispositivo e pode até ser revertida no próximo login.

**Independent Test**: com relógio falso, falhar o primeiro envio e conferir o reenvio após o intervalo de espera, até gravar.

**Acceptance Scenarios**:

1. **Given** sessão ativa e servidor indisponível, **When** a pessoa equipa um item, **Then** o local muda na hora e o envio é reagendado com espera crescente.
2. **Given** um reenvio pendente, **When** o servidor volta, **Then** o próximo reenvio grava o equipado **mais recente** e a pendência some.
3. **Given** um reenvio pendente, **When** a pessoa recarrega a página ou a conexão volta, **Then** o envio é tentado de novo na abertura com sessão ou no evento de volta da rede.
4. **Given** um reenvio pendente, **When** a pessoa entra de novo, **Then** o equipado da conta não sobrescreve a escolha local ainda não enviada.

### Edge Cases

- Várias trocas seguidas offline geram um só envio pendente, com o último equipado.
- Depois de 8 tentativas a pendência é descartada (mesmo teto da outbox de pontuação); o local continua com a escolha.
- Pendência de outro usuário não é enviada com a sessão atual.
- O cosmético do P2 continua só no navegador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Falha ao gravar o equipado DEVE registrar uma pendência persistente por usuário.
- **FR-002**: O reenvio DEVE usar espera exponencial com jitter, igual à da outbox de pontuação, até 8 tentativas.
- **FR-003**: O reenvio DEVE enviar o equipado local do momento do envio (o último vence).
- **FR-004**: Com pendência, a leitura dos cosméticos da conta no login NÃO DEVE sobrescrever o equipado local.
- **FR-005**: O reenvio DEVE ser tentado também na abertura com sessão e quando a conexão volta.

### Key Entities

- **Pendência do equipado**: usuário, número de tentativas e momento do próximo envio. O conteúdo não é guardado: vem do local.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das escolhas feitas offline chegam à conta na primeira tentativa com rede, dentro do teto de tentativas.
- **SC-002**: 0 escolhas locais revertidas pelo login enquanto houver pendência.

## Assumptions

- Falhas não são diferenciadas por tipo: o teto de tentativas limita o custo de uma recusa definitiva (ex.: item que a conta não possui).
- Reaproveita o cálculo de espera da outbox de pontuação (KD-35), sem duplicar código.
