import { t } from '../i18n'
import { TEMPLATE_GROUPS } from './templateGroups'
import { Combobox } from './ui/Combobox'
import './select-field.css'

type Props = {
  id: string
  value: string
  onChange: (templateId: string) => void
}

/** Выбор шаблона существа: подпись поля и комбобокс со справочником. */
export function TemplateField({ id, value, onChange }: Props) {
  const labelId = `${id}-label`

  return (
    <div className="select-field">
      <span className="select-field__label" id={labelId}>
        {t.template}
      </span>
      <Combobox
        id={id}
        labelId={labelId}
        value={value}
        emptyLabel={t.customTemplate}
        groups={TEMPLATE_GROUPS}
        searchPlaceholder={t.templateSearch}
        onChange={onChange}
      />
    </div>
  )
}
