# Constituição do Kitchen Dash

## Core Principles

### I. O jogo funciona sem rede

- Uma partida completa (menu, jogo, resultado, recordes e cosméticos locais) MUST funcionar offline.
- A rede só é exigida para identidade (login OTP), ranking global e sincronização.
- Falhas de rede MUST degradar com aviso claro e nunca interromper uma partida em andamento.
- Pontuações feitas sem rede vão para uma outbox local e são enviadas depois, de forma idempotente.

*Por quê:* o produto é um jogo casual de sessões curtas, e a rede não pode ser um ponto único de falha.

### II. O cliente não é confiável

- Toda gravação que afete outros jogadores (pontuação, ranking, estatísticas, cosméticos) MUST passar por RPC no banco, com autenticação, idempotência, rate limit e validação de plausibilidade.
- Toda tabela MUST ter RLS ligada.
- Não existem policies de escrita direta nas tabelas de ranking e progresso.
- O frontend usa somente a chave publicável. Segredos nunca chegam ao bundle nem a variáveis `VITE_*`.

*Por quê:* qualquer valor enviado pelo navegador pode ser forjado, e o ranking só tem valor se for justo.

### III. Regras separadas de renderização (NÃO NEGOCIÁVEL)

- As regras do jogo vivem em `game/core`, em JavaScript puro e determinístico.
  - MUST NOT importar Phaser, React, `services/` ou APIs do DOM.
  - A aleatoriedade vem de um `rng` com seed.
- O mesmo seed com o mesmo conteúdo MUST produzir o mesmo resultado.
- Toda regra de pontuação, pedidos e paciência MUST ter teste no Vitest.
- O ESLint impõe essas fronteiras, e o CI falha se elas forem violadas.

*Por quê:* regras testáveis e reaproveitáveis no servidor permitem validar partidas por replay e evoluir sem reescrita.

### IV. Conteúdo é dado, não código

- Receitas, cozinhas, cosméticos e textos MUST viver em JSON versionado (`content/`, `i18n/`), validado por schema no build.
- Valores de balanceamento MUST NOT ficar hardcoded em cenas ou componentes.
- Cada partida registra o `content_version` usado.

*Por quê:* ajustar o jogo não deve exigir mudança de lógica, e o servidor precisa saber contra qual conteúdo validar.

### V. Fornecedores atrás de interfaces

- Supabase, Sentry, storage local e analytics MUST ser acessados só por módulos em `services/`.
- `features/` e `game/` não importam SDKs de fornecedor diretamente.
- `game/phaser` comunica a aplicação apenas pelo `EventBus`.

*Por quê:* trocar ou simular um fornecedor (em testes ou num plano futuro) deve afetar só um módulo.

### VI. Caber no plano gratuito, com caminho claro para o pago

- O MVP MUST operar nos planos gratuitos da Cloudflare Pages, do Supabase e do Sentry.
- O orçamento de tamanho do SYSTEM_DESIGN §8.5 é obrigatório e verificado no CI.
- Os gatilhos de custo do SYSTEM_DESIGN §9 MUST ser revisados mensalmente.

*Por quê:* é um projeto de estudantes; custo inesperado ou build pesado inviabilizam o produto.

## Restrições técnicas

- **Stack aprovada:** React + JavaScript (sem TypeScript) + Vite, Phaser 3.90, Tailwind CSS v4 + daisyUI 5, React Router, TanStack Query, Supabase, Cloudflare Pages, Vitest, ESLint, Prettier, Sentry.
- **Dependências:**
  - Qualquer pacote fora da lista do SYSTEM_DESIGN §11 MUST ter aprovação e versão exata, com o lockfile no mesmo commit.
  - Uma dependência estrutural MUST ser registrada em `docs/ESTUDOS_E_DECISOES.md`.
- **Interface:**
  - Todo texto visível ao jogador passa pelo i18n (pt-BR primeiro).
  - As telas cumprem a acessibilidade básica do SYSTEM_DESIGN §8.2: teclado, contraste, foco visível e alternativas a cor.
- **Privacidade:**
  - Sem PII em logs, eventos do Sentry (`sendDefaultPii: false`), fixtures ou prompts de IA.
  - A exclusão de conta e a política de privacidade fazem parte do MVP (LGPD).
- **Banco:**
  - O schema muda só por migration versionada em `supabase/migrations/`, testada localmente.
  - Nada é alterado pelo painel.

## Fluxo de desenvolvimento

- **Spec antes do código:**
  - Funcionalidades seguem o Spec Kit (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`).
  - Pular a spec exige concordância explícita e só vale para correções triviais.
- **Uma issue = uma branch** (`<tipo>/kd-XX-descricao`), criada a partir da `main` atualizada.
- **Commits e títulos de PR** em Conventional Commits, em português e no imperativo, verificados por hook local e pelo CI.
- **Merge na `main`:** só via PR, com 1 aprovação, threads resolvidas e os checks Convenções, Segredos e Qualidade verdes. Sem force push, sem `--no-verify` e sem merge feito por agente de IA.
- **Definition of Done:**
  - Os critérios de pronto estão ligados a testes ou a verificação descrita.
  - Os gates rodaram e a saída foi mostrada.
  - O diff não tem código morto, segredos nem TODO sem issue.
  - Exceções e débitos estão registrados no PR.

## Governance

- **Precedência:** esta constituição define os princípios e prevalece sobre qualquer outra prática. O [AGENTS.md](../../AGENTS.md) é o contrato operacional (o *como*) e MUST permanecer coerente com ela.
- **Emendas:** só por PR que altere este arquivo, registre o motivo em `docs/ESTUDOS_E_DECISOES.md` e ajuste no mesmo PR os documentos afetados (AGENTS.md, SYSTEM_DESIGN, templates).
- **Versionamento semântico:**
  - MAJOR: remove ou redefine um princípio.
  - MINOR: adiciona um princípio ou seção, ou amplia materialmente uma orientação.
  - PATCH: esclarecimentos e redação.
- **Conformidade:** toda spec, plano e PR MUST ser verificado contra estes princípios. O `/speckit-plan` registra o *Constitution Check*. Uma violação só entra com justificativa explícita no plano ou no PR.

**Version**: 1.0.0 | **Ratified**: 2026-11-13 | **Last Amended**: 2026-11-13
