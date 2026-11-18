# Research — KD-21

## Estado da página de jogo
- **Decision**: `useReducer` com reducer puro (`playFlow.js`).
- **Rationale**: testável sem DOM; AGENTS §7 proíbe estado global.
- **Alternatives**: Context (desnecessário, estado é local à rota); Zustand (proibido).

## Passar a configuração ao Phaser
- **Decision**: `callbacks.preBoot` grava `matchConfig` no `registry`; `key` muda a cada partida.
- **Rationale**: as cenas leem antes do `create`; nova instância garante estado limpo em "jogar de novo".
- **Alternatives**: emitir evento após o boot (corrida com o `create`); reiniciar a cena (risco de vazar estado).

## Menu de pausa
- **Decision**: `<dialog>` nativo com `showModal()`; `cancel` (Esc) = continuar.
- **Rationale**: foco preso e Esc acessíveis sem lib extra.
- **Alternatives**: `div.modal-open` do daisyUI (exige foco manual).

## Testes de componente
- **Decision**: não incluir; lógica em módulos puros testados.
- **Rationale**: Testing Library precisa de jsdom/happy-dom, que não estão aprovados.
- **Alternatives**: instalar jsdom (exige aprovação).

## Payload de `match:ended`
- **Decision**: ver [contracts/match-ended.md](contracts/match-ended.md).
- **Rationale**: cobre `submit_score` (SYSTEM_DESIGN §6.2), `player_stats` (§5) e o recorde por nº de jogadores (PRD).
- **Alternatives**: proposta original sem `players`/pedidos (insuficiente para KD-22 e KD-31).
