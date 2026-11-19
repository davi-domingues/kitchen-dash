# Feature Specification: Tela de remapeamento de teclas

**Feature Branch**: `feat/remapear-teclas`

**Created**: 2026-11-19

**Status**: Draft

**Input**: Issue #75. Tela para o jogador remapear as teclas de P1 e P2; o remapeamento já persiste em `settings`. Falta a UI. Deve ser acessível por teclado, tratar conflito de tecla, ter botão de restaurar o padrão, usar textos via i18n pt-BR e não adicionar dependência nova.

## Clarifications

### Session 2026-11-19

- Q: Preferências salvas corrompidas devem gerar aviso na tela? → A: Não. A tela apenas exibe o padrão, sem prometer diagnóstico; a recuperação continua silenciosa como no modelo atual.
- Q: O nome da branch segue o padrão com `kd-XX`? → A: Não. `feat/remapear-teclas` é mantida porque a issue #75 é de débito e não existe KD-75; a rastreabilidade fica no commit e no PR com `Refs #75` / `Closes #75`.
- Q: Enter e Espaço, que também ativam botões, viram tecla durante a captura? → A: Sim. Como qualquer outra tecla, eles viram a nova tecla do controle; só Esc, Tab e modificadores isolados são tratados à parte.
- Q: O que "Restaurar padrão" faz quando as teclas já estão no padrão? → A: Continua acionável e avisa que as teclas já estão no padrão, sem alterar nada.
- Q: Como a confirmação de "Restaurar padrão" aparece? → A: Modal na própria tela, com foco preso enquanto aberto, cancelamento por Esc e retorno de foco ao botão.

## Cenários de usuário e testes _(obrigatório)_

### História 1 - Trocar a tecla de um controle (Prioridade: P1)

Fora de uma partida, o jogador abre a tela de configurações, vê as teclas atuais de P1, de P2 e da pausa, escolhe um controle e pressiona a tecla que quer usar. A tela mostra a nova tecla e a escolha é usada na próxima partida e continua valendo depois de recarregar a página.

**Por que esta prioridade**: é o objetivo central da issue; sem isso o jogador não consegue adaptar os controles ao próprio teclado ou preferência.

**Teste independente**: abrir a tela, trocar a ação de P1 de Enter para uma letra livre, recarregar a página e iniciar uma partida usando a nova tecla.

**Cenários de aceitação**:

1. **Given** a tela de configurações aberta, **When** o jogador ativa o controle "ação" de P1 e pressiona uma tecla livre, **Then** o controle passa a exibir a nova tecla e a preferência fica salva imediatamente.
2. **Given** uma tecla trocada, **When** o jogador recarrega a página ou volta à tela depois, **Then** a tecla escolhida continua aparecendo e valendo no jogo.
3. **Given** uma tecla trocada, **When** o jogador inicia uma partida, **Then** o jogo responde à nova tecla; a tecla anterior deixa de executar aquele controle.
4. **Given** a tela aberta, **When** o jogador pressiona a mesma tecla que o controle já usa, **Then** nada muda e a tela informa que a tecla já é a atual.

---

### História 2 - Operar a tela só com o teclado (Prioridade: P1)

O jogador navega até a tela, percorre os controles e troca teclas sem usar o mouse, com foco sempre visível e com anúncios claros de cada passo.

**Por que esta prioridade**: a tela troca justamente os controles do teclado; exigir mouse tornaria a configuração inacessível para parte do público e contraria o requisito de acessibilidade do produto.

**Teste independente**: percorrer a tela inteira usando apenas Tab, Shift+Tab, Enter/Espaço e Esc, realizando uma troca e um cancelamento.

**Cenários de aceitação**:

1. **Given** a página inicial, **When** o jogador navega por teclado até o link de configurações e o ativa, **Then** a tela abre com um título e um foco inicial útil.
2. **Given** a tela aberta, **When** o jogador usa Tab e Shift+Tab, **Then** o foco percorre todos os controles e botões na ordem visual, sem armadilha de foco.
3. **Given** um controle em modo de captura, **When** o jogador pressiona Esc, **Then** a captura é cancelada, nenhuma tecla muda e o foco volta ao controle que estava editando.
4. **Given** um controle em modo de captura, **When** o jogador pressiona Tab, **Then** o foco segue para o próximo elemento e a captura é cancelada sem alteração.
5. **Given** qualquer troca, conflito, cancelamento ou restauração, **When** a ação termina, **Then** uma mensagem acessível anuncia o resultado para quem usa leitor de tela.

---

### História 3 - Resolver conflito entre duas funções (Prioridade: P2)

Quando a tecla escolhida já pertence a outro controle, o jogador é avisado e as duas teclas trocam de lugar, para nenhuma tecla ficar com duas funções.

