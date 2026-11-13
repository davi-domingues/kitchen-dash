import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

// Fronteiras de dependência do SYSTEM_DESIGN §3 (AGENTS.md §4)
const FORNECEDORES = ['@supabase/*', '@sentry/*', 'posthog-js']
const camada = (nome) => [`**/${nome}/**`]
// O core não enxerga APIs do navegador: desliga os globals herdados do bloco geral
const SEM_BROWSER = Object.fromEntries(Object.keys(globals.browser).map((g) => [g, 'off']))

export default defineConfig([
  globalIgnores(['dist', 'coverage', '.agents', '.claude', '.specify', '.opencode']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Só services/ fala com fornecedores
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/services/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: FORNECEDORES, message: 'Acesse fornecedores só por src/services (§3).' }] },
      ],
    },
  },
  {
    // game/core: JS puro e determinístico, sem Phaser, React, DOM ou services
    files: ['src/game/core/**/*.js'],
    languageOptions: { globals: SEM_BROWSER },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'phaser',
                'react',
                'react/*',
                'react-dom',
                'react-dom/*',
                'react-router',
                ...FORNECEDORES,
              ],
              message: 'game/core é JS puro: não importa Phaser, React nem fornecedores (§3).',
            },
            {
              group: [
                ...camada('services'),
                ...camada('phaser'),
                ...camada('features'),
                ...camada('app'),
                ...camada('ui'),
              ],
              message: 'game/core não depende de outras camadas (§3).',
            },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use o rng com seed de game/core (determinismo).' },
        { object: 'Date', property: 'now', message: 'Receba o tempo como entrada; o core é determinístico.' },
      ],
    },
  },
  {
    // game/phaser: renderiza e emite eventos; nunca chama o backend
    files: ['src/game/phaser/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: FORNECEDORES, message: 'Acesse fornecedores só por src/services (§3).' },
            {
              group: [...camada('services'), ...camada('features')],
              message: 'game/phaser não chama services nem features; emita pelo EventBus (§3).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  prettier,
])
