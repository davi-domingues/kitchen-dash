# KD-17 · InputMap — spec, plano e tarefas

Issue #16. Fontes: PRD "Plataforma e controles", SYSTEM_DESIGN §3 e §8.1, AGENTS.md §4.

## Requisitos

- **FR-1** Ações abstratas por jogador: `move` (vetor x/y em -1, 0, 1), `interact` e `pause`.
- **FR-2** Padrão: P1 setas + Enter; P2 WASD + Espaço; P pausa.
- **FR-3** Em 1 jogador, os dois conjuntos de teclas controlam o mesmo chef (`p1`).
- **FR-4** Botão de ação: soltar antes de 220 ms é **toque**; chegar a 220 ms é **segurar** (início e fim).
- **FR-5** Teclas remapeáveis, sem tecla com duas funções, salvas em `kd:v1:settings` (`keyBindings`).
- **FR-6** A lógica é testável sem Phaser nem DOM: o tempo entra como parâmetro.

## Suposições (clarify resolvido pelos docs, sem perguntar)

- A issue cita `move`, `interact`, `pause`; SYSTEM_DESIGN §3 cita `drop`. O PRD define **um único botão de
  ação**, então não existe `drop` separado: soltar é um toque contextual. Seguimos o PRD.
- SYSTEM_DESIGN §8.1 cita `E`/`Esc`; o PRD (mais recente e específico) define Enter/Espaço/P. Seguimos o PRD.
- "Ficar parado olhando para a estação" depende de posição e estação: é regra do `game/core` (KD-18+), não do input.
- Teclas usam `KeyboardEvent.code` (independe do layout do teclado).
- A tela de remapeamento (UI) fica para a tela de configurações; aqui entram o modelo e a persistência.

## Plano

- `src/game/input/keyBindings.js`: padrão, `remapKey` (troca em conflito), `sanitizeKeyBindings`.
- `src/game/input/inputMap.js`: `createInputMap` com `keyDown/keyUp/update/getMove/isHolding/releaseAll`.
- `src/services/settings.js`: `loadKeyBindings` / `saveKeyBindings` via `storage.js`.

## Tarefas

- [x] T1 Teclas padrão, remapeamento e validação + testes
- [x] T2 InputMap: movimento, 1 × 2 jogadores, pausa + testes
- [x] T3 Toque rápido × segurar + testes
- [x] T4 Persistência em `settings` + testes
