import strikeIcon from '../assets/images/attack_result.webp'
import counterIcon from '../assets/images/counterattack_result.webp'
import type { Strike } from '../domain/types'
import { t } from '../i18n'
import { ResultTable } from './ResultTable'
import { Disclosure } from './ui/Disclosure'

type Props = {
  /** counter — ответный удар (синяя), strike — удар по защищающемуся (красная) */
  variant: 'counter' | 'strike'
  strike: Strike
  /** здоровье получающей стороны — знаменатель строки «Здоровье» */
  maxHp: number
  /** строка расшифровки формулы */
  breakdown: string
  /** слепок параметров; есть только у закреплённых результатов */
  snapshot?: string
}

export function ResultCard({ variant, strike, maxHp, breakdown, snapshot }: Props) {
  const isCounter = variant === 'counter'

  return (
    <article className={`result-card result-card--${variant}`}>
      {snapshot && <p className="result-card__snapshot">{snapshot}</p>}

      <header className="result-card__header">
        <img className="result-card__icon" src={isCounter ? counterIcon : strikeIcon} alt="" />
        <h3 className="result-card__title">{isCounter ? t.counterCard : t.strikeCard}</h3>
      </header>

      <ResultTable strike={strike} maxHp={maxHp} />

      <Disclosure
        className="result-card__formula"
        label={t.breakdown}
        bodyClassName="result-card__breakdown"
      >
        {breakdown}
      </Disclosure>
    </article>
  )
}
