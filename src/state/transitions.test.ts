import { describe, expect, test } from 'vitest'
import { CREATURE_TEMPLATES, CUSTOM_TEMPLATE_ID, type CreatureTemplate } from '../data/creatures'
import { DEFAULT_INPUT } from '../domain/rules'
import type { Input, Side } from '../domain/types'
import {
  patchAttack,
  patchSide,
  sameInput,
  selectTemplate,
  swapSides,
  type SidePatch,
} from './transitions'

/**
 * Существ берём из справочника по признаку, а ожидания — из самого шаблона:
 * правка чисел в справочнике не должна ломать проверку правил.
 */
const pick = (label: string, match: (c: CreatureTemplate) => boolean) => {
  const found = CREATURE_TEMPLATES.find(match)
  if (!found) throw new Error(`в справочнике нет существа: ${label}`)
  return found
}

const shooter = pick('стрелок', (c) => Boolean(c.ranged && c.counterHalved))
const reach = pick('атака на расстоянии', (c) => Boolean(c.ranged && !c.counterHalved))
const melee = pick('рукопашник', (c) => !c.ranged && !c.counterHalved)

/** Стороны с «ситуацией»: раненые, с героем и процентами — чтобы было что сохранять. */
const situation: Partial<Side> = {
  count: 7,
  heroAttack: 4,
  heroDefense: 5,
  outgoing: 10,
  incoming: 20,
}

const base: Input = {
  attacker: { ...DEFAULT_INPUT.attacker, ...situation, topHp: 3 },
  defender: { ...DEFAULT_INPUT.defender, ...situation, topHp: 2 },
  ranged: false,
  rangePenalty: 30,
}

describe('выбор шаблона', () => {
  test('подставляет свойства существа и делает стек целым, ситуацию не трогает', () => {
    const { attacker } = selectTemplate(base, 'attacker', melee.id)

    expect(attacker).toEqual({
      ...base.attacker,
      templateId: melee.id,
      hp: melee.hp,
      topHp: melee.hp,
      attack: melee.attack,
      defense: melee.defense,
      damageMin: melee.damageMin,
      damageMax: melee.damageMax,
      counterHalved: false,
    })
  })

  test('у атакующего стрелок включает дистанционную атаку, рукопашник — выключает', () => {
    const shooting = selectTemplate(base, 'attacker', shooter.id)
    expect(shooting.ranged).toBe(true)
    expect(shooting.attacker.counterHalved).toBe(true)

    expect(selectTemplate(shooting, 'attacker', melee.id).ranged).toBe(false)
    expect(selectTemplate(base, 'attacker', reach.id).ranged).toBe(true)

    // штраф — расстояние до цели, а не свойство существа
    expect(shooting.rangePenalty).toBe(base.rangePenalty)
  })

  test('у защищающегося ставит «Контратаку 50%», а дистанционную атаку не трогает', () => {
    const defended = selectTemplate(base, 'defender', shooter.id)
    expect(defended.defender.counterHalved).toBe(true)
    expect(defended.ranged).toBe(base.ranged)

    // атака на расстоянии в ближнем бою отвечает в полную силу
    expect(selectTemplate(base, 'defender', reach.id).defender.counterHalved).toBe(false)
  })

  test('повторный выбор того же существа ничего не меняет', () => {
    const chosen = selectTemplate(base, 'attacker', melee.id)
    const wounded = patchSide(chosen, 'attacker', { topHp: 1 })

    expect(selectTemplate(wounded, 'attacker', melee.id)).toBe(wounded)
  })

  test('«Свой» снимает имя, числа остаются', () => {
    const chosen = selectTemplate(base, 'attacker', shooter.id)
    const custom = selectTemplate(chosen, 'attacker', CUSTOM_TEMPLATE_ID)

    expect(custom.attacker).toEqual({ ...chosen.attacker, templateId: CUSTOM_TEMPLATE_ID })
    expect(custom.ranged).toBe(chosen.ranged)
  })
})

