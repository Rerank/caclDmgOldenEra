import { F } from '../domain/rules'
import type { Side } from '../domain/types'
import { t } from '../i18n'
import { NumberField } from './ui/NumberField'
import './hero-panel.css'

type Props = {
  /** префикс для id полей: у двух сторон они не должны совпадать */
  idPrefix: string
  attack: number
  defense: number
  onChange: (patch: Partial<Side>) => void
}

/**
 * Атака и защита героя. Вводятся один раз на сторону и прибавляются
 * к параметрам существа, поэтому живут в отдельной панели над ним.
 */
export function HeroPanel({ idPrefix, attack, defense, onChange }: Props) {
  return (
    <div className="hero-panel">
      <span className="hero-panel__label">{t.hero}</span>
      <div className="hero-panel__params">
        <NumberField
          id={`${idPrefix}-hero-attack`}
          label={t.attack}
          value={attack}
          {...F.hero}
          onChange={(heroAttack) => onChange({ heroAttack })}
        />
        <NumberField
          id={`${idPrefix}-hero-defense`}
          label={t.defense}
          value={defense}
          {...F.hero}
          onChange={(heroDefense) => onChange({ heroDefense })}
        />
      </div>
    </div>
  )
}
