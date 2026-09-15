import { useState } from 'react'
import arrowIcon from './assets/images/arrow_right.webp'
import swapIcon from './assets/images/swap.svg'
import { AppHeader } from './components/AppHeader'
import { RangedFields } from './components/RangedFields'
import { ResultCard } from './components/ResultCard'
import { ResultPanel } from './components/ResultPanel'
import { UnitSide } from './components/UnitSide'
import { Button } from './components/ui/Button'
import { IconButton } from './components/ui/IconButton'
import type { Input, Outcome, Side, Strike } from './domain/types'
import { t } from './i18n'
import './battle.css'

/* ────────────────────────────────────────────────────────────────────────
   Этап 2: настоящего состояния и расчёта ещё нет.
   Цифры ниже повторяют temp/html/index.html, чтобы страницу можно было
   сверить с вёрсткой один в один. Параметры сторон держит локальный
   useState — иначе поля нечем проверить. На этапе 3 этот блок целиком
   заменит useCalculator(), на этапе 4 — настоящий calculate().
   ──────────────────────────────────────────────────────────────────────── */

const MOCK_INPUT: Input = {
  attacker: {
    templateId: 'custom',
    hp: 35,
    attack: 10,
    defense: 12,
    damageMin: 7,
    damageMax: 9,
    count: 10,
    heroAttack: 4,
    heroDefense: 3,
    outgoing: 25,
    incoming: 0,
  },
  defender: {
    templateId: 'custom',
    hp: 25,
    attack: 8,
    defense: 8,
    damageMin: 3,
    damageMax: 6,
    count: 8,
    heroAttack: 2,
    heroDefense: 5,
    outgoing: 0,
    incoming: 0,
  },
  ranged: true,
  hexes: 2,
}

const outcome = (damage: number, killed: number, survived: number, topHp: number): Outcome => ({
  damage,
  killed,
  survived,
  topHp,
})

const MOCK_FRESH_COUNTER: Strike = {
  min: outcome(15, 1, 4, 5),
  max: outcome(15, 1, 4, 5),
  avg: outcome(15, 1, 4, 5),
  countMin: 8,
  countMax: 8,
  attack: 8,
  defense: 12,
  rangePenalty: 0,
}

const MOCK_FRESH_STRIKE: Strike = {
  min: outcome(25, 2, 3, 5),
  max: outcome(25, 2, 3, 5),
  avg: outcome(25, 2, 3, 5),
  countMin: 10,
  countMax: 10,
  attack: 10,
  defense: 8,
  rangePenalty: 0,
}

const MOCK_PINNED_COUNTER: Strike = {
  min: outcome(22, 2, 8, 4),
  max: outcome(28, 3, 7, 1),
  avg: outcome(25, 2, 8, 3),
  countMin: 6,
  countMax: 6,
  attack: 12,
  defense: 12,
  rangePenalty: 0,
}

const MOCK_PINNED_STRIKE: Strike = {
  min: outcome(31, 3, 3, 7),
  max: outcome(40, 4, 2, 2),
  avg: outcome(36, 3, 3, 4),
  countMin: 10,
  countMax: 10,
  attack: 10,
  defense: 9,
  rangePenalty: 0,
}

export function App() {
  const [input, setInput] = useState<Input>(MOCK_INPUT)

  const patchSide = (role: 'attacker' | 'defender', patch: Partial<Side>) =>
    setInput((current) => ({ ...current, [role]: { ...current[role], ...patch } }))

  return (
    <div className="page__inner">
      <AppHeader />

      <main className="battle">
        <UnitSide
          role="attacker"
          side={input.attacker}
          onChange={(patch) => patchSide('attacker', patch)}
          extra={
            <RangedFields
              ranged={input.ranged}
              hexes={input.hexes}
              onRangedChange={(ranged) => setInput((current) => ({ ...current, ranged }))}
              onHexesChange={(hexes) => setInput((current) => ({ ...current, hexes }))}
            />
          }
        />

        <div className="battle__swap">
          <IconButton icon={swapIcon} label={t.swapSides} />
        </div>

        <UnitSide
          role="defender"
          side={input.defender}
          onChange={(patch) => patchSide('defender', patch)}
        />

        <div className="battle__strike">
          <img className="battle__arrow" src={arrowIcon} alt="" />
          <Button variant="strike">{t.strike}</Button>
        </div>
      </main>

      <div className="results">
        <ResultPanel title={t.resultTitle} action={<Button variant="small">{t.pin}</Button>}>
          <ResultCard
            variant="counter"
            strike={MOCK_FRESH_COUNTER}
            maxHp={10}
            breakdown="8 шт × 3–6 урона × (20 + 8) / (20 + 12) · увел. исх. 0% · умен. вх. 0%"
          />
          <ResultCard
            variant="strike"
            strike={MOCK_FRESH_STRIKE}
            maxHp={10}
            breakdown="10 шт × 7–9 урона × (20 + 10) / (20 + 8) · увел. исх. 25% · умен. вх. 0%"
          />
        </ResultPanel>

        <ResultPanel
          title={t.pinnedTitle}
          pinned
          action={
            <Button variant="small" quiet>
              {t.unpin}
            </Button>
          }
        >
          <ResultCard
            variant="counter"
            strike={MOCK_PINNED_COUNTER}
            maxHp={10}
            snapshot="Свой · HP 30 · атака 12 · защ. 9 · урон 5–8 · 6 шт · исх. +0% · вх. −10%"
            breakdown="6 шт × 5–8 урона × (20 + 12) / (20 + 12) · увел. исх. 0% · умен. вх. 0%"
          />
          <ResultCard
            variant="strike"
            strike={MOCK_PINNED_STRIKE}
            maxHp={10}
            snapshot="Свой · HP 35 · атака 10 · защ. 12 · урон 7–9 · 10 шт · исх. +25% · вх. −0%"
            breakdown="10 шт × 7–9 урона × (20 + 10) / (20 + 9) · увел. исх. 25% · умен. вх. 10%"
          />
        </ResultPanel>
      </div>
    </div>
  )
}
