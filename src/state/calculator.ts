import { useState } from 'react'
import { calculate } from '../domain/damage'
import { DEFAULT_INPUT } from '../domain/rules'
import type { Entry, Input, Side } from '../domain/types'

export type Role = 'attacker' | 'defender'

/**
 * Длительность анимаций появления и ухода панели результата.
 * Должна совпадать с --result-anim в styles/variables.css.
 */
const ANIMATION_MS = 160

/**
 * Связанные поля. Ввод не блокируем, а подтягиваем соседнее: пользователь
 * набирает число, а не борется с валидацией.
 */
function applyToSide(side: Side, patch: Partial<Side>): Side {
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

  return next
}

/** Патч ничего не меняет: все его поля уже равны текущим. */
function isNoop(side: Side, patch: Partial<Side>): boolean {
  return (Object.keys(patch) as Array<keyof Side>).every((key) => side[key] === patch[key])
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
  /*
   * Анимации привязаны к явным спискам, а не к монтированию компонента:
   * закрепление и открепление переставляют панель в стопке, а перестановка
   * узла в DOM перезапустила бы CSS-анимацию — и она играла бы там,
   * где ничего не появилось и не исчезло.
   */
  const [enteringIds, setEnteringIds] = useState<string[]>([])
  const [leavingIds, setLeavingIds] = useState<string[]>([])

  /** Помечает панель появившейся на время анимации. */
  const markEntering = (id: string) => {
    setEnteringIds((current) => [...current, id])
    setTimeout(() => setEnteringIds((current) => current.filter((item) => item !== id)), ANIMATION_MS)
  }

  /** Помечает панель уходящей и убирает её, когда анимация доиграет. */
  const dismiss = (id: string, remove: () => void) => {
    setLeavingIds((current) => [...current, id])
    setTimeout(() => {
      remove()
      setLeavingIds((current) => current.filter((item) => item !== id))
    }, ANIMATION_MS)
  }

  /**
   * Любая правка параметров обесценивает свежий результат: он посчитан
   * по другим числам и рядом с изменённой формой только путает. Поэтому
   * он уходит. Нужно сохранить — закрепи: закреплённые правка не трогает.
   */
  const dropFresh = () => {
    if (!fresh || leavingIds.includes(fresh.id)) return

    const { id } = fresh
    // сверяем id: пока играла анимация, «Удар» мог положить сюда новый расчёт
    dismiss(id, () => setFresh((current) => (current?.id === id ? null : current)))
  }

  return {
    input,
    fresh,
    pinned,
    enteringIds,
    leavingIds,

    patchSide: (role: Role, patch: Partial<Side>) => {
      if (isNoop(input[role], patch)) return
      dropFresh()
      setInput((current) => ({ ...current, [role]: applyToSide(current[role], patch) }))
    },

    patchAttack: (patch: Partial<Pick<Input, 'ranged' | 'hexes'>>) => {
      const unchanged =
        (patch.ranged === undefined || patch.ranged === input.ranged) &&
        (patch.hexes === undefined || patch.hexes === input.hexes)
      if (unchanged) return

      dropFresh()
      setInput((current) => ({ ...current, ...patch }))
    },

    // Меняются местами стороны целиком, вместе с героями. Дистанционная атака
    // и гексы остаются на месте: это свойства удара, а не существа.
    swap: () => {
      dropFresh()
      setInput((current) => ({
        ...current,
        attacker: current.defender,
        defender: current.attacker,
      }))
    },

    // Слепок параметров снимается прямо здесь: дальше форму можно править,
    // а результат останется тем, с которым его посчитали.
    // Удар — единственное место, где панель действительно появляется.
    strike: () => {
      const entry: Entry = {
        id: crypto.randomUUID(),
        input: structuredClone(input),
        result: calculate(input),
      }
      setFresh(entry)
      markEntering(entry.id)
    },

    // Закрепить — значит увести свежий результат вниз, в стопку:
    // ни новый удар, ни правка параметров его больше не затрут
    pin: () => {
      if (!fresh || leavingIds.includes(fresh.id)) return
      setPinned((current) => [fresh, ...current])
      setFresh(null)
    },

    /**
     * Открепить — значит вернуть панель туда, откуда её закрепили. Если место
     * «Итога» свободно, она возвращается наверх: закрепил по ошибке — отменил.
     * Если там уже стоит более свежий расчёт, возвращаться некуда, и панель
     * уходит совсем.
     */
    unpin: (id: string) => {
      if (leavingIds.includes(id)) return

      const entry = pinned.find((item) => item.id === id)
      if (!entry) return

      if (fresh === null) {
        setFresh(entry)
        setPinned((current) => current.filter((item) => item.id !== id))
        return
      }

      dismiss(id, () => setPinned((current) => current.filter((item) => item.id !== id)))
    },
  }
}
