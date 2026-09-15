import { RULES } from './rules'
import type { Input, Outcome, Result, Side, Strike } from './types'

/**
 * Расчёт урона. Чистые функции: ни React, ни строк интерфейса здесь нет,
 * наружу уходят только числа. Текст расшифровки собирается в слое UI.
 */

/** Множитель атаки/защиты: (20 + ATK) / (20 + DEF). Максимума нет, минимум 0. */
function attackDefenseMultiplier(attack: number, defense: number): number {
  return (RULES.base + attack) / (RULES.base + defense)
}

/**
 * Слой процентных бонусов. Проценты внутри слоя складываются, а не
 * перемножаются: «увеличил исходящий на 25%» против «уменьшил входящий
 * на 25%» дают ×1.0, а не ×0.94. После всех штрафов остаётся минимум 10%.
 */
function bonusMultiplier(outgoing: number, incoming: number): number {
  return Math.max(RULES.minMultiplier, 1 + (outgoing - incoming) / 100)
}

/** Штраф за дистанцию в процентах: −10% за каждый гекс сверх трёх, не более −50%. */
export function rangePenalty(ranged: boolean, hexes: number): number {
  if (!ranged) return 0
  const extraHexes = Math.max(0, hexes - RULES.rangeFreeHexes)
  return Math.min(RULES.rangePenaltyMax, extraHexes * RULES.rangePenaltyPerHex)
}

/**
 * Поправка на ошибку представления. Цепочка множителей считается в double,
 * и там, где математически выходит ровное число, в double получается чуть
 * меньше: 10 × 8 × 30/28 × 0.7 — это ровно 60, но в double 59.999999999999993,
 * и честный floor превратил бы 60 в 59. Величина заведомо больше погрешности
 * double на наших числах и заведомо меньше единицы урона.
 */
const EPSILON = 1e-6

/**
 * Урон одной ветки. Округление — вниз и ровно один раз, в самом конце:
 * округления на промежуточных шагах накапливали бы ошибку.
 * Минимум в 1 единицу — правило игры, но только если бить есть чем.
 */
function damageOf(count: number, perCreature: number, multiplier: number): number {
  const raw = count * perCreature * multiplier
  if (raw <= 0) return 0
  return Math.max(RULES.minDamage, Math.floor(raw + EPSILON))
}

/** Раскладывает урон по стеку: кто погиб, кто уцелел и с каким здоровьем верхний. */
function applyToStack(damage: number, hp: number, count: number): Outcome {
  if (damage >= hp * count) {
    return { damage, killed: count, survived: 0, topHp: 0 }
  }

  const killed = Math.floor(damage / hp)
  const rest = damage % hp

  return {
    damage,
    killed,
    survived: count - killed,
    // остаток снимается с верхнего выжившего; без остатка он невредим
    topHp: rest === 0 ? hp : hp - rest,
  }
}

/**
 * Один удар по стороне-получателю.
 * `counts` — сколько существ бьёт в каждой ветке. У обычного удара это одно
 * и то же число, у ответного — выжившие, а их количество зависит от того,
 * насколько сильным вышел первый удар.
 */
function buildStrike(
  striker: Side,
  receiver: Side,
  counts: { min: number; max: number; avg: number },
  penaltyPercent: number,
): Strike {
  const attack = striker.attack + striker.heroAttack
  const defense = receiver.defense + receiver.heroDefense

  const multiplier =
    attackDefenseMultiplier(attack, defense) *
    bonusMultiplier(striker.outgoing, receiver.incoming) *
    (1 - penaltyPercent / 100)

  const branch = (count: number, perCreature: number) =>
    applyToStack(damageOf(count, perCreature, multiplier), receiver.hp, receiver.count)

  return {
    min: branch(counts.min, striker.damageMin),
    max: branch(counts.max, striker.damageMax),
    avg: branch(counts.avg, (striker.damageMin + striker.damageMax) / 2),
    countMin: Math.min(counts.min, counts.max),
    countMax: Math.max(counts.min, counts.max),
    attack,
    defense,
    rangePenalty: penaltyPercent,
  }
}

export function calculate(input: Input): Result {
  const { attacker, defender, ranged, hexes } = input

  const count = attacker.count
  const strike = buildStrike(
    attacker,
    defender,
    { min: count, max: count, avg: count },
    rangePenalty(ranged, hexes),
  )

  // Отвечают выжившие, поэтому ветки перекрёстные: самый слабый удар
  // оставляет больше всего живых, а значит грозит самым сильным ответом.
  const survivors = {
    min: strike.max.survived,
    max: strike.min.survived,
    avg: strike.avg.survived,
  }

  // Выстрел ответа не провоцирует; мёртвые не отвечают
  const counter =
    ranged || survivors.max === 0 ? null : buildStrike(defender, attacker, survivors, 0)

  return { strike, counter }
}
