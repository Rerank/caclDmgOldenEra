import type { ReactNode } from 'react'
import type { Entry } from '../domain/types'
import { t } from '../i18n'
import { formatBreakdown } from './breakdown'
import { ResultCard } from './ResultCard'
import { ResultPanel } from './ResultPanel'
import { Button } from './ui/Button'

type Props = {
  fresh: Entry | null
}

/** Стопка результатов: свежий расчёт сверху. */
export function Results({ fresh }: Props) {
  if (!fresh) return null

  return (
    <div className="results">
      <EntryPanel
        entry={fresh}
        title={t.resultTitle}
        action={<Button variant="small">{t.pin}</Button>}
      />
    </div>
  )
}

type EntryPanelProps = {
  entry: Entry
  title: string
  action: ReactNode
}

/**
 * Одна панель результата. Разворачивает слепок в две карточки:
 * ответный удар описывает, что случилось с атакующим, удар по защищающемуся —
 * что случилось с защищающимся. Цвет карточки — цвет той стороны, которая бьёт.
 */
function EntryPanel({ entry, title, action }: EntryPanelProps) {
  const { input, result } = entry
  const hexes = input.ranged ? input.hexes : null

  return (
    <ResultPanel title={title} action={action} single={result.counter === null}>
      {result.counter && (
        <ResultCard
          variant="counter"
          strike={result.counter}
          maxHp={input.attacker.hp}
          breakdown={formatBreakdown(result.counter, input.defender, input.attacker, null)}
        />
      )}
      <ResultCard
        variant="strike"
        strike={result.strike}
        maxHp={input.defender.hp}
        breakdown={formatBreakdown(result.strike, input.attacker, input.defender, hexes)}
      />
    </ResultPanel>
  )
}
