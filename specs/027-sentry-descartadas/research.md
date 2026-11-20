# Research

- **Decision**: callback `onDiscarded` injetado na outbox. **Rationale**: mantém a outbox testável e sem acoplamento ao Sentry, como o `onSubmitted` da KD-38. **Alternatives**: importar o monitoramento na outbox (acopla); só contar descartes no resumo (não chega à equipe).
- **Decision**: `captureMessage` nível `warning`. **Rationale**: o descarte é esperado em fraude/conteúdo antigo; não é exceção do app. **Alternatives**: `captureException` com `ScoreFailure` (mistura com erros reais).
