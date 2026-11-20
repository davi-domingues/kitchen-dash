# Implementation Plan: Privacidade (LGPD)

**Branch**: `feat/kd-44-privacidade-lgpd` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

Troca o placeholder do `/privacidade` pela política (7 seções, textos no i18n), cria um rodapé com o link e liga a política à exclusão de conta do perfil (`/perfil#excluir-conta`), com aviso para o visitante.

## Technical Context

**Language/Version**: JavaScript ESM, React 19, react-router
**Primary Dependencies**: nenhuma nova
**Storage**: nenhum
**Testing**: Vitest (conteúdo do dicionário) + i18n.test
**Constraints**: página estática no JS inicial (texto curto); sem cookies

## Constitution Check

- I. Funciona sem rede: a política é estática. ✅
- II–VI: sem impacto (sem backend novo, sem conteúdo de jogo). ✅

## Project Structure

```text
src/app/PrivacyPage.jsx            # política
src/app/privacyPolicy.test.js      # seções e marcadores no dicionário
src/ui/SiteFooter.jsx              # rodapé com link
src/app/HomePage.jsx, ProfilePage.jsx
src/features/profile/AccountSection.jsx, DeleteAccountSection.jsx  # âncora, aviso ao visitante, link à política
src/i18n/pt-BR.json
```

## Complexity Tracking

Sem violações.
