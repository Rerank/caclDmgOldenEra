import type { ButtonHTMLAttributes } from 'react'
import './icon-button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string
  /** доступное имя: у кнопки нет текста, только картинка */
  label: string
}

export function IconButton({ icon, label, ...rest }: Props) {
  return (
    <button type="button" className="icon-button" aria-label={label} {...rest}>
      <img className="icon-button__icon" src={icon} alt="" />
    </button>
  )
}
