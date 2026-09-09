import RiverRule from "@/components/ui/RiverRule"

type Props = {
  eyebrow?: React.ReactNode
  heading?: string
  /**
   * A page needs exactly one h1. Section renders h2 by default since most
   * sections are secondary content; a page's lead Section passes
   * headingLevel={1} to carry the page's one h1 instead of introducing a
   * separate heading element just for that.
   */
  headingLevel?: 1 | 2
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
  headingLevel = 2,
  tone = "paper",
  fullBleed = false,
  divider = false,
  children,
}: Props) {
  const Heading = headingLevel === 1 ? "h1" : "h2"
  return (
    <section className="band" data-tone={tone} data-bleed={fullBleed}>
      {divider && <RiverRule />}
      <div className="band__inner">
        {eyebrow && <p className="eyebrow band__eyebrow">{eyebrow}</p>}
        {heading && <Heading>{heading}</Heading>}
        {children}
      </div>
    </section>
  )
}
