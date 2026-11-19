# Research: KD-22

- **Recorde derivado do placar** — Decision: recorde = 1ª entrada do placar do modo/jogadores. Rationale: um único dado, sem inconsistência. Alternatives: campo `records` separado (duplicaria).
- **Comparação** — Decision: Clássico/Livre por pontos desc; Desafio por duração asc; empate → mais antiga primeiro. Rationale: PRD.
- **Pendentes** — Decision: lista `pending` com o resultado validado + `endedAt`, máx. 50 (descarta as mais antigas). Rationale: KD-35 consome; a outbox com backoff fica lá. Alternatives: implementar outbox agora (fora do escopo).
- **Idempotência** — Decision: `matchId` já em `pending` ou no placar → ignora. Rationale: StrictMode/efeitos duplos não contam duas vezes. Limite: id que saiu de ambas as listas pode recontar estatística (raro, aceito).
- **Configurações / keyBindings** — Decision: não criar `services/settings.js` (KD-17 cria). Apenas "apagar progresso". Rationale: evitar conflito add/add.
- **Onde gravar** — Decision: `useEffect` da PlayPage ao entrar em `RESULT`, guardado por `matchId`. Rationale: reducer continua puro.
