import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CONTENT_FILES = ['recipes.json', 'kitchens.json', 'cosmetics.json']
const ACCEPTED_VERSIONS_UPDATE =
  /update\s+public\.game_rules\s+set\s+value\s*=\s*'(\[[^']*\])'[\s\S]*?where\s+key\s*=\s*'accepted_content_versions'/i

export function hashContent(value) {
  const text = JSON.stringify(value)
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function readContentVersion(contentDirectory) {
  const content = CONTENT_FILES.map((file) => JSON.parse(readFileSync(join(contentDirectory, file), 'utf8')))
  return hashContent(content)
}

export function findAcceptedVersionsMigration(migrationsDirectory) {
  const migrations = readdirSync(migrationsDirectory)
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort()
    .reverse()

  for (const file of migrations) {
    const source = readFileSync(join(migrationsDirectory, file), 'utf8')
    const match = source.match(ACCEPTED_VERSIONS_UPDATE)
    if (match) return { file, versions: JSON.parse(match[1]) }
  }

  throw new Error('Nenhuma migration atualiza accepted_content_versions.')
}

export function assertCurrentVersionAccepted({ contentDirectory, migrationsDirectory }) {
  const version = readContentVersion(contentDirectory)
  const migration = findAcceptedVersionsMigration(migrationsDirectory)

  if (!migration.versions.includes(version)) {
    throw new Error(
      `A versão de conteúdo ${version} não está em ${migration.file}. ` +
        'Crie uma migration que a inclua em accepted_content_versions.',
    )
  }

  return { version, migration }
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const { version, migration } = assertCurrentVersionAccepted({
    contentDirectory: join(root, 'src', 'content'),
    migrationsDirectory: join(root, 'supabase', 'migrations'),
  })
  process.stdout.write(`Versão de conteúdo ${version} aceita em ${migration.file}.\n`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()
