# Quickstart: Desafio do dia

## Objetivo

Validar que o desafio do dia e selecionado de forma deterministica (UTC), avaliado no fim da partida e registrado localmente.

## Pre-requisitos

- Dependencias instaladas (`npm ci`).

## Validacao automatizada

1. Execute os testes:

```sh
npm test
```

2. Verifique que os testes do core para selecao e avaliacao do desafio diario passam.

## Validacao manual

1. Inicie o jogo:

```sh
npm run dev
```

2. Inicie uma partida e verifique que o desafio do dia exibido e o mesmo em duas sessoes diferentes no mesmo dia.
3. Conclua uma partida que atenda ao criterio do desafio e confirme que o resultado indica conclusao.
4. Reabra o jogo no mesmo dia e confirme que o status do desafio permanece como concluido.
5. Repita em outro dia (ou simulacao de data) para confirmar que o desafio muda.
