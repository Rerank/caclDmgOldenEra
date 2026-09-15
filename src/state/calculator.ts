import { useState } from 'react'
import { DEFAULT_INPUT } from '../domain/rules'
import type { Input, Side } from '../domain/types'

export type Role = 'attacker' | 'defender'

/**
 * Урон min не может быть больше урона max. Не блокируем ввод, а подтягиваем
 * соседнее поле: пользователь набирает число, а не борется с валидацией.
 */
function applyToSide(side: Side, patch: Partial<Side>): Side {
  const next = { ...side, ...patch }

  if (patch.damageMin !== undefined && next.damageMin > next.damageMax) {
    next.damageMax = next.damageMin
  }
  if (patch.damageMax !== undefined && next.damageMax < next.damageMin) {
    next.damageMin = next.damageMax
  }

  return next
}

/**
 * Состояние калькулятора. Обычный useState за фасадом хука: операций мало
 * и каждая — одна строка. Если появится отмена действий или пересчёт
 * закреплённых результатов, здесь станет reducer, а компоненты не заметят.
 */
export function useCalculator() {
  const [input, setInput] = useState<Input>(DEFAULT_INPUT)

  return {
    input,

    patchSide: (role: Role, patch: Partial<Side>) =>
      setInput((current) => ({ ...current, [role]: applyToSide(current[role], patch) })),

    patchAttack: (patch: Partial<Pick<Input, 'ranged' | 'hexes'>>) =>
      setInput((current) => ({ ...current, ...patch })),
  }
}
