# Quickstart

1. `npm run build && npm run check-size`: a linha `precache` aparece medida (≤ 15 MiB).
2. `npx vite preview`, abrir e esperar o SW ativo (DevTools > Application).
3. DevTools > Network > Offline; recarregar `/` e `/jogar`; jogar até o resultado.
4. Novo build com mudança; fora de /jogar o aviso aparece, em /jogar não; "Recarregar" troca a versão.
5. Chrome/Edge: opção de instalar o app na barra de endereço.
