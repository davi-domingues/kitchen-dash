import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { evaluate, initialScripts, LIMITS, measure } from './check-size.js'

const dirs = []
function fakeDist(files) {
  const dir = mkdtempSync(join(tmpdir(), 'kd-dist-'))
  dirs.push(dir)
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
  return dir
}

afterEach(() => {
  while (dirs.length) rmSync(dirs.pop(), { recursive: true, force: true })
})

describe('initialScripts', () => {
  it('lê o script de entrada e os modulepreload do index.html', () => {
    const html = `<script type="module" crossorigin src="/assets/index-a.js"></script>
      <link rel="modulepreload" crossorigin href="/assets/vendor-b.js">
      <link rel="stylesheet" href="/assets/index.css">`

    expect(initialScripts(html)).toEqual(['assets/index-a.js', 'assets/vendor-b.js'])
  })
})

describe('measure', () => {
  it('conta arquivos, tamanho total, maior arquivo e JS inicial sem os chunks lazy', () => {
    const dist = fakeDist({
      'index.html': '<script type="module" src="/assets/index.js"></script>',
      'assets/index.js': 'a'.repeat(1000),
      'assets/PlayPage.js': 'b'.repeat(5000),
    })

    const stats = measure(dist)

    expect(stats.fileCount).toBe(3)
    expect(stats.largestPath).toBe('assets/PlayPage.js')
    expect(stats.largestFile).toBe(5000)
    expect(stats.initialJsGzip).toBeGreaterThan(0)
    expect(stats.initialJsGzip).toBeLessThan(1000)
    expect(stats.precache).toBeNull()
  })
})

describe('evaluate', () => {
  const ok = { fileCount: 10, largestFile: 1, totalSize: 1, precache: null, initialJsGzip: 1 }

  it('aprova quando tudo está dentro dos limites e ignora métricas não medidas', () => {
    const results = evaluate(ok)

    expect(results.every((r) => r.ok)).toBe(true)
    expect(results.map((r) => r.metric)).not.toContain('precache')
  })

  it('reprova a métrica que passa do limite', () => {
    const results = evaluate({ ...ok, fileCount: LIMITS.fileCount + 1 })

    expect(results.filter((r) => !r.ok).map((r) => r.metric)).toEqual(['fileCount'])
  })

  it('aceita exatamente o limite', () => {
    const results = evaluate({ ...ok, initialJsGzip: LIMITS.initialJsGzip })

    expect(results.every((r) => r.ok)).toBe(true)
  })
})
