import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DEFAULT_KEY_BINDINGS, PLAYER_CONTROLS, PLAYER_IDS } from '../../game/input/keyBindings.js'
import { loadKeyBindings, saveKeyBindings } from '../../services/settings.js'
import { storage } from '../../services/storage.js'
import { assignKey, isAssignableKey } from './keyCapture.js'

export default function ControlsPage() {
  const { t } = useTranslation()
  const [bindings, setBindings] = useState(loadKeyBindings)
  const [capturing, setCapturing] = useState(null)
  const [message, setMessage] = useState('')
  const [persistent, setPersistent] = useState(() => storage.isPersistent)
  const players = { p1: t('controls.playerOne'), p2: t('controls.playerTwo') }
  const actions = {
    up: t('controls.up'),
    down: t('controls.down'),
    left: t('controls.left'),
    right: t('controls.right'),
    action: t('controls.action'),
  }
  const specialKeys = {
    ArrowUp: t('controls.keyUp'),
    ArrowDown: t('controls.keyDown'),
    ArrowLeft: t('controls.keyLeft'),
    ArrowRight: t('controls.keyRight'),
    Space: t('controls.keySpace'),
    Enter: t('controls.keyEnter'),
    NumpadEnter: t('controls.keyNumpadEnter'),
  }
  const keyName = (code) => {
    if (specialKeys[code]) return specialKeys[code]
    if (/^Numpad[0-9]$/.test(code)) return t('controls.keyNumpad', { number: code.slice(-1) })
    return code.replace(/^Key|^Digit/, '')
  }
  const slotName = (slot) =>
    slot.player ? `${players[slot.player]} — ${actions[slot.control]}` : t('controls.pause')
  const slotId = (slot) => (slot.player ? `${slot.player}-${slot.control}` : 'pause')

  function save(next) {
    saveKeyBindings(next)
    setBindings(next)
    setPersistent(storage.isPersistent)
  }

  function handleKey(event, slot) {
    if (capturing !== slotId(slot)) return
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault()
      setCapturing(null)
      setMessage(t('controls.cancelled'))
      return
    }
    if (!isAssignableKey(event)) {
      setMessage(t('controls.invalidKey'))
      return
    }
    event.preventDefault()
    const result = assignKey(bindings, slot, event.code)
    save(result.bindings)
    setCapturing(null)
    setMessage(
      result.swapped
        ? t('controls.swapped', { first: slotName(slot), second: slotName(result.swapped) })
        : t('controls.saved', { action: slotName(slot), key: keyName(event.code) }),
    )
  }

  function renderControl(slot, code) {
    const name = slotName(slot)
    const active = capturing === slotId(slot)
    return (
      <div key={slotId(slot)} className="flex items-center justify-between gap-4">
        <span>{slot.player ? actions[slot.control] : name}</span>
        <button
          type="button"
          className="btn btn-outline"
          aria-label={t('controls.changeLabel', { action: name, key: keyName(code) })}
          aria-describedby="capture-instructions"
          onClick={() => {
            setCapturing(slotId(slot))
            setMessage(t('controls.waiting', { action: name }))
          }}
          onKeyDown={(event) => handleKey(event, slot)}
          onBlur={() => setCapturing(null)}
        >
          {active ? t('controls.pressKey') : keyName(code)}
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-base-200 p-4">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <Link to="/" className="btn btn-ghost self-start">
          {t('nav.home')}
        </Link>
        <h1 className="text-3xl font-bold text-primary">{t('controls.title')}</h1>
        <p id="capture-instructions">{t('controls.instructions')}</p>
        {!persistent && (
          <p role="status" className="alert">
            {t('controls.temporary')}
          </p>
        )}
        <p role="status" aria-live="polite" aria-atomic="true">
          {message}
        </p>
        {PLAYER_IDS.map((player) => (
          <fieldset key={player} className="card gap-3 bg-base-100 p-5">
            <legend className="font-bold">{players[player]}</legend>
            {PLAYER_CONTROLS.map((control) => renderControl({ player, control }, bindings[player][control]))}
          </fieldset>
        ))}
        <div className="card bg-base-100 p-5">{renderControl({}, bindings.pause)}</div>
        <button
          type="button"
          className="btn btn-secondary self-start"
          onClick={() => {
            save(DEFAULT_KEY_BINDINGS)
            setCapturing(null)
            setMessage(t('controls.restored'))
          }}
        >
          {t('controls.restore')}
        </button>
      </div>
    </main>
  )
}
