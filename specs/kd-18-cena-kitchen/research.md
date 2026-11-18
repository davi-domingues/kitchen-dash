# Research: KD-18

- **Movimento em grade com passo fixo**: 1 tile a cada `CHEF_STEP_MS = 150` ms enquanto a direção está ativa; na diagonal, o horizontal tem prioridade. Motivo: determinístico, sem física, colisão por tile. Alternativa descartada: Arcade Physics (regra fora do core, não reproduzível).
- **Onde fica o passo**: constante do core, não do `kitchens.json`, porque vale para todas as cozinhas. Se virar ajuste por cozinha, entra no schema numa issue própria.
- **Movimento como sistema**: `createMovementSystem(kitchen)` recebe `{ chefId, action: 'move', x, y }`; o update composto filtra `move` antes do sistema de estações, que rejeita ação desconhecida.
- **Estação alvo**: tile adjacente na direção `facing`; a cena resolve o `stationId` antes de enviar `tap`/`holdStart` (contrato do KD-12).
- **Alcançabilidade**: BFS a partir dos spawns sobre o piso; uma estação é alcançável se algum vizinho ortogonal for piso alcançável. Testada sobre todas as `KITCHENS`.
- **Arte**: Graphics/Text com emoji; atlas fica para o KD-19.
