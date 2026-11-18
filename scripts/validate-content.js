import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'

const CONTENT_DIR = join(import.meta.dirname, '..', 'src', 'content')
const FILES = ['recipes', 'kitchens', 'cosmetics']
const STATION_KINDS = ['crate', 'cutting', 'stove', 'counter', 'plates', 'trash', 'pass']
const NEIGHBORS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

const readJson = (name) => JSON.parse(readFileSync(join(CONTENT_DIR, name), 'utf8'))

export function readContent() {
  return Object.fromEntries(FILES.map((name) => [name, readJson(`${name}.json`)]))
}

function schemaErrors(content) {
  const ajv = new Ajv({ allErrors: true })
  return FILES.flatMap((name) => {
    const validate = ajv.compile(readJson(`schemas/${name}.schema.json`))
    if (validate(content[name])) return []
    return validate.errors.map((e) => `${name}.json${e.instancePath}: ${e.message}`)
  })
}

function duplicateIds(file, items) {
  const seen = new Set()
  return items.flatMap(({ id }) => {
    if (seen.has(id)) return [`${file}: id duplicado "${id}"`]
    seen.add(id)
    return []
  })
}

// O schema não enxerga relações entre itens nem a geometria do mapa; isso fica aqui
function kitchenErrors(kitchen, ingredientIds) {
  const { id, tiles, legend, spawns } = kitchen
  const errors = []
  const width = tiles[0].length
  const cellAt = (x, y) => legend[tiles[y]?.[x]]
  const isFloor = (x, y) => cellAt(x, y)?.kind === 'floor'

  tiles.forEach((row, y) => {
    if (row.length !== width) errors.push(`kitchens.json ${id}: linha ${y} com largura diferente`)
    ;[...row].forEach((char, x) => {
      const cell = legend[char]
      if (!cell) return errors.push(`kitchens.json ${id}: "${char}" em (${x},${y}) fora da legenda`)
      if (cell.ingredient && !ingredientIds.has(cell.ingredient)) {
        errors.push(`kitchens.json ${id}: ingrediente desconhecido "${cell.ingredient}"`)
      }
      const reachable = NEIGHBORS.some(([dx, dy]) => isFloor(x + dx, y + dy))
      if (STATION_KINDS.includes(cell.kind) && !reachable) {
        errors.push(`kitchens.json ${id}: estação em (${x},${y}) sem chão adjacente`)
      }
    })
  })

  const usedCells = [...tiles.join('')].map((char) => legend[char]).filter(Boolean)
  const usedKinds = new Set(usedCells.map((cell) => cell.kind))
  const crates = new Set(usedCells.map((cell) => cell.ingredient))
  ingredientIds.forEach((ingredient) => {
    if (!crates.has(ingredient)) errors.push(`kitchens.json ${id}: sem caixa de "${ingredient}"`)
  })
  STATION_KINDS.filter((kind) => !usedKinds.has(kind)).forEach((kind) =>
    errors.push(`kitchens.json ${id}: falta estação "${kind}" no mapa`),
  )
  spawns.forEach(([x, y]) => {
    if (!isFloor(x, y)) errors.push(`kitchens.json ${id}: spawn (${x},${y}) fora do chão`)
  })
  return errors
}

function referenceErrors({ recipes, kitchens, cosmetics }) {
  const ingredientIds = new Set(recipes.ingredients.map((i) => i.id))
  const errors = [
    ...duplicateIds('recipes.json ingredients', recipes.ingredients),
    ...duplicateIds('recipes.json recipes', recipes.recipes),
    ...duplicateIds('kitchens.json', kitchens.kitchens),
    ...duplicateIds('cosmetics.json', cosmetics.cosmetics),
  ]
  recipes.recipes.forEach((recipe) =>
    recipe.ingredients
      .filter((ingredient) => !ingredientIds.has(ingredient))
      .forEach((ingredient) =>
        errors.push(`recipes.json ${recipe.id}: ingrediente desconhecido "${ingredient}"`),
      ),
  )
  kitchens.kitchens.forEach((kitchen) => errors.push(...kitchenErrors(kitchen, ingredientIds)))
  ;['hat', 'apron', 'theme'].forEach((slot) => {
    const free = cosmetics.cosmetics.some((c) => c.slot === slot && c.unlockScore === 0)
    if (!free) errors.push(`cosmetics.json: slot "${slot}" sem item grátis`)
  })
  return errors
}

export function validateContent(content) {
  const errors = schemaErrors(content)
  // Referências só fazem sentido sobre dados com o formato garantido pelo schema
  return errors.length > 0 ? errors : referenceErrors(content)
}

export function contentPlugin() {
  return {
    name: 'kitchen-dash:content',
    buildStart() {
      FILES.forEach((name) => this.addWatchFile(join(CONTENT_DIR, `${name}.json`)))
      const errors = validateContent(readContent())
      if (errors.length > 0) this.error(`Conteúdo inválido:\n- ${errors.join('\n- ')}`)
    },
  }
}
