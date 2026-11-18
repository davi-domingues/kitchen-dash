# Feature Specification: Cosméticos locais (KD-23)

**Feature Branch**: `feat/kd-23-cosmeticos-locais`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #22 — KD-23 · Cosméticos locais: desbloqueio por recorde e personalização (chapéu, avental, tema), aplicados na cozinha, com aviso na tela de resultado.

## Clarifications

### Session 2026-11-18

- Q: Qual "recorde" desbloqueia? → A: A maior pontuação já feita pelo jogador em qualquer modo e nº de jogadores, a mesma regra do `submit_score` (KD-31: `max(best_scores.score)` ≥ `unlockScore`). Resolvido pelos docs.
- Q: Apagar progresso apaga os cosméticos? → A: Sim. "Apagar progresso local" volta ao estado inicial (só os itens de custo 0). Suposição: o jogador espera um recomeço completo.
- Q: Em 2 jogadores, cada chefe tem sua escolha? → A: Não. Há um perfil por navegador, então os dois chefes usam o mesmo chapéu e avental. A cor do corpo continua diferenciando P1 e P2. Suposição registrada.
- Q: O que o tema muda? → A: A cor das paredes da cozinha (placeholder até a arte da KD-19).

## User Scenarios & Testing

### User Story 1 - Desbloquear ao bater pontuação (Priority: P1)

Ao fim de uma partida cuja pontuação alcança o custo de itens ainda bloqueados, o jogador vê na tela de resultado quais itens acabou de ganhar.

**Independent Test**: jogar e fazer 320 pontos com o progresso vazio. A tela de resultado lista "Chapéu bordô" e "Avental de ervas".

**Acceptance Scenarios**:

1. **Given** nenhum item ganho, **When** a partida termina com 320 pontos, **Then** são desbloqueados os itens com custo ≤ 320 e o resultado avisa quais são.
2. **Given** a pontuação máxima já é 500, **When** a partida termina com 300 pontos, **Then** nada novo é desbloqueado e não aparece aviso.
3. **Given** a mesma partida registrada duas vezes, **Then** o aviso não se repete nem duplica itens.

### User Story 2 - Personalizar no perfil (Priority: P1)

No /perfil, o jogador vê os itens de cada slot (chapéu, avental, tema). Os ganhos podem ser equipados; os bloqueados mostram a pontuação necessária.

**Acceptance Scenarios**:

1. **Given** um item desbloqueado, **When** o jogador o escolhe pelo teclado, **Then** ele fica equipado e continua equipado depois de recarregar a página.
2. **Given** um item bloqueado, **Then** ele aparece desabilitado com "Faça N pontos".
3. **Given** armazenamento bloqueado ou dado corrompido, **Then** a tela mostra os itens padrão e um aviso, sem quebrar.

### User Story 3 - Ver a escolha na cozinha (Priority: P2)

Na partida, os chefes aparecem com o chapéu e o avental equipados, e a cozinha com a cor do tema.

### Edge Cases

- Dado salvo com id inexistente ou bloqueado equipado: volta ao item padrão do slot.
- Pontuação negativa ou inválida: ignorada.
- Lista de ganhos vinda da conta (KD-38) com ids desconhecidos: ignorados.

## Requirements

### Functional Requirements

- **FR-001**: O desbloqueio MUST usar a regra "maior pontuação pessoal ≥ custo do item", com os custos do catálogo de conteúdo.
- **FR-002**: Os itens ganhos MUST ficar ganhos (não se perdem se a regra de cálculo mudar), até o jogador apagar o progresso.
- **FR-003**: A tela de resultado MUST anunciar (região de status) os itens recém-desbloqueados.
- **FR-004**: O /perfil MUST permitir equipar um item desbloqueado por slot, operável por teclado, com estados de carregamento, vazio e erro.
- **FR-005**: A escolha MUST ser salva no navegador de forma versionada, sem mudar o formato do progresso da KD-22.
- **FR-006**: A cozinha MUST desenhar chapéu, avental e tema equipados.
- **FR-007**: MUST existir uma forma de unir à lista local os itens ganhos na conta (KD-38).
- **FR-008**: Todo texto visível MUST vir do i18n.

### Key Entities

- **Coleção de cosméticos**: maior pontuação vista, itens ganhos e item equipado por slot.

## Success Criteria

- **SC-001**: 100% das regras de desbloqueio e equipar cobertas por teste automatizado.
- **SC-002**: O jogador equipa um item em até 3 ações de teclado a partir do /perfil.
- **SC-003**: Dados corrompidos nunca impedem a tela de abrir.

## Assumptions

- Itens de custo 0 vêm sempre ganhos e são o padrão de cada slot.
- Sem servidor nesta task: a conciliação com a conta é da KD-38/KD-37.
- O catálogo (`content/cosmetics.json`) não muda, para manter a versão do conteúdo.
