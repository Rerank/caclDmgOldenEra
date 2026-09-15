import type { ReactNode } from 'react'
import './param-row.css'

type Props = {
  label: ReactNode
  /** id управляющего элемента — чтобы подпись кликалась */
  htmlFor?: string
  /** управление: stepper или toggle */
  children: ReactNode
}

export function ParamRow({ label, htmlFor, children }: Props) {
  return (
    <div className="param-row">
      <label className="param-row__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}