describe('правка после выбора шаблона', () => {
  const chosen = selectTemplate(base, 'defender', shooter.id)

  test.each<[string, SidePatch]>([
    ['здоровье', { hp: shooter.hp + 1 }],
    ['атака', { attack: shooter.attack + 1 }],
    ['защита', { defense: shooter.defense + 1 }],
    ['урон мин', { damageMin: shooter.damageMin + 1 }],
    ['урон макс', { damageMax: shooter.damageMax + 1 }],
    ['контратака 50%', { counterHalved: false }],
  ])('%s — свойство существа, шаблон сбрасывается на «Свой»', (_, patch) => {
    expect(patchSide(chosen, 'defender', patch).defender.templateId).toBe(CUSTOM_TEMPLATE_ID)
  })

  test.each<[string, SidePatch]>([
    ['здоровье верхнего', { topHp: 1 }],
    ['кол-во', { count: 99 }],
    ['атака героя', { heroAttack: 9 }],
    ['защита героя', { heroDefense: 9 }],
    ['увел. исх. урона', { outgoing: 50 }],
    ['умен. вх. урона', { incoming: 50 }],
  ])('%s — ситуация, шаблон остаётся', (_, patch) => {
    expect(patchSide(chosen, 'defender', patch).defender.templateId).toBe(shooter.id)
  })

  test('дистанционная атака и штраф — ситуация, шаблоны остаются', () => {
    const next = patchAttack(chosen, { ranged: true, rangePenalty: 10 })

    expect(next.defender.templateId).toBe(shooter.id)
  })

  test('ввод того же значения — не правка', () => {
    expect(patchSide(chosen, 'defender', { attack: shooter.attack })).toBe(chosen)
  })
})

describe('сравнение слепков', () => {
  /** другое значение того же типа — чтобы «поменять» любое поле, не зная, какое оно */
  const other = (value: Side[keyof Side]) => {
    if (typeof value === 'number') return value + 1
    if (typeof value === 'boolean') return !value
    return `${value}-другое`
  }

  test('одинаковые данные совпадают, даже если это разные объекты', () => {
    expect(sameInput(base, structuredClone(base))).toBe(true)
  })

  test('правка любого поля стороны делает слепки разными', () => {
    for (const key of Object.keys(base.attacker) as Array<keyof Side>) {
      const changed: Input = {
        ...base,
        attacker: { ...base.attacker, [key]: other(base.attacker[key]) } as Side,
      }

      expect(sameInput(base, changed), `поле ${key}`).toBe(false)
    }
  })

  test('параметры удара тоже сравниваются', () => {
    expect(sameInput(base, { ...base, ranged: !base.ranged })).toBe(false)
    expect(sameInput(base, { ...base, rangePenalty: base.rangePenalty + 10 })).toBe(false)
  })
})

describe('обмен сторонами', () => {
  test('дистанционная атака выставляется по справочнику нового атакующего', () => {
    // стрелок бьёт рукопашника, затем рукопашник отвечает своим ходом
    const shot = selectTemplate(selectTemplate(base, 'attacker', shooter.id), 'defender', melee.id)
    expect(shot.ranged).toBe(true)
    expect(swapSides(shot).ranged).toBe(false)

    // и наоборот
    const hit = selectTemplate(selectTemplate(base, 'attacker', melee.id), 'defender', shooter.id)
    expect(swapSides(hit).ranged).toBe(true)
  })

  test('у «Своего» нового атакующего дистанционная атака выключается', () => {
    const shot = selectTemplate({ ...base, ranged: true }, 'attacker', shooter.id)

    expect(shot.defender.templateId).toBe(CUSTOM_TEMPLATE_ID)
    expect(swapSides(shot).ranged).toBe(false)
  })

  test('существа едут вместе со своими флагами, штраф остаётся', () => {
    const shot = selectTemplate(base, 'attacker', shooter.id)
    const swapped = swapSides(shot)

    expect(swapped.defender).toBe(shot.attacker)
    expect(swapped.attacker).toBe(shot.defender)
    expect(swapped.rangePenalty).toBe(base.rangePenalty)
  })
})
