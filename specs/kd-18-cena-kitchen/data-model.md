# Data Model: KD-18

- **Chef** (estende o KD-12): `{ id: 'p1'|'p2', holding, workingAt, x, y, facing: 'up'|'down'|'left'|'right', stepCooldownMs }`.
- **Entrada de movimento**: `{ chefId, action: 'move', x: -1|0|1, y: -1|0|1 }`, uma por chef por frame.
- **Relatório de alcançabilidade**: `{ ok: boolean, unreachable: string[] }` (ids `<kind>-<x>-<y>`).
- Bloqueiam: `wall`, qualquer estação e o tile de outro chef. Andável: `floor`.
