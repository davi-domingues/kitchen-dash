# Especificação: remapeamento de teclas

**Branch**: `feat/kd-75-remapeamento-teclas`  
**Criada**: 2026-11-19  
**Entrada**: issue #75.

## Cenários e testes

### P1 — Alterar controles

Uma pessoa abre a tela de controles, escolhe uma ação do jogador 1 ou 2 e informa uma tecla. A escolha aparece na tela, é salva e é usada na próxima partida, inclusive após recarregar.

### P1 — Resolver conflito

Ao selecionar tecla já atribuída, a atribuição anterior é trocada pela tecla que estava na ação escolhida. A interface informa a troca; nenhuma ação fica duplicada.

### P1 — Usar o teclado

Todas as ações são operáveis por teclado. A captura informa a ação selecionada e pode ser cancelada com Escape ou Tab, sem alterar o mapeamento.

### Casos de borda

- Teclas de navegação da interface, modificadores e combinações de atalhos não devem prender a pessoa na captura.
- Um armazenamento indisponível conserva as escolhas apenas na sessão e é informado.
- Dados salvos inválidos usam os padrões existentes.

## Requisitos

- **FR-001**: Exibir e permitir alterar direção e ação dos dois jogadores, além da pausa.
- **FR-002**: Salvar pelo serviço existente, sem substituir outras configurações.
- **FR-003**: Resolver duplicatas por troca, conforme o mecanismo já existente, com aviso acessível.
- **FR-004**: Oferecer cancelamento de captura e restauração dos padrões por teclado.
- **FR-005**: As mudanças devem ser aplicadas ao iniciar a próxima partida e resistir a recarregamento quando houver armazenamento persistente.
- **FR-006**: Mensagens e rótulos devem passar pelo dicionário em português.

## Critérios de sucesso

- **SC-001**: As 11 ações podem ser identificadas e alteradas por teclado.
- **SC-002**: Troca de teclas mantém 11 atribuições distintas e é anunciada.
- **SC-003**: Recarregar mantém mudanças com armazenamento disponível; bloqueio não interrompe o uso da tela.
- **SC-004**: Cancelar não modifica controles e restaurar recupera os 11 padrões.

## Premissas

- As teclas são identificadas por posição física, como no `InputMap` existente.
- A tela usa troca automática para conflitos, comportamento já implementado no projeto.
