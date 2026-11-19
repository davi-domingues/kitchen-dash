# Contrato: EventBus e registry (KD-20)

| Evento | Direção | Payload |
|---|---|---|
| `match:paused` | cena → React | — |
| `match:resumed` | React → cena | — |
| `match:endRequested` | React → cena | — (a cena chama `endMatch`) |
| `match:ended` | cena → React | `{ matchId, ...matchEndedPayload(state) }`, emitido uma vez |

Registry: `matchConfig` `{ mode, players }` e `keyBindings` (de `loadKeyBindings()`).
