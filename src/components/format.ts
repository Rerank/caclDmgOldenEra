import { CREATURE_TEMPLATES } from '../data/creatures'
import { RULES } from '../domain/rules'
import type { Side, Strike } from '../domain/types'
import { t } from '../i18n'

/** «7–9», но «7», если min и max совпали. */
const range = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`)

const templateName = (id: string) => {
  const template = CREATURE_TEMPLATES.find((item) => item.id === id)
  return template ? (t.creatures[template.nameKey] ?? template.nameKey) : id
}

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
  ]

  // нулевые проценты на урон не влияют — в строке от них только шум
  if (striker.outgoing > 0) parts.push(`${t.outgoingShort} ${striker.outgoing}%`)
  if (receiver.incoming > 0) parts.push(`${t.incomingShort} ${receiver.incoming}%`)

  if (hexes !== null) {
    // штраф показываем, только когда он есть: «дистанция 2» против «дистанция 5 (−20%)»
    const penalty = strike.rangePenalty > 0 ? ` (−${strike.rangePenalty}%)` : ''
    parts.push(`${t.distance} ${hexes}${penalty}`)
  }

  return parts.join(' · ')
}

/**
 * Слепок существа: с какими параметрами закреплённый результат был посчитан.
 * «Свой · HP 35 · атака 14 · защ. 15 · урон 7–9 · 10 шт · исх. +25% · вх. −0%»
 *
 * Атака и защита — итоговые, с бонусом героя: ровно те числа, что видно
 * в панели и в расшифровке.
 */
export function formatSnapshot(side: Side): string {
  const parts = [
    templateName(side.templateId),
    // «HP 4/10» у раненого стека, просто «HP 10» у целого
    `${t.hpShort} ${side.topHp < side.hp ? `${side.topHp}/${side.hp}` : side.hp}`,
    `${t.attackShort} ${side.attack + side.heroAttack}`,
    `${t.defenseShort} ${side.defense + side.heroDefense}`,
    `${t.damageShort} ${range(side.damageMin, side.damageMax)}`,
    `${side.count} ${t.pcs}`,
  ]

  // нулевые бонусы не показываем: слепок и так длинный
  if (side.outgoing > 0) parts.push(`${t.outgoingSnapshot} +${side.outgoing}%`)
  if (side.incoming > 0) parts.push(`${t.incomingSnapshot} −${side.incoming}%`)

  return parts.join(' · ')
}
