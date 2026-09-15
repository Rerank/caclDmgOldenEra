/**
 * Справочник существ. Пока в нём одна запись — «Свой»: все параметры
 * задаёт пользователь. Когда появятся настоящие данные, они лягут сюда же,
 * а компоненты не изменятся.
 */
export interface CreatureTemplate {
  id: string
  /** ключ в словаре i18n: имена существ тоже переводятся */
  nameKey: string
  /** null у «Свой» — подставлять нечего */
  stats: {
    hp: number
    attack: number
    defense: number
    damageMin: number
    damageMax: number
  } | null
}

export const CUSTOM_TEMPLATE_ID = 'custom'

export const CREATURE_TEMPLATES: CreatureTemplate[] = [
  { id: CUSTOM_TEMPLATE_ID, nameKey: 'custom', stats: null },
]
