import { ParamRow } from './ParamRow'
import { Stepper, type StepperProps } from './Stepper'

type Props = Omit<StepperProps, 'label' | 'id'> & {
  id: string
  label: string
  /** нижний индекс у подписи: «Урон min» */
  sub?: string
}

/** Строка параметра с числовым полем — самый частый случай в панелях. */
export function NumberField({ id, label, sub, ...stepper }: Props) {
  return (
    <ParamRow
      htmlFor={id}
      label={
        <>
          {label}
          {sub && <span className="param-row__sub">{sub}</span>}
        </>
      }
    >
      <Stepper id={id} label={sub ? `${label} ${sub}` : label} {...stepper} />
    </ParamRow>
  )
}
