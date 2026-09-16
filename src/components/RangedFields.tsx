import { F } from '../domain/rules'
import { t } from '../i18n'
import { NumberField } from './ui/NumberField'
import { ParamRow } from './ui/ParamRow'
import { Toggle } from './ui/Toggle'

type Props = {
  ranged: boolean
  rangePenalty: number
  onRangedChange: (ranged: boolean) => void
  onPenaltyChange: (rangePenalty: number) => void
}

/**
 * Дистанционная атака и её штраф. Это свойства удара, а не стороны, поэтому
 * блок приходит в UnitSide слотом, а состояние живёт отдельно.
 *
 * Штраф задаётся прямо в процентах, а не расстоянием до цели: у части существ
 * выстрел штрафа не имеет вовсе, и расстояние тогда ни о чём не говорит.
 */
export function RangedFields({ ranged, rangePenalty, onRangedChange, onPenaltyChange }: Props) {
  return (
    <>
      <ParamRow label={t.ranged} htmlFor="attack-ranged">
        <Toggle id="attack-ranged" checked={ranged} onChange={onRangedChange} />
      </ParamRow>

      {/* в ближнем бою штраф ни на что не влияет — прячем */}
      {ranged && (
        <NumberField
          id="attack-penalty"
          label={t.penalty}
          title={t.penaltyHint}
          value={rangePenalty}
          sign="−"
          unit="%"
          {...F.rangePenalty}
          onChange={onPenaltyChange}
        />
      )}
    </>
  )
}
