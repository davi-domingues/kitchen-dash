import { useTranslation } from 'react-i18next'
import { PLAYER_CONTROLS } from '../../game/input/keyBindings.js'
import KeyBindingRow from './KeyBindingRow.jsx'

function messageText(t, status) {
  if (!status) return ''
  switch (status.kind) {
    case 'bound':
      return t('settings.status.bound', status.params)
    case 'same':
      return t('settings.status.same', status.params)
    case 'swapped':
      return t('settings.status.swapped', status.params)
    case 'cancelled':
      return t('settings.status.cancelled')
    case 'restored':
      return t('settings.status.restored')
    case 'alreadyDefault':
      return t('settings.status.alreadyDefault')
    case 'modifier':
      return t('settings.status.modifier', status.params)
    default:
      return ''
  }
}

export default function KeyBindingsPanel({ bindings, status, onRemap }) {
  const { t } = useTranslation()
  const groups = [
    { player: 'p1', title: t('settings.players.p1') },
    { player: 'p2', title: t('settings.players.p2') },
  ]

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body gap-6">
        <p role="status" aria-live="polite" className="min-h-6 text-sm">
          {messageText(t, status)}
        </p>

        {groups.map(({ player, title }) => (
          <section key={player} aria-labelledby={`${player}-heading`} className="space-y-2">
            <h2 id={`${player}-heading`} className="text-lg font-semibold text-primary">
              {title}
            </h2>
            <ul className="flex flex-col gap-2">
              {PLAYER_CONTROLS.map((control) => (
                <li key={control}>
                  <KeyBindingRow bindings={bindings} slot={{ player, control }} onRemap={onRemap} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="pause-heading" className="space-y-2">
          <h2 id="pause-heading" className="text-lg font-semibold text-primary">
            {t('settings.players.pause')}
          </h2>
          <KeyBindingRow bindings={bindings} slot={{}} onRemap={onRemap} />
        </section>
      </div>
    </div>
  )
}
