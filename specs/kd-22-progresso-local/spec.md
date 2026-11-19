# Feature Specification: Progresso local do visitante

**Feature Branch**: `feat/kd-22-progresso-local`
**Created**: 2026-11-18
**Status**: Draft
**Input**: Issue #21 (KD-22) — recordes, placar dos chefs, estatísticas e configurações salvos no navegador do visitante.

## Clarifications

### Session 2026-11-18

- Q: Como ordenar empates no placar? → A: Desempate pela partida mais antiga primeiro (quem fez antes mantém a posição); resolvido sem perguntar, padrão comum de placar.
- Q: Um Desafio pode terminar sem os 12 pedidos? → A: Pelo core (KD-15) não, mas o resultado é validado mesmo assim: sem 12 entregues não vira recorde nem entra no placar do Desafio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver "novo recorde" ao terminar a partida (Priority: P1)

O visitante termina uma partida e a tela de resultado diz se ele bateu o próprio recorde naquele modo e número de jogadores.

**Why this priority**: É o gancho de repetição do PRD ("bater recordes").

**Independent Test**: Jogar duas partidas do Clássico solo; a primeira e qualquer uma com mais pontos mostram "Novo recorde!".

**Acceptance Scenarios**:

1. **Given** nenhum recorde no Clássico 1P, **When** a partida termina com 120 pontos, **Then** aparece "Novo recorde!" e o recorde passa a 120.
2. **Given** recorde de 300 no Clássico 1P, **When** termina com 200, **Then** não aparece "Novo recorde!" e o recorde atual (300) é mostrado.
3. **Given** melhor tempo do Desafio 2P de 4:00, **When** um Desafio 2P completo termina em 3:30, **Then** é novo recorde; o recorde do Desafio 1P não muda.
4. **Given** um Desafio terminado sem os 12 pedidos entregues, **Then** não conta como recorde de tempo.

### User Story 2 - Placar dos chefs e estatísticas no perfil (Priority: P2)

O visitante abre o perfil e vê recordes por modo e nº de jogadores, as melhores partidas (placar local) e totais (partidas, pedidos entregues e perdidos, tempo jogado).

**Why this priority**: Torna o progresso visível fora da partida.

**Independent Test**: Com progresso salvo, recarregar a página e abrir o perfil; sem progresso, ver o estado vazio.

**Acceptance Scenarios**:

1. **Given** nenhum progresso, **When** abre o perfil, **Then** vê mensagem de vazio com atalho para jogar.
2. **Given** partidas salvas, **When** abre o perfil, **Then** vê recordes, placar ordenado e estatísticas.
3. **Given** armazenamento do navegador bloqueado, **Then** vê um aviso de que o progresso não será mantido.

### User Story 3 - Apagar progresso local (Priority: P3)

Nas configurações do perfil, o visitante pode apagar o progresso local após confirmar.

**Why this priority**: Controle do próprio dado; pouco usado.

**Independent Test**: Apagar e ver o perfil voltar ao estado vazio.

**Acceptance Scenarios**:

1. **Given** progresso salvo, **When** confirma "apagar", **Then** recordes, placar e estatísticas somem.

### Edge Cases

- Dado salvo corrompido ou de formato inesperado: normalizado ou descartado sem quebrar a tela.
- Mesmo resultado recebido duas vezes (mesmo id de partida): conta uma vez só.
- Placar com muitas partidas: guarda só as 10 melhores por modo e nº de jogadores.
- Lista de pendentes cresce sem login: limitada às 50 mais recentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Recorde por modo e nº de jogadores: Clássico e Livre por maior pontuação; Desafio por menor tempo, só com os 12 pedidos entregues.
- **FR-002**: A tela de resultado informa se a partida é novo recorde e mostra o recorde atual.
- **FR-003**: O placar local guarda as 10 melhores partidas por modo e nº de jogadores, cada uma com id da partida, seed, versão de conteúdo e data.
- **FR-004**: Estatísticas locais acumulam partidas, pedidos entregues, pedidos perdidos e tempo jogado.
- **FR-005**: Toda partida terminada entra numa lista local de pendentes de envio (máx. 50) com o resultado completo, para o envio (KD-35) e a migração local → conta (KD-37). O envio não faz parte desta task.
- **FR-006**: Um resultado com id já registrado não altera recorde, placar, estatísticas nem pendentes.
- **FR-007**: O perfil mostra recordes, placar e estatísticas, com estados vazio e de aviso, acessível por teclado e com textos traduzíveis.
- **FR-008**: O visitante pode apagar o progresso local com confirmação.
- **FR-009**: Modos e nº de jogadores têm uma única definição compartilhada por regras e telas.

### Key Entities

- **Progresso local**: placar (com recordes derivados), estatísticas e pendentes.
- **Entrada de placar**: id da partida, modo, jogadores, seed, versão de conteúdo, pontos, pedidos, duração, data.
- **Partida pendente**: resultado do fim de partida + data.

## Success Criteria *(mandatory)*

- **SC-001**: 100% dos fins de partida válidos atualizam o progresso sem erro visível.
- **SC-002**: O progresso sobrevive a recarregar a página quando o navegador permite armazenamento.
- **SC-003**: O jogador identifica um novo recorde na tela de resultado sem navegar.
- **SC-004**: Dado local inválido nunca impede abrir o perfil ou jogar.

## Assumptions

- O remapeamento de teclas (`settings.keyBindings`) é da KD-17, ainda não mergeada nesta base; esta task não cria `services/settings.js` para não duplicar nem conflitar. As configurações aqui se limitam a apagar o progresso; a tela de teclas entra quando a KD-17 chegar.
- O Livre também tem recorde por pontuação (o PRD cita Clássico e Desafio; o Livre segue a regra do Clássico para o placar ficar coerente).
- O melhor tempo do Desafio aparece no perfil e no resultado; exibi-lo no menu de partida fica para um ajuste de UI posterior.
- O recorde é a 1ª entrada do placar daquele modo e nº de jogadores (não há dado duplicado).
- Sem contas: tudo no navegador, chave `progress` (SYSTEM_DESIGN §7.2).
