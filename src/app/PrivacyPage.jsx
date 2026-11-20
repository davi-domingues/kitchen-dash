import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DELETE_ACCOUNT_ANCHOR } from '../features/profile/anchors.js'

// Política de privacidade (KD-44, SYSTEM_DESIGN D13 e §6.4). Estática: abre mesmo sem backend.
export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <main className="min-h-screen bg-base-200 p-4">
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link to="/" className="btn btn-ghost self-start">
          <ArrowLeft aria-hidden="true" /> {t('nav.home')}
        </Link>
        <header>
          <h1 className="text-4xl font-bold text-primary">{t('privacy.title')}</h1>
          <p className="mt-2 text-sm opacity-80">{t('privacy.updated')}</p>
        </header>
        <section>
          <h2 className="text-xl font-semibold">{t('privacy.collected.title')}</h2>
          <p>{t('privacy.collected.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{t('privacy.purpose.title')}</h2>
          <p>{t('privacy.purpose.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{t('privacy.retention.title')}</h2>
          <p>{t('privacy.retention.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{t('privacy.sharing.title')}</h2>
          <p>{t('privacy.sharing.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{t('privacy.storage.title')}</h2>
          <p>{t('privacy.storage.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{t('privacy.rights.title')}</h2>
          <p>{t('privacy.rights.body')}</p>
          <Link to={`/perfil#${DELETE_ACCOUNT_ANCHOR}`} className="link link-error mt-2 inline-block">
            {t('privacy.rights.deleteLink')}
          </Link>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{t('privacy.contact.title')}</h2>
          <p>{t('privacy.contact.controller')}</p>
          <p>{t('privacy.contact.dpo')}</p>
        </section>
      </article>
    </main>
  )
}
