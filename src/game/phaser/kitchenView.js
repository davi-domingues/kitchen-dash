// Desenho placeholder da cozinha (retângulos e emojis) até a arte do KD-19. Só lê o estado.
import { getIngredient, getRecipe } from '../../content/index.js'
import { t } from '../../i18n/index.js'
import { resolveLook } from './cosmeticLook.js'
import { POT_STATUS, STATION_KINDS } from '../core/stations.js'

const COLORS = Object.freeze({
  wall: 0x3b2f2f,
  floor: 0xe9dcc3,
  station: 0x8a6d4b,
  p1: 0x2f6fd6,
  p2: 0xd64f2f,
  targetReady: 0x3ad65a,
  targetIdle: 0xf5ead6,
})

const STATION_ICONS = Object.freeze({
  [STATION_KINDS.CUTTING]: '🔪',
  [STATION_KINDS.STOVE]: '🍲',
  [STATION_KINDS.PLATES]: '🍽️',
  [STATION_KINDS.TRASH]: '🗑️',
  [STATION_KINDS.PASS]: '🛎️',
})

const POT_ICONS = Object.freeze({
  [POT_STATUS.COOKING]: '♨️',
  [POT_STATUS.DONE]: '✅',
  [POT_STATUS.BURNT]: '🔥',
})

function itemIcon(item) {
  if (!item) return ''
  if (item.type === 'ingredient') return getIngredient(item.ingredientId).emoji + (item.chopped ? '✂' : '')
  if (item.recipeId) return getRecipe(item.recipeId).emoji
  return '🍽️' + item.ingredients.map((id) => getIngredient(id).emoji).join('')
}

function stationIcon(station) {
  if (station.kind === STATION_KINDS.CRATE) return getIngredient(station.ingredientId).emoji
  if (station.kind === STATION_KINDS.STOVE) {
    const pot = station.pot.ingredients.map((id) => getIngredient(id).emoji).join('')
    return `${STATION_ICONS.stove}${POT_ICONS[station.pot.status] ?? ''}${pot}`
  }
  return `${STATION_ICONS[station.kind]}${itemIcon(station.item)}`
}

// Literais para o i18n.test.js enxergar as chaves usadas
const chefLabel = (chefId) => (chefId === 'p1' ? t('game.kitchen.chef.p1') : t('game.kitchen.chef.p2'))

const textStyle = (size) => ({
  fontFamily: 'sans-serif',
  fontSize: `${Math.round(size)}px`,
  color: '#1b1b1b',
})

/**
 * @param {Phaser.Scene} scene
 * @param {object} kitchen conteúdo da cozinha (KD-10)
 * @param {object} state MatchState inicial
 * @param {{x: number, y: number, width: number, height: number}} [area] região livre (abaixo do HUD)
 * @param {ReturnType<typeof resolveLook>} [look] cores equipadas (KD-23): tema pinta as paredes, chapéu e avental por chef
 */
export function createKitchenView(scene, kitchen, state, area, look = resolveLook()) {
  const box = area ?? { x: 0, y: 0, width: scene.scale.width, height: scene.scale.height }
  const rows = kitchen.tiles.length
  const cols = kitchen.tiles[0].length
  const tile = Math.floor(Math.min(box.width / cols, box.height / rows))
  const origin = { x: box.x + (box.width - tile * cols) / 2, y: box.y + (box.height - tile * rows) / 2 }
  const at = (x, y) => ({ x: origin.x + x * tile, y: origin.y + y * tile })
  const center = (x, y) => ({ x: at(x, y).x + tile / 2, y: at(x, y).y + tile / 2 })

  const floor = scene.add.graphics()
  kitchen.tiles.forEach((row, y) =>
    [...row].forEach((symbol, x) => {
      const kind = kitchen.legend[symbol].kind
      const color = kind === 'wall' ? look.theme : (COLORS[kind] ?? COLORS.station)
      floor.fillStyle(color).fillRect(at(x, y).x, at(x, y).y, tile, tile)
    }),
  )

  const stationTexts = new Map(
    state.stations.map((s) => {
      const { x, y } = center(s.x, s.y)
      return [s.id, scene.add.text(x, y, '', textStyle(tile * 0.4)).setOrigin(0.5)]
    }),
  )
  const highlight = scene.add.graphics()
  const chefs = new Map(
    state.chefs.map((c) => {
      const body = scene.add.rectangle(0, 0, tile * 0.8, tile * 0.8, COLORS[c.id])
      const outfit = look.chefs[c.id] ?? look.chefs.p1
      // Placeholder até a KD-19: faixa do chapéu em cima e avental na metade de baixo
      const hat = scene.add.rectangle(0, 0, tile * 0.6, tile * 0.18, outfit.hat).setStrokeStyle(1, 0x1b1b1b)
      const apron = scene.add
        .rectangle(0, 0, tile * 0.5, tile * 0.32, outfit.apron)
        .setStrokeStyle(1, 0x1b1b1b)
      const label = scene.add.text(0, 0, chefLabel(c.id), textStyle(tile * 0.25)).setOrigin(0.5)
      const holding = scene.add.text(0, 0, '', textStyle(tile * 0.35)).setOrigin(0.5, 1)
      return [c.id, { body, hat, apron, label, holding }]
    }),
  )

  /** @param {{chefId: string, station: object, ready: boolean}[]} targets */
  function render(current, targets) {
    current.stations.forEach((s) => stationTexts.get(s.id).setText(stationIcon(s)))
    highlight.clear()
    for (const { station, ready } of targets) {
      const { x, y } = at(station.x, station.y)
      highlight
        .lineStyle(ready ? 4 : 2, ready ? COLORS.targetReady : COLORS.targetIdle)
        .strokeRect(x + 2, y + 2, tile - 4, tile - 4)
    }
    current.chefs.forEach((c) => {
      const view = chefs.get(c.id)
      const { x, y } = center(c.x, c.y)
      view.body.setPosition(x, y)
      view.hat.setPosition(x, y - tile * 0.4)
      view.apron.setPosition(x, y + tile * 0.22)
      view.label.setPosition(x, y)
      view.holding.setPosition(x, y - tile * 0.3).setText(itemIcon(c.holding))
    })
  }

  return { render }
}
