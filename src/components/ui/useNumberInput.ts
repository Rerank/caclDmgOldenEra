import { useState, type ChangeEvent } from 'react'

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

type Options = {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

/**
 * Поведение числового поля, общее для степпера и поля здоровья.
 *
 * Пока поле редактируют, показываем ровно набранное: иначе его нельзя
 * очистить, чтобы ввести число заново. Наружу отдаём только значения,
 * уже попавшие в границы, а на выходе из поля добираем остальное —
 * «99999» зажимается в максимум, пустое поле возвращает прежнее.
 *
 * Возвращает готовый набор пропсов для <input>.
 */
export function useNumberInput({ value, min, max, onChange }: Options) {
  const [draft, setDraft] = useState<string | null>(null)

  return {
    type: 'text' as const,
    inputMode: 'numeric' as const,
    // Браузер не предлагает прежние значения: подсказка «10, 25, 7» под полем
    // атаки только мешает — число каждый раз своё и набирается быстрее выбора
    autoComplete: 'off' as const,
    value: draft ?? String(value),

    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, '')
      setDraft(digits)

      const parsed = Number.parseInt(digits, 10)
      if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) onChange(parsed)
    },

    onBlur: () => {
      const parsed = Number.parseInt(draft ?? '', 10)
      if (!Number.isNaN(parsed)) onChange(clamp(parsed, min, max))
      setDraft(null)
    },
  }
}
