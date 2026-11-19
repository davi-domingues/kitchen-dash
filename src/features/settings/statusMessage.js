// Mensagem da última ação da tela. Só devolve dados; a tradução acontece no componente.
// Contrato: { kind, params? } com `kind` de conjunto fechado (data-model §5).

export const boundMessage = (control, key) => ({ kind: 'bound', params: { control, key } })

export const swappedMessage = (control, key, otherControl, otherKey) => ({
  kind: 'swapped',
  params: { control, key, otherControl, otherKey },
})

export const sameMessage = (control, key) => ({ kind: 'same', params: { control, key } })

export const cancelledMessage = () => ({ kind: 'cancelled' })

export const restoredMessage = () => ({ kind: 'restored' })

export const alreadyDefaultMessage = () => ({ kind: 'alreadyDefault' })

export const modifierMessage = (key) => ({ kind: 'modifier', params: { key } })
