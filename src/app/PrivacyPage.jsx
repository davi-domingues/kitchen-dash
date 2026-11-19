import { useTranslation } from 'react-i18next'
import PlaceholderPage from './PlaceholderPage.jsx'

export default function PrivacyPage() {
  const { t } = useTranslation()
  return <PlaceholderPage title={t('nav.privacy')} message={t('placeholder.comingSoon')} />
}
