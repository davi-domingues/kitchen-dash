# Implementation Plan: Perfil da conta

**Branch**: `feat/kd-34-perfil-conta` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

Seção "Conta" no `/perfil` para quem está logado: editar o nome de exibição (validação local + erros do banco mapeados), excluir a conta pela RPC `delete_my_account` com diálogo de confirmação e encerrar a sessão local. As configurações passam a ser conciliadas no login e enviadas à conta a cada mudança, reaproveitando a regra da KD-37.

## Technical Context

**Language/Version**: JavaScript ESM, React 19
**Primary Dependencies**: supabase-js (via loader dinâmico), react-i18next, daisyUI 5 — nenhuma nova
**Storage**: `profiles.display_name`, `user_settings.settings` (existentes); `kd:v1:settings` local
**Testing**: Vitest com clientes falsos (sem rede)
**Target Platform**: navegador (PWA)
**Constraints**: JS inicial ≤ 250 KiB — o serviço novo entra só por `import()`; sem migration nova
**Scale/Scope**: 3 componentes, 2 serviços, 1 módulo de sync

## Constitution Check

- I. Funciona sem rede: falha remota de configurações nunca bloqueia o local. ✅
- II. Cliente não confiável: o banco valida o nome (check + unique) e a RPC só apaga `auth.uid()`. ✅
- III. Regras fora da renderização: validação em `displayName.js`, sync em `settingsSync.js`. ✅
- IV. Conteúdo é dado: não se aplica.
- V. Fornecedores atrás de interfaces: `profileService` em `services/`, carregado por `profileLoader`. ✅
- VI. Plano gratuito: sem custo novo. ✅

## Project Structure

```text
src/services/profileService.js(+test)   # nome e exclusão
src/services/profileLoader.js(+test)
src/features/profile/displayName.js(+test)
src/features/profile/AccountSection.jsx
src/features/profile/DisplayNameForm.jsx
src/features/profile/DeleteAccountSection.jsx
src/features/settings/settingsSync.js(+test)
src/features/settings/useSettingsSync.js
src/app/ProfilePage.jsx, App.jsx, SettingsPage.jsx (integração)
```

**Structure Decision**: segue o padrão de `cosmeticsService`/`cosmeticsSync` (KD-38).

## Complexity Tracking

Sem violações.
