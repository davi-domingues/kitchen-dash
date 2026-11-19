// Desenho procedural da cozinha no estilo do protótipo (KD-19). Só lê o estado e desenha:
// o que mostrar vem de stationVisual.js, chefVisual.js e cosmeticLook.js.
import { t } from '../../i18n/index.js'
import { STATION_KINDS } from '../core/stations.js'
import { BASE_TILE, chefPose } from './chefVisual.js'
import { resolveLook } from './cosmeticLook.js'
import { EMOJI_FONT, TEXT_FONT } from './fonts.js'
import {
  ITEM_SHAPES,
  WARNING_ICON,
  burnDanger,
  chopFraction,
  dashSegments,
  itemVisual,
  stationIcon,
  stoveVisual,
} from './stationVisual.js'

const COLORS = Object.freeze({
  ink: 0x2b1d16,
  white: 0xffffff,
  gold: 0xd9a441,
  green: 0x3f7d4e,
  red: 0xc0392b,
  plateRim: 0xc9b9a0,
  plateInner: 0xe8ddcc,
  crate: 0xa8743f,
  crateSlat: 0x7a4f27,
  board: 0xd6a46b,
  stove: 0x333333,
  burnerOn: 0xff7a1a,
  burnerOff: 0x555555,
  pot: 0x888888,
  trash: 0x555555,
  coat: 0xfdfdfd,
  skin: 0xf2c9a0,
})

// Literais para o i18n.test.js enxergar as chaves usadas
const chefLabel = (chefId) => (chefId === 'p1' ? t('game.kitchen.chef.p1') : t('game.kitchen.chef.p2'))

/** Reaproveita textos de emoji entre quadros: cria sob demanda e esconde o que sobrou. */
function createEmojiPool(scene) {
  const texts = []
  let used = 0
  return {
    begin() {
      used = 0
    },
    draw(emoji, x, y, size) {
      if (!texts[used]) {
        texts[used] = scene.add.text(0, 0, '', { fontFamily: EMOJI_FONT }).setOrigin(0.5)
      }
      const text = texts[used++]
      const fontSize = `${Math.round(size)}px`
      // setFontSize sempre refaz a textura; só chama quando muda
      if (text.style.fontSize !== fontSize) text.setFontSize(fontSize)
      text.setText(emoji).setPosition(x, y).setVisible(true)
    },
    end() {
      texts.slice(used).forEach((text) => text.setVisible(false))
    },
    destroy() {
      texts.forEach((text) => text.destroy())
    },
  }
}

/**
 * @param {Phaser.Scene} scene
 * @param {object} kitchen conteúdo da cozinha (KD-10)
 * @param {object} state MatchState inicial
 * @param {{x: number, y: number, width: number, height: number}} [area] região livre (abaixo do HUD)
 * @param {ReturnType<typeof resolveLook>} [look] visual equipado (KD-23): paleta do tema e roupa de cada chef
 */
