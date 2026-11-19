import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { isDefaultKeyBindings, sanitizeKeyBindings } from '../game/input/keyBindings.js'
import KeyBindingsPanel from '../features/settings/KeyBindingsPanel.jsx'
import RestoreDefaultsDialog from '../features/settings/RestoreDefaultsDialog.jsx'
import { alreadyDefaultMessage, restoredMessage } from '../features/settings/statusMessage.js'
import { loadKeyBindings, saveKeyBindings } from '../services/settings.js'
import { storage } from '../services/storage.js'

export default function SettingsPage() {
  const { t } = useTranslation()
  const [bindings, setBindings] = useState(loadKeyBindings)
  const [status, setStatus] = useState(null)
  const [persistent] = useState(() => storage.isPersistent)
  const [restoreOpen, setRestoreOpen] = useState(false)

  // Grava antes de atualizar a tela; `next` nulo significa cancelamento/recusa
  function handleRemap(next, message) {
    if (next) {
      saveKeyBindings(next)
      setBindings(next)
    }
    setStatus(message)
  }

  function confirmRestore() {
    setRestoreOpen(false)
    if (isDefaultKeyBindings(bindings)) {
      setStatus(alreadyDefaultMessage())
      return
    }
    const next = sanitizeKeyBindings(null)
    saveKeyBindings(next)
    setBindings(next)
    setStatus(restoredMessage())
  }

  return (
    <main className="min-h-screen bg-base-200 p-4">
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <Link to="/" className="btn btn-ghost self-start">
          <ArrowLeft aria-hidden="true" /> {t('play.back')}
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">{t('settings.title')}</h1>
          <p className="opacity-80">{t('settings.intro')}</p>
        </header>

        {!persistent && (
          <p role="status" className="alert alert-warning">
            {t('settings.storageWarning')}
          </p>
        )}

        <KeyBindingsPanel bindings={bindings} status={status} onRemap={handleRemap} />

        <button type="button" className="btn btn-outline btn-error" onClick={() => setRestoreOpen(true)}>
          {t('settings.restore.button')}
        </button>

        {restoreOpen && (
          <RestoreDefaultsDialog onConfirm={confirmRestore} onCancel={() => setRestoreOpen(false)} />
        )}
      </div>
    </main>
  )
}
