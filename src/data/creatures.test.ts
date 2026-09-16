import { describe, expect, test } from 'vitest'
import { F } from '../domain/rules'
import { CREATURE_TEMPLATES, CUSTOM_TEMPLATE_ID } from './creatures'

/**
 * Справочник дальше правится руками, а типы видят не всё: дубли id
 * и числа вне границ полей компилятор пропустит. Каждый тест возвращает
 * список нарушителей — при падении сразу видно, кого чинить.
 */

const within = (value: number, limits: { min: number; max: number }) =>
  value >= limits.min && value <= limits.max

describe('справочник существ', () => {
  test('id уникальны и не заняты шаблоном «Свой»', () => {
    const ids = CREATURE_TEMPLATES.map((c) => c.id)
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)

    expect(dupes).toEqual([])
    expect(ids).not.toContain(CUSTOM_TEMPLATE_ID)
  })

  test('id — английское имя строчными, без пробелов и знаков', () => {
    const broken = CREATURE_TEMPLATES.filter(
      (c) => c.id !== c.name.en.toLowerCase().replace(/[^a-z0-9]/g, ''),
    )

    expect(broken.map((c) => c.id)).toEqual([])
  })

  test('параметры помещаются в границы полей, урон мин не больше макс', () => {
    // иначе шаблон подставит число, которое поле не позволило бы ввести руками
    const broken = CREATURE_TEMPLATES.filter(
      (c) =>
        !within(c.hp, F.hp) ||
        !within(c.attack, F.attack) ||
        !within(c.defense, F.defense) ||
        !within(c.damageMin, F.damage) ||
        !within(c.damageMax, F.damage) ||
        c.damageMin > c.damageMax,
    )

    expect(broken.map((c) => c.id)).toEqual([])
  })
})
