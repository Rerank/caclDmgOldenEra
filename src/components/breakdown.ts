import { RULES } from '../domain/rules'
import type { Side, Strike } from '../domain/types'
import { t } from '../i18n'

const range = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`)

/**
 * Строка под таблицей результата: из чего сложился этот урон.
 * «10 шт × 7–9 урона × (20 + 14) / (20 + 13) · увел. исх. 25% · умен. вх. 10%»
 *
 * Атака и защита здесь уже с героями. У ответного удара количество бьющих —
 * диапазон: отвечают выжившие, а их число зависит от силы первого удара.
 *
 * @param hexes расстояние до цели или null, если удар не дистанционный
 */
export function formatBreakdown(
  strike: Strike,
  striker: Side,
  receiver: Side,
  hexes: number | null,
): string {
  const parts = [
    `${range(strike.countMin, strike.countMax)} ${t.pcs}` +
      ` × ${range(striker.damageMin, striker.damageMax)} ${t.damageGenitive}` +
      ` × (${RULES.base} + ${strike.attack}) / (${RULES.base} + ${strike.defense})`,
    `${t.outgoingShort} ${striker.outgoing}%`,
    `${t.incomingShort} ${receiver.incoming}%`,
  ]

  if (hexes !== null) {
    // штраф показываем, только когда он есть: «дистанция 2» против «дистанция 5 (−20%)»
    const penalty = strike.rangePenalty > 0 ? ` (−${strike.rangePenalty}%)` : ''
    parts.push(`${t.distance} ${hexes}${penalty}`)
  }

  return parts.join(' · ')
}
