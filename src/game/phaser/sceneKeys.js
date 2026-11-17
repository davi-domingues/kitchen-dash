export const SCENE_KEYS = Object.freeze({
  BOOT: 'Boot',
  PRELOAD: 'Preload',
  KITCHEN: 'Kitchen',
})

// Boot prepara o mínimo, Preload carrega os assets e só então a cozinha começa
export const SCENE_ORDER = Object.freeze([SCENE_KEYS.BOOT, SCENE_KEYS.PRELOAD, SCENE_KEYS.KITCHEN])

export const nextSceneKey = (key) => {
  const index = SCENE_ORDER.indexOf(key)
  if (index === -1) throw new Error(`Cena desconhecida: ${key}`)
  return SCENE_ORDER[index + 1] ?? null
}
