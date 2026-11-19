# Quickstart — Tela de remapeamento de teclas

Guia de validação da feature. Cobre os gates automáticos e os cenários manuais que substituem o teste de DOM (issue #70).

**Referências**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contrato](./contracts/key-bindings-ui.md)

---

## 1. Pré-requisitos

- Node >= 24 e `npm ci` já executado.
- Nenhum Supabase local é necessário: a tela não fala com backend.
- Navegador desktop com teclado; um leitor de tela é opcional (Narrator, VoiceOver ou Orca).

## 2. Gates automáticos

```bash
npm run lint
npm run format:check
npm test
npm run build
npm run check-size
```

Esperado:

- `lint` sem warnings (as fronteiras de import do §4 do AGENTS.md continuam válidas: `features/settings` não importa Phaser nem fornecedores).
- `test` verde, incluindo os novos `captureKey.test.js`, `keyLabels.test.js`, `statusMessage.test.js` e os casos acrescentados a `keyBindings.test.js`.
- `i18n.test.js` verde: toda chave `settings.*` usada literalmente e nenhuma chave órfã.
- `check-size` dentro dos limites do SYSTEM_DESIGN §8.5 (JS inicial ≤ 250 KB gzip).

## 3. Rodar a aplicação

```bash
npm run dev
```

Abrir `http://localhost:5173/`.

## 4. Cenários manuais

### M1 — Acesso pela navegação

1. Na home, percorrer com `Tab` até o link "Configurações" e ativá-lo com `Enter`.
2. **Esperado**: a tela abre em `/configuracoes`, com `<h1>` visível e foco inicial útil.
3. Voltar com `Tab` até o link de retorno e confirmar que ele leva à home.

### M2 — Troca e persistência

1. Acionar o controle "Ação" de P1 e, na captura, pressionar `L`.
2. **Esperado**: a linha passa a mostrar `L`; a mensagem de estado anuncia a troca.
3. Recarregar a página (`F5`) e voltar à tela.
4. **Esperado**: `L` continua em "Ação" de P1.
5. Ir para `/jogar`, iniciar uma partida de 2 jogadores e confirmar que `L` executa a ação de P1 e `Enter` não executa mais.

### M3 — Conflito por troca

1. Definir a "Ação" de P1 como `W` (tecla de cima do P2).
2. **Esperado**: a ação de P1 recebe `W` e "Cima" de P2 recebe a tecla anterior da ação de P1 (`Enter`, se M2 foi desfeito, ou `L`).
3. **Esperado**: a mensagem cita os dois controles e as duas teclas.
4. Conferir que nenhum par de linhas mostra a mesma tecla.

### M4 — Mesma tecla do próprio controle

1. Acionar um controle e pressionar a tecla que ele já usa.
2. **Esperado**: a captura encerra, a mensagem diz que já é a tecla atual e nada é gravado.

### M5 — Cancelar com Esc

1. Armar um controle, pressionar `Esc`.
2. **Esperado**: captura encerrada, tecla inalterada, mensagem de cancelamento, foco de volta no botão do controle.

### M6 — Cancelar com Tab

1. Armar um controle, pressionar `Tab`.
2. **Esperado**: a captura encerra sem mudar nada e o foco avança para o próximo elemento focável, com foco visível no elemento novo.
3. Repetir com `Shift+Tab`.

### M7 — Modificador isolado

1. Armar um controle e pressionar apenas `Shift` (depois `Ctrl`, `Alt`, `Meta`).
2. **Esperado**: a captura continua ativa e a mensagem orienta a escolher outra tecla.

### M8 — Voltar aos padrões do jogo

1. Trocar a ação de P1 para `L` e a de P2 para `K`.
2. Reatribuir a ação de P1 para `Enter` e a de P2 para `Space` usando a captura.
3. **Esperado**: `Enter` e `Space` viram bindings e não reativam o botão durante a captura.

### M9 — Restaurar padrão (modal, foco e Esc)

1. Com pelo menos uma tecla personalizada, ativar "Restaurar padrão".
2. **Esperado**: o modal abre com foco no botão principal; `Tab` e `Shift+Tab` percorrem apenas os botões do modal.
3. Pressionar `Esc`.
4. **Esperado**: o modal fecha, nenhuma tecla muda e o foco volta ao botão "Restaurar padrão".
5. Reabrir, confirmar e verificar os onze valores padrão na tela.
6. Recarregar e confirmar que o padrão persistiu.

### M10 — Restaurar já no padrão

1. Com todas as teclas no padrão, ativar "Restaurar padrão" e confirmar.
2. **Esperado**: a mensagem diz que as teclas já estão no padrão; a tela não muda e o botão permanece acionável.

### M11 — Leitor de tela

1. Com o leitor ativo, repetir M2, M3, M5 e M9.
2. **Esperado**: cada resultado é anunciado uma vez, sem acumular mensagens antigas.

### M12 — Armazenamento indisponível

1. Simular falha de `localStorage` antes de carregar a página:
   - Chrome: DevTools → **Application → Storage**, marcar "Simulate custom quota" com quota `0` e recarregar; ou
   - Firefox: `about:config` → `dom.storage.enabled = false` e recarregar.
2. Abrir `/configuracoes`.
3. **Esperado**: o aviso de que as escolhas não serão lembradas aparece; trocar uma tecla funciona na sessão.
4. Recarregar.
5. **Esperado**: a tela volta ao padrão e continua sem erro; o jogo não quebra.
6. Desfazer a simulação ao final.

### M13 — Sem rede

1. DevTools → Network → *Offline*, recarregar o app servido pelo `vite preview` (build já visitado).
2. **Esperado**: a tela abre, mostra e grava normalmente, sem erro de rede.

### M14 — Partida de 1 jogador

1. Personalizar uma tecla de P2.
2. Iniciar uma partida de 1 jogador.
3. **Esperado**: os dois conjuntos controlam o mesmo chef, com as teclas personalizadas valendo.

### M15 — Preferências corrompidas

1. Com a tela de configurações fechada, abrir o DevTools → **Application → Local Storage** e substituir `kd:v1:settings` por um JSON inválido (por exemplo, `{"keyBindings":` truncado) ou remover o campo `keyBindings`.
2. Recarregar e abrir `/configuracoes`.
3. **Esperado**: os onze controles aparecem no padrão, sem aviso de erro e sem quebrar o jogo (FR-004).
4. Repetir com um JSON válido, mas com a mesma tecla em duas funções (por exemplo, `p1.up` igual a `p2.up`).
5. **Esperado**: `loadKeyBindings` descarta o valor inválido, a tela mostra o padrão e não exibe aviso.
6. Trocar uma tecla depois disso e confirmar que a preferência volta a ser gravada normalmente.

## 5. Evidência para o PR

Anexar ao PR:

- Saída de `npm run lint`, `npm test`, `npm run build` e `npm run check-size`.
- Lista dos cenários manuais executados (M1–M15) com o resultado obtido.
- Navegador e sistema usados, mais o leitor de tela, se aplicável.

## 6. O que este quickstart não cobre

- Toque, gamepad e mobile: fora do MVP (spec, "Fora de escopo").
- Sincronização das teclas com a conta: KD-34/KD-37.
- Automação de foco, `<dialog>` e `aria-live`: bloqueada pela falta de ambiente de teste de DOM (issue #70); fica manual até a issue ser resolvida.
