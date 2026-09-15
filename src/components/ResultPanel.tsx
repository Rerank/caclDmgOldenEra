import type { ReactNode } from 'react'
import './result-panel.css'

type Props = {
  title: string
  /** кнопка «Закрепить» или «Открепить» */
  action: ReactNode
  pinned?: boolean
  /** одна карточка: ответного удара нет — тогда она занимает всю ширину */
  single?: boolean
  children: ReactNode
}

export function ResultPanel({ title, action, pinned, single, children }: Props) {
  return (
    <section className={'result-panel' + (pinned ? ' result-panel--pinned' : '')}>
      <header className="result-panel__header">
        <h2 className="result-panel__title">{title}</h2>
        {action}
      </header>
      <div className={'result-panel__body' + (single ? ' result-panel__body--single' : '')}>
        {children}
      </div>
    </section>
  )
}
