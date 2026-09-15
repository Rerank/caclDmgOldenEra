import { F } from '../domain/rules'
import { t } from '../i18n'
import { NumberField } from './ui/NumberField'
import { ParamRow } from './ui/ParamRow'
import { Toggle } from './ui/Toggle'

type Props = {
  ranged: boolean
  hexes: number
  onRangedChange: (ranged: boolean) => void
  onHexesChange: (hexes: number) => void
}

/**
 * Дистанционная атака и расстояние до цели. Это свойства удара, а не стороны,
 * поэтому блок приходит в UnitSide слотом, а состояние живёт отдельно.
 */
export function RangedFields({ ranged, hexes, onRangedChange, onHexesChange }: Props) {
  return (
    <>
      <ParamRow label={t.ranged} htmlFor="attack-ranged">
        <Toggle id="attack-ranged" checked={ranged} onChange={onRangedChange} />
      </ParamRow>

      {/* без дистанционной атаки расстояние ни на что не влияет — прячем */}
      {ranged && (
        <NumberField
          id="attack-hexes"
          label={t.hexes}
          value={hexes}
          {...F.hexes}
          onChange={onHexesChange}
        />
      )}
    </>
  )
}
