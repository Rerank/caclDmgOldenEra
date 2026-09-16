import { describe, expect, test } from 'vitest'
import { CREATURE_TEMPLATES } from '../data/creatures'
import { TEMPLATE_GROUPS } from './templateGroups'
import { filterGroups } from './ui/comboboxFilter'

const found = (query: string) =>
  filterGroups(TEMPLATE_GROUPS, query)
    .flatMap((group) => group.options.map((option) => option.value))
    .sort()

describe('поиск шаблона', () => {
  test('цифра находит всех существ этого ранга и только их', () => {
    const tiers = [...new Set(CREATURE_TEMPLATES.map((c) => c.tier))]

    for (const tier of tiers) {
      const expected = CREATURE_TEMPLATES.filter((c) => c.tier === tier)
        .map((c) => c.id)
        .sort()

      expect(found(String(tier))).toEqual(expected)
    }
  })

  test('ранг вместе с именем — пересечение двух поисков', () => {
    const both = found('7 дракон')

    expect(both.length).toBeGreaterThan(0)
    expect(both).toEqual(found('дракон').filter((id) => found('7').includes(id)))
  })
})
