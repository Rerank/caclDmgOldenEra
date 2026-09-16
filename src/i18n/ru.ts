/**
 * Единственное место, где живут строки интерфейса.
 * Когда понадобится английский — рядом ляжет en.ts той же формы,
 * а компоненты продолжат импортировать `t` из ./index.
 */
export const ru = {
  gameTitle: 'HoMM: Olden Era',
  appTitle: 'Калькулятор входящего урона',
  headerFormula: 'урон = кол-во × урон × (20 + ATK) / (20 + DEF)',

  // Стороны
  attacker: 'Атакующий',
  defender: 'Защищающийся',
  swapSides: 'Поменять стороны местами',

  // Герой и параметры существа
  hero: 'Герой',
  template: 'Шаблон',
  /** шаблон без существа; имена существ — в data/creatures.ts */
  customTemplate: 'Свой',
  /** цифра в поиске ищет по рангу — подсказка об этом прямо в поле */
  templateSearch: 'Имя или ранг (1–8)',
  hp: 'Здоровье',
  hpCurrent: 'Здоровье верхнего существа',
  hpMax: 'Максимальное здоровье существа',
  attack: 'Атака',
  defense: 'Защита',
  damage: 'Урон',
  damageMin: 'Минимальный урон',
  damageMax: 'Максимальный урон',
  count: 'Кол-во',
  ranged: 'Дистанционная атака',
  penalty: 'Штраф',
  penaltyHint: '−10% за каждый гекс свыше трёх, но не больше −50%. У части существ штрафа нет',
  weakCounter: 'Контратака 50%',
  weakCounterHint: 'Стрелок, которого достали в ближнем бою, отвечает вполсилы',

  // Дополнительные параметры
  extra: 'Дополнительно',
  extraMarker: 'есть изменённые параметры',
  outgoing: 'Увел. исх. урона',
  incoming: 'Умен. вх. урона',

  // Кнопки
  strike: 'Удар',
  pin: 'Закрепить',
  unpin: 'Открепить',
  decrease: 'уменьшить',
  increase: 'увеличить',
  close: 'Закрыть',
  nothingFound: 'Ничего не найдено',

  // Результаты
  resultTitle: 'Итог',
  pinnedTitle: 'Закреплено',
  counterCard: 'Ответный удар',
  strikeCard: 'Удар по защищающемуся',
  breakdown: 'Расшифровка',

  // Куски строки расшифровки: «10 шт × 7–9 урона × … · увел. исх. 25%»
  pcs: 'шт',
  damageGenitive: 'урона',
  outgoingShort: 'увел. исх.',
  incomingShort: 'умен. вх.',
  penaltyShort: 'штраф',

  // Куски слепка: «Свой · HP 35 · атака 10+4 · … · исх. +25% · вх. −0%»
  hpShort: 'HP',
  attackShort: 'атака',
  defenseShort: 'защ.',
  damageShort: 'урон',
  outgoingSnapshot: 'исх.',
  incomingSnapshot: 'вх.',

  colMin: 'мин',
  colMax: 'макс',
  colAvg: 'сред',
  rowDamage: 'Получено урона',
  rowKilled: 'Умерло',
  rowSurvived: 'Выжило',
  rowHp: 'Здоровье',
}

export type Dictionary = typeof ru
