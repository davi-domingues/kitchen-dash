import { useTranslation } from 'react-i18next'
import PlaceholderPage from './PlaceholderPage.jsx'

export default function ProfilePage() {
  const { t } = useTranslation()
  return <PlaceholderPage title={t('nav.profile')} message={t('placeholder.comingSoon')} />
}
