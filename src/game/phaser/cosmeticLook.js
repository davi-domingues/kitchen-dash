// Converte o visual vindo do registry (`#rrggbb` por slot) em cores do Phaser, com padrão seguro
const DEFAULT_LOOK = Object.freeze({ hat: 0xf5ead6, apron: 0xf5ead6, theme: 0x3b2f2f })
const HEX = /^#[0-9a-f]{6}$/i

const toColor = (value, fallback) =>
  typeof value === 'string' && HEX.test(value) ? parseInt(value.slice(1), 16) : fallback

export function resolveLook(look) {
  return Object.fromEntries(
    Object.entries(DEFAULT_LOOK).map(([slot, color]) => [slot, toColor(look?.[slot], color)]),
  )
}
