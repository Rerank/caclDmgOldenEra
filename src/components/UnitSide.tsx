import type { ReactNode } from 'react'
import attackIcon from '../assets/images/attack.webp'
import defenseIcon from '../assets/images/defense.webp'
import { F } from '../domain/rules'
import type { Side } from '../domain/types'
import { t } from '../i18n'
import { HeroPanel } from './HeroPanel'
import { TemplateField } from './TemplateField'
import { Disclosure } from './ui/Disclosure'
import { NumberField } from './ui/NumberField'
import './unit-side.css'

type Props = {
  role: 'attacker' | 'defender'
  side: Side
  /** патч: меняем одно поле, не собирая весь объект в вызывающем коде */
  onChange: (patch: Partial<Side>) => void
  /** доп. блок внутри панели параметров; есть только у атакующего */
  extra?: ReactNode
}

/**
 * Поле показывает итоговый параметр — вместе с бонусом героя, ровно то число,
 * которое уходит в расчёт. Редактируется тоже итог, поэтому границы сдвинуты
 * на бонус: собственное значение существа при любом вводе остаётся в своих
 * пределах, а «−» гаснет там, где от существа уже ничего не осталось.
 */
const withHero = (own: number, hero: number, limits: { min: number; max: number; step: number }) => ({
  value: own + hero,
  min: limits.min + hero,
  max: limits.max + hero,
  step: limits.step,
  boosted: hero > 0,
  title: hero > 0 ? `${own} + ${hero} = ${own + hero}` : undefined,
})

/**
 * Сторона боя. Компонент один на обе: различаются только иконка, заголовок,
 * цвет (через модификатор и переменную --side-accent) и наличие слота extra.
 */
export function UnitSide({ role, side, onChange, extra }: Props) {
  const isAttacker = role === 'attacker'
  const hasExtras = side.outgoing !== 0 || side.incoming !== 0

  return (
    <section className={`unit-side unit-side--${role}`}>
      <header className="unit-side__header">
        <img className="unit-side__icon" src={isAttacker ? attackIcon : defenseIcon} alt="" />
        <h2 className="unit-side__title">{isAttacker ? t.attacker : t.defender}</h2>
      </header>

      <HeroPanel
        idPrefix={role}
        attack={side.heroAttack}
        defense={side.heroDefense}
        onChange={onChange}
      />

      <div className="unit-panel">
        <TemplateField
          id={`${role}-template`}
          value={side.templateId}
          onChange={(templateId) => onChange({ templateId })}
        />

        <div className="unit-panel__params">
          <NumberField
            id={`${role}-hp`}
            label={t.hp}
            value={side.hp}
            {...F.hp}
            onChange={(hp) => onChange({ hp })}
          />
          <NumberField
            id={`${role}-attack`}
            label={t.attack}
            {...withHero(side.attack, side.heroAttack, F.attack)}
            onChange={(total) => onChange({ attack: total - side.heroAttack })}
          />
          <NumberField
            id={`${role}-defense`}
            label={t.defense}
            {...withHero(side.defense, side.heroDefense, F.defense)}
            onChange={(total) => onChange({ defense: total - side.heroDefense })}
          />
          <NumberField
            id={`${role}-damage-min`}
            label={t.damage}
            sub={t.damageMin}
            value={side.damageMin}
            {...F.damage}
            onChange={(damageMin) => onChange({ damageMin })}
          />
          <NumberField
            id={`${role}-damage-max`}
            label={t.damage}
            sub={t.damageMax}
            value={side.damageMax}
            {...F.damage}
            onChange={(damageMax) => onChange({ damageMax })}
          />
          <NumberField
            id={`${role}-count`}
            label={t.count}
            value={side.count}
            {...F.count}
            onChange={(count) => onChange({ count })}
          />
          {extra}
        </div>

        <hr className="unit-panel__divider" />

        <Disclosure
          label={t.extra}
          marked={hasExtras}
          markerLabel={t.extraMarker}
          bodyClassName="unit-panel__params"
        >
          <NumberField
            id={`${role}-outgoing`}
            label={t.outgoing}
            value={side.outgoing}
            sign="+"
            unit="%"
            {...F.outgoing}
            onChange={(outgoing) => onChange({ outgoing })}
          />
          <NumberField
            id={`${role}-incoming`}
            label={t.incoming}
            value={side.incoming}
            sign="−"
            unit="%"
            {...F.incoming}
            onChange={(incoming) => onChange({ incoming })}
          />
        </Disclosure>
      </div>
    </section>
  )
}
