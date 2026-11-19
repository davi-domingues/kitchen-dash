# Implementation Plan: Login por código no e-mail (KD-33)

**Branch**: `feat/kd-33-login-otp` | **Spec**: [spec.md](spec.md)

## Summary

Login sem senha: o jogador pede um código de 6 dígitos (com Turnstile), digita o código e a sessão do Supabase Auth passa a valer no app inteiro por um contexto React. O acesso ao Supabase fica em `services/auth.js`; o fluxo da tela é um reducer puro testado; o e-mail usa um template com `{{ .Token }}`.

## Technical Context

- **Linguagem**: JavaScript (ESM), React 19, Vite 8
- **Dependências**: `@supabase/supabase-js` (já aprovada), `@marsidev/react-turnstile@1.6.3` (aprovada)
- **Testes**: Vitest, cliente Supabase falso injetado (sem rede)
- **Plataforma**: navegador; backend local via `supabase start`
- **Restrições**: chave publicável só; segredo do Turnstile só via `env()` no `config.toml` e no painel

## Constitution Check

| Princípio | Situação |
|---|---|
| I. Funciona sem rede | ✔ Sem backend, login desligado e jogo intacto |
| II. Cliente não é confiável | ✔ Captcha validado pelo Supabase Auth no servidor |
| III. Regras separadas de renderização | ✔ Fluxo em reducer puro; nada no Phaser |
| IV. Conteúdo é dado | ✔ Textos no i18n |
| V. Fornecedores atrás de interfaces | ✔ `services/auth.js` isola o Supabase; `features/auth` não importa o SDK |
| VI. Plano gratuito | ✔ Turnstile e SMTP padrão gratuitos |

Reavaliado após o design: sem violações.

## Project Structure

```text
src/services/supabaseConfig.js         # config sem o SDK (isBackendConfigured)
src/services/authLoader.js (+test)     # import() dinâmico do serviço: fora do JS inicial (§8.5)
src/services/auth.js (+test)           # requestOtp, verifyOtp, signOut, getUser, onUserChange, erros
src/features/auth/loginFlow.js (+test) # reducer do fluxo e validações de e-mail/código
src/features/auth/AuthContext.js       # contexto + useAuth
src/features/auth/AuthProvider.jsx     # sessão, carregando, sair
src/features/auth/LoginPage.jsx        # rota /entrar (e-mail + Turnstile → código)
src/features/auth/AccountStatus.jsx    # bloco da home: entrar / e-mail + sair
supabase/config.toml                   # [auth.captcha], template magic_link, otp_length/expiry
supabase/templates/magic_link.html     # e-mail com {{ .Token }}
```

## Complexity Tracking

Nenhuma.
