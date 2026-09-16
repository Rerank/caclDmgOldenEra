import { describe, expect, test } from 'vitest'
import { calculate } from './damage'
import type { Input, Side } from './types'

/**
 * Ожидания в тестах посчитаны вручную и записаны числом — формула здесь
 * намеренно не повторяется, иначе тест проверял бы сам себя.
 * Цель — зафиксировать края, которых не видно глазами в браузере.
 */

const side = (over: Partial<Side> = {}): Side => {
  const merged: Side = {
    templateId: 'custom',
    hp: 10,
    topHp: 10,
    attack: 0,
    defense: 0,
    damageMin: 1,
    damageMax: 1,
    count: 1,
    heroAttack: 0,
    heroDefense: 0,
    outgoing: 0,
    incoming: 0,
    counterHalved: false,
    ...over,
  }

  // по умолчанию стек цел: текущее здоровье равно максимальному
  return over.topHp === undefined ? { ...merged, topHp: merged.hp } : merged
}

const input = (
  attacker: Partial<Side>,
  defender: Partial<Side>,
  extra: Partial<Input> = {},
): Input => ({
  attacker: side(attacker),
  defender: side(defender),
  ranged: false,
  rangePenalty: 0,
  ...extra,
})

describe('удар по защищающемуся', () => {
  test('базовая формула, округление к ближайшему и точное деление на здоровье', () => {
    // 10 шт × 7–9 урона × (20 + 10) / (20 + 8) = 75 / 96.43 / 85.71
    const { strike } = calculate(
      input({ count: 10, damageMin: 7, damageMax: 9, attack: 10 }, { defense: 8, hp: 25, count: 8 }),
    )

    expect(strike.min.damage).toBe(75)
    expect(strike.max.damage).toBe(96)
    expect(strike.avg.damage).toBe(86)

    // 75 делится на 25 нацело: трое погибли, верхний выживший невредим
    expect(strike.min).toMatchObject({ killed: 3, survived: 5, topHp: 25 })
    expect(strike.max).toMatchObject({ killed: 3, survived: 5, topHp: 4 })
  })

  test('атака и защита героя прибавляются к параметрам существа', () => {
    const { strike } = calculate(
      input({ attack: 10, heroAttack: 4 }, { defense: 8, heroDefense: 5, hp: 100 }),
    )

    expect(strike.attack).toBe(14)
    expect(strike.defense).toBe(13)
  })

  test('проценты внутри слоя складываются, а не перемножаются', () => {
    // +25% исходящего против −25% входящего гасят друг друга: ×1.0.
    // Если бы множители перемножались (1.25 × 0.75), вышло бы 93.
    const { strike } = calculate(
      input(
        { count: 10, damageMin: 10, damageMax: 10, outgoing: 25 },
        { incoming: 25, hp: 1000 },
      ),
    )

    expect(strike.min.damage).toBe(100)
  })

  test('после всех штрафов остаётся минимум 10% урона', () => {
    // 10 шт × 7 урона × 30/28 = 75, «умен. вх. 100%» срезает не до нуля, а до 10%
    const { strike } = calculate(
      input(
        { count: 10, damageMin: 7, damageMax: 7, attack: 10 },
        { defense: 8, incoming: 100, hp: 1000 },
      ),
    )

    expect(strike.min.damage).toBe(8) // 7.5 округляется к ближайшему
  })

  test('финальный урон не меньше единицы при любой защите', () => {
    const { strike } = calculate(input({}, { defense: 99, heroDefense: 99, hp: 100 }))

    expect(strike.min.damage).toBe(1)
  })

  test('ошибка представления double не съедает единицу урона', () => {
    // 10 шт × 8 урона × 30/28 × 0.7 — это ровно 60, но в double 59.999999999999993
    const { strike } = calculate(
      input(
        { count: 10, damageMin: 8, damageMax: 8, attack: 10 },
        { defense: 8, hp: 1000 },
        { ranged: true, rangePenalty: 30 },
      ),
    )

    expect(strike.min.damage).toBe(60)
    expect(strike.penalty).toBe(30)
  })

  test('сверено с игрой: 4 шт × 5–9 урона против защиты 5', () => {
    // 23.2 и 41.76 — игра показывает 23 и 42, то есть округляет к ближайшему,
    // а не вниз. Наблюдение из реального боя, в гайде правила округления нет.
    const { strike } = calculate(
      input(
        { count: 4, damageMin: 5, damageMax: 9, attack: 9, defense: 7, hp: 30 },
        { count: 16, damageMin: 3, damageMax: 3, attack: 5, defense: 5, hp: 10 },
      ),
    )

    expect(strike.min.damage).toBe(23)
    expect(strike.max.damage).toBe(42)
  })
})

