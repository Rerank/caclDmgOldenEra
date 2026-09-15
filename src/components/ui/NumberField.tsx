import { ParamRow } from './ParamRow'
import { Stepper, type StepperProps } from './Stepper'

type Props = Omit<StepperProps, 'label' | 'id'> & {
  id: string
  label: string
}

/** Строка параметра с числовым полем и кнопками ± — самый частый случай в панелях. */
export function NumberField({ id, label, ...stepper }: Props) {
  return (
    <ParamRow htmlFor={id} label={label}>
      <Stepper id={id} label={label} {...stepper} />
    </ParamRow>
  )
}
