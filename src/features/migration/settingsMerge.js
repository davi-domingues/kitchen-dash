// Regra de conflito das configurações na migração (KD-37, ESTUDOS_E_DECISOES): por campo de primeiro
// nível, a conta vence quando já tem o campo; o que só existe no local é levado para a conta.

/**
 * @param {Record<string, unknown>} local
 * @param {Record<string, unknown>} account
 * @returns {{ settings: Record<string, unknown>, changedAccount: boolean }}
 */
export function mergeSettings(local, account) {
  const merged = { ...local, ...account }
  const changedAccount = Object.keys(local).some((key) => !Object.hasOwn(account, key))
  return { settings: merged, changedAccount }
}
