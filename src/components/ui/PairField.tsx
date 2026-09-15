import type { KeyboardEvent } from 'react'
import { ParamRow } from './ParamRow'
import { useNumberInput } from './useNumberInput'
import './pair-field.css'

type Part = {
  id: string
  /** доступное имя: подпись строки одна на два поля, различить их нечем */
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

type Props = {
  label: string
  /** знак между полями: «/» у здоровья, «–» у урона */
  separator: string
  /** клавиша, которая перебрасывает из первого поля во второе */
  jumpKey: string
  left: Part
  right: Part
}

/**
 * Строка, где параметр задаётся парой чисел: «4 / 10», «5 – 9».
 *
 * Кнопок ± здесь нет намеренно: такие значения переписывают целиком, подсмотрев
 * их в бою, а не подкручивают по единице. Ширина собрана из тех же токенов, что
 * и у степпера, поэтому поля в колонке стоят в одну линейку при любой метрике.
 */
export function PairField({ label, separator, jumpKey, left, right }: Props) {
  // Разделитель заодно работает клавишей перехода: «/» на клавиатуре ещё поискать,
  // а так его можно просто набрать по ходу — как и видишь на экране.
  const jump = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== jumpKey) return

    const [first, second] = event.currentTarget.querySelectorAll('input')
    if (event.target !== first || !second) return

    event.preventDefault()
    second.select()
  }

  return (
    <ParamRow label={label} htmlFor={left.id}>
      <div className="pair-field" onKeyDown={jump}>
        <Input {...left} />
        <span className="pair-field__separator" aria-hidden="true">
          {separator}
        </span>
        <Input {...right} />
      </div>
    </ParamRow>
  )
}

function Input({ id, label, value, min, max, onChange }: Part) {
  const input = useNumberInput({ value, min, max, onChange })

  return <input className="pair-field__input" id={id} aria-label={label} {...input} />
}
