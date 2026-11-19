import { PLAYER_CONTROLS, PLAYER_IDS, remapKey } from '../../game/input/keyBindings.js'

const ASSIGNABLE_CODE =
  /^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Space|Enter|Numpad[0-9]|NumpadEnter)$/

export function isAssignableKey(event) {
  return (
    !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey && ASSIGNABLE_CODE.test(event.code)
  )
}

export function assignKey(bindings, slot, code) {
  const slots = [
    ...PLAYER_IDS.flatMap((player) => PLAYER_CONTROLS.map((control) => ({ player, control }))),
    {},
  ]
  const getCode = (item) => (item.player ? bindings[item.player][item.control] : bindings.pause)
  const previous = getCode(slot)
  const owner = slots.find((item) => getCode(item) === code)
  const swapped = owner && getCode(owner) !== previous ? owner : null
  return { bindings: remapKey(bindings, slot, code), swapped }
}
