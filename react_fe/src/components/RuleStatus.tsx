type RuleStatusProps = {
  uniqueSpeciesCount: number
  totalWeight: number
}

const MIN_SPECIES = 3
const MAX_WEIGHT = 1300

export function RuleStatus({ uniqueSpeciesCount, totalWeight }: RuleStatusProps) {
  const speciesOk = uniqueSpeciesCount >= MIN_SPECIES
  const weightOk = totalWeight <= MAX_WEIGHT

  return (
    <section className="panel rule-panel" aria-label="List rule validation">
      <h3>Rule Check</h3>
      <ul className="rule-list">
        <li className={speciesOk ? 'ok' : 'bad'}>
          <span>At least {MIN_SPECIES} different species</span>
          <strong>{uniqueSpeciesCount}</strong>
        </li>
        <li className={weightOk ? 'ok' : 'bad'}>
          <span>Total weight must be ≤ {MAX_WEIGHT}</span>
          <strong>{totalWeight}</strong>
        </li>
      </ul>
    </section>
  )
}