import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { keyOwner, remapKey } from '../../game/input/keyBindings.js'
import { classifyCaptureKey, isModifierCode } from './captureKey.js'
import { keyLabel } from './keyLabels.js'
import {
  boundMessage,
  cancelledMessage,
  modifierMessage,
  sameMessage,
  swappedMessage,
} from './statusMessage.js'

// Traduz o labelId de keyLabels.js com chaves literais (i18n.test.js só reconhece literais)
function keyText(t, code) {
  switch (keyLabel(code)) {
    case 'arrowUp':
      return t('settings.keys.arrowUp')
    case 'arrowDown':
      return t('settings.keys.arrowDown')
    case 'arrowLeft':
      return t('settings.keys.arrowLeft')
    case 'arrowRight':
      return t('settings.keys.arrowRight')
    case 'enter':
      return t('settings.keys.enter')
    case 'space':
      return t('settings.keys.space')
    case 'escape':
      return t('settings.keys.escape')
    case 'tab':
      return t('settings.keys.tab')
    case 'backspace':
      return t('settings.keys.backspace')
    case 'delete':
      return t('settings.keys.delete')
    case 'home':
      return t('settings.keys.home')
    case 'end':
      return t('settings.keys.end')
    case 'pageUp':
      return t('settings.keys.pageUp')
    case 'pageDown':
      return t('settings.keys.pageDown')
    case 'insert':
      return t('settings.keys.insert')
    default: {
      const labelId = keyLabel(code)
      if (/^[a-z]$/.test(labelId)) return labelId.toUpperCase()
      if (/^[0-9]$/.test(labelId)) return labelId
      if (/^numpad[0-9]$/.test(labelId)) return labelId.slice(6)
      return t('settings.keys.unknown', { code })
    }
  }
}

// Nome traduzido do controle dono de um slot; a pausa é o slot sem player
function controlText(t, slot) {
  if (!slot.player) return t('settings.players.pause')
  return {
    up: t('settings.controls.up'),
    down: t('settings.controls.down'),
    left: t('settings.controls.left'),
    right: t('settings.controls.right'),
    action: t('settings.controls.action'),
  }[slot.control]
}

export default function KeyBindingRow({ bindings, slot, onRemap }) {
  const { t } = useTranslation()
  const [capturing, setCapturing] = useState(false)
  // Ref espelha o estado para blur/desmontagem não dependerem do próximo render
  const capturingRef = useRef(false)
  const buttonRef = useRef(null)

  const rowId = slot.player ? `${slot.player}.${slot.control}` : 'pause'
  const hintId = `${rowId}-hint`
  const code = slot.player ? bindings[slot.player][slot.control] : bindings.pause
  const control = controlText(t, slot)

  // Desmontar no meio da captura não grava nada
  useEffect(() => {
    return () => {
      capturingRef.current = false
    }
  }, [])

  function startCapture() {
    capturingRef.current = true
    setCapturing(true)
  }

  function stopCapture() {
    capturingRef.current = false
    setCapturing(false)
  }

  function handleClick() {
    if (!capturingRef.current) startCapture()
  }

  // Sair da linha (clique fora, Tab já tratado) cancela sem gravar e sem mensagem
  function handleBlur() {
    if (capturingRef.current) stopCapture()
  }

  function handleKeyDown(event) {
    if (!capturingRef.current) return
    const action = classifyCaptureKey({ code: event.code, repeat: event.repeat })

    if (action === 'cancel') {
      if (event.code === 'Escape') event.preventDefault()
      stopCapture()
      onRemap(null, cancelledMessage())
      return
    }

    if (action === 'ignore') {
      if (isModifierCode(event.code)) {
        event.preventDefault()
        onRemap(null, modifierMessage(event.key))
      }
      return
    }

    event.preventDefault()
    if (event.code === code) {
      stopCapture()
      onRemap(null, sameMessage(control, keyText(t, event.code)))
      return
    }

    // Consultar o dono antes de remapear: o `remapKey` troca as duas teclas em conflito
    const owner = keyOwner(bindings, event.code)
    const next = remapKey(bindings, slot, event.code)
    stopCapture()
    if (owner) {
      onRemap(next, swappedMessage(control, keyText(t, event.code), controlText(t, owner), keyText(t, code)))
      return
    }
    onRemap(next, boundMessage(control, keyText(t, event.code)))
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`btn w-full justify-between ${capturing ? 'btn-primary' : 'btn-ghost'}`}
      aria-label={t('settings.change', { control })}
      aria-describedby={capturing ? hintId : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <span className="font-semibold">{control}</span>
      <span id={hintId} className={capturing ? 'text-sm' : 'badge badge-neutral'}>
        {capturing ? t('settings.capture.hint') : t('settings.current', { key: keyText(t, code) })}
      </span>
    </button>
  )
}
