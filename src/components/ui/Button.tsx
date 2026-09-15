import type { ButtonHTMLAttributes } from 'react'
import './button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** strike — главная кнопка удара, small — компактная в шапке «Итога» */
  variant?: 'strike' | 'small'
  /** приглушённый вид: действие не должно спорить с «Ударом» */
  quiet?: boolean
}

export function Button({ variant, quiet, className, ...rest }: Props) {
  const cls = ['button', variant && `button--${variant}`, quiet && 'button--quiet', className]
    .filter(Boolean)
    .join(' ')

  return <button type="button" className={cls} {...rest} />
}
