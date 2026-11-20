// Orçamento de tamanho do build (SYSTEM_DESIGN §8.5). Falha o CI se algum limite for ultrapassado.
// Uso: npm run build && npm run check-size
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const KIB = 1024
const MIB = 1024 * KIB

export const LIMITS = {
  fileCount: 500,
  largestFile: 5 * MIB,
  totalSize: 25 * MIB,
  precache: 15 * MIB,
  initialJsGzip: 250 * KIB,
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

// JS que a home baixa antes de qualquer import dinâmico: scripts de entrada e modulepreload do index.html
export function initialScripts(html) {
  const refs = [
    ...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
    ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
  ].map((m) => m[1].replace(/^\//, ''))
  return [...new Set(refs)]
}

// Lista do precache do vite-plugin-pwa (KD-41). Antes do PWA não há precache para medir.
function precacheSize(distDir) {
  const sw = join(distDir, 'sw.js')
  if (!existsSync(sw)) return null
  const urls = [...readFileSync(sw, 'utf8').matchAll(/url:\s*"([^"]+)"/g)].map((m) => m[1])
  return urls.reduce((sum, url) => {
    const path = join(distDir, url)
    return existsSync(path) ? sum + statSync(path).size : sum
  }, 0)
}

export function measure(distDir) {
  // Source maps vão só para o Sentry e são apagados após o upload (KD-45): não contam no orçamento
  const files = listFiles(distDir)
    .filter((path) => !path.endsWith('.map'))
    .map((path) => ({
      path: relative(distDir, path).split(sep).join('/'),
      size: statSync(path).size,
    }))
  const largest = files.reduce((max, f) => (f.size > max.size ? f : max), { path: '-', size: 0 })
  const html = readFileSync(join(distDir, 'index.html'), 'utf8')
  const initialJsGzip = initialScripts(html).reduce(
    (sum, file) => sum + gzipSync(readFileSync(join(distDir, file))).length,
    0,
  )
  return {
    fileCount: files.length,
    largestFile: largest.size,
    largestPath: largest.path,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    precache: precacheSize(distDir),
    initialJsGzip,
  }
}

export function evaluate(stats, limits = LIMITS) {
  return Object.keys(limits)
    .filter((metric) => stats[metric] !== null && stats[metric] !== undefined)
    .map((metric) => ({
      metric,
      value: stats[metric],
      limit: limits[metric],
      ok: stats[metric] <= limits[metric],
    }))
}

const format = (metric, value) =>
  metric === 'fileCount'
    ? String(value)
    : value >= MIB
      ? `${(value / MIB).toFixed(2)} MiB`
      : `${(value / KIB).toFixed(1)} KiB`

function main() {
  const distDir = fileURLToPath(new URL('../dist', import.meta.url))
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('✖ dist/ não encontrado. Rode `npm run build` antes.')
    process.exit(1)
  }
  const stats = measure(distDir)
  const results = evaluate(stats)
  for (const { metric, value, limit, ok } of results) {
    const extra = metric === 'largestFile' ? ` (${stats.largestPath})` : ''
    console.warn(
      `${ok ? '✔' : '✖'} ${metric.padEnd(14)} ${format(metric, value).padStart(11)} / ${format(metric, limit)}${extra}`,
    )
  }
  if (stats.precache === null) console.warn('ℹ precache: sem service worker ainda (KD-41), não medido')
  if (results.some((r) => !r.ok)) {
    console.error('✖ Orçamento de tamanho ultrapassado (SYSTEM_DESIGN §8.5).')
    process.exit(1)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()
