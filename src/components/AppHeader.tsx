import { t } from '../i18n'
import './app-header.css'

export function AppHeader() {
  return (
    <header className="app-header">
      <p className="app-header__game">{t.gameTitle}</p>
      <h1 className="app-header__title">{t.appTitle}</h1>
      <p className="app-header__formula">{t.headerFormula}</p>
    </header>
  )
}
