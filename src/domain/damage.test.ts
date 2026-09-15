import { describe, expect, test } from 'vitest'
import { calculate } from './damage'
import type { Input, Side } from './types'

/**
 * Ожидания в тестах посчитаны вручную и записаны числом — формула здесь
 * намеренно не повторяется, иначе тест проверял бы сам себя.
 * Цель — зафиксировать края, которых не видно глазами в браузере.
 */

const side = (over: Partial<Side> = {}): Side => ({
  templateId: 'custom',
  hp: 10,
  attack: 0,
  defense: 0,
  damageMin: 1,
  damageMax: 1,
  count: 1,
  heroAttack: 0,
  heroDefense: 0,
  outgoing: 0,
  incoming: 0,
  ...over,
})

const input = (
  attacker: Partial<Side>,
  defender: Partial<Side>,
  extra: Partial<Input> = {},
): Input => ({
  attacker: side(attacker),
  defender: side(defender),
  ranged: false,
  hexes: 2,
  ...extra,
})

describe('удар по защищающемуся', () => {
  test('базовая формула, округление вниз один раз и точное деление на здоровье', () => {
    // 10 шт × 7–9 урона × (20 + 10) / (20 + 8) = 75 / 96.43 / 85.71
    const { strike } = calculate(
      input({ count: 10, damageMin: 7, damageMax: 9, attack: 10 }, { defense: 8, hp: 25, count: 8 }),
    )

    expect(strike.min.damage).toBe(75)
    expect(strike.max.damage).toBe(96)
    expect(strike.avg.damage).toBe(85)

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

    expect(strike.min.damage).toBe(7)
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
        { ranged: true, hexes: 6 },
      ),
    )

    expect(strike.min.damage).toBe(60)
  })
})

describe('штраф за дистанцию', () => {
  const shot = (hexes: number) =>
    calculate(
      input({ count: 10, damageMin: 10, damageMax: 10 }, { hp: 1000 }, { ranged: true, hexes }),
    ).strike

  test('до трёх гексов включительно штрафа нет, дальше −10% за гекс', () => {
    expect(shot(3).min.damage).toBe(100)
    expect(shot(4).min.damage).toBe(90)
    expect(shot(4).rangePenalty).toBe(10)
  })

  test('суммарный штраф не превышает 50%', () => {
    expect(shot(8).min.damage).toBe(50)
    expect(shot(20).min.damage).toBe(50)
    expect(shot(20).rangePenalty).toBe(50)
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
    expect(battle.counter?.min.damage).toBe(7) // 3 шт × 3 урона × 28/32
    expect(battle.counter?.max.damage).toBe(31) // 6 шт × 6 урона × 28/32
    expect(battle.counter?.avg.damage).toBe(19) // 5 шт × 4.5 урона × 28/32
  })

  test('в расшифровке количество отвечающих — диапазон', () => {
    expect(battle.counter?.countMin).toBe(3)
    expect(battle.counter?.countMax).toBe(6)
  })

  test('дистанционная атака ответа не провоцирует', () => {
    const { counter } = calculate(
      input({ count: 10, damageMin: 1, damageMax: 1 }, { hp: 100, count: 8 }, { ranged: true, hexes: 2 }),
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
