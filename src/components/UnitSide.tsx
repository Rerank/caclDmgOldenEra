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
import { PairField } from './ui/PairField'
import { ParamRow } from './ui/ParamRow'
import { Toggle } from './ui/Toggle'
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
          {/* здоровье верхнего, ещё не добитого существа, и максимальное */}
          <PairField
            label={t.hp}
            separator="/"
            jumpKey="/"
            left={{
              id: `${role}-top-hp`,
              label: t.hpCurrent,
              value: side.topHp,
              min: F.topHp.min,
              max: side.hp,
              onChange: (topHp) => onChange({ topHp }),
            }}
            right={{
              id: `${role}-hp`,
              label: t.hpMax,
              value: side.hp,
              min: F.hp.min,
              max: F.hp.max,
              onChange: (hp) => onChange({ hp }),
            }}
          />
          <NumberField
            id={`${role}-count`}
            label={t.count}
            value={side.count}
            {...F.count}
            onChange={(count) => onChange({ count })}
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
          <PairField
            label={t.damage}
            separator="–"
            jumpKey="-"
            left={{
              id: `${role}-damage-min`,
              label: t.damageMin,
              value: side.damageMin,
              min: F.damage.min,
              max: F.damage.max,
              onChange: (damageMin) => onChange({ damageMin }),
            }}
            right={{
              id: `${role}-damage-max`,
              label: t.damageMax,
              value: side.damageMax,
              min: F.damage.min,
              max: F.damage.max,
              onChange: (damageMax) => onChange({ damageMax }),
            }}
          />

          {/* Свойство существа, но показываем только у защищающегося:
              атакующий в этом обмене не контратакует, и тумблер там был бы
              мёртвым. Данные лежат в side, поэтому слот extra не нужен. */}
          {!isAttacker && (
            <ParamRow
              label={t.weakCounter}
              title={t.weakCounterHint}
              htmlFor={`${role}-weak-counter`}
            >
              <Toggle
                id={`${role}-weak-counter`}
                checked={side.counterHalved}
                onChange={(counterHalved) => onChange({ counterHalved })}
              />
            </ParamRow>
          )}

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
