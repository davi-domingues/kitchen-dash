import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { normalizeDisplayName, validateDisplayName } from './displayName.js'

// Funções em vez de chaves soltas: o i18n.test só enxerga chamadas literais de t
const MESSAGES = {
  invalid: (t) => t('profile.account.nameInvalid'),
  taken: (t) => t('profile.account.nameTaken'),
  generic: (t) => t('profile.account.nameError'),
}

export default function DisplayNameForm({ service, userId }) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(null)
  const [value, setValue] = useState('')
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    service
      .fetchDisplayName(userId)
      .then((name) => {
        if (!active) return
        setCurrent(name)
        setValue(name ?? '')
        setState('idle')
      })
      .catch(() => active && setState('loadError'))
    return () => {
      active = false
    }
  }, [service, userId])

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = validateDisplayName(value, current)
    if (problem === 'unchanged') return
    if (problem) {
      setError('invalid')
      return
    }
    const name = normalizeDisplayName(value)
    setState('saving')
    setError(null)
    try {
      await service.updateDisplayName(userId, name)
      setCurrent(name)
      setValue(name)
      setState('saved')
    } catch (failure) {
      setError(MESSAGES[failure.reason] ? failure.reason : 'generic')
      setState('idle')
    }
  }

  if (state === 'loading') return <span className="loading loading-dots" aria-label={t('app.loading')} />
  if (state === 'loadError') {
    return (
      <p role="alert" className="text-error">
        {t('profile.account.loadError')}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
      <label className="fieldset">
        <span className="fieldset-legend">{t('profile.account.nameLabel')}</span>
        <input
          className={`input w-full ${error ? 'input-error' : ''}`}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setState('idle')
          }}
          maxLength={40}
          autoComplete="nickname"
          aria-invalid={Boolean(error)}
          aria-describedby="display-name-hint"
        />
        <span id="display-name-hint" className="label">
          {t('profile.account.nameHint')}
        </span>
      </label>
      {error && (
        <p role="alert" className="text-error">
          {MESSAGES[error](t)}
        </p>
      )}
      {state === 'saved' && <p role="status">{t('profile.account.nameSaved')}</p>}
      <button type="submit" className="btn btn-primary self-start" disabled={state === 'saving'}>
        {state === 'saving' ? t('app.loading') : t('profile.account.nameSave')}
      </button>
    </form>
  )
}
