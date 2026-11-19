# Data Model: KD-19 parte 1

## Look (registry `COSMETIC_LOOK_KEY`, vindo do React)

`{ themeId: string, theme: '#rrggbb', chefs: { p1: { hat, apron }, p2: { hat, apron } } }` — `themeId` é novo e opcional (ausente/desconhecido → Bistrô).

## ResolvedLook (cena)

`{ theme: number, palette: { floor: [n, n], wall, counter, top }, chefs: { p1: { hat, apron, player }, p2: {...} } }`

## StoveVisual (derivado do pot)

`{ lit: bool, content: 'ingredients'|'dish'|'burnt'|'empty', cookFraction: number|null, burnFraction: number|null, warning: bool }`
