# Guia de contribuição

Obrigado pelo interesse no Kitchen Dash! As regras completas, válidas para pessoas e para agentes de IA, estão no [AGENTS.md](../AGENTS.md). Este guia é o resumo.

## Primeira vez no clone

```sh
git config core.hooksPath .githooks   # ativa os gates locais (pre-commit e commit-msg)
```

Recomendado: instale o [gitleaks](https://github.com/gitleaks/gitleaks#installing) para que segredos sejam barrados antes do commit. Sem ele, o scan roda só no CI.

## Fluxo de trabalho

1. Pegue uma issue em *Todo* sem bloqueios no [board do MVP](https://github.com/users/davi-domingues/projects/3) e mova-a para *In Progress*.
2. Crie uma branch a partir da `main` atualizada: `<tipo>/kd-XX-descricao-curta` (ex.: `feat/kd-13-pontuacao`).
3. Funcionalidades novas seguem o Spec Kit: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. As specs ficam em `specs/`.
4. Abra um PR para a `main` preenchendo o template, com `Closes #N`. O merge exige CI verde e 1 aprovação.

## Commits e títulos de PR

[Conventional Commits](https://www.conventionalcommits.org/pt-br/) em português, no imperativo, com até 72 caracteres e sem ponto final:

```
feat(core): adiciona combo por entregas seguidas
fix(phaser): remove listeners ao encerrar a cena
docs(agents): registra regra de nomes de branch
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. O hook `commit-msg` e o CI conferem.

## Padrões

- Siga as decisões de [docs/SYSTEM_DESIGN.md](../docs/SYSTEM_DESIGN.md). Para mudar uma decisão, atualize o documento no mesmo PR e registre o motivo em [docs/ESTUDOS_E_DECISOES.md](../docs/ESTUDOS_E_DECISOES.md).
- Os checks **Convenções**, **Segredos** e **Qualidade** precisam passar. Este último roda formatação, lint, testes, build, orçamento de tamanho e `npm audit`.
- Nunca versione segredos. Use `.env.local`, que é ignorado pelo git.
