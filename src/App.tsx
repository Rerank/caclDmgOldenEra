import arrowIcon from './assets/images/arrow_right.webp'
import swapIcon from './assets/images/swap.svg'
import { AppHeader } from './components/AppHeader'
import { RangedFields } from './components/RangedFields'
import { Results } from './components/Results'
import { UnitSide } from './components/UnitSide'
import { Button } from './components/ui/Button'
import { IconButton } from './components/ui/IconButton'
import { t } from './i18n'
import { useCalculator } from './state/calculator'
import './battle.css'

export function App() {
  const {
    input,
    fresh,
    pinned,
    enteringIds,
    leavingIds,
    patchSide,
    patchAttack,
    selectTemplate,
    swap,
    strike,
    pin,
    unpin,
  } = useCalculator()

  return (
    <div className="page__inner">
      <AppHeader />

      <main className="battle">
        <UnitSide
          role="attacker"
          side={input.attacker}
          onChange={(patch) => patchSide('attacker', patch)}
          onTemplateChange={(templateId) => selectTemplate('attacker', templateId)}
          extra={
            <RangedFields
              ranged={input.ranged}
              rangePenalty={input.rangePenalty}
              onRangedChange={(ranged) => patchAttack({ ranged })}
              onPenaltyChange={(rangePenalty) => patchAttack({ rangePenalty })}
            />
          }
        />

        <div className="battle__swap">
          <IconButton icon={swapIcon} label={t.swapSides} onClick={swap} />
        </div>

        <UnitSide
          role="defender"
          side={input.defender}
          onChange={(patch) => patchSide('defender', patch)}
          onTemplateChange={(templateId) => selectTemplate('defender', templateId)}
        />

        <div className="battle__strike">
          <img className="battle__arrow" src={arrowIcon} alt="" />
          <Button variant="strike" onClick={strike}>
            {t.strike}
          </Button>
        </div>
      </main>

      <Results
        fresh={fresh}
        pinned={pinned}
        enteringIds={enteringIds}
        leavingIds={leavingIds}
        onPin={pin}
        onUnpin={unpin}
      />
    </div>
  )
}
