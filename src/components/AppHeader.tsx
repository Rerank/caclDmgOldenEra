import { Fragment } from 'react'
import { t } from '../i18n'
import { Disclosure } from './ui/Disclosure'
import './app-header.css'

export function AppHeader() {
  // Формула делится на слагаемые по « × », каждое не разрывается: на узком
  // экране строка переносится только перед знаком умножения, а скобки
  // вроде «(20 + ATK)» остаются целыми
  const terms = t.headerFormula.split(' × ')
  const notes = t.formulaNotes

  return (
    <header className="app-header">
      <p className="app-header__game">{t.gameTitle}</p>
      <h1 className="app-header__title">{t.appTitle}</h1>

      <p className="app-header__formula">
        {terms.map((term, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="app-header__term">{i > 0 ? `× ${term}` : term}</span>
          </Fragment>
        ))}
      </p>

      <Disclosure
        label={t.more}
        className="disclosure--inline app-header__more"
        bodyClassName="app-header__notes"
      >
        <p>
          <strong>{t.outgoing}</strong>&nbsp;— {notes.outgoing}
          <br />
          <strong>{t.incoming}</strong>&nbsp;— {notes.incoming}
          <br />
          {notes.where}
        </p>
        <p>{notes.floor}</p>
        <p>{notes.abilities}</p>
      </Disclosure>
    </header>
  )
}
