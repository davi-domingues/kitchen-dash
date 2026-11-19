# Data Model: KD-33

## Session (contexto)

- `user`: `{ id, email } | null`
- `status`: `'loading' | 'guest' | 'authenticated' | 'disabled'` (`disabled` = backend não configurado)

## LoginFlow (reducer)

- `step`: `'email' | 'code'`
- `email`, `code`, `captchaToken: string | null`
- `pending: boolean`, `error: string | null` (chave i18n)

Transições: `email --(codeSent)--> code`; `code --(back)--> email` (zera código e captcha); `submit` → `pending`; `failed(key)` → erro; no passo do e-mail o captcha é zerado (token de uso único).
