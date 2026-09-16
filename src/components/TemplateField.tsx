import { CUSTOM_TEMPLATE_ID } from '../data/creatures'
import { t } from '../i18n'
import './select-field.css'

type Props = {
  id: string
  value: string
  onChange: (templateId: string) => void
}

/**
 * Выбор шаблона существа. Пока это нативный <select> с одной опцией «Свой».
 * Справочник уже лежит в data/creatures.ts, но в список его не выводим:
 * без подстановки параметров выбор существа ничего бы не менял.
 * Список появится вместе с комбобоксом и подстановкой.
 */
export function TemplateField({ id, value, onChange }: Props) {
  const labelId = `${id}-label`

  return (
    <div className="select-field">
      <span className="select-field__label" id={labelId}>
        {t.template}
      </span>
      <div className="select-field__control">
        <select
          className="select-field__select"
          id={id}
          aria-labelledby={labelId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value={CUSTOM_TEMPLATE_ID}>{t.customTemplate}</option>
        </select>
        <span className="select-field__arrow" aria-hidden="true">
          ▼
        </span>
      </div>
    </div>
  )
}
