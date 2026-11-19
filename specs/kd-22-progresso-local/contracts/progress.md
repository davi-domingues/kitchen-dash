# Contrato: progresso local

`src/features/progress/progress.js` (puro)

- `createEmptyProgress() → Progress`
- `sanitizeProgress(raw) → Progress`
- `applyMatchResult(progress, result, { now: Date }) → { progress, isNewRecord, record, duplicate }`
- `getRecord(progress, mode, players) → Entry | null`
- `getBoard(progress, mode, players) → Entry[]`
- `isBetter(mode, a, b) → boolean`

`src/features/progress/progressStore.js`

- `loadProgress(store?) → Progress`
- `recordMatchResult(result, { store?, now? }) → { isNewRecord, record, duplicate }`
- `clearProgress(store?)`
- `takePending` não existe: a KD-35 lê `loadProgress().pending` e remove com `removePending(matchIds, store?)`.
