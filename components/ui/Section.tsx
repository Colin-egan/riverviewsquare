import RiverRule from "@/components/ui/RiverRule"

type Props = {
  eyebrow?: string
  heading?: string
  /** "paper" is the default ground; "ink" and "limestone" break up the scroll. */
  tone?: "paper" | "ink" | "limestone"
  /** Full-bleed bands hold imagery edge to edge; the default constrains to the grid. */
  fullBleed?: boolean
  divider?: boolean
  children: React.ReactNode
}

export default function Section({
  eyebrow,
  heading,
  tone = "paper",
  fullBleed = false,
  divider = false,
  children,
}: Props) {
  return (
    <section className="band" data-tone={tone} data-bleed={fullBleed}>
      {divider && <RiverRule />}
      <div className="band__inner">
        {eyebrow && <p className="eyebrow band__eyebrow">{eyebrow}</p>}
        {heading && <h2>{heading}</h2>}
        {children}
      </div>
    </section>
  )
}
