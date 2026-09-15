import { useState } from 'react'
import { t } from '../../i18n'
import './stepper.css'

export type StepperProps = {
  id?: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  /** доступное имя для кнопок ±: «Атака: уменьшить» */
  label: string
  /** фиксированный знак перед числом: «+» у увеличения, «−» у уменьшения */
  sign?: string
  /** единица измерения после числа */
  unit?: string
  /** к параметру прибавлен бонус героя — число подсвечивается */
  boosted?: boolean
  title?: string
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function Stepper({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  sign,
  unit,
  boosted,
  title,
}: StepperProps) {
  // Пока поле редактируют, показываем ровно набранное. Иначе его нельзя
  // очистить, чтобы ввести число заново: React тут же вернул бы прежнее.
  const [draft, setDraft] = useState<string | null>(null)

  const handleType = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    setDraft(digits)
    // наверх отдаём только то, что уже укладывается в границы
    const n = Number.parseInt(digits, 10)
    if (!Number.isNaN(n) && n >= min && n <= max) onChange(n)
  }

  // На blur добираем остальное: «99999» зажимаем в max, пустое поле
  // возвращает прежнее значение
  const handleBlur = () => {
    const n = Number.parseInt(draft ?? '', 10)
    if (!Number.isNaN(n)) onChange(clamp(n, min, max))
    setDraft(null)
  }

  const fieldCls = 'stepper__field' + (sign || unit ? ' stepper__field--with-unit' : '')
  const inputCls = 'stepper__input' + (boosted ? ' stepper__input--boosted' : '')

  return (
    <div className="stepper">
      <button
        className="stepper__btn stepper__btn--dec"
        type="button"
        aria-label={`${label}: ${t.decrease}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step, min, max))}
      >
        −
      </button>

      <div className={fieldCls}>
        {sign && <span className="stepper__sign">{sign}</span>}
        <input
          className={inputCls}
          id={id}
          type="text"
          inputMode="numeric"
          title={title}
          value={draft ?? String(value)}
          onChange={(e) => handleType(e.target.value)}
          onBlur={handleBlur}
        />
        {unit && <span className="stepper__unit">{unit}</span>}
      </div>

      <button
        className="stepper__btn stepper__btn--inc"
        type="button"
        aria-label={`${label}: ${t.increase}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step, min, max))}
      >
        +
      </button>
    </div>
  )
}
