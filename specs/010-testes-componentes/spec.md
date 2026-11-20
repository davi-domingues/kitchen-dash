# Feature Specification: Testes de componente das telas principais

**Feature Branch**: `test/debito-70-testes-componentes`
**Created**: 2026-11-20
**Status**: Draft
**Input**: Débito #70 — ambiente DOM só para testes de componente e testes das telas tocadas na KD-21/22/23/37.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Telas principais protegidas contra regressão (Priority: P1)

Como pessoa do time, quero que a suíte de testes renderize as telas principais (Home, resultado da partida, Perfil, placar global, aviso de migração, Configurações) e verifique o que o jogador vê, para que uma mudança que quebre texto, estado vazio ou estado de erro seja barrada no CI.

**Independent Test**: `npm test` executa os testes de componente e falha se um texto esperado sumir.

**Acceptance Scenarios**:

1. **Given** a Home, **When** renderizada, **Then** mostra o título do jogo, o botão Jogar e a navegação.
2. **Given** um resultado com novo recorde, **When** a tela de resultado é renderizada, **Then** o selo de novo recorde aparece e o foco vai ao título; os botões Jogar de novo/Trocar modo chamam seus callbacks.
3. **Given** um visitante sem partidas, **When** abre o Perfil, **Then** vê o estado vazio com o atalho para jogar.
4. **Given** o placar global, **When** o serviço devolve lista vazia ou erro, **Then** a tela mostra o estado vazio ou o alerta de erro com "Tentar de novo".
5. **Given** uma migração em andamento ou concluída com descartes, **When** o aviso é renderizado, **Then** a mensagem correta aparece e pode ser dispensada.
6. **Given** Configurações, **When** abertas, **Then** listam os controles dos dois jogadores e da pausa, e restaurar padrões já padrão informa "já está no padrão".

### Edge Cases

- `localStorage` indisponível: o aviso de armazenamento não persistente aparece no Perfil.
- Nenhum teste de componente acessa rede ou Supabase (serviços substituídos por dublês).

## Requirements *(mandatory)*

- **FR-001**: Somente arquivos de teste de componente rodam em ambiente DOM; os demais testes continuam no ambiente Node.
- **FR-002**: Cada tela listada tem ao menos um teste cobrindo o estado principal e, quando a tela os tem, vazio e erro.
- **FR-003**: Testes determinísticos, sem rede, sem Supabase real, com dados fictícios.
- **FR-004**: Textos verificados vêm do i18n real (pt-BR), não de strings duplicadas sem fonte.
- **FR-005**: Novas dependências com versão exata e lockfile no mesmo commit; escolha do ambiente DOM registrada em ESTUDOS_E_DECISOES.

## Success Criteria *(mandatory)*

- **SC-001**: As 6 áreas de tela têm testes verdes no CI.
- **SC-002**: Os testes existentes não ficam mais lentos por causa do ambiente DOM (continuam em Node).
- **SC-003**: Gates (format, lint, test, build, check-size) verdes; o bundle de produção não muda.

## Assumptions

- Ambiente escolhido: happy-dom (mais leve e rápido; a suíte não depende de APIs que só o jsdom tem). Registrado em ESTUDOS_E_DECISOES.
- Seleção por diretiva `// @vitest-environment happy-dom` por arquivo (o Vitest atual não tem mais `environmentMatchGlobs`).
- `<dialog>.showModal` pode faltar no ambiente; os testes não dependem dele.
- Fora de escopo: E2E (D4), testes da cena Phaser.
