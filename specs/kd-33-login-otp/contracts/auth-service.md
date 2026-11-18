# Contrato: services/auth.js e useAuth

- `createAuthService(client)` → serviço abaixo (cliente injetável para testes)
- `requestOtp(email, captchaToken)` → `Promise<void>`; lança `AuthFailure` com `.key` (chave i18n)
- `verifyOtp(email, code)` → `Promise<{ id, email }>`; lança `AuthFailure`
- `signOut()` → `Promise<void>`
- `getUser()` → `Promise<{ id, email } | null>`
- `onUserChange(callback)` → função que cancela a inscrição
- `authService` → instância com o cliente do app, ou `null` sem backend
- `useAuth()` (features/auth) → `{ status, user, signOut }`
