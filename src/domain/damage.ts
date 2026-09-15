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
 * поэтому значение, которое математически ровно попадает на половину,
 * может оказаться чуть ниже неё — и округлиться не в ту сторону.
 * Величина заведомо больше погрешности double на наших числах
 * и заведомо меньше единицы урона.
 */
const EPSILON = 1e-6

/**
 * Урон одной ветки. Округление — к ближайшему и ровно один раз, в самом конце:
 * округления на промежуточных шагах накапливали бы ошибку.
 *
 * Правило округления в гайде не описано, выведено сверкой с игрой:
 * 4 × 5–9 против защиты 5 — это 23.2 и 41.76, а игра показывает 23 и 42.
 *
 * Минимум в 1 единицу — правило игры, но только если бить есть чем.
 */
function damageOf(count: number, perCreature: number, multiplier: number): number {
  const raw = count * perCreature * multiplier
  if (raw <= 0) return 0
  return Math.max(RULES.minDamage, Math.round(raw + EPSILON))
}

/**
 * Раскладывает урон по стеку: кто погиб, кто уцелел и с каким здоровьем верхний.
 * Урон сначала добивает верхнее существо — оно могло прийти в бой уже раненым, —
 * и только потом принимается за целые.
 */
function applyToStack(damage: number, hp: number, count: number, topHp: number): Outcome {
  if (damage >= topHp + (count - 1) * hp) {
    return { damage, killed: count, survived: 0, topHp: 0 }
  }

  if (damage < topHp) {
    return { damage, killed: 0, survived: count, topHp: topHp - damage }
  }

  // верхнее добито, остаток снимаем с целых
  const rest = damage - topHp
  const killed = 1 + Math.floor(rest / hp)
  const tail = rest % hp

  return {
    damage,
    killed,
    survived: count - killed,
    // без остатка следующее существо невредимо
    topHp: tail === 0 ? hp : hp - tail,
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
    applyToStack(
      damageOf(count, perCreature, multiplier),
      receiver.hp,
      receiver.count,
      receiver.topHp,
    )

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
