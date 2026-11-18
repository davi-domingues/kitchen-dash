# Feature Specification: Cosméticos vinculados à conta (KD-38)

**Feature Branch**: `feat/kd-38-cosmeticos-conta`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #31 — ao logar, ler os cosméticos da conta e mesclar no local; aplicar os desbloqueios devolvidos pelo envio de pontuação; salvar o equipado na conta e restaurar em outro dispositivo.

## Clarifications

### Session 2026-11-18

Resolvidas pelos docs (o agente não pergunta à pessoa nesta rodada):

- Q: Quem vence quando o equipado local e o da conta diferem no login? → A: A conta, slot a slot, se o item estiver liberado localmente.
- Q: A validação de posse do equipado (pendente na KD-34) entra aqui? → A: Sim; a escrita passa a ser só por RPC que valida posse (AGENTS §6: escrita sensível de cosméticos só por RPC).
- Q: Itens gratuitos precisam constar na conta para serem equipados? → A: Não; o servidor aceita item sem custo (fora de `cosmetic_unlocks`).
- Q: Os itens locais são enviados para a conta? → A: Não nesta task; é a KD-37.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cosméticos ganhos voltam ao logar (Priority: P1)

Jogador que ganhou itens em outro dispositivo faz login e vê esses itens liberados no seletor.

**Independent Test**: conta com itens desbloqueados; navegador vazio; após o login, o seletor mostra os itens como ganhos.

**Acceptance Scenarios**:

1. **Given** conta com `hat_navy`, **When** o jogador loga num navegador novo, **Then** `hat_navy` aparece liberado.
2. **Given** itens locais que a conta não tem, **When** loga, **Then** os itens locais continuam liberados (união, nada é perdido).

### User Story 2 - Desbloqueio pelo envio de pontuação (Priority: P1)

Ao enviar uma partida autenticada, os itens que o servidor liberou entram no estado local.

**Acceptance Scenarios**:

1. **Given** envio aceito com `unlocked_cosmetics = [apron_herbs]`, **Then** `apron_herbs` fica liberado localmente.

### User Story 3 - Equipado acompanha a conta (Priority: P2)

O jogador logado equipa um item; em outro dispositivo, após logar, o mesmo visual é restaurado.

**Acceptance Scenarios**:

1. **Given** logado, **When** equipa `hat_navy`, **Then** a escolha é salva na conta.
2. **Given** a conta tem `hat_navy` equipado, **When** loga noutro dispositivo, **Then** `hat_navy` aparece equipado.
3. **Given** um pedido para equipar item que a conta não possui, **Then** o servidor recusa.

### Edge Cases

- Sem backend ou sem rede: o jogo segue só com o estado local; falha não apaga nada local.
- Ids desconhecidos vindos da conta são ignorados.
- Equipado da conta com item que o local não tem liberado: ignorado naquele slot.
- Itens gratuitos podem ser equipados sem constar nos itens da conta.

## Requirements *(mandatory)*

- **FR-001**: Ao detectar sessão, o app lê os itens da conta e os une ao estado local.
- **FR-002**: Ao detectar sessão, o equipado da conta (se houver) substitui o local, slot a slot, quando o item está liberado.
- **FR-003**: Desbloqueios devolvidos pelo envio de pontuação são unidos ao estado local.
- **FR-004**: Com sessão, equipar um item também o grava na conta; falha de rede não desfaz a escolha local.
- **FR-005**: A gravação do equipado na conta só aceita itens que a conta possui ou gratuitos; a escrita direta no campo fica bloqueada.
- **FR-006**: Visitante não faz nenhuma chamada ao servidor.

### Key Entities

- **Itens da conta**: lista de ids liberados por conta.
- **Equipado da conta**: um item por slot (hat, apron, theme).

## Success Criteria *(mandatory)*

- **SC-001**: 100% dos itens da conta aparecem liberados após o login, sem perder itens locais.
- **SC-002**: O equipado é restaurado em outro dispositivo no primeiro carregamento após o login.
- **SC-003**: 100% das tentativas de equipar item não possuído são recusadas pelo servidor.

## Assumptions

- Escopo "itens equipados no perfil" (PLANO_MVP KD-38) inclui a validação de posse.
- Migração de partidas e cosméticos locais para a conta fica na KD-37.
