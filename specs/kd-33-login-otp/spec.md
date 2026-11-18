# Feature Specification: Login por código enviado ao e-mail

**Feature Branch**: `feat/kd-33-login-otp`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "KD-33 (issue #27): Login por código OTP de 6 dígitos por e-mail com Cloudflare Turnstile. Tela de login (e-mail + Turnstile → enviar código; código → verificar), contexto de sessão (usuário, carregando, sair), template de e-mail com o código, captcha no config local sem segredos, chaves de teste do Turnstile no .env.example. Visitante continua jogando offline; sem backend configurado o login fica desligado."

## Clarifications

### Session 2026-11-18

Resolvidas com os docs, sem perguntar à pessoa (BRIEF):

- Q: Onde fica a tela de login? → A: Rota própria `/entrar`, acessível pela home e pelo perfil (SYSTEM_DESIGN §3: `features/auth`).
- Q: O login é obrigatório para jogar? → A: Não. Visitante joga offline; o login só habilita features online (ARQUITETURA: visitante × autenticado).
- Q: Quantos dígitos e quanto tempo vale o código? → A: 6 dígitos (ARQUITETURA), validade de 10 minutos (SYSTEM_DESIGN §6: "expiração curta").
- Q: O usuário pode pedir outro código? → A: Sim, voltando ao passo do e-mail; um novo desafio anti-bot é exigido a cada envio.
- Q: O que a home mostra para quem já entrou? → A: O e-mail da conta e a ação "Sair".

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Entrar com o código do e-mail (Priority: P1)

O jogador informa o e-mail, passa pela verificação anti-bot, recebe um código de 6 dígitos e o digita para entrar na conta.

**Why this priority**: Sem login não há ranking, envio de pontuação nem migração de progresso (M2).

**Independent Test**: Com o backend local, pedir o código para `jogador@example.com`, ler o código na caixa de teste e entrar.

**Acceptance Scenarios**:

1. **Given** a tela de login, **When** o jogador informa um e-mail válido e passa na verificação anti-bot, **Then** o código é enviado e a tela pede os 6 dígitos.
2. **Given** o passo do código, **When** o jogador digita o código correto, **Then** entra na conta e volta à home vendo o seu e-mail.
3. **Given** o passo do código, **When** o código é errado ou expirou, **Then** vê uma mensagem de erro e pode tentar de novo ou pedir outro código.
4. **Given** só o teclado, **When** o jogador faz o fluxo inteiro, **Then** conclui sem mouse.

---

### User Story 2 - Manter a sessão e sair (Priority: P1)

Quem entrou continua logado ao recarregar a página e pode sair quando quiser.

**Why this priority**: Base para as tasks que dependem do usuário (KD-34, KD-35, KD-38).

**Independent Test**: Entrar, recarregar a página (continua logado), sair (volta a visitante).

**Acceptance Scenarios**:

1. **Given** um jogador logado, **When** recarrega a página, **Then** continua logado.
2. **Given** um jogador logado, **When** ativa "Sair", **Then** volta a ser visitante.
3. **Given** a sessão ainda carregando, **When** a home abre, **Then** mostra um indicador de carregamento no lugar da área de conta.

---

### User Story 3 - Jogar sem backend (Priority: P2)

Sem o backend configurado (ou offline), o jogo continua funcionando e o login aparece desligado com uma explicação.

**Why this priority**: Princípio offline-first da constituição.

**Independent Test**: Rodar sem as variáveis do backend e abrir `/entrar`.

**Acceptance Scenarios**:

1. **Given** o backend não configurado, **When** o jogador abre a tela de login, **Then** vê que o login está indisponível e um link para voltar.

### Edge Cases

- E-mail inválido: o envio fica bloqueado com mensagem antes de chamar o servidor.
- Código com menos de 6 dígitos ou com letras: não é enviado.
- Verificação anti-bot falha ou expira: o envio fica bloqueado e o desafio é refeito.
- Limite de envios de e-mail atingido: mensagem "muitas tentativas, aguarde".
- Sem rede: mensagem de erro genérica, sem perder o e-mail digitado.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O sistema DEVE permitir pedir um código de 6 dígitos informando um e-mail válido.
- **FR-002**: O pedido de código DEVE exigir uma verificação anti-bot concluída.
- **FR-003**: O sistema DEVE validar o código de 6 dígitos e iniciar a sessão quando correto.
- **FR-004**: O sistema DEVE traduzir as falhas (código inválido/expirado, limite de envios, anti-bot, rede) em mensagens claras.
- **FR-005**: A sessão DEVE persistir entre recargas e expor usuário, estado de carregamento e ação de sair a todo o app.
- **FR-006**: Sem backend configurado, o login DEVE aparecer desligado e o jogo continuar jogável.
- **FR-007**: O e-mail enviado DEVE conter o código, não um link.
- **FR-008**: Todo texto visível DEVE passar pelo i18n; todo o fluxo DEVE ser operável por teclado e tratar carregando e erro.

### Key Entities

- **Sessão**: usuário autenticado (id, e-mail) ou visitante; estado de carregamento.
- **Pedido de código**: e-mail + token anti-bot.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Um jogador entra na conta em menos de 1 minuto a partir do recebimento do e-mail.
- **SC-002**: 100% das falhas conhecidas mostram mensagem específica (coberto por teste).
- **SC-003**: Recarregar a página mantém o jogador logado em 100% dos casos com sessão válida.
- **SC-004**: Sem backend, a home e o jogo continuam funcionando sem erros.

## Assumptions

- O envio de e-mail usa o SMTP padrão do Supabase no MVP (Resend fica no ROADMAP).
- Chaves de teste públicas do Turnstile (sempre aprova) são usadas no desenvolvimento local; a chave secreta só existe no ambiente do servidor.
- Configurações de produção (painel do Supabase e da Cloudflare) são passos manuais da pessoa.
- Migração do progresso local para a conta fica para a KD-37.
