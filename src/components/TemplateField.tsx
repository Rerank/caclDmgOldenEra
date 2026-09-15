import { CREATURE_TEMPLATES } from '../data/creatures'
import { t } from '../i18n'
import './select-field.css'

type Props = {
  id: string
  value: string
  onChange: (templateId: string) => void
}

/**
 * Выбор шаблона существа. Пока это нативный <select> с одной опцией «Свой» —
 * комбобокс с поиском появится вместе со справочником существ.
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
          {CREATURE_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {t.creatures[template.nameKey] ?? template.nameKey}
            </option>
          ))}
        </select>
        <span className="select-field__arrow" aria-hidden="true">
          ▼
        </span>
      </div>
    </div>
  )
}
