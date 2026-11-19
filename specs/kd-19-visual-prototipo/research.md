# Research: KD-19 parte 1

- **Decision**: Graphics estático (piso, balcões, estações fixas) desenhado uma vez; Graphics dinâmico limpo e redesenhado a cada quadro (fogão, alvo, chefs). **Rationale**: custo baixo e simples. **Alternatives**: texturas geradas (`generateTexture`) — mais complexo, sem ganho perceptível para 13×8 tiles.
- **Decision**: Tracejado com segmentos manuais (Phaser 3 não tem `setLineDash`). **Rationale**: função pura `dashSegments` testável. **Alternatives**: plugin externo — vetado (dependência).
- **Decision**: Tema por id (`theme_bistro/marble/provence`) mapeado para paletas do protótipo (bistro/marmore/provence). **Alternatives**: deduzir pela cor do cosmético — frágil.
- **Decision**: Cores de jogador do protótipo: P1 `#7a1f2b`, P2 `#2f6fb0`. Chef P2 usa os próprios cosméticos (KD-23) em vez do jaleco azul fixo.
- **Decision**: Fontes: `Georgia, serif` (títulos) e `system-ui, sans-serif` (texto); emojis com pilha de fontes de emoji. Pendência: Playfair Display/Nunito auto-hospedadas exigem aprovação.
- **Decision**: Aviso de queima quando `timerMs ≥ 2/3 · stoveBurnAfterMs`, piscando por `floor(elapsed·6) % 2` (igual ao protótipo), usando o tempo da cena.
