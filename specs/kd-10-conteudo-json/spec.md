# Feature Specification: Conteúdo do jogo em dados com schema (KD-10)

**Feature Branch**: `feat/kd-10-conteudo-json`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "KD-10 (#9): conteúdo do jogo em src/content/*.json (receitas, cozinha bistrô, cosméticos) com JSON Schema validado no build, content_version (hash) e nomes via i18n `<tipo>.<id>.name`."

## Clarifications

### Session 2026-11-18

Respostas tiradas dos docs (PRD, SYSTEM_DESIGN §3–4), sem consultar a pessoa, conforme o briefing.

- Q: O importador do TheMealDB e a sequência fixa do modo Desafio entram nesta task? → A: Não. O importador é um script separado (SYSTEM_DESIGN §4) e a sequência do Desafio é da KD-15.
- Q: Qual formato tem a versão do conteúdo? → A: Um texto curto de 8 caracteres hexadecimais, derivado de todos os arquivos de conteúdo (SYSTEM_DESIGN §4: "hash do JSON").
- Q: A falha de conteúdo deve barrar também o servidor de desenvolvimento? → A: Sim. A mesma validação roda no início do build e do servidor local.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Conteúdo do protótipo disponível como dado (Priority: P1)

Quem implementa as regras do jogo (estações, pedidos, cena da cozinha, cosméticos) lê receitas, ingredientes, o mapa do bistrô e os cosméticos de uma fonte única, sem números nem nomes fixos no código.

**Why this priority**: KD-12, KD-13, KD-18 e KD-23 dependem desses dados.

**Independent Test**: consultar as receitas e conferir os pontos (60, 60, 90, 130) e o desbloqueio (0, 20, 45 e 70 s) do PRD.

**Acceptance Scenarios**:

1. **Given** o conteúdo publicado, **When** se consultam as receitas liberadas aos 0 s, **Then** só a Salada aparece.
2. **Given** um recorde de 300 pontos, **When** se consultam os cosméticos liberados, **Then** aparecem os itens grátis, o Chapéu Bordeaux e o Avental Ervas.
3. **Given** um id inexistente, **When** se busca o item, **Then** a busca falha de forma explícita.

---

### User Story 2 - Conteúdo inválido nunca é publicado (Priority: P1)

O time altera o conteúdo com segurança: um arquivo com formato errado, referência quebrada ou mapa com estação inalcançável impede a geração da versão publicável.

**Why this priority**: É o critério de pronto da issue: o build falha com conteúdo inválido.

**Independent Test**: alterar um campo para um valor proibido e gerar o build, que deve falhar com uma mensagem que aponta o arquivo e o campo.

**Acceptance Scenarios**:

1. **Given** um cosmético com slot desconhecido, **When** o build roda, **Then** o build falha e cita o arquivo e o caminho do campo.
2. **Given** uma receita com ingrediente inexistente, **When** se valida o conteúdo, **Then** o erro cita a receita e o ingrediente.
3. **Given** uma estação sem chão adjacente, **When** se valida o conteúdo, **Then** o erro cita a posição da estação.

---

### User Story 3 - Versão do conteúdo identificável (Priority: P2)

Cada partida e cada pontuação enviada carregam a versão do conteúdo, para o servidor aceitar só versões conhecidas.

**Why this priority**: É necessária no envio de pontuação (M2), mas não bloqueia o jogo offline.

**Independent Test**: a versão é estável para o mesmo conteúdo e muda quando o conteúdo muda.

**Acceptance Scenarios**:

1. **Given** o mesmo conteúdo, **When** a versão é calculada duas vezes, **Then** o resultado é idêntico.
2. **Given** um conteúdo alterado, **When** a versão é recalculada, **Then** o resultado é diferente.

### Edge Cases

- O mapa tem linhas de largura diferente ou um caractere fora da legenda.
- Um ponto de nascimento dos chefs cai fora do chão.
- Falta uma caixa para algum ingrediente usado pelas receitas.
- Algum slot de cosmético fica sem um item grátis.
- Há ids duplicados.
- Algum item de conteúdo não tem nome traduzido.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O conteúdo MUST trazer as 4 receitas do protótipo (Salada, Tartine, Sopa de Tomate, Ratatouille), cada uma com ingredientes, recipiente (prato ou panela), tempos de preparo, pontos base e momento de desbloqueio.
- **FR-002**: O conteúdo MUST trazer o mapa do bistrô com as estações (caixas, tábua, fogão, balcão, pratos, lixeira, passe), dois pontos de nascimento e o tempo até a comida queimar.
- **FR-003**: O conteúdo MUST trazer chapéus, aventais e temas com os limiares de recorde do PRD.
- **FR-004**: A geração do build e o servidor local MUST falhar se algum arquivo violar o formato definido ou as regras de consistência (ids únicos, referências válidas, estações alcançáveis, caixa para cada ingrediente, um item grátis por slot).
- **FR-005**: O sistema MUST expor uma versão do conteúdo com 8 caracteres hexadecimais, derivada deterministicamente de todos os arquivos de conteúdo.
- **FR-008**: Fora de escopo: importador do TheMealDB e sequência fixa do modo Desafio.
- **FR-006**: Todo nome visível de conteúdo MUST vir do dicionário de idioma, pela chave `<tipo>.<id>.name`. Os testes MUST barrar nomes ausentes.
- **FR-007**: O sistema MUST oferecer consultas por id, receitas liberadas por tempo decorrido e cosméticos liberados por recorde.

### Key Entities

- **Ingrediente**: id, ícone e tempo de corte.
- **Receita**: id, ícone, pontos, desbloqueio, recipiente, ingredientes e tempo de cozimento.
- **Cozinha**: id, grade, legenda de células, pontos de nascimento e tempo de queima.
- **Cosmético**: id, slot (chapéu, avental ou tema), recorde necessário e cor.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% das violações de regra listadas nos Edge Cases fazem a validação falhar e têm teste automatizado.
- **SC-002**: Os 4 pratos, as 7 estações e os 11 cosméticos do PRD estão presentes, com os valores do PRD.
- **SC-003**: A versão do conteúdo é idêntica em 100% das execuções com os mesmos dados.
- **SC-004**: Nenhum nome de conteúdo exibido fica sem tradução (0 chaves ausentes).

## Assumptions

- A pasta é `src/content/`, conforme o SYSTEM_DESIGN §3.
- Os tempos de corte (1,2–2 s), cozimento (6–8 s) e queima (6 s) não constam no PRD; são valores iniciais de balanceamento e mudam só nos dados.
- As cores dos cosméticos são provisórias; a arte final é da KD-19.
- Os ingredientes ficam junto das receitas, já que a issue lista só 3 arquivos.
- A lista de versões aceitas no servidor é escopo da KD-31.
