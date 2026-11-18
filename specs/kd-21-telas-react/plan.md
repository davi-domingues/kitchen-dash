# Plano — KD-21

## Módulos

| Arquivo | Papel |
|---|---|
| `src/game/core/matchModes.js` | Constantes `MATCH_MODES`, `PLAYER_COUNTS`, `DEFAULT_MATCH_CONFIG` e `isMatchConfig` (puro) |
| `src/game/phaser/events.js` | Documenta o payload final de `match:ended` |
| `src/features/match/matchEnded.js` | `parseMatchEnded(payload)` → resultado normalizado ou `null` |
| `src/features/match/playFlow.js` | Reducer da página de jogo: `setup` → `playing` ⇄ `paused` → `result` / `error` |
| `src/features/match/*.jsx` | `MatchSetup`, `PauseDialog`, `MatchResult` |
| `src/app/PlayPage.jsx` | Liga `EventBus` ao reducer e monta `PhaserGame` com `matchConfig` |
| `src/app/*Page.jsx` | Placeholders de ranking, perfil, privacidade e 404 |

## Decisões

- Estado local com `useReducer`; nada de estado global (AGENTS §7).
- `PhaserGame` recebe `matchConfig` e o grava no `registry` antes das cenas lerem; `key` com contador força nova instância em "jogar de novo".
- Pausa com `<dialog>` nativo (`showModal`): foco preso e `Esc` nativos; `cancel` vira "continuar".
- Formatação de duração com `Intl` via i18n (`mm:ss` montado no módulo puro).

## Testes

Vitest (node): `matchModes.test.js`, `matchEnded.test.js`, `playFlow.test.js`. Componentes: verificação manual (sem jsdom aprovado).
