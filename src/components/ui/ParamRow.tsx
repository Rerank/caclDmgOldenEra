import type { ReactNode } from 'react'
import './param-row.css'

type Props = {
  label: string
  /** id управляющего элемента — чтобы подпись кликалась */
  htmlFor?: string
  /** подсказка при наведении на подпись */
  title?: string
  /** управление: степпер, тумблер или пара полей */
  children: ReactNode
}

export function ParamRow({ label, htmlFor, title, children }: Props) {
  return (
    <div className="param-row">
      <label className="param-row__label" htmlFor={htmlFor} title={title}>
        {label}
      </label>
      {children}
    </div>
  )
}
