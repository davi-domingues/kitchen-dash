// Cosméticos locais (KD-23): regras puras, sem storage nem React.
// Desbloqueio = maior pontuação pessoal ≥ unlockScore, a mesma regra do submit_score (KD-31),
// para que a conta (KD-38) e o navegador concordem sobre o que foi ganho.
import { COSMETIC_SLOTS, COSMETICS, getUnlockedCosmetics } from '../../content/index.js'

const DEFAULTS = Object.freeze(
  Object.fromEntries(
    COSMETIC_SLOTS.map((slot) => [slot, COSMETICS.find((c) => c.slot === slot && c.unlockScore === 0).id]),
  ),
)
const FREE_IDS = Object.freeze(Object.values(DEFAULTS))
const byId = new Map(COSMETICS.map((c) => [c.id, c]))

// Slots que cada chef escolhe; o tema pinta a cozinha inteira e fica com o P1
export const CHEF_SLOTS = Object.freeze(['hat', 'apron'])
const chefPart = (equipped) => Object.fromEntries(CHEF_SLOTS.map((slot) => [slot, equipped[slot]]))

// Ordem do catálogo para o resultado não depender da ordem de chegada
const inCatalogOrder = (ids) => COSMETICS.map((c) => c.id).filter((id) => ids.has(id))

export function createEmptyCosmetics() {
  return { bestScore: 0, unlocked: [...FREE_IDS], equipped: { ...DEFAULTS }, equippedP2: chefPart(DEFAULTS) }
}

function withUnlocked(state, ids) {
  const known = new Set(state.unlocked)
  const newlyUnlocked = inCatalogOrder(new Set(ids.filter((id) => byId.has(id) && !known.has(id))))
  if (newlyUnlocked.length === 0) return { state, newlyUnlocked }
  return {
    state: { ...state, unlocked: inCatalogOrder(new Set([...known, ...newlyUnlocked])) },
    newlyUnlocked,
  }
}

function isEquippable(state, id, slot) {
  const item = byId.get(id)
  return Boolean(item) && item.slot === slot && state.unlocked.includes(id)
}

// Dado vindo do localStorage é não confiável: normaliza o que dá e descarta o resto
export function sanitizeCosmetics(raw) {
  const empty = createEmptyCosmetics()
  if (!raw || typeof raw !== 'object') return empty
  const bestScore = Number.isInteger(raw.bestScore) && raw.bestScore > 0 ? raw.bestScore : 0
  const ids = Array.isArray(raw.unlocked) ? raw.unlocked.filter((id) => byId.has(id)) : []
  const unlocked = inCatalogOrder(new Set([...FREE_IDS, ...ids]))
  const state = { bestScore, unlocked }
  const equipped = Object.fromEntries(
    COSMETIC_SLOTS.map((slot) => {
      const id = raw.equipped?.[slot]
      return [slot, isEquippable(state, id, slot) ? id : DEFAULTS[slot]]
    }),
  )
  // Formato antigo (sem equippedP2): o P2 herda o visual do P1, que era o que ele já usava
  const p2Source = raw.equippedP2 && typeof raw.equippedP2 === 'object' ? raw.equippedP2 : equipped
  const equippedP2 = Object.fromEntries(
    CHEF_SLOTS.map((slot) => {
      const id = p2Source[slot]
      return [slot, isEquippable(state, id, slot) ? id : DEFAULTS[slot]]
    }),
  )
  return { ...state, equipped, equippedP2 }
}

/** Registra a pontuação de uma partida; só o máximo conta. */
export function applyScore(state, score) {
  if (!Number.isInteger(score) || score <= state.bestScore) return { state, newlyUnlocked: [] }
  const ids = getUnlockedCosmetics(score).map((c) => c.id)
  return withUnlocked({ ...state, bestScore: score }, ids)
}

/** Para a KD-38: une os itens que a conta já tem; ids desconhecidos são ignorados. */
export function mergeUnlocked(state, ids) {
  return withUnlocked(state, Array.isArray(ids) ? ids : [])
}

/** Equipa um item ganho no slot dele; item bloqueado ou desconhecido não muda nada. */
export function equip(state, id) {
  const item = byId.get(id)
  if (!item || !isEquippable(state, id, item.slot)) return state
  return { ...state, equipped: { ...state.equipped, [item.slot]: id } }
}

/** KD-38: o equipado da conta vence, slot a slot, quando o item está liberado e no slot certo. */
export function applyAccountEquipped(state, equipped) {
  if (!equipped || typeof equipped !== 'object') return state
  return COSMETIC_SLOTS.reduce((current, slot) => {
    const id = equipped[slot]
    return isEquippable(current, id, slot) ? equip(current, id) : current
  }, state)
}

/** Equipa no P2 um item ganho (os mesmos itens do P1); tema não é por chef e não muda nada. */
export function equipP2(state, id) {
  const item = byId.get(id)
  if (!item || !CHEF_SLOTS.includes(item.slot) || !isEquippable(state, id, item.slot)) return state
  return { ...state, equippedP2: { ...state.equippedP2, [item.slot]: id } }
}

export const isUnlocked = (state, id) => state.unlocked.includes(id)

const colorsOf = (equipped) =>
  Object.fromEntries(CHEF_SLOTS.map((slot) => [slot, byId.get(equipped[slot]).color]))

/** Cores equipadas no formato que a cena recebe pelo registry: tema único e visual por chef. */
export function getLook(state) {
  return {
    theme: byId.get(state.equipped.theme).color,
    chefs: { p1: colorsOf(state.equipped), p2: colorsOf(state.equippedP2) },
  }
}
