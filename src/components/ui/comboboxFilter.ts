export type ComboboxOption = {
  value: string
  label: string
  /** короткая метка справа от имени, например ранг */
  hint?: string
  /** строки, по которым опцию находит поиск: например, имя на всех языках */
  keywords: string[]
}

export type ComboboxGroup = {
  /** null — опции без заголовка, например «Свой» в начале списка */
  label: string | null
  options: ComboboxOption[]
}

/**
 * Приводит строку к виду, в котором её сравнивает поиск.
 *
 * - регистр не важен;
 * - «ё» и «е» не различаются: в самих данных встречаются оба написания
 *   («Тяжелый арбалетчик», но «Чёрный дракон»);
 * - апострофы выброшены: в русской раскладке его не набрать, не переключив
 *   язык, а «Ра'шотх» должен находиться по «рашотх».
 */
export const normalize = (text: string) =>
  text.toLowerCase().replaceAll('ё', 'е').replace(/['’]/g, '')

/**
 * Оставляет опции, подходящие под запрос, и выбрасывает опустевшие группы
 * вместе с заголовками. Пустой запрос — список целиком.
 *
 * Запрос делится на слова, и опция подходит, если каждое слово нашлось
 * хоть в одном её ключе. Так складываются условия из разных ключей:
 * «3 гриф» — это ранг из одного ключа и имя из другого. Всё, что находилось
 * целой строкой, находится и по словам.
 */
export function filterGroups(groups: ComboboxGroup[], query: string): ComboboxGroup[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return groups

  return groups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => {
        const keywords = option.keywords.map(normalize)
        return words.every((word) => keywords.some((keyword) => keyword.includes(word)))
      }),
    }))
    .filter((group) => group.options.length > 0)
}
