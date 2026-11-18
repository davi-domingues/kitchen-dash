// Converte o visual vindo do registry (`#rrggbb`) em cores do Phaser, com padrão seguro.
// Formato: { theme, chefs: { p1: { hat, apron }, p2: { hat, apron } } }; o tema é único da cozinha.
const DEFAULT_THEME = 0x3b2f2f
const DEFAULT_CHEF = Object.freeze({ hat: 0xf5ead6, apron: 0xf5ead6 })
const CHEF_IDS = Object.freeze(['p1', 'p2'])
const HEX = /^#[0-9a-f]{6}$/i

const toColor = (value, fallback) =>
  typeof value === 'string' && HEX.test(value) ? parseInt(value.slice(1), 16) : fallback

const resolveChef = (chef) =>
  Object.fromEntries(
    Object.entries(DEFAULT_CHEF).map(([slot, color]) => [slot, toColor(chef?.[slot], color)]),
  )

export function resolveLook(look) {
  return {
    theme: toColor(look?.theme, DEFAULT_THEME),
    chefs: Object.fromEntries(CHEF_IDS.map((id) => [id, resolveChef(look?.chefs?.[id])])),
  }
}
