/** Параметры одной стороны — ровно то, что нарисовано на экране. */
export interface Side {
  templateId: string
  hp: number
  attack: number
  defense: number
  damageMin: number
  damageMax: number
  count: number
  /** атака героя, прибавляется к атаке существа */
  heroAttack: number
  /** защита героя, прибавляется к защите существа */
  heroDefense: number
  /** увел. исх. урона, % */
  outgoing: number
  /** умен. вх. урона, % */
  incoming: number
}

/** Всё, что нужно для расчёта. Он же — слепок закреплённого результата. */
export interface Input {
  attacker: Side
  defender: Side
  /** дистанционная атака: ответного удара не будет, зато возможен штраф за дистанцию */
  ranged: boolean
  /** расстояние до цели в гексах; имеет смысл только при ranged */
  hexes: number
}

/** Одна колонка таблицы результата: мин, макс или сред. */
export interface Outcome {
  damage: number
  killed: number
  survived: number
  /** здоровье верхнего выжившего; знаменатель — hp получающей стороны */
  topHp: number
}

/** Один удар: три колонки + числа, которых нет во входных данных. */
export interface Strike {
  min: Outcome
  max: Outcome
  avg: Outcome
  /** сколько существ наносило удар; у ответного это выжившие, поэтому диапазон */
  countMin: number
  countMax: number
  /** атака бьющего — уже с героем */
  attack: number
  /** защита получающего — уже с героем */
  defense: number
  /** штраф за дистанцию, %; 0 — штрафа нет */
  rangePenalty: number
}

export interface Result {
  strike: Strike
  /** null — ответного удара нет, карточка не рендерится */
  counter: Strike | null
}

/** Строка в стопке результатов. */
export interface Entry {
  id: string
  /** слепок параметров на момент удара */
  input: Input
  result: Result
}
