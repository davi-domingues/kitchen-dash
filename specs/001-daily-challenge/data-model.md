# Data Model: Desafio do dia

## DailyChallengeDefinition

**Represents**: Um desafio diario definido no catalogo de conteudo.

**Fields**:
- `id`: identificador estavel do desafio.
- `titleKey`: chave i18n do titulo.
- `descriptionKey`: chave i18n da descricao.
- `criteria`: definicao do criterio de conclusao (tipo e parametros).
- `applicableModes`: lista de modos em que o desafio e valido.

**Validation Rules**:
- `id` deve ser unico.
- `criteria` deve ser interpretavel pelo core.
- `applicableModes` nao pode ser vazia.

## DailyChallengeResult

**Represents**: Resultado da avaliacao do desafio no fim da partida.

**Fields**:
- `dateUtc`: data (YYYY-MM-DD) usada para selecao.
- `challengeId`: referencia ao desafio selecionado.
- `completed`: booleano de conclusao.

**Validation Rules**:
- `dateUtc` deve ser consistente com o dia de avaliacao.
- `challengeId` deve existir no catalogo de desafios.

## DailyChallengeCompletion

**Represents**: Registro local de conclusao do desafio diario.

**Fields**:
- `dateUtc`: data (YYYY-MM-DD) da conclusao.
- `challengeId`: id do desafio concluido.
- `completedAt`: timestamp local da conclusao (opcional).

**Validation Rules**:
- Apenas uma conclusao por `dateUtc`.
- Nao sobrescrever se o mesmo dia ja estiver marcado como concluido.
