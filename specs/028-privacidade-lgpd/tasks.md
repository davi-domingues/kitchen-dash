# Tasks: Privacidade (LGPD)

**Input**: [plan.md](plan.md), [spec.md](spec.md)

## Phase 1: Setup

- [X] T001 Confirmar fatos da política em docs/SYSTEM_DESIGN.md (D7, D9, D11, D13, §6.4)

## Phase 2: Foundational

- [X] T002 Adicionar as chaves `privacy.*`, `footer.*` e `profile.account.*` novas em src/i18n/pt-BR.json, com "[a definir]" para controlador e encarregado

## Phase 3: User Story 1 - Ler a política (P1)

- [X] T003 [P] [US1] Testar as 7 seções e os 2 marcadores em src/app/privacyPolicy.test.js
- [X] T004 [US1] Escrever a política com títulos em ordem em src/app/PrivacyPage.jsx
- [X] T005 [US1] Criar o rodapé em src/ui/SiteFooter.jsx e usá-lo em src/app/HomePage.jsx e src/app/ProfilePage.jsx

## Phase 4: User Story 2 - Chegar à exclusão (P1)

- [X] T006 [US2] Link da política para `/perfil#excluir-conta` em src/app/PrivacyPage.jsx
- [X] T007 [US2] Aviso ao visitante e rolagem até a âncora em src/features/profile/AccountSection.jsx
- [X] T008 [US2] Link para a política na exclusão em src/features/profile/DeleteAccountSection.jsx

## Phase 5: Polish

- [X] T009 Registrar a decisão em docs/ESTUDOS_E_DECISOES.md
- [X] T010 Rodar os gates

## Dependencies

T002 → US1 e US2. US2 depende da KD-34 (#28).
