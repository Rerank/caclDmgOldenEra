import type { ReactNode } from 'react'
import type { Entry } from '../domain/types'
import { t } from '../i18n'
import { formatBreakdown, formatSnapshot } from './format'
import { ResultCard } from './ResultCard'
import { ResultPanel } from './ResultPanel'
import { Button } from './ui/Button'

type Props = {
  fresh: Entry | null
  pinned: Entry[]
  onPin: () => void
  onUnpin: (id: string) => void
}

/** Стопка результатов: свежий расчёт сверху, закреплённые под ним. */
export function Results({ fresh, pinned, onPin, onUnpin }: Props) {
  if (!fresh && pinned.length === 0) return null

  return (
    <div className="results">
      {fresh && (
        <EntryPanel
          entry={fresh}
          title={t.resultTitle}
          action={
            <Button variant="small" onClick={onPin}>
              {t.pin}
            </Button>
          }
        />
      )}

      {pinned.map((entry) => (
        <EntryPanel
          key={entry.id}
          entry={entry}
          pinned
          title={t.pinnedTitle}
          action={
            <Button variant="small" quiet onClick={() => onUnpin(entry.id)}>
              {t.unpin}
            </Button>
          }
        />
      ))}
    </div>
  )
}

type EntryPanelProps = {
  entry: Entry
  title: string
  action: ReactNode
  /** закреплённый результат: у него показываем слепок параметров */
  pinned?: boolean
}

/**
 * Одна панель результата. Разворачивает запись в две карточки: ответный удар
 * описывает, что случилось с атакующим, удар по защищающемуся — что случилось
 * с защищающимся. Цвет карточки и её слепок — той стороны, которая бьёт.
 */
function EntryPanel({ entry, title, action, pinned }: EntryPanelProps) {
  const { input, result } = entry
  const hexes = input.ranged ? input.hexes : null

  return (
    <ResultPanel title={title} action={action} pinned={pinned} single={result.counter === null}>
      {result.counter && (
        <ResultCard
          variant="counter"
          strike={result.counter}
          maxHp={input.attacker.hp}
          snapshot={pinned ? formatSnapshot(input.defender) : undefined}
          breakdown={formatBreakdown(result.counter, input.defender, input.attacker, null)}
        />
      )}

      <ResultCard
        variant="strike"
        strike={result.strike}
        maxHp={input.defender.hp}
        snapshot={pinned ? formatSnapshot(input.attacker) : undefined}
        breakdown={formatBreakdown(result.strike, input.attacker, input.defender, hexes)}
      />
    </ResultPanel>
  )
}
