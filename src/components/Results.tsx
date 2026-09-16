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
  /** панели, которые играют анимацию появления */
  enteringIds: string[]
  /** панели, которые доигрывают анимацию ухода */
  leavingIds: string[]
  onPin: () => void
  onUnpin: (id: string) => void
}

/** Стопка результатов: свежий расчёт сверху, закреплённые под ним. */
export function Results({ fresh, pinned, enteringIds, leavingIds, onPin, onUnpin }: Props) {
  if (!fresh && pinned.length === 0) return null

  // Свежая и закреплённые панели идут одним списком с ключом по id. Если бы
  // свежая рендерилась отдельно от map, то при закреплении React уничтожил бы
  // узел в одном месте и создал в другом — для браузера это новый элемент,
  // и анимация появления играла бы там, где ничего не появилось.
  const panels = [
    ...(fresh ? [{ entry: fresh, isPinned: false }] : []),
    ...pinned.map((entry) => ({ entry, isPinned: true })),
  ]

  return (
    <div className="results">
      {panels.map(({ entry, isPinned }) => (
        <EntryPanel
          key={entry.id}
          entry={entry}
          pinned={isPinned}
          entering={enteringIds.includes(entry.id)}
          leaving={leavingIds.includes(entry.id)}
          title={isPinned ? t.pinnedTitle : t.resultTitle}
          action={
            isPinned ? (
              <Button variant="small" quiet onClick={() => onUnpin(entry.id)}>
                {t.unpin}
              </Button>
            ) : (
              <Button variant="small" onClick={onPin}>
                {t.pin}
              </Button>
            )
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
  entering?: boolean
  leaving?: boolean
}

/**
 * Одна панель результата. Разворачивает запись в две карточки: удар
 * по защищающемуся описывает, что случилось с защищающимся, ответный удар —
 * что случилось с атакующим.
 *
 * Цвет карточки — стороны, которая бьёт. А слепок и таблица — стороны, которая
 * получает: карточка стоит под её панелью, и там же ждёшь увидеть её параметры.
 *
 * Порядок в разметке — порядок чтения: сначала потери защищающегося, потом
 * атакующего. На телефоне карточки так и идут сверху вниз. На ПК они стоят
 * под панелями своих сторон, и ответный удар CSS переносит в левую колонку —
 * взгляд идёт по часовой стрелке: атакующий → защищающийся → его потери
 * → потери атакующего.
 */
function EntryPanel({ entry, title, action, pinned, entering, leaving }: EntryPanelProps) {
  const { input, result } = entry

  return (
    <ResultPanel
      title={title}
      action={action}
      pinned={pinned}
      entering={entering}
      leaving={leaving}
      single={result.counter === null}
    >
      <ResultCard
        variant="strike"
        strike={result.strike}
        maxHp={input.defender.hp}
        snapshot={pinned ? formatSnapshot(input.defender) : undefined}
        breakdown={formatBreakdown(result.strike, input.attacker, input.defender)}
      />

      {result.counter && (
        <ResultCard
          variant="counter"
          strike={result.counter}
          maxHp={input.attacker.hp}
          snapshot={pinned ? formatSnapshot(input.attacker) : undefined}
          breakdown={formatBreakdown(result.counter, input.defender, input.attacker)}
        />
      )}
    </ResultPanel>
  )
}
