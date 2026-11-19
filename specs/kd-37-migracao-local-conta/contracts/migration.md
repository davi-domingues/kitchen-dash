# Contrato: migração local → conta

```js
// features/migration/accountMigration.js
runAccountMigration(user, deps?) → Promise<{ status: 'done'|'partial'|'skipped', sent, discarded }>
// deps: { store, loadScoreService, loadSettingsService, pullCosmetics, pushEquipped,
//         sleep, rng, onProgress({ phase: 'scores', sent, discarded, total }) }
isMigrationDone(userId, store?) → boolean

// features/migration/settingsMerge.js (puro)
mergeSettings(local, account) → { local, account, changedAccount: boolean }

// services/settingsService.js (via settingsLoader.js)
createSettingsService(client) → { fetchSettings(userId) → object, saveSettings(userId, settings) }
```

Códigos tratados no envio: `retry` → backoff; `discard` (22023/23505) → remove e conta; `auth` → interrompe (`partial`).