**Por que esta prioridade**: sem essa regra o jogador pode acidentalmente deixar dois controles na mesma tecla e perder o controle do chef; a troca mantém o conjunto completo e previsível.

**Teste independente**: mapear a ação de P1 para uma tecla já usada por P2 e verificar que as duas teclas trocaram de dono.

**Cenários de aceitação**:

1. **Given** "KeyL" na direita de P2 e "Enter" na ação de P1, **When** o jogador define "KeyL" como ação de P1, **Then** a ação de P1 fica com "KeyL" e a direita de P2 fica com "Enter".
2. **Given** um conflito resolvido por troca, **When** a troca termina, **Then** a tela informa quais dois controles trocaram de tecla.
3. **Given** qualquer sequência de trocas, **When** o jogador confere a tela ou inicia uma partida, **Then** não existe tecla repetida entre os onze controles.

---

### História 4 - Restaurar o padrão (Prioridade: P3)

Depois de várias trocas, o jogador volta todas as teclas ao padrão do jogo em uma única ação.

**Por que esta prioridade**: dá uma saída segura para quem se confunde ou empresta o computador; é menos frequente que as trocas, mas exigido na issue.

**Teste independente**: trocar duas teclas, ativar "restaurar padrão", confirmar e verificar os onze valores padrão salvos.

**Cenários de aceitação**:

1. **Given** teclas personalizadas, **When** o jogador ativa "Restaurar padrão", **Then** a tela pede confirmação em um modal, com o foco preso nele, antes de alterar qualquer coisa.
2. **Given** a confirmação aceita, **When** a restauração termina, **Then** todos os onze controles exibem os valores padrão, a preferência é salva e o resultado é anunciado.
3. **Given** o modal de confirmação aberto, **When** o jogador cancela com Esc ou recusa, **Then** nenhuma tecla muda, o modal fecha e o foco volta ao botão de restaurar.
4. **Given** todos os onze controles já no padrão, **When** o jogador ativa "Restaurar padrão" e confirma, **Then** a tela avisa que as teclas já estão no padrão e nada muda.

---

### Casos limite

- **Teclas modificadoras isoladas** (Shift, Control, Alt, Meta): são ignoradas durante a captura, com orientação para escolher outra tecla, porque sozinhas não servem como botão.
- **Enter, Espaço e outras teclas de ativação durante a captura**: viram a nova tecla do controle como qualquer outra, e não ativam o botão; o jogador pode devolver a ação de P1 para Enter e a de P2 para Espaço.
- **Esc durante a captura**: cancela; Esc nunca vira tecla de um controle.
- **Tab durante a captura**: mantém a navegação normal por teclado e cancela a captura; o foco nunca fica preso.
- **Teclas de atalho do navegador ou do sistema** (recarregar, fechar aba): o atalho continua sendo do navegador; a tela só recebe a tecla quando o navegador a entrega. Se não for possível capturar, nada muda e a tela continua aguardando.
- **Preferências salvas corrompidas ou inválidas**: a tela mostra o padrão, sem quebrar o jogo e sem prometer diagnóstico ao jogador.
- **Armazenamento local indisponível**: a tela continua funcionando na sessão e avisa que as escolhas não serão lembradas no próximo acesso.
- **Tecla física sem rótulo conhecido**: a tela exibe um nome legível ou o identificador da tecla, nunca um campo vazio.
- **Tela aberta em partida**: não é possível; a tela só existe fora do jogo e mudanças valem a partir da próxima partida.
- **Sem rede ou sem login**: a tela funciona por completo, pois só usa preferências locais.

## Requisitos _(obrigatório)_

### Requisitos funcionais

