# Guia de contribuição

Obrigado pelo interesse no Kitchen Dash!

## Fluxo de trabalho

1. Abra uma issue descrevendo o bug ou a funcionalidade antes de começar.
2. Crie uma branch a partir de `main` com um prefixo:
   - `feat/` para funcionalidades;
   - `fix/` para correções;
   - `docs/` para documentação;
   - `chore/` para manutenção;
   - `init/` para configuração inicial.
3. Funcionalidades novas seguem o fluxo do Spec Kit: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. As especificações ficam versionadas em `specs/`.
4. Abra um Pull Request para `main` preenchendo o template.

## Commits

- Mensagens em português, no imperativo e curtas (ex.: `Adiciona fila de envio de pontuações`).
- Um assunto por commit.

## Padrões

- Siga as decisões de [docs/SYSTEM_DESIGN.md](../docs/SYSTEM_DESIGN.md). Para mudar uma decisão, atualize o documento no mesmo PR e registre o motivo em [docs/ESTUDOS_E_DECISOES.md](../docs/ESTUDOS_E_DECISOES.md).
- Lint, testes e orçamento de tamanho do build precisam passar no CI.
- Nunca versione segredos. Use `.env.local`, que é ignorado pelo git.
