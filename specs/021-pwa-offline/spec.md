# Feature Specification: PWA — jogo offline e aviso de atualização

**Feature Branch**: `feat/kd-41-pwa-offline`
**Created**: 2026-11-20
**Status**: Draft
**Input**: KD-41 (issue #34): o jogo abre e roda sem rede; aviso acessível de nova versão, nunca durante a partida (SYSTEM_DESIGN §8.4).

## Clarifications

### Session 2026-11-20

- Q: Como garantir "nunca no meio de uma partida"? → A: o aviso não é exibido na rota /jogar (resolvido pela SYSTEM_DESIGN §8.4, suposição registrada).
- Q: A atualização é automática? → A: não; a nova versão espera o clique em "recarregar" (§8.4).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogar sem internet (Priority: P1)

Quem já visitou o jogo uma vez abre o site (ou o app instalado) sem rede e joga uma partida completa como visitante.

**Why this priority**: é o critério de pronto da issue e um RNF do MVP (D14).

**Independent Test**: build de produção servido localmente, visitar uma vez, desligar a rede nas DevTools, recarregar, jogar uma partida até o resultado.

**Acceptance Scenarios**:

1. **Given** uma visita anterior completa, **When** o jogador abre o site offline, **Then** a tela inicial, a rota /jogar, o jogo, as imagens e os sons carregam.
2. **Given** offline, **When** o jogador navega direto para uma rota interna (ex.: /ranking), **Then** a aplicação abre e a tela mostra o estado offline já existente, sem página de erro do navegador.

---

### User Story 2 - Aviso de nova versão (Priority: P2)

Após um novo deploy, o jogador vê um aviso "nova versão disponível — recarregar" fora da partida e decide quando atualizar.

**Why this priority**: evita versões presas no cache sem interromper partidas.

**Independent Test**: com o app aberto, publicar um build novo; o aviso aparece fora de /jogar, é anunciado por leitor de tela e opera por teclado.

**Acceptance Scenarios**:

1. **Given** uma nova versão pronta, **When** o jogador está fora da tela de jogo, **Then** aparece um aviso anunciado (`role="status"`) com o botão de recarregar e o de dispensar.
2. **Given** uma nova versão pronta, **When** o jogador está na tela de jogo, **Then** nenhum aviso aparece até ele sair dela.
3. **Given** o aviso visível, **When** o jogador aciona "recarregar", **Then** a nova versão assume e a página recarrega.

### Edge Cases

- Requisições ao Supabase, Sentry e Turnstile nunca são servidas do cache (network-only); offline elas falham e as telas mostram o estado offline/outbox já existentes.
- Primeira visita sem rede: não há cache; comportamento padrão do navegador (fora do escopo).
- Dispensar o aviso o esconde até a próxima detecção de versão (recarga da página).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE armazenar para uso offline o shell da aplicação, os bundles (inclusive o do jogo), imagens e sons.
- **FR-002**: Navegações offline para qualquer rota da aplicação DEVEM abrir o shell.
- **FR-003**: Requisições a Supabase, Sentry e Turnstile NÃO DEVEM ser servidas do cache.
- **FR-004**: Uma nova versão NÃO DEVE assumir sozinha; só após o jogador acionar "recarregar".
- **FR-005**: O aviso NÃO DEVE aparecer na tela de partida (/jogar).
- **FR-006**: O aviso DEVE ser anunciado a leitores de tela, operável por teclado e com todos os textos via i18n.
- **FR-007**: O app DEVE ser instalável (manifesto com nome, ícone e cores do tema).
- **FR-008**: O orçamento de tamanho DEVE medir o precache (≤ 15 MiB) e a CSP DEVE permitir o service worker.

### Key Entities

- **Versão em espera**: build novo baixado e aguardando a confirmação do jogador.

## Success Criteria *(mandatory)*

- **SC-001**: Com a rede desligada após uma visita, 100% das partidas de teste chegam à tela de resultado.
- **SC-002**: O conteúdo guardado para uso offline fica ≤ 15 MiB.
- **SC-003**: Nenhum aviso de atualização aparece durante uma partida.

## Assumptions

- `vite-plugin-pwa` está aprovado na SYSTEM_DESIGN §11; a versão exata é a estável atual.
- Ícone do app: SVG próprio simples em `public/` (sem gerador de assets, que seria dependência nova).
- "Fora da partida" = qualquer rota diferente de /jogar (a tela de setup/resultado também fica em /jogar; aceitável e mais seguro).
