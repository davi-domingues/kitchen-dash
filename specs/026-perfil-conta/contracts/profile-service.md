# Contract: profileService

```js
fetchDisplayName(userId) -> Promise<string | null>
updateDisplayName(userId, name) -> Promise<void>   // lança ProfileFailure(reason: 'taken'|'invalid'|'generic')
deleteAccount() -> Promise<void>                   // RPC delete_my_account + signOut local; ProfileFailure('generic')
```

`loadProfileService()` devolve `null` sem backend.

# Contract: settingsSync

```js
pullAccountSettings(userId, deps?) -> Promise<boolean>  // concilia (KD-37) e grava local; false em falha
pushAccountSettings(user, deps?) -> Promise<boolean>    // envia o objeto local; false sem sessão/falha
```
