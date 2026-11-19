# Feature Specification: Ranking global paginado

**Feature Branch**: `feat/kd-36-global-ranking`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: KD-36 — disponibilizar o ranking global em páginas de 20 posições, com atualização de dados remotos em cache e estado offline explícito.

## Clarifications

### Session 2026-11-18

- Q: Pessoas sem login devem poder abrir o ranking global? → A: Sim. O ranking será público, inclusive para visitantes.
- Q: Quais modalidades devem aparecer no ranking da KD-36? → A: Todos os modos; a ordenação usa pontuação, inclusive no modo Desafio.

## User Scenarios & Testing

### User Story 1 - Consultar o ranking (Priority: P1)

Uma pessoa abre o ranking e escolhe o modo e o número de jogadores para comparar seu recorde de pontuação com o de outras pessoas. Quando está autenticada e seu recorde aparece na página atual, sua linha é destacada.

**Why this priority**: O ranking global é o principal retorno social da pontuação online do MVP.

**Independent Test**: Carregar dados fictícios de mais de uma página e verificar que o ranking apresenta as posições, nomes públicos e pontuações na ordem esperada.

**Acceptance Scenarios**:

1. **Given** que existem recordes para um modo e número de jogadores, **When** a pessoa seleciona esse quadro, **Then** vê as primeiras 20 posições ordenadas por pontuação decrescente.
2. **Given** que há uma próxima página, **When** a pessoa avança, **Then** vê o próximo grupo de até 20 posições sem repetir nem omitir posições.
3. **Given** que não há recordes no quadro selecionado, **When** a pessoa abre o quadro, **Then** recebe uma mensagem de lista vazia e uma forma clara de voltar.
4. **Given** uma pessoa autenticada cujo recorde está na página atual, **When** o ranking é exibido, **Then** sua linha fica visualmente destacada sem depender apenas de cor.

### User Story 2 - Usar o ranking com conexão instável (Priority: P1)

Uma pessoa recebe um estado compreensível quando o ranking não pode ser consultado por falta de rede ou indisponibilidade do serviço.

**Why this priority**: O jogo continua utilizável offline, e uma falha de ranking não deve parecer uma lista vazia nem interromper a aplicação.

**Independent Test**: Simular primeiro acesso offline e indisponibilidade após uma consulta bem-sucedida; conferir estados de erro/offline e dados em cache, quando existentes.

**Acceptance Scenarios**:

1. **Given** que não existe consulta anterior em cache e a rede está indisponível, **When** a pessoa abre o ranking, **Then** vê um aviso de indisponibilidade com opção de tentar novamente.
2. **Given** que há dados de uma consulta anterior em cache e a rede fica indisponível, **When** a pessoa abre o ranking, **Then** pode consultar os dados em cache e é informada de que podem estar desatualizados.
3. **Given** que uma consulta falha, **When** a pessoa solicita nova tentativa e a conexão volta, **Then** o ranking atualiza e a falha deixa de ser exibida.

### Edge Cases

- Uma página além da última não deve mostrar posições repetidas nem tratar o resultado vazio como erro.
- Pontuações iguais devem manter ordem estável e não alterar uma posição entre consultas equivalentes.
- Uma falha ao consultar nomes públicos não pode revelar e-mail ou outras informações privadas.
- A troca entre páginas enquanto uma consulta está pendente não deve apresentar conteúdo de uma categoria/página como se fosse outra.
- Se a pessoa autenticada não estiver entre os resultados da página atual, nenhuma outra linha deve ser destacada como se fosse dela.
- Visitantes e pessoas autenticadas têm o mesmo acesso de leitura aos quadros de ranking de todos os modos.

## Requirements

### Functional Requirements

- **FR-001**: O sistema MUST apresentar quadros de ranking separados por modo e número de jogadores, incluindo Clássico, Livre e Desafio, com no máximo 20 posições por página.
- **FR-002**: O sistema MUST permitir navegar entre páginas disponíveis e indicar a página atual.
- **FR-003**: O sistema MUST ordenar todos os quadros por pontuação decrescente e aplicar uma regra determinística de desempate.
- **FR-004**: O sistema MUST apresentar somente a posição, nome público e pontuação necessários para comparar recordes.
- **FR-005**: O sistema MUST comunicar carregamento, lista vazia, indisponibilidade e erro em textos traduzidos e acessíveis.
- **FR-006**: O sistema MUST preservar e distinguir resultados em cache de dados recém-atualizados.
- **FR-007**: O sistema MUST permitir nova tentativa após uma falha de consulta sem exigir reiniciar a aplicação.
- **FR-008**: O sistema MUST permitir a consulta do ranking por visitantes e pessoas autenticadas, sem exigir login.
- **FR-009**: O ranking MUST mostrar apenas recordes válidos do quadro selecionado, sem misturar modos ou números de jogadores.
- **FR-010**: Para uma pessoa autenticada, o sistema MUST destacar seu recorde somente quando ele estiver entre as posições exibidas na página atual.

### Key Entities

- **Quadro do ranking**: categoria do placar, identificada pelo modo e pelo número de jogadores.
- **Recorde**: maior pontuação de uma pessoa em um quadro, com data do recorde.
- **Perfil público**: nome de exibição associado a um recorde, sem dados privados.
- **Página do ranking**: segmento ordenado do quadro, com até 20 posições.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Cada página retornada contém no máximo 20 posições e páginas adjacentes não repetem posições.
- **SC-002**: Em dados iguais, duas consultas consecutivas exibem as mesmas posições e desempates.
- **SC-003**: Nos testes de estados, carregamento, vazio, offline inicial, erro, cache e recuperação de conexão são distinguíveis.
- **SC-004**: Os registros exibidos não incluem e-mail, configurações privadas ou outros dados pessoais além do nome público aprovado.
- **SC-005**: Quando o recorde da pessoa autenticada aparece na página, ele é distinguível visualmente e por uma indicação textual; em outros casos nenhuma linha é marcada como própria.

## Assumptions

- A pontuação oficial é o melhor recorde de cada jogador por quadro, não cada partida histórica; no modo Desafio a ordenação também é por pontuação, não pelo menor tempo.
- O ranking não escreve nem recalcula pontuações; a validação e atualização dos recordes são responsabilidade da KD-31.
- O tamanho da página é fixo em 20 conforme definido pelo MVP.
- O cache remoto permanece válido por 60 segundos, conforme a meta de eficiência documentada no System Design.
- A KD-36 depende da KD-21 (telas e rota base) e da KD-30 (schema/RLS); ambas estão concluídas na base consultada e devem permanecer integradas na branch de implementação.
