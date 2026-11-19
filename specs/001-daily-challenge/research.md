# Research: Desafio do dia

## Decision 1: Data de referencia em UTC

**Decision**: O desafio do dia usa a data em UTC como base para selecao.

**Rationale**: Garante consistencia global e evita diferencas entre fusos ou configuracoes locais.

**Alternatives considered**:
- Data local do dispositivo (falha em consistencia global).
- Fuso fixo (ex.: America/Sao_Paulo) com risco de desalinhamento global.

## Decision 2: Selecionar desafio por mapeamento deterministico

**Decision**: A data em UTC e mapeada de forma deterministica para um item do catalogo de desafios diarios.

**Rationale**: Mantem o mesmo desafio para todos e evita dependencias de rede.

**Alternatives considered**:
- Rotacao sequencial (sensivel a lacunas e alteracoes no catalogo).
- Sorteio diario via backend (exige rede e infraestrutura).

## Decision 3: Verificacao no fim da partida

**Decision**: A avaliacao do desafio acontece ao encerrar a partida, usando o resumo da partida.

**Rationale**: Evita custo por frame e mantem o core deterministico e testavel.

**Alternatives considered**:
- Acompanhamento em tempo real por evento (complexidade maior e necessidade de estado adicional).

## Decision 4: Registro local por data

**Decision**: A conclusao diaria e registrada localmente por data UTC e id do desafio.

**Rationale**: Persistencia offline e alinhada ao progresso local do visitante.

**Alternatives considered**:
- Registrar apenas no historico de partidas (consulta mais lenta e menos direta).
