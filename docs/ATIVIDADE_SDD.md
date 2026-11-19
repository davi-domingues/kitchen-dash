# Atividade: SDD na prática com um framework

Atividade em grupo.

Escolham um framework de SDD: GSD, BMAD, SpecKit ou OpenSpec.

Instalem esse framework no opencode, dentro de um projeto React criado com Vite.

Usem o framework para especificar, planejar, implementar e validar uma funcionalidade completa que consuma uma API.

O tema do projeto é escolha do grupo.

Criem um repositório no GitHub para o grupo e adicionem todos os integrantes como colaboradores. Todo o trabalho deve estar nele: código, artefatos gerados pelo framework e README preenchido.

## Organização do grupo

- Escrevam a spec juntos, em uma única sessão do framework.
- Leiam a spec gerada em voz alta e corrijam o que estiver errado.
- Só passem para o plano quando todos concordarem com a spec.
- Depois, dividam as tarefas do plano: cada integrante implementa as suas.
- Todo acordo vai para os arquivos do framework, não para o WhatsApp.

## Escolham uma ferramenta

| Framework | Ideia central | Instalação (terminal) | Fluxo no chat do opencode |
|---|---|---|---|
| GSD | Fases curtas e subagentes com contexto limpo, contra o context rot | `npx @opengsd/gsd-core@latest --opencode --local` | `/gsd-new-project`, `/gsd-discuss-phase 1`, `/gsd-plan-phase 1`, `/gsd-execute-phase 1`, `/gsd-verify-work 1` |
| BMAD | Agentes por papel (analista, PM, arquiteto, dev) que geram e refinam os artefatos | `npx skills add bmad-code-org/BMAD-METHOD -a opencode` | Siga o fluxo da skill bmad (brief, PRD, arquitetura, histórias) |
| SpecKit | Kit do GitHub com um comando por etapa, guiado por uma constituição | `uv tool install specify-cli` e `specify init --here --integration opencode` | `/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement` |
| OpenSpec | Leve: cada mudança vira uma proposta com specs, design e tarefas | `npm install -g @fission-ai/openspec@latest` e `openspec init --tools opencode` | `/opsx-explore`, `/opsx-propose`, `/opsx-apply` |

Os comandos exatos e as opções de cada framework estão no book *Frameworks para criação de SDD*; consultem o capítulo da ferramenta escolhida antes de começarem.

## Regras do projeto

O contexto é livre: controle de estudos, biblioteca, cardápio de lanchonete, agenda de treinos, o que fizer sentido para o grupo.

O projeto precisa cumprir apenas estes requisitos mínimos:

| Requisito | Detalhe |
|---|---|
| Front-end React com Vite | Na estrutura de pastas usada neste livro (`src/api`, `src/components`, `src/pages`) |
| Consumo de dados | Uma API HTTP: a api-usuarios adaptada, uma API pública, um back-end próprio ou um mock com JSON Server |
| Ao menos uma funcionalidade completa | Com listagem, cadastro e um comportamento de erro especificado |
| Artefatos versionados | Spec, plano e tarefas gerados pelo framework, commitados no Git |

> **Dica:** se o grupo não tiver back-end, usem o JSON Server como mock de dados. Nesse caso, o `db.json` é o contrato: descrevam seus recursos e campos na spec.

## Passo a passo

| Etapa | O que fazer | Evidência |
|---|---|---|
| 0. Preparar | Criar o repositório no GitHub, o projeto com Vite e instalar o framework escolhido | Primeiro push no GitHub com o framework instalado |
| 1. Especificar | Rodar o comando de especificação, responder em grupo às perguntas do agente e revisar o arquivo gerado com todos | Spec / PRD / proposta no repositório |
| 2. Planejar | Gerar plano e tarefas; ajustar o que não fizer sentido e dividir as tarefas entre os integrantes | Plano e lista de tarefas |
| 3. Implementar | Cada integrante executa as suas tarefas e faz commits pequenos | Commits pequenos e com mensagens claras |
| 4. Validar | Usar o comando de verificação do framework e conferir os critérios de aceitação | Relatório de verificação ou checklist preenchido |

> **Atenção:** leiam todo artefato gerado antes de aprová-lo. Em cada etapa, façam pelo menos uma alteração própria e registrem-na no arquivo.

## Entrega

Um integrante envia o link do repositório no GitHub em nome do grupo. Entregas sem repositório no GitHub não serão aceitas. Na raiz, incluam um `README.md` com:

```markdown
# README.md (modelo)
## Projeto e integrantes
Tema, problema que ele resolve e nomes dos integrantes.

## Framework utilizado
Qual foi e por que o grupo o escolheu.

## Como rodar
Comandos para subir a API e o front.

## Onde estão os artefatos
Caminho da spec, do plano e das tarefas, e quem fez cada tarefa.

## Reflexão
- Que decisão o agente teria tomado sozinho e a spec evitou?
- Que inconsistência a validação encontrou? Estava na spec ou no código?
- Como o framework ajudou (ou atrapalhou) a coordenação do grupo?
- O que fariam diferente com outro framework?
```

> **Dica:** comecem pequeno. Uma funcionalidade bem especificada e validada vale mais do que um sistema inteiro gerado sem revisão. Se sobrar tempo, rodem um segundo ciclo do framework para uma nova funcionalidade.
