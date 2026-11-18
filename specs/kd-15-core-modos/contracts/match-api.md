# Contrato: `src/game/core/match.js`

```js
createMatch({ mode, players, seed, contentVersion, content: { recipes, ingredients, kitchen } })
  // → { state, update }   update(state, inputs, dtMs) → { state, events }
endMatch(state) // → { state, events }   events = [match:ended] ou [] se já encerrada
challengeSequence(recipes) // → string[12]
MODE_RULES, CHALLENGE_SEED, CHALLENGE_LENGTH
```

`match:ended` payload: `{ mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs }`. No Desafio `seed = CHALLENGE_SEED` independentemente da entrada. `matchId` é da cena.
