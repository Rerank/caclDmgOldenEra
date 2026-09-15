import { useState, type ReactNode } from 'react'
import './disclosure.css'

type Props = {
  label: string
  /** внутри есть значения, отличные от значений по умолчанию */
  marked?: boolean
  markerLabel?: string
  defaultOpen?: boolean
  /** раскладку содержимого задаёт вызывающий: здесь только отбивка */
  bodyClassName?: string
  className?: string
  children: ReactNode
}

/**
 * Сворачиваемый блок на нативных <details>/<summary>.
 * Состояние держим в React: иначе при любой перерисовке атрибут `open`
 * вернулся бы к значению пропса и блок схлопнулся бы сам собой.
 */
export function Disclosure({
  label,
  marked = false,
  markerLabel,
  defaultOpen = false,
  bodyClassName,
  className,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  const cls = ['disclosure', marked && 'disclosure--marked', className].filter(Boolean).join(' ')
  const bodyCls = ['disclosure__body', bodyClassName].filter(Boolean).join(' ')

  return (
    <details className={cls} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="disclosure__toggle">
        <span className="disclosure__label">
          {label}
          {/* маркер всегда в разметке, показывает его модификатор --marked */}
          <span className="disclosure__marker" role="img" aria-label={markerLabel} />
        </span>
        <span className="disclosure__chevron" aria-hidden="true">
          ▼
        </span>
      </summary>
      <div className={bodyCls}>{children}</div>
    </details>
  )
}
