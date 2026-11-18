import { ArrowLeft } from 'lucide-react'
import { useEffect, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import MatchResult from '../features/match/MatchResult.jsx'
import MatchSetup from '../features/match/MatchSetup.jsx'
import PauseDialog from '../features/match/PauseDialog.jsx'
import { useRecordedResult } from '../features/progress/useRecordedResult.js'
import { useSubmitMatch } from '../features/progress/useScoreSync.js'
import { PLAY_PHASES, initialPlayState, playFlowReducer } from '../features/match/playFlow.js'
import { EventBus } from '../game/phaser/EventBus.js'
import PhaserGame from '../game/phaser/PhaserGame.jsx'
import { MATCH_MODES } from '../game/core/matchModes.js'
import { GAME_EVENTS } from '../game/phaser/events.js'
import { loadKeyBindings } from '../services/settings.js'

export default function PlayPage() {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(playFlowReducer, initialPlayState)
  const recorded = useRecordedResult(state.phase === PLAY_PHASES.RESULT ? state.result : null)
  useSubmitMatch(recorded ? state.result.matchId : null)
  // Lidas uma vez por visita: a cena recebe as teclas pelo registry
  const [keyBindings] = useState(loadKeyBindings)
  const inMatch = state.phase === PLAY_PHASES.PLAYING || state.phase === PLAY_PHASES.PAUSED

  useEffect(() => {
    const onPaused = () => dispatch({ type: 'paused' })
    const onEnded = (payload) => dispatch({ type: 'ended', payload })
    EventBus.on(GAME_EVENTS.MATCH_PAUSED, onPaused)
    EventBus.on(GAME_EVENTS.MATCH_ENDED, onEnded)
    return () => {
      EventBus.off(GAME_EVENTS.MATCH_PAUSED, onPaused)
      EventBus.off(GAME_EVENTS.MATCH_ENDED, onEnded)
    }
  }, [])

  function resume() {
    dispatch({ type: 'resumed' })
    EventBus.emit(GAME_EVENTS.MATCH_RESUMED)
  }

  const endTurn = () => EventBus.emit(GAME_EVENTS.MATCH_END_REQUESTED)

  const backToSetup = () => dispatch({ type: 'setup' })

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-neutral p-4">
      <Link to="/" className="btn btn-ghost self-start text-neutral-content">
        <ArrowLeft aria-hidden="true" /> {t('play.back')}
      </Link>

      {state.phase === PLAY_PHASES.SETUP && (
        <MatchSetup initialConfig={state.config} onStart={(config) => dispatch({ type: 'start', config })} />
      )}

      {inMatch && <PhaserGame key={state.run} matchConfig={state.config} keyBindings={keyBindings} />}
      {state.phase === PLAY_PHASES.PAUSED && (
        <PauseDialog
          onResume={resume}
          onQuit={backToSetup}
          onEnd={state.config.mode === MATCH_MODES.FREE ? endTurn : undefined}
        />
      )}

      {state.phase === PLAY_PHASES.RESULT && (
        <MatchResult
          result={state.result}
          recorded={recorded}
          onReplay={() => dispatch({ type: 'replay' })}
          onChangeMode={backToSetup}
        />
      )}

      {state.phase === PLAY_PHASES.ERROR && (
        <div role="alert" className="alert alert-error max-w-lg">
          <span>{t('play.result.error')}</span>
          <button type="button" className="btn btn-sm" onClick={backToSetup}>
            {t('play.result.changeMode')}
          </button>
        </div>
      )}
    </main>
  )
}
