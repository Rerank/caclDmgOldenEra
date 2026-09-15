import './toggle.css'

type Props = {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * Переключатель на нативном чекбоксе: доступность с клавиатуры
 * и внешний вид «включено» достаются из CSS, без JS.
 */
export function Toggle({ id, checked, onChange }: Props) {
  return (
    <span className="toggle">
      <input
        className="toggle__input"
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="toggle__track" htmlFor={id}>
        <span className="toggle__thumb" />
      </label>
    </span>
  )
}
