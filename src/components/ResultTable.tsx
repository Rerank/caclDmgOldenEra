import type { Outcome, Strike } from '../domain/types'
import { t } from '../i18n'

type Props = {
  strike: Strike
  /** здоровье существа, которое получает урон — знаменатель строки «Здоровье» */
  maxHp: number
}

/** Колонки таблицы. Последняя — акцентная. */
const COLUMNS = ['min', 'max', 'avg'] as const

export function ResultTable({ strike, maxHp }: Props) {
  const rows: Array<{ label: string; value: (o: Outcome) => string | number }> = [
    { label: t.rowDamage, value: (o) => o.damage },
    { label: t.rowKilled, value: (o) => o.killed },
    { label: t.rowSurvived, value: (o) => o.survived },
    { label: t.rowHp, value: (o) => `${o.topHp}/${maxHp}` },
  ]

  return (
    <table className="result-table">
      <colgroup>
        <col className="result-table__col-label" />
        <col />
        <col />
        <col />
      </colgroup>
      <thead>
        <tr>
          <td className="result-table__corner" />
          <th className="result-table__head" scope="col">
            {t.colMin}
          </th>
          <th className="result-table__head" scope="col">
            {t.colMax}
          </th>
          <th className="result-table__head result-table__head--avg" scope="col">
            {t.colAvg}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr className="result-table__row" key={row.label}>
            <th className="result-table__label" scope="row">
              {row.label}
            </th>
            {COLUMNS.map((column) => (
              <td
                key={column}
                className={
                  'result-table__value' + (column === 'avg' ? ' result-table__value--avg' : '')
                }
              >
                {row.value(strike[column])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
