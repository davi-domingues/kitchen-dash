# Tasks: PWA — jogo offline e aviso de atualização

## Phase 1: Setup

- [X] T001 Instalar `vite-plugin-pwa@2.0.0` com `--save-exact` em package.json e package-lock.json

## Phase 2: Foundational

- [X] T002 Criar opções do plugin (precache, NetworkOnly, manifesto) em scripts/pwaConfig.js com teste em scripts/pwaConfig.test.js
- [X] T003 Ligar o VitePWA em vite.config.js e criar public/icon.svg

## Phase 3: User Story 1 - Jogar sem internet (P1)

**Independent Test**: build + preview, rede desligada, partida completa.

- [X] T004 [US1] Medir o precache de verdade no check-size em scripts/check-size.js e scripts/check-size.test.js
- [X] T005 [P] [US1] `Cache-Control: no-cache` para sw.js e manifesto em public/_headers (CSP já permite o SW)

## Phase 4: User Story 2 - Aviso de nova versão (P2)

**Independent Test**: novo build; aviso só fora de /jogar, anunciado e operável por teclado.

- [X] T006 [US2] Regra `shouldShowUpdateNotice` ("fora de `/jogar`") em src/features/pwa/updateNotice.js com teste
- [X] T007 [US2] Registro do SW em src/services/pwa.js
- [X] T008 [US2] Componente src/features/pwa/UpdateNotice.jsx montado em src/app/App.jsx, textos em src/i18n/pt-BR.json

## Phase 5: Polish

- [X] T009 Registrar a decisão em docs/ESTUDOS_E_DECISOES.md
- [X] T010 Rodar gates: format:check, lint, test, build, check-size

## Dependencies

T001 → T002 → T003 → (T004, T005) ; T003 → T006 → T007 → T008 → T009 → T010.
