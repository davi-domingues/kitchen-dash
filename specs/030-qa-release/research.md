# Research: QA final e release do MVP

## R1 — Como automatizar 2 jogadores sem dependência nova
- **Decision**: teste do core com `createMatch({ players: 2 })`, os dois chefs andando e se revezando nas entregas do passe.
- **Rationale**: o core é determinístico e já tem o ponto único de montagem por modo; roda em ~1 s.
- **Alternatives**: E2E com Playwright (proibido no MVP, D4); teste da cena Phaser (exige canvas).

## R2 — Como cobrir o Desafio do dia
- **Decision**: avaliar `getDailyChallengeResult` com o resumo montado como a `KitchenScene` monta.
- **Rationale**: é o mesmo caminho que a cena usa no fim da partida.
- **Alternatives**: novo modo no core (não existe; o Desafio do dia avalia qualquer modo).

## R3 — Política de versão
- **Decision**: SemVer, versão por PR, tag manual após QA (ESTUDOS_E_DECISOES §13.9).
- **Rationale**: a tag indica algo verificado em produção; AGENTS.md proíbe agente de fazer release.
- **Alternatives**: tag automática no merge (marcaria versão não verificada).

## R4 — Telas pequenas
- **Decision**: roteiro manual nas larguras 360, 768 e 1280 px no DevTools.
- **Rationale**: sem E2E, não há como medir layout no CI sem dependência nova.
