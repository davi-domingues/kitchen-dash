# Research — KD-10

## Validador

- **Decision:** usar JSON Schema draft-07 com ajv 8 (dev) e checagens próprias para referências e geometria do mapa.
- **Rationale:** o ajv é o validador de referência e já foi aprovado. O schema não enxerga relações entre arquivos nem a vizinhança no mapa, por isso essas checagens são próprias.
- **Alternatives considered:** validar só com código próprio (mais código para manter) e usar zod (dependência não aprovada).

## Onde validar

- **Decision:** um plugin do Vite no `buildStart`, que chama `this.error`.
- **Rationale:** o build e o dev server falham sem precisar de um script extra no CI, e o ajv fica fora do bundle.
- **Alternatives considered:** um script `prebuild` (dá para esquecer no dev server) e validar em runtime (põe o ajv no bundle).

## content_version

- **Decision:** FNV-1a de 32 bits, com 8 caracteres hexadecimais, sobre `JSON.stringify` dos 3 arquivos, calculado no loader.
- **Rationale:** é determinístico, não traz dependência e funciona no navegador e no Node. Basta para distinguir versões.
- **Alternatives considered:** SHA-256 via `define` do Vite (exige build magic e não ganha nada para este uso) e a versão manual (dá para esquecer).

## Nomes

- **Decision:** a chave i18n é derivada como `<tipo>.<id>.name`, sem nome no JSON.
- **Rationale:** segue o AGENTS.md §5. O teste de i18n gera as chaves a partir dos dados.
