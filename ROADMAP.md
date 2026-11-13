# Kitchen Dash — Roadmap

Itens fora do MVP, com prioridade relativa. Detalhes técnicos em [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md).

## Antes da divulgação pública (alta)
- **SMTP próprio (Resend)** para os e-mails de OTP.
- **Migrar Supabase para o plano Pro** (backups diários; gatilhos em System Design §9).

## Produto (média)
### Pagamento via Pix para cosméticos
- Venda opcional de itens cosméticos, sem vantagens competitivas.
- Requer Supabase Edge Functions + provedor de pagamento com webhook; item liberado só após confirmação no servidor.
- Catálogo de cosméticos migra do JSON para o banco.

### Desafios recorrentes
- Desafios diários/semanais com seed compartilhada (o núcleo já é determinístico).
- Ranking por desafio usando a coluna `board` de `best_scores`.
- Rotação agendada via Supabase Cron.

### Anti-trapaça avançado
- Validação por replay: Edge Function reexecuta o `game/core` com seed + log de inputs.

## Qualidade e operação (baixa)
### Analytics de interação
- Cloudflare Web Analytics (tráfego) + PostHog (funil e eventos de jogo) atrás de `services/analytics.js`.
- PostHog sem cookies até consentimento.
- **A refinar na implementação:** catálogo e volume de eventos. Ex.: `order_failed` não deve gerar um evento por erro; avaliar agregar em `match_ended` (contagem por receita/motivo) ou amostrar.

### Performance
- Orçamento de runtime: 60 fps em notebook comum, profiling das cenas, object pooling.
- (O orçamento de **tamanho** do build já é obrigatório no MVP.)

### Outros
- Testes E2E com Playwright (login → partida → ranking).
- Filtro de palavrões em `display_name`.
- Idioma inglês (i18n já preparado).

## Plataformas (baixíssima)
- Joystick virtual e controles por toque para celular (o `InputMap` já abstrai ações).
- Suporte a gamepad.
