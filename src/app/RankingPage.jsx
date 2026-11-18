import { useTranslation } from 'react-i18next'
import PlaceholderPage from './PlaceholderPage.jsx'

export default function RankingPage() {
  const { t } = useTranslation()
  return <PlaceholderPage title={t('nav.ranking')} message={t('placeholder.comingSoon')} />
}
