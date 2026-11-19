// Classificação dos erros do submit_score, sem depender do SDK (a outbox importa daqui)
export const FAILURE_KINDS = Object.freeze({ RETRY: 'retry', DISCARD: 'discard', AUTH: 'auth' })

// Códigos do contrato specs/001-rpc-submit-score/contracts/submit_score.md
const KIND_BY_CODE = {
  54000: FAILURE_KINDS.RETRY,
  22023: FAILURE_KINDS.DISCARD,
  23505: FAILURE_KINDS.DISCARD,
  28000: FAILURE_KINDS.AUTH,
  42501: FAILURE_KINDS.AUTH,
}

export class ScoreFailure extends Error {
  constructor(kind, cause) {
    super(kind, { cause })
    this.name = 'ScoreFailure'
    this.kind = kind
  }
}

// Sem código conhecido (rede, 5xx, PGRST) é tratado como transitório: a fila limita as tentativas
export function classifyScoreError(error) {
  return KIND_BY_CODE[error?.code] ?? FAILURE_KINDS.RETRY
}
