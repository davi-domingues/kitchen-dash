# Especificação: acessibilidade básica (KD-43)

**Branch**: `feat/kd-43-acessibilidade`  
**Criada**: 2026-11-19  
**Entrada**: issue #36 e SYSTEM_DESIGN §§8.1–8.2.

## Cenários e testes

### P1 — Navegar pelos menus

A pessoa navega pelos menus usando teclado e identifica o elemento em foco. Verificação: percorrer as telas, ativar controles e fechar a pausa com teclado.

### P1 — Reduzir efeitos

A pessoa ativa ou desativa a redução de efeitos; sem escolha salva, a preferência do sistema define o padrão. A escolha permanece após recarregar. Com armazenamento indisponível, a interface continua utilizável.

### P2 — Identificar limitações de toque

Em dispositivo com entrada por toque, a tela de jogo informa que a partida requer teclado; o aviso não impede o uso de teclado conectado.

### Casos de borda

- A preferência do sistema pode mudar quando não há escolha salva.
- O armazenamento pode conter dados inválidos ou estar indisponível.
- Um dispositivo pode ter teclado e toque simultaneamente.

## Requisitos

- **FR-001**: Os menus devem permitir navegação e ativação por teclado com foco visível.
- **FR-002**: Cores de texto e controles devem respeitar contraste WCAG AA no tema disponível.
- **FR-003**: Deve existir opção acessível para reduzir efeitos, persistida localmente, cujo padrão acompanha o sistema.
- **FR-004**: Quando a redução estiver ativa, animações e transições decorativas da interface devem ser reduzidas; tremores e flashes futuros devem respeitar a mesma preferência.
- **FR-005**: A tela de jogo deve avisar sobre a necessidade de teclado em dispositivos com toque.
- **FR-006**: Textos visíveis devem usar o dicionário existente.

## Critérios de sucesso

- **SC-001**: Todas as telas existentes são verificadas com teclado, incluindo foco e diálogo de pausa.
- **SC-002**: Os pares de cores usados nos controles e textos verificáveis atendem aos limites AA aplicáveis.
- **SC-003**: A preferência funciona com e sem armazenamento e respeita o padrão do sistema.
- **SC-004**: O aviso aparece em dispositivo de toque e não aparece em dispositivo sem toque.

## Premissas

- O jogo continua sendo de teclado; suporte a controles de toque não faz parte desta issue.
- No estado atual não existem tremores de tela nem flashes no Phaser.
