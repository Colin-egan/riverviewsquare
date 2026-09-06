export type Stat = { value: string; label: string }

/**
 * Project numbers as a description list, not a grid of divs: the value/label
 * relationship is real semantics and a screen reader should get it.
 */
export default function StatRow({ items }: { items: Stat[] }) {
  return (
    <dl className="stats">
      {items.map(({ value, label }) => (
        <div key={label} className="stats__item">
          <dt className="eyebrow stats__label">{label}</dt>
          <dd className="stats__value">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
