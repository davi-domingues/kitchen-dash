// Teste de integração opcional (débito #76): N envios simultâneos do mesmo match_id
// contra o Supabase LOCAL devem gravar uma só linha. Fica fora do `npm test` porque
// os testes do Vitest não usam Supabase real. Rode com `npm run db:test:concurrency`.
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const PARALLEL_CALLS = 8
const CONTENT_VERSION = '7691008a'

function readLocalConfig() {
  const output = execSync('npx supabase status -o env', { encoding: 'utf8' })
  const values = Object.fromEntries(
    output
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z_]+)="?([^"]*)"?$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value]),
  )
  return { url: values.API_URL, key: values.PUBLISHABLE_KEY ?? values.ANON_KEY }
}

function assertLocal(url) {
  const { hostname } = new URL(url)
  if (!['127.0.0.1', 'localhost'].includes(hostname)) {
    throw new Error(`Recusado: ${url} não é o Supabase local.`)
  }
}

async function signUpFakePlayer(client) {
  const email = `concurrency-${randomUUID()}@example.com`
  const { error } = await client.auth.signUp({ email, password: randomUUID() })
  if (error) throw error
}

async function main() {
  const { url, key } = readLocalConfig()
  assertLocal(url)
  const client = createClient(url, key, { auth: { persistSession: false } })
  await signUpFakePlayer(client)

  const matchId = randomUUID()
  const results = await Promise.all(
    Array.from({ length: PARALLEL_CALLS }, () =>
      client.rpc('submit_score', {
        p_match_id: matchId,
        p_board: 'global',
        p_score: 100,
        p_duration_ms: 180000,
        p_seed: 42,
        p_content_version: CONTENT_VERSION,
        p_origin: 'online',
        p_orders_completed: 2,
      }),
    ),
  )
  const failures = results.filter((result) => result.error)
  if (failures.length) throw new Error(`Envios falharam: ${failures.map((f) => f.error.message).join(', ')}`)

  const { count, error } = await client
    .from('scores')
    .select('match_id', { count: 'exact', head: true })
    .eq('match_id', matchId)
  if (error) throw error
  const { data: stats, error: statsError } = await client
    .from('player_stats')
    .select('matches_played')
    .single()
  if (statsError) throw statsError

  if (count !== 1 || stats.matches_played !== 1) {
    throw new Error(
      `Esperava 1 linha e 1 partida; obteve ${count} linha(s) e ${stats.matches_played} partida(s).`,
    )
  }
  process.stdout.write(`OK: ${PARALLEL_CALLS} envios simultâneos gravaram 1 linha.\n`)
}

main().catch((error) => {
  process.stderr.write(`FALHOU: ${error.message}\n`)
  process.exitCode = 1
})
