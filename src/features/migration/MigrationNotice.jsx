import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAccountMigration } from './useAccountMigration.js'

// Aviso discreto da migração: não bloqueia a navegação e é anunciado por leitores de tela
export default function MigrationNotice() {
  const { t } = useTranslation()
  const { notice, dismiss } = useAccountMigration()

  let message = null
  if (notice?.kind === 'progress') {
    message = t('migration.notice.progress', { done: notice.done, total: notice.total })
  } else if (notice?.kind === 'done') {
    message = t('migration.notice.done', { count: notice.sent })
    if (notice.discarded > 0) {
      message = `${message} ${t('migration.notice.discarded', { count: notice.discarded })}`
    }
  }

  return (
    <div className="toast toast-end toast-bottom z-50" role="status" aria-live="polite">
      {message && (
        <div className={`alert ${notice.discarded > 0 ? 'alert-warning' : 'alert-info'} text-sm`}>
          <span>{message}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            onClick={dismiss}
            aria-label={t('migration.notice.dismiss')}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
