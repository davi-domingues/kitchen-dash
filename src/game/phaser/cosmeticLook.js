// Converte o visual vindo do registry (`#rrggbb`) em cores do Phaser, com padrão seguro.
// Formato: { themeId, theme, chefs: { p1: { hat, apron }, p2: { hat, apron } } }; o tema é único da cozinha.
const DEFAULT_THEME = 0x3b2f2f
const DEFAULT_CHEF = Object.freeze({ hat: 0xf5ead6, apron: 0xf5ead6 })
const CHEF_IDS = Object.freeze(['p1', 'p2'])
const HEX = /^#[0-9a-f]{6}$/i

// Cores de cada jogador no 2P (anel, rótulo, alvo), as mesmas do protótipo
export const PLAYER_COLORS = Object.freeze({ p1: 0x7a1f2b, p2: 0x2f6fb0 })

// Paletas da cozinha por tema, portadas do protótipo
export const THEME_PALETTES = Object.freeze({
  theme_bistro: Object.freeze({
    floor: Object.freeze([0xe9dcc4, 0xdccbaf]),
    wall: 0x5a3a28,
    counter: 0x8b5a3c,
    top: 0xc9a27a,
  }),
  theme_marble: Object.freeze({
    floor: Object.freeze([0xeceff1, 0xd7dde0]),
    wall: 0x2e3a44,
    counter: 0x4a5560,
    top: 0xcfd8dc,
  }),
  theme_provence: Object.freeze({
    floor: Object.freeze([0xe8e0f0, 0xd8cbe6]),
    wall: 0x45325c,
    counter: 0x6b4f8a,
    top: 0xd6c3a5,
  }),
})
const DEFAULT_PALETTE = THEME_PALETTES.theme_bistro

const toColor = (value, fallback) =>
  typeof value === 'string' && HEX.test(value) ? parseInt(value.slice(1), 16) : fallback

const resolveChef = (id, chef) => ({
  ...Object.fromEntries(
    Object.entries(DEFAULT_CHEF).map(([slot, color]) => [slot, toColor(chef?.[slot], color)]),
  ),
  player: PLAYER_COLORS[id],
})

export const paletteOf = (themeId) =>
  Object.hasOwn(THEME_PALETTES, themeId ?? '') ? THEME_PALETTES[themeId] : DEFAULT_PALETTE

export function resolveLook(look) {
  return {
    theme: toColor(look?.theme, DEFAULT_THEME),
    palette: paletteOf(look?.themeId),
    chefs: Object.fromEntries(CHEF_IDS.map((id) => [id, resolveChef(id, look?.chefs?.[id])])),
  }
}
