# Data Model — KD-10

O `id` de toda entidade segue `^[a-z][a-z0-9_]*$` e é único dentro do seu tipo.

## Ingredient (`recipes.json` → `ingredients`)

| Campo | Tipo | Regra |
|---|---|---|
| id | string | único |
| emoji | string | não vazio (placeholder até a KD-19) |
| chopMs | int | ≥ 1 |

## Recipe (`recipes.json` → `recipes`)

| Campo | Tipo | Regra |
|---|---|---|
| id | string | único |
| emoji | string | não vazio |
| points | int | ≥ 1 |
| unlockAtMs | int | ≥ 0 (tempo de partida) |
| container | `plate` \| `pot` | — |
| ingredients | string[] | 1 a 4 itens; cada um referencia um Ingredient; aceita repetição |
| cookMs | int | `pot` ⇒ ≥ 1; `plate` ⇒ 0 |

## Kitchen (`kitchens.json` → `kitchens`)

| Campo | Tipo | Regra |
|---|---|---|
| id | string | único |
| tiles | string[] | todas as linhas com a mesma largura; todo caractere está na legenda |
| legend | `{char: {kind, ingredient?}}` | `kind` ∈ wall, floor, crate, cutting, stove, counter, plates, trash, pass; `ingredient` só em crate e obrigatório nele |
| spawns | `[[x,y],[x,y]]` | P1 e P2, sempre em floor |
| stoveBurnAfterMs | int | ≥ 1 |

Invariantes do mapa:

- Toda estação tem chão em uma das 4 células vizinhas.
- Todos os kinds de estação aparecem no mapa.
- Existe uma caixa para cada ingrediente.

## Cosmetic (`cosmetics.json` → `cosmetics`)

| Campo | Tipo | Regra |
|---|---|---|
| id | string | único |
| slot | `hat` \| `apron` \| `theme` | cada slot tem ao menos um item com unlockScore 0 |
| unlockScore | int | ≥ 0 (recorde pessoal) |
| color | `#rrggbb` | placeholder da arte |
