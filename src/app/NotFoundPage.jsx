import { useTranslation } from 'react-i18next'
import PlaceholderPage from './PlaceholderPage.jsx'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return <PlaceholderPage title={t('notFound.title')} message={t('notFound.message')} />
}
