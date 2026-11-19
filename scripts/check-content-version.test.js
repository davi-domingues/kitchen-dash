import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { assertCurrentVersionAccepted, hashContent } from './check-content-version.js'

const temporaryDirectories = []

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'kitchen-dash-content-version-'))
  temporaryDirectories.push(root)
  const contentDirectory = join(root, 'content')
  const migrationsDirectory = join(root, 'migrations')
  mkdirSync(contentDirectory)
  mkdirSync(migrationsDirectory)

  const content = [{ recipes: ['salad'] }, { kitchens: ['bistro'] }, { cosmetics: ['hat'] }]
  for (const [index, file] of ['recipes.json', 'kitchens.json', 'cosmetics.json'].entries()) {
    writeFileSync(join(contentDirectory, file), JSON.stringify(content[index]))
  }

  return { content, contentDirectory, migrationsDirectory }
}

function writeAcceptedVersions(migrationsDirectory, file, versions) {
  writeFileSync(
    join(migrationsDirectory, file),
    `update public.game_rules set value = '${JSON.stringify(versions)}' where key = 'accepted_content_versions';`,
  )
}

afterEach(() => {
  while (temporaryDirectories.length) rmSync(temporaryDirectories.pop(), { recursive: true, force: true })
})

describe('check-content-version', () => {
  it('aceita a versão presente na última migration relevante', () => {
    const { content, contentDirectory, migrationsDirectory } = fixture()
    const version = hashContent(content)
    writeAcceptedVersions(migrationsDirectory, '20261118000000_accept_versions.sql', [version])

    expect(assertCurrentVersionAccepted({ contentDirectory, migrationsDirectory })).toEqual({
      version,
      migration: { file: '20261118000000_accept_versions.sql', versions: [version] },
    })
  })

  it('falha quando a versão atual não está na lista aceita', () => {
    const { contentDirectory, migrationsDirectory } = fixture()
    writeAcceptedVersions(migrationsDirectory, '20261118000000_accept_versions.sql', ['deadbeef'])

    expect(() => assertCurrentVersionAccepted({ contentDirectory, migrationsDirectory })).toThrow(
      'Crie uma migration que a inclua em accepted_content_versions.',
    )
  })

  it('ignora migration posterior que não altera a lista aceita', () => {
    const { content, contentDirectory, migrationsDirectory } = fixture()
    const version = hashContent(content)
    writeAcceptedVersions(migrationsDirectory, '20261118000000_accept_versions.sql', [version])
    writeFileSync(
      join(migrationsDirectory, '20261119000000_unrelated.sql'),
      '-- accepted_content_versions não muda aqui',
    )

    expect(assertCurrentVersionAccepted({ contentDirectory, migrationsDirectory }).migration.file).toBe(
      '20261118000000_accept_versions.sql',
    )
  })
})
