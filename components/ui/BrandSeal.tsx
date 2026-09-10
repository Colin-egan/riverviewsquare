import Image from "next/image"

/**
 * The circle mark set into a solid `river` disc — the site's one repeated
 * brand object, used wherever the mark has to sit on top of photography.
 *
 * The disc is not decoration around the mark, it is what makes the mark
 * usable there at all: public/brand/riverview-square-circle-white.png is a
 * reversed (white-on-transparent) file, so dropped straight onto a daylight
 * rendering it disappears. Giving it its own ground means every placement
 * is the same validated on.river pair the nav and footer already use, no
 * matter what the photograph underneath is doing.
 *
 * alt="" throughout, deliberately: every seal on this site sits within a
 * few elements of the project name in text — the nav wordmark above it, the
 * heading beside it — so an alt would make a screen reader announce
 * "Riverview Square" twice. The mark is chrome here, not content, which is
 * also why it lives in public/brand/ rather than the media registry.
 */
export default function BrandSeal({ className }: { className?: string }) {
  return (
    <span className={className ? `brandseal ${className}` : "brandseal"} aria-hidden="true">
      <Image src="/brand/riverview-square-circle-white.png" alt="" width={532} height={533} />
    </span>
  )
}