- **FR-001**: O sistema MUST oferecer uma tela dedicada de configuração de teclas, alcançável pela navegação principal, listando os cinco controles de P1, os cinco de P2 e a pausa, cada um com sua tecla atual legível.
- **FR-002**: O jogador MUST poder escolher qualquer um dos onze controles e definir uma nova tecla pressionando-a.
- **FR-003**: Cada troca MUST ser salva imediatamente na preferência local e MUST valer para a próxima partida, sem exigir recarregar a página.
- **FR-004**: A tela MUST exibir as teclas salvas ao abrir e MUST recuperar o padrão quando as preferências estiverem corrompidas, sem avisar o jogador e sem quebrar o jogo.
- **FR-005**: Uma tecla já usada por outro controle MUST trocar de função com o controle editado, e a tela MUST informar a troca; nenhuma tecla pode ficar com duas funções.
- **FR-006**: O jogador MUST poder cancelar a captura com Esc ou saindo do controle, sem alterar nada.
- **FR-007**: Teclas modificadoras isoladas MUST ser recusadas com orientação, mantendo a captura ativa.
- **FR-008**: A tela MUST oferecer "Restaurar padrão", que devolve os onze controles aos valores padrão e salva o resultado; a ação MUST pedir confirmação em um modal com foco preso, cancelável com Esc, e MUST devolver o foco ao botão ao fechar; quando tudo já estiver no padrão, a confirmação MUST apenas informar isso, sem alterar nada e sem desabilitar o botão.
- **FR-009**: Toda a tela MUST ser operável apenas por teclado, com foco visível, ordem de foco coerente e retorno de foco após cancelar ou confirmar.
- **FR-010**: Estados de captura, troca, conflito, cancelamento, restauração e falha de armazenamento MUST ser comunicados também de forma não visual (mensagem anunciada).
- **FR-011**: Todo texto visível MUST vir do dicionário pt-BR, incluindo nomes de jogadores, controles, teclas conhecidas, instruções, estados e avisos; não pode haver texto literal no código.
- **FR-012**: A tela MUST funcionar sem rede e sem autenticação, usando apenas preferências locais.
- **FR-013**: A funcionalidade MUST NOT adicionar dependência nova.
- **FR-014**: A tela MUST deixar claro que o jogador 1 usa os controles de P1, o 2 os de P2 e que, em partidas de 1 jogador, os dois conjuntos controlam o mesmo chef.
- **FR-015**: As mensagens de status MUST ser curtas e substituídas a cada nova ação, sem acumular avisos antigos na tela.
- **FR-016**: Quando o armazenamento local não estiver disponível, a tela MUST continuar funcionando na sessão e MUST avisar que as escolhas não serão lembradas no próximo acesso.

### Entidades-chave

- **Preferência de teclas**: conjunto das onze funções (P1 × cinco, P2 × cinco e pausa), sempre completo e sem repetição.
- **Função de controle**: identificação de jogador e controle (cima, baixo, esquerda, direita, ação) ou pausa, com a tecla atual.
- **Sessão de captura**: o controle que está aguardando uma tecla, com as opções de cancelar ou receber uma nova tecla.
- **Mensagem de estado**: resultado da última ação, exibido e anunciado, com indicação de sucesso, troca, cancelamento ou falha de persistência.

## Critérios de sucesso _(obrigatório)_

### Resultados mensuráveis

- **SC-001**: Um jogador conclui uma troca de tecla em até 3 ações (abrir a tela, escolher o controle, pressionar a nova tecla) e em menos de 20 segundos.
- **SC-002**: 100% das operações da tela (troca, conflito, cancelamento, restauração e confirmação) podem ser concluídas sem mouse.
- **SC-003**: 100% das trocas salvas continuam valendo depois de recarregar a página com armazenamento disponível.
- **SC-004**: Após qualquer sequência de trocas, a tela nunca mostra e o jogo nunca aceita a mesma tecla em duas funções.
- **SC-005**: 100% dos cancelamentos (Esc ou saída do controle) deixam as teclas exatamente como estavam.
- **SC-006**: "Restaurar padrão" devolve os onze controles ao padrão em uma única confirmação, e o jogador vê e ouve o resultado.
- **SC-007**: Nenhuma string visível fica fora do dicionário pt-BR: a verificação automatizada de i18n passa sem chaves faltantes nem sem uso.
- **SC-008**: O conjunto de dependências do projeto não muda.

## Premissas

- **Local da tela**: uma tela de configurações própria, apontada pela navegação principal da home, conforme a spec do InputMap (001) — que deixou a UI de remapeamento para a tela de configurações. Outras preferências não entram nesta entrega.
- **Pausa incluída**: a tecla de pausa é remapeável como os demais controles, alinhado à decisão registrada na spec 001.
- **Conflito por troca**: a regra existente de troca entre controles é a esperada; não há rejeição nem "tecla livre obrigatória".
- **Confirmação ao restaurar**: restaurar pede confirmação porque apaga até onze personalizações de uma vez.
- **Aplicação**: mudanças passam a valer na próxima partida; não há remapeamento durante a partida.
- **Rótulos de teclas**: teclas nomeadas aparecem em pt-BR (setas, Enter, Espaço, Esc etc.); letras e números aparecem como o caractere correspondente; a identificação é por posição física, independente do layout ABNT2 ou US.
- **Público**: desktop com teclado; mobile e gamepad continuam fora do MVP.
- **Dados**: nenhuma informação pessoal é coletada ou exibida; não há telemetria nesta tela.

## Fora de escopo

- Sincronizar as preferências com a conta (KD-34/KD-37).
- Remapear controles de toque, gamepad ou mobile.
- Outras configurações (áudio, reduzir efeitos, idioma) além das teclas.
- Alterar a lógica de captura de teclas do jogo, que já existe.
- Atalhos alternativos por controle (mais de uma tecla para a mesma função).
