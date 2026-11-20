import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

// Rodapé das telas de navegação; a partida fica sem ele para não disputar espaço com o jogo
export default function SiteFooter() {
  const { t } = useTranslation()
  return (
    <footer aria-label={t('footer.label')} className="footer footer-center p-4 text-sm">
      <Link to="/privacidade" className="link">
        {t('footer.privacy')}
      </Link>
    </footer>
  )
}
