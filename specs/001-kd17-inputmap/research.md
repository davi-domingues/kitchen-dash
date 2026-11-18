# Research: InputMap

## Identificação das teclas

- **Decision**: `KeyboardEvent.code`.
- **Rationale**: posição física; WASD funciona igual em ABNT2, US e AZERTY-agnóstico de Shift/CapsLock.
- **Alternatives**: `event.key` (muda com layout e Shift); `Phaser.Input.Keyboard.KeyCodes` (acopla ao Phaser e quebra a fronteira de `game/input`).

## Toque × segurar

- **Decision**: limite de 220 ms, inclusivo para segurar; `update(now)` por frame emite o início do segurar.
- **Rationale**: PRD "~0,22 s"; o início do segurar precisa sair enquanto a tecla ainda está pressionada (picar contínuo), então depende de tempo e não só de keyup.
- **Alternatives**: timers (`setTimeout`/Phaser `time.delayedCall`): não determinísticos em teste e exigem limpeza no `shutdown`.

## Repetição automática do SO

- **Decision**: ignorar keydown de tecla já pressionada.
- **Rationale**: senão o segurar reiniciaria a cada ~30 ms e nunca chegaria a 220 ms.

## Persistência

- **Decision**: campo `keyBindings` em `kd:v1:settings` via `services/storage.js`, validado por `sanitizeKeyBindings`.
- **Rationale**: SYSTEM_DESIGN §7.2/§8.1; dado corrompido não pode deixar o jogo sem controles.
- **Alternatives**: chave própria (`kd:v1:keyBindings`): fragmenta as preferências que a tela de configurações vai editar juntas.

## Conflito no remapeamento

- **Decision**: trocar as teclas entre os dois controles.
- **Alternatives**: recusar (exige UI de erro) ou deixar sem tecla (controle inutilizável).