describe('раненый стек', () => {
  test('урон сначала добивает раненое верхнее существо', () => {
    // 5 шт × 5 урона без модификаторов = 25
    const shot = (topHp: number) =>
      calculate(input({ count: 5, damageMin: 5, damageMax: 5 }, { hp: 10, count: 16, topHp }))
        .strike.min

    // у целого стека 25 урона снимают двоих и ранят третьего на 5
    expect(shot(10)).toMatchObject({ damage: 25, killed: 2, survived: 14, topHp: 5 })
    // у стека с раненым на 4 верхним тех же 25 хватает уже на троих
    expect(shot(4)).toMatchObject({ damage: 25, killed: 3, survived: 13, topHp: 9 })
  })

  test('урона не хватило даже на раненого — никто не гибнет', () => {
    const { strike } = calculate(
      input({ count: 3, damageMin: 1, damageMax: 1 }, { hp: 10, count: 16, topHp: 4 }),
    )

    expect(strike.min).toMatchObject({ damage: 3, killed: 0, survived: 16, topHp: 1 })
  })

  test('урон ровно добил верхнего — следующий остаётся невредимым', () => {
    const { strike } = calculate(
      input({ count: 4, damageMin: 1, damageMax: 1 }, { hp: 10, count: 16, topHp: 4 }),
    )

    expect(strike.min).toMatchObject({ damage: 4, killed: 1, survived: 15, topHp: 10 })
  })

  test('раненый стек гибнет целиком там, где целый выстоял бы', () => {
    const wipe = (topHp: number) =>
      calculate(input({ count: 11, damageMin: 1, damageMax: 1 }, { hp: 10, count: 2, topHp }))

    expect(wipe(10).strike.min).toMatchObject({ killed: 1, survived: 1 })
    expect(wipe(1).strike.min).toMatchObject({ killed: 2, survived: 0, topHp: 0 })
    expect(wipe(1).counter).toBeNull()
  })
})

describe('штраф за дистанцию', () => {
  // 10 шт × 10 урона без модификаторов = 100
  const shot = (rangePenalty: number, ranged = true) =>
    calculate(
      input({ count: 10, damageMin: 10, damageMax: 10 }, { hp: 1000 }, { ranged, rangePenalty }),
    ).strike

  test('штраф снимает свою долю урона', () => {
    expect(shot(0).min.damage).toBe(100)
    expect(shot(10).min.damage).toBe(90)
    expect(shot(50).min.damage).toBe(50)
  })

  test('штраф не превышает 50%, каким бы ни пришёл', () => {
    expect(shot(80).min.damage).toBe(50)
    expect(shot(80).penalty).toBe(50)
  })

  test('в ближнем бою штраф не применяется', () => {
    expect(shot(50, false).min.damage).toBe(100)
    expect(shot(50, false).penalty).toBe(0)
  })
})

describe('ослабленная контратака', () => {
  // удар слабый и никого не убивает, отвечают все десять
  const battle = (over: Partial<Side>, extra: Partial<Input> = {}) =>
    calculate(
      input(
        { count: 10, damageMin: 1, damageMax: 1, hp: 1000 },
        { count: 10, damageMin: 10, damageMax: 10, hp: 1000, ...over },
        extra,
      ),
    )

  test('стрелок в ближнем бою отвечает вполсилы', () => {
    expect(battle({}).counter?.min.damage).toBe(100)
    expect(battle({ counterHalved: true }).counter?.min.damage).toBe(50)
    expect(battle({ counterHalved: true }).counter?.penalty).toBe(50)
  })

  test('ослабленная контратака не отменяет правила о выстреле', () => {
    expect(battle({ counterHalved: true }, { ranged: true }).counter).toBeNull()
  })

  test('тот же флаг у атакующего на расчёт не влияет', () => {
    // атакующий в этом обмене не контратакует, его собственный флаг ничего не меняет
    const { strike, counter } = calculate(
      input(
        { count: 10, damageMin: 1, damageMax: 1, hp: 1000, counterHalved: true },
        { count: 10, damageMin: 10, damageMax: 10, hp: 1000 },
      ),
    )

    expect(strike.min.damage).toBe(10)
    expect(counter?.min.damage).toBe(100)
  })
})

describe('ответный удар', () => {
  const battle = calculate(
    input(
      { count: 10, damageMin: 5, damageMax: 12, attack: 10, defense: 12, hp: 35 },
      { hp: 25, count: 8, defense: 8, attack: 8, damageMin: 3, damageMax: 6 },
    ),
  )

  test('отвечают выжившие, а ветки перекрёстные', () => {
    // Удар: 53 / 128 / 91 урона → выжило 6 / 3 / 5 защищающихся
    expect(battle.strike.min.survived).toBe(6)
    expect(battle.strike.max.survived).toBe(3)
    expect(battle.strike.avg.survived).toBe(5)

    // Минимум входящего — от самого сильного удара: выжило трое, бьют по минимуму.
    // Максимум — от самого слабого: выжило шестеро, бьют по максимуму.
    expect(battle.counter?.min.damage).toBe(8) // 3 шт × 3 урона × 28/32 = 7.875
    expect(battle.counter?.max.damage).toBe(32) // 6 шт × 6 урона × 28/32 = 31.5
    expect(battle.counter?.avg.damage).toBe(20) // 5 шт × 4.5 урона × 28/32 = 19.6875
  })

  test('в расшифровке количество отвечающих — диапазон', () => {
    expect(battle.counter?.countMin).toBe(3)
    expect(battle.counter?.countMax).toBe(6)
  })

  test('дистанционная атака ответа не провоцирует', () => {
    const { counter } = calculate(
      input({ count: 10, damageMin: 1, damageMax: 1 }, { hp: 100, count: 8 }, { ranged: true }),
    )

    expect(counter).toBeNull()
  })

  test('погибший стек не отвечает', () => {
    const { strike, counter } = calculate(
      input({ count: 100, damageMin: 100, damageMax: 100 }, { hp: 10, count: 2 }),
    )

    expect(strike.min.survived).toBe(0)
    expect(counter).toBeNull()
  })
})
