# Research: Perfil da conta

## R1. Como gravar o nome
- **Decision**: `update` direto em `profiles` (grant de coluna + RLS da própria linha, KD-30).
- **Rationale**: o banco já impõe formato (check) e unicidade; não há regra extra que justifique RPC.
- **Alternatives**: RPC `set_display_name` — rejeitada, duplicaria a validação sem ganho.

## R2. Mapear erros do banco
- **Decision**: `23505` → `taken`; `23514` → `invalid`; o resto → `generic`.
- **Rationale**: códigos estáveis do Postgres repassados pelo PostgREST.

## R3. Sessão após excluir
- **Decision**: depois da RPC, `auth.signOut({ scope: 'local' })`.
- **Rationale**: o usuário já não existe; o logout global faria chamada que falha. O local limpa o token e dispara `onAuthStateChange`.

## R4. Sincronizar configurações
- **Decision**: no login, `mergeSettings` (conta vence por campo, KD-37); a cada mudança com sessão, envia o objeto local inteiro em segundo plano.
- **Rationale**: reaproveita a regra registrada; o local é sempre a fonte imediata (princípio I).
- **Alternatives**: fila/outbox de configurações — rejeitada para o MVP; a próxima mudança ou login reenvia.
