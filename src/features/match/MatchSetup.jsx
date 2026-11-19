import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MATCH_MODES, PLAYER_COUNTS } from '../../game/core/matchModes.js'

export default function MatchSetup({ initialConfig, onStart, reduceEffects, onReduceEffectsChange }) {
  const { t } = useTranslation()
  const [players, setPlayers] = useState(initialConfig.players)
  const [mode, setMode] = useState(initialConfig.mode)

  const playerLabels = { 1: t('play.setup.onePlayer'), 2: t('play.setup.twoPlayers') }
  const modeLabels = {
    [MATCH_MODES.CLASSIC]: { name: t('play.setup.modeClassic'), hint: t('play.setup.modeClassicHint') },
    [MATCH_MODES.FREE]: { name: t('play.setup.modeFree'), hint: t('play.setup.modeFreeHint') },
    [MATCH_MODES.CHALLENGE]: { name: t('play.setup.modeChallenge'), hint: t('play.setup.modeChallengeHint') },
  }

  function handleSubmit(event) {
    event.preventDefault()
    onStart({ mode, players })
  }

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-lg bg-base-100 shadow-xl">
      <div className="card-body gap-6">
        <h1 className="card-title text-3xl text-primary">{t('play.setup.title')}</h1>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">{t('play.setup.playersLegend')}</legend>
          <div className="join">
            {PLAYER_COUNTS.map((count) => (
              <input
                key={count}
                type="radio"
                name="players"
                className="btn join-item"
                aria-label={playerLabels[count]}
                checked={players === count}
                onChange={() => setPlayers(count)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="fieldset gap-2">
          <legend className="fieldset-legend text-base">{t('play.setup.modeLegend')}</legend>
          {Object.values(MATCH_MODES).map((value) => (
            <label key={value} className="label cursor-pointer items-start gap-3 text-base-content">
              <input
                type="radio"
                name="mode"
                className="radio radio-primary mt-1"
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              <span>
                <span className="block font-semibold">{modeLabels[value].name}</span>
                <span className="block text-sm whitespace-normal opacity-80">{modeLabels[value].hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="label cursor-pointer gap-3 text-base-content">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={reduceEffects}
            onChange={(event) => onReduceEffectsChange(event.target.checked)}
          />
          <span>{t('play.setup.reduceEffects')}</span>
        </label>

        <button type="submit" className="btn btn-primary btn-lg">
          {t('play.setup.start')}
        </button>
      </div>
    </form>
  )
}
