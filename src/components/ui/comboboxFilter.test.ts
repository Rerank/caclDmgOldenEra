import { describe, expect, test } from 'vitest'
import { filterGroups, type ComboboxGroup } from './comboboxFilter'

const option = (value: string, ...keywords: string[]) => ({ value, label: keywords[0], keywords })

const groups: ComboboxGroup[] = [
  {
    label: 'Храм',
    options: [option('marksman', 'Тяжелый арбалетчик', 'Marksman'), option('griffin', 'Грифон', 'Griffin')],
  },
  {
    label: 'Подземелье',
    options: [option('blackdragon', 'Чёрный дракон', 'Black Dragon')],
  },
  {
    label: 'Раскол',
    options: [option('rashoth', "Ра'шотх", "Ra'Shoth")],
  },
]

const found = (query: string) => filterGroups(groups, query).flatMap((g) => g.options.map((o) => o.value))

describe('поиск в комбобоксе', () => {
  test('пустой запрос оставляет список целиком', () => {
    expect(filterGroups(groups, '')).toBe(groups)
    expect(filterGroups(groups, '   ')).toBe(groups)
  })

  test('ищет по вхождению подстроки без учёта регистра', () => {
    expect(found('ГРИФ')).toEqual(['griffin'])
    expect(found('рифо')).toEqual(['griffin'])
  })

  test('ищет по любому из ключей, в том числе по английскому имени', () => {
    expect(found('dragon')).toEqual(['blackdragon'])
  })

  test('«ё» и «е» не различаются ни в запросе, ни в данных', () => {
    expect(found('тяжёлый')).toEqual(['marksman'])
    expect(found('черный')).toEqual(['blackdragon'])
  })

  test('апострофы не мешают: их не набрать в русской раскладке', () => {
    expect(found('рашотх')).toEqual(['rashoth'])
    expect(found("ra'sh")).toEqual(['rashoth'])
  })

  test('слова запроса ищутся по отдельности, и найтись должно каждое', () => {
    expect(found('дракон черный')).toEqual(['blackdragon'])
    expect(found('тяжел арб')).toEqual(['marksman'])
    // слова нашлись, но у разных опций — это не совпадение
    expect(found('грифон дракон')).toEqual([])
  })

  test('группы без совпадений пропадают вместе с заголовком', () => {
    expect(filterGroups(groups, 'гриф').map((g) => g.label)).toEqual(['Храм'])
    expect(filterGroups(groups, 'нет такого')).toEqual([])
  })
})