export function createKitchenView(scene, kitchen, state, area, look = resolveLook()) {
  const box = area ?? { x: 0, y: 0, width: scene.scale.width, height: scene.scale.height }
  const rows = kitchen.tiles.length
  const cols = kitchen.tiles[0].length
  const tile = Math.floor(Math.min(box.width / cols, box.height / rows))
  // Medidas do protótipo (tile de 64 px) escaladas para o tile real
  const u = (value) => (value * tile) / BASE_TILE
  const origin = { x: box.x + (box.width - tile * cols) / 2, y: box.y + (box.height - tile * rows) / 2 }
  const at = (x, y) => ({ px: origin.x + x * tile, py: origin.y + y * tile })
  const centerOf = (x, y) => ({ cx: at(x, y).px + tile / 2, cy: at(x, y).py + tile / 2 - u(3) })
  const { palette } = look
  const playerCount = state.chefs.length
  const objects = []
  const keep = (object) => {
    objects.push(object)
    return object
  }

  const base = keep(scene.add.graphics())
  const staticEmoji = (emoji, x, y, size) =>
    keep(
      scene.add
        .text(x, y, emoji, { fontFamily: EMOJI_FONT, fontSize: `${Math.round(size)}px` })
        .setOrigin(0.5),
    )

  function drawStationBase(station) {
    const { px, py } = at(station.x, station.y)
    const { cx, cy } = centerOf(station.x, station.y)
    switch (station.kind) {
      case STATION_KINDS.CRATE:
        base.fillStyle(COLORS.crate).fillRoundedRect(px + u(8), py + u(8), tile - u(16), tile - u(20), u(4))
        base.lineStyle(u(2), COLORS.crateSlat).strokeRect(px + u(10), py + u(14), tile - u(20), u(2))
        staticEmoji(stationIcon(station), cx, cy, u(26))
        break
      case STATION_KINDS.CUTTING:
        base.fillStyle(COLORS.board).fillRoundedRect(px + u(10), py + u(10), tile - u(20), tile - u(24), u(6))
        break
      case STATION_KINDS.STOVE:
        base.fillStyle(COLORS.stove).fillRoundedRect(px + u(8), py + u(8), tile - u(16), tile - u(20), u(6))
        break
      case STATION_KINDS.PLATES:
        for (let i = 0; i < 3; i++) {
          base.fillStyle(COLORS.white).fillEllipse(cx, cy - u(i * 3), u(36), u(24))
          base.lineStyle(u(1), COLORS.plateRim).strokeEllipse(cx, cy - u(i * 3), u(36), u(24))
        }
        break
      case STATION_KINDS.TRASH:
        base.fillStyle(COLORS.trash).fillRoundedRect(px + u(14), py + u(10), tile - u(28), tile - u(22), u(5))
        staticEmoji(stationIcon(station), cx, cy, u(22))
        break
      case STATION_KINDS.PASS:
        base.fillStyle(COLORS.gold).fillRoundedRect(px + u(6), py + u(6), tile - u(12), tile - u(16), u(6))
        staticEmoji(stationIcon(station), cx, cy - u(6), u(20))
        keep(
          scene.add
            .text(cx, cy + u(12), t('game.kitchen.pass'), {
              fontFamily: TEXT_FONT,
              fontStyle: '900',
              fontSize: `${Math.round(u(11))}px`,
              color: '#7a1f2b',
            })
            .setOrigin(0.5),
        )
        break
      default:
        break
    }
  }

  kitchen.tiles.forEach((row, y) =>
    [...row].forEach((symbol, x) => {
      const { px, py } = at(x, y)
      const kind = kitchen.legend[symbol].kind
      if (kind === 'floor') {
        base.fillStyle(palette.floor[(x + y) % 2]).fillRect(px, py, tile, tile)
        return
      }
      base.fillStyle(palette.wall).fillRect(px, py, tile, tile)
      if (kind === 'wall') return
      base.fillStyle(palette.counter).fillRoundedRect(px + u(2), py + u(2), tile - u(4), tile - u(4), u(8))
      base.fillStyle(palette.top).fillRoundedRect(px + u(5), py + u(5), tile - u(10), tile - u(14), u(6))
    }),
  )
  state.stations.forEach(drawStationBase)

  const stationLayer = keep(scene.add.graphics())
  const stationEmojis = createEmojiPool(scene)
  const targetLayer = keep(scene.add.graphics())
  const chefLayer = keep(scene.add.graphics())
  const chefEmojis = createEmojiPool(scene)
  const labels = new Map(
    state.chefs.map((c) => [
      c.id,
      keep(
        scene.add
          .text(0, 0, chefLabel(c.id), {
            fontFamily: TEXT_FONT,
            fontStyle: '900',
            fontSize: `${Math.round(u(12))}px`,
            color: `#${look.chefs[c.id].player.toString(16).padStart(6, '0')}`,
            stroke: '#ffffff',
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setVisible(playerCount > 1),
      ),
    ]),
  )

  function bar(g, x, y, width, fraction, color) {
    g.fillStyle(0x000000, 0.45).fillRoundedRect(x, y, width, u(8), u(4))
    if (fraction > 0) {
      const fill = (width - u(2)) * fraction
      g.fillStyle(color).fillRoundedRect(x + u(1), y + u(1), fill, u(6), Math.min(u(3), fill / 2))
    }
  }

  function drawItem(g, pool, item, cx, cy, scale = 1) {
    const { shape, emojis } = itemVisual(item)
    const s = (value) => u(value * scale)
    if (shape === ITEM_SHAPES.WHOLE) pool.draw(emojis[0], cx, cy, s(30))
    if (shape === ITEM_SHAPES.CHOPPED) {
      g.fillStyle(COLORS.white).fillRoundedRect(cx - s(18), cy - s(12), s(36), s(24), s(8))
      pool.draw(emojis[0], cx - s(7), cy, s(16))
      pool.draw(emojis[1], cx + s(7), cy + s(2), s(14))
    }
    if (shape === ITEM_SHAPES.PLATE) {
      g.fillStyle(COLORS.white).fillEllipse(cx, cy, s(44), s(34))
      g.lineStyle(u(2), COLORS.plateRim).strokeEllipse(cx, cy, s(44), s(34))
      g.lineStyle(u(2), COLORS.plateInner).strokeEllipse(cx, cy, s(30), s(22))
      if (item.recipeId) {
        pool.draw(emojis[0], cx, cy, s(22))
        return
      }
      const spread = emojis.length > 1 ? s(8) : 0
      emojis.forEach((emoji, i) => pool.draw(emoji, cx + (i % 2 ? spread : -spread), cy, s(16)))
    }
  }

  function drawStove(station, elapsedMs) {
    const { px, py } = at(station.x, station.y)
    const { cx, cy } = centerOf(station.x, station.y)
    const view = stoveVisual(station.pot, { burnAfterMs: kitchen.stoveBurnAfterMs, elapsedMs })
    stationLayer.fillStyle(view.lit ? COLORS.burnerOn : COLORS.burnerOff).fillCircle(cx, cy, u(16))
    stationLayer.fillStyle(COLORS.pot).fillCircle(cx, cy, u(13))
    const size = view.emojis.length > 1 ? u(12) : u(20)
    view.emojis.forEach((emoji, i) =>
      stationEmojis.draw(emoji, cx + (view.emojis.length > 1 ? (i - 1) * u(8) : 0), cy, size),
    )
    const barY = py + tile - u(12)
    if (view.cookFraction !== null)
      bar(stationLayer, px + u(8), barY, tile - u(16), view.cookFraction, COLORS.green)
    if (view.burnFraction !== null) {
      const color = burnDanger(view.burnFraction) ? COLORS.red : COLORS.gold
      bar(stationLayer, px + u(8), barY, tile - u(16), view.burnFraction, color)
    }
    if (view.warning) stationEmojis.draw(WARNING_ICON, px + tile - u(10), py + u(10), u(14))
  }

  function drawStations(stations, elapsedMs) {
    stationLayer.clear()
    stationEmojis.begin()
    for (const station of stations) {
      const { px, py } = at(station.x, station.y)
      const { cx, cy } = centerOf(station.x, station.y)
      if (station.kind === STATION_KINDS.STOVE) drawStove(station, elapsedMs)
      if (station.kind === STATION_KINDS.CUTTING) {
        const knife = stationIcon(station)
        if (knife) stationEmojis.draw(knife, cx, cy, u(22))
      }
      if (!station.item) continue
      drawItem(stationLayer, stationEmojis, station.item, cx, cy)
      const chop = station.kind === STATION_KINDS.CUTTING ? chopFraction(station.item) : null
      if (chop !== null) bar(stationLayer, px + u(8), py + tile - u(12), tile - u(16), chop, COLORS.green)
    }
    stationEmojis.end()
  }

  function strokeDashedRoundRect(g, x, y, size, radius) {
    for (const [x1, y1, x2, y2] of dashSegments({ x, y, width: size, height: size, radius })) {
      g.lineBetween(x1, y1, x2, y2)
    }
    const corners = [
      [x + size - radius, y + radius, -90, 0],
      [x + size - radius, y + size - radius, 0, 90],
      [x + radius, y + size - radius, 90, 180],
      [x + radius, y + radius, 180, 270],
    ]
    for (const [ax, ay, from, to] of corners) {
      g.beginPath()
      g.arc(ax, ay, radius, (from * Math.PI) / 180, (to * Math.PI) / 180)
      g.strokePath()
    }
  }

  /** @param {{chefId: string, station: object, ready: boolean}[]} targets */
  function drawTargets(targets) {
    targetLayer.clear()
    for (const { chefId, station, ready } of targets) {
      const { px, py } = at(station.x, station.y)
      const index = chefId === 'p1' ? 0 : 1
      const color = playerCount > 1 ? look.chefs[chefId].player : COLORS.white
      // Alvo onde a ação não serve fica mais fino e apagado, sem mudar de cor
      targetLayer.lineStyle(u(ready ? 3 : 2), color, ready ? 0.95 : 0.55)
      const inset = u(3 + index * 3)
      strokeDashedRoundRect(targetLayer, px + inset, py + inset, tile - 2 * inset, u(8))
    }
  }

  function drawChef(chef, elapsedMs) {
    const { cx: x } = centerOf(chef.x, chef.y)
    const y = at(chef.x, chef.y).py + tile / 2
    const outfit = look.chefs[chef.id] ?? look.chefs.p1
    const { fx, fy, bob, showPlayer } = chefPose(chef, { elapsedMs, playerCount })
    const g = chefLayer
    g.fillStyle(0x000000, 0.18).fillEllipse(x, y + u(20), u(40), u(16))
    if (showPlayer) g.lineStyle(u(3), outfit.player).strokeEllipse(x, y + u(20), u(42), u(18))
    g.lineStyle(u(2), COLORS.ink)
    g.fillStyle(COLORS.coat).fillEllipse(x, y + u(6) + bob * 0.3, u(36), u(32))
    g.strokeEllipse(x, y + u(6) + bob * 0.3, u(36), u(32))
    g.fillStyle(outfit.apron).fillRoundedRect(x - u(11), y + u(2) + bob * 0.3, u(22), u(16), u(5))
    g.fillStyle(COLORS.skin).fillCircle(x, y - u(10) + bob, u(12))
    g.strokeCircle(x, y - u(10) + bob, u(12))
    g.fillStyle(COLORS.ink)
    g.fillCircle(x - u(4) + u(fx * 4), y - u(10) + u(fy * 3) + bob, u(1.8))
    g.fillCircle(x + u(4) + u(fx * 4), y - u(10) + u(fy * 3) + bob, u(1.8))
    g.fillStyle(outfit.hat)
    for (const [dx, dy, r] of [
      [-7, -26, 7],
      [0, -30, 8],
      [7, -26, 7],
    ]) {
      g.fillCircle(x + u(dx), y + u(dy) + bob, u(r))
      g.strokeCircle(x + u(dx), y + u(dy) + bob, u(r))
    }
    g.fillRect(x - u(10), y - u(25) + bob, u(20), u(6))
    g.strokeRect(x - u(10), y - u(25) + bob, u(20), u(6))
    labels.get(chef.id).setPosition(x - u(14), y - u(38))
    g.fillStyle(outfit.player).fillCircle(x + u(fx * 22), y + u(4) + u(fy * 22), u(3))
    if (chef.holding) drawItem(g, chefEmojis, chef.holding, x + u(fx * 24), y + u(fy * 20 + 4), 0.8)
  }

  /** @param {{chefId: string, station: object, ready: boolean}[]} targets */
  function render(current, targets, elapsedMs = scene.time.now) {
    drawStations(current.stations, elapsedMs)
    drawTargets(targets)
    chefLayer.clear()
    chefEmojis.begin()
    current.chefs.forEach((chef) => drawChef(chef, elapsedMs))
    chefEmojis.end()
  }

  function destroy() {
    stationEmojis.destroy()
    chefEmojis.destroy()
    objects.forEach((object) => object.destroy())
  }

  return { render, destroy }
}
