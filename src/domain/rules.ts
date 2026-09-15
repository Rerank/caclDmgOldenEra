import type { Input } from './types'

/**
 * Константы боевой механики Olden Era.
 * Собраны в одном месте: если разработчики поменяют цифры патчем,
 * правка будет здесь, а не по всему расчёту.
 */
export const RULES = {
  /** база в (20 + ATK) / (20 + DEF) */
  base: 20,
  /** пол слоя бонусов: после всех штрафов остаётся минимум 10% урона */
  minMultiplier: 0.1,
  /** до скольких гексов стрелок бьёт без штрафа */
  rangeFreeHexes: 3,
  /** штраф за каждый гекс сверх свободных, % */
  rangePenaltyPerHex: 10,
  /** максимальный суммарный штраф за дистанцию, % */
  rangePenaltyMax: 50,
  /** при любых модификаторах финальный урон не меньше этого */
  minDamage: 1,
} as const

/**
 * Границы и шаг полей ввода. Раскладываются прямо в поле:
 * `<NumberField {...F.hp} />`. Отдельного слоя валидации нет —
 * поле само не выпустит наружу значение вне границ.
 */
export const F = {
  hp: { min: 1, max: 9999, step: 1 },
  /** верхнюю границу задаёт hp стороны, поэтому здесь только минимум */
  topHp: { min: 1, max: 9999, step: 1 },
  attack: { min: 0, max: 99, step: 1 },
  defense: { min: 0, max: 99, step: 1 },
  damage: { min: 0, max: 9999, step: 1 },
  count: { min: 1, max: 9999, step: 1 },
  hero: { min: 0, max: 99, step: 1 },
  /** минимум 2: на соседнем гексе это уже ближний бой, а не выстрел */
  hexes: { min: 2, max: 20, step: 1 },
  outgoing: { min: 0, max: 500, step: 5 },
  incoming: { min: 0, max: 100, step: 5 },
} as const

export const DEFAULT_INPUT: Input = {
  attacker: {
    templateId: 'custom',
    hp: 35,
    topHp: 35,
    attack: 10,
    defense: 12,
    damageMin: 7,
    damageMax: 9,
    count: 10,
    heroAttack: 0,
    heroDefense: 0,
    outgoing: 0,
    incoming: 0,
  },
  defender: {
    templateId: 'custom',
    hp: 25,
    topHp: 25,
    attack: 8,
    defense: 8,
    damageMin: 3,
    damageMax: 6,
    count: 8,
    heroAttack: 0,
    heroDefense: 0,
    outgoing: 0,
    incoming: 0,
  },
  ranged: false,
  hexes: 2,
}
