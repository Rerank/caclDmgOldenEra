import { CUSTOM_TEMPLATE_ID, findTemplate, type CreatureTemplate } from '../data/creatures'
import type { Input, Side } from '../domain/types'

/**
 * Переходы состояния формы — чистые функции без React: берут Input,
 * возвращают новый. Если переход ничего не меняет, возвращается тот же
 * объект, и хук по сравнению ссылок понимает, что трогать нечего.
 */

export type Role = 'attacker' | 'defender'

/** Правка стороны. Шаблон так не меняется — только через selectTemplate. */
export type SidePatch = Partial<Omit<Side, 'templateId'>>

export type AttackPatch = Partial<Pick<Input, 'ranged' | 'rangePenalty'>>

/**
 * Свойства самого существа — то, что приходит из шаблона. Правка любого
 * из них отвязывает стек от шаблона: числа уже не те, что в справочнике,
 * и имя существа врало бы. Список один на подстановку и на сброс,
 * поэтому они не разойдутся.
 *
 * Здоровья верхнего, количества, героя и процентов здесь нет намеренно:
 * они описывают ситуацию, а не существо. Дистанционная атака и штраф
 * лежат вообще не в стороне, а в ударе.
 */
const CREATURE_FIELDS = [
  'hp',
  'attack',
  'defense',
  'damageMin',
  'damageMax',
  'counterHalved',
] as const satisfies ReadonlyArray<keyof Side>

type CreatureFields = Pick<Side, (typeof CREATURE_FIELDS)[number]>

function creatureFields(template: CreatureTemplate): CreatureFields {
  return {
    hp: template.hp,
    attack: template.attack,
    defense: template.defense,
    damageMin: template.damageMin,
    damageMax: template.damageMax,
    counterHalved: template.counterHalved ?? false,
  }
}

/**
 * Связанные поля. Ввод не блокируем, а подтягиваем соседнее: пользователь
 * набирает число, а не борется с валидацией.
 */
function applyToSide(side: Side, patch: SidePatch): Side {
  const next = { ...side, ...patch }

  // урон min не может быть больше урона max
  if (patch.damageMin !== undefined && next.damageMin > next.damageMax) {
    next.damageMax = next.damageMin
  }
  if (patch.damageMax !== undefined && next.damageMax < next.damageMin) {
    next.damageMin = next.damageMax
  }

  // Пока существо цело, текущее здоровье едет за максимальным; раненое —
  // остаётся как есть, только подрезается сверху
  if (patch.hp !== undefined) {
    next.topHp = side.topHp === side.hp ? next.hp : Math.min(next.topHp, next.hp)
  }
  if (patch.topHp !== undefined) {
    next.topHp = Math.min(next.topHp, next.hp)
  }

  // Сравниваем уже итог, а не сам патч: подтянутый урон — тоже правка существа
  if (CREATURE_FIELDS.some((key) => next[key] !== side[key])) {
    next.templateId = CUSTOM_TEMPLATE_ID
  }

  return next
}

export function patchSide(input: Input, role: Role, patch: SidePatch): Input {
  const side = input[role]
  const unchanged = (Object.keys(patch) as Array<keyof SidePatch>).every(
    (key) => side[key] === patch[key],
  )

  return unchanged ? input : { ...input, [role]: applyToSide(side, patch) }
}

export function patchAttack(input: Input, patch: AttackPatch): Input {
  const unchanged =
    (patch.ranged === undefined || patch.ranged === input.ranged) &&
    (patch.rangePenalty === undefined || patch.rangePenalty === input.rangePenalty)

  return unchanged ? input : { ...input, ...patch }
}

/**
 * Выбор шаблона. Подставляет свойства существа и делает стек целым: новое
 * существо ничем не ранено. Количество, герой и проценты остаются.
 *
 * «Свой» только снимает имя — числа остаются теми, что были.
 * Повторный выбор того же шаблона ничего не делает: иначе он молча
 * вылечил бы раненый стек и убрал «Итог».
 */
export function selectTemplate(input: Input, role: Role, templateId: string): Input {
  const side = input[role]
  if (side.templateId === templateId) return input

  const template = findTemplate(templateId)
  if (!template) {
    return { ...input, [role]: { ...side, templateId: CUSTOM_TEMPLATE_ID } }
  }

  const next: Input = {
    ...input,
    [role]: { ...side, ...creatureFields(template), topHp: template.hp, templateId },
  }

  // Дистанционная атака — свойство удара, а бьёт атакующий. У защищающегося
  // стрелка тумблер не включаем: за него отвечает «Контратака 50%».
  return role === 'attacker' ? { ...next, ranged: template.ranged ?? false } : next
}

/**
 * Обмен сторонами целиком, вместе с героями. Флаг «Контратака 50%» лежит
 * в стороне и едет вместе с существом сам.
 *
 * Дистанционная атака берётся из справочника по новому атакующему: иначе
 * рукопашник «стрелял» бы тумблером, оставшимся от прежнего стрелка.
 * У «Своего» справочника нет — выключаем: ближний бой самый частый случай.
 * Штраф не трогаем: при выключенном тумблере он в расчёте не участвует.
 */
export function swapSides(input: Input): Input {
  return {
    ...input,
    attacker: input.defender,
    defender: input.attacker,
    ranged: findTemplate(input.defender.templateId)?.ranged ?? false,
  }
}
