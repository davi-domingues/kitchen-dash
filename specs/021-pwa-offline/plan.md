# Implementation Plan: PWA — jogo offline e aviso de atualização

**Branch**: `feat/kd-41-pwa-offline` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

`vite-plugin-pwa` (generateSW, `registerType: 'prompt'`) gera o service worker e o manifesto. O precache cobre JS, CSS, HTML, imagens e sons; Supabase, Sentry e Turnstile ficam em `NetworkOnly`. O registro fica em `services/pwa.js` (fornecedor isolado). `features/pwa/UpdateNotice.jsx` mostra o aviso fora de /jogar, com a regra pura `shouldShowUpdateNotice` testada. O `check-size` passa a medir o precache.

## Technical Context

**Language/Version**: JavaScript ESM, React 19, Vite 8
**Primary Dependencies**: `vite-plugin-pwa@2.0.0` (aprovado na SYSTEM_DESIGN §11; traz `workbox-build` e `workbox-window` como dependências diretas)
**Testing**: Vitest (regra de exibição, opções do Workbox, check-size)
**Target Platform**: navegadores modernos, Cloudflare Pages
**Constraints**: JS inicial ≤ 250 KiB gzip; precache ≤ 15 MiB; CSP sem script inline

## Constitution Check

- Fronteiras §4: core e Phaser intocados; registro do SW só em `services/`. OK
- i18n: textos do aviso via i18n. OK
- Dependência aprovada na §11, versão exata e lockfile no mesmo commit. OK
- Acessibilidade: `role="status"`, botões focáveis por teclado. OK

## Project Structure

```text
vite.config.js                       # VitePWA com as opções de pwaConfig
scripts/pwaConfig.js (+ test)        # opções do plugin, testáveis
scripts/check-size.js (+ test)       # precache medido
src/services/pwa.js                  # registro do SW
src/features/pwa/UpdateNotice.jsx    # aviso
src/features/pwa/updateNotice.js (+ test)
public/icon.svg, public/_headers
src/i18n/pt-BR.json
```
