import { useState } from 'react'
import { calculate } from '../domain/damage'
import { DEFAULT_INPUT } from '../domain/rules'
import type { Entry, Input, Side } from '../domain/types'

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
  const [fresh, setFresh] = useState<Entry | null>(null)
  const [pinned, setPinned] = useState<Entry[]>([])

  return {
    input,
    fresh,
    pinned,

    patchSide: (role: Role, patch: Partial<Side>) =>
      setInput((current) => ({ ...current, [role]: applyToSide(current[role], patch) })),

    patchAttack: (patch: Partial<Pick<Input, 'ranged' | 'hexes'>>) =>
      setInput((current) => ({ ...current, ...patch })),

    // Меняются местами стороны целиком, вместе с героями. Дистанционная атака
    // и гексы остаются на месте: это свойства удара, а не существа.
    swap: () =>
      setInput((current) => ({
        ...current,
        attacker: current.defender,
        defender: current.attacker,
      })),

    // Слепок параметров снимается прямо здесь: дальше форму можно править,
    // а результат останется тем, с которым его посчитали.
    strike: () =>
      setFresh({
        id: crypto.randomUUID(),
        input: structuredClone(input),
        result: calculate(input),
      }),

    // Закрепить — значит увести свежий результат вниз, в стопку:
    // новые удары его больше не затрут
    pin: () => {
      if (!fresh) return
      setPinned((current) => [fresh, ...current])
      setFresh(null)
    },

    unpin: (id: string) => setPinned((current) => current.filter((entry) => entry.id !== id)),
  }
}
