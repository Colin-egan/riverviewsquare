"use client"

import Image from "next/image"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { getMedia } from "@/lib/data/media"
import type { MediaId } from "@/lib/data/media"

export type DriftWallItem = {
  id: MediaId
}

type Props = {
  items: readonly DriftWallItem[]
  columns?: number
  tileWidth?: number
  tileHeight?: number
  gap?: number
  radius?: number
  tilt?: number
  turn?: number
  roll?: number
  perspective?: number
  depth?: number
  speed?: number
  direction?: "up" | "down"
  variance?: number
  parallax?: number
  pauseOnHover?: boolean
  lift?: number
  fade?: number
  className?: string
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

const columnFactor = (index: number, variance: number) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1
  return 1 + variance * pseudo
}

/**
 * A drifting, parallaxed wall of photographs. Every tile is a duplicate copy
 * of a handful of source photographs repeated down each column so the loop
 * is seamless, so it stays out of the tab order and the accessibility tree
 * — alt is empty on every tile and the container is aria-hidden — but a
 * click still opens the full photograph in a lightbox, since that is a
 * plain pointer affordance rather than something a screen reader user needs
 * a tab stop for. The real, single copy of each photograph's credit lives in
 * the caption list a caller renders below the wall (see the home page's
 * neighbourhood section) and in the lightbox itself once a photo is open —
 * that is the reachable, once-per-photo version of the same information.
 */
export default function DriftWall({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number | null>(null)

  const offsetsRef = useRef<number[]>([])
  const velocitiesRef = useRef<number[]>([])
  const hoveredColRef = useRef(-1)
  const wallHoveredRef = useRef(false)
  const pointerRef = useRef({ x: 0, y: 0 })
  const pointerDampedRef = useRef({ x: 0, y: 0 })
  const lastTsRef = useRef<number | null>(null)

  const [containerHeight, setContainerHeight] = useState(600)
  const [reduced, setReduced] = useState(false)
  const [openId, setOpenId] = useState<MediaId | null>(null)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Spreads getMedia's result but keeps `id` as the literal MediaId from
  // `items` rather than the widened `string` the MediaItem schema declares,
  // so a tile click can hand setOpenId a type it actually accepts.
  const media = useMemo(() => items.map((item) => ({ ...getMedia(item.id), id: item.id })), [items])

  const columnItems = useMemo(() => {
    const cols: (typeof media)[] = Array.from({ length: columns }, () => [])
    media.forEach((item, i) => cols[i % columns].push(item))
    return cols.map((col) => (col.length ? col : media.slice(0, 1)))
  }, [media, columns])

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap
    return columnItems.map((col) => {
      const copyHeight = Math.max(unit, col.length * unit)
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1)
      return { copyHeight, copies }
    })
  }, [columnItems, tileHeight, gap, containerHeight])

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 600)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const baseVelocities = useMemo(() => {
    const dirSign = direction === "up" ? 1 : -1
    return columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1
      return speed * columnFactor(c, variance) * dirSign * altSign
    })
  }, [columnItems, speed, direction, variance])

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1))
    velocitiesRef.current = columnItems.map(() => 0)
  }, [columnMeta, columnItems])

  const applyPlaneTransform = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current
      if (!plane) return
      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`
    },
    [tilt, turn, roll, depth],
  )

  useEffect(() => {
    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts
      const dt = Math.min(0.05, Math.max(0, ts - lastTsRef.current) / 1000)
      lastTsRef.current = ts

      const maxTilt = parallax * 8
      const targetX = pointerRef.current.x * maxTilt
      const targetY = -pointerRef.current.y * maxTilt
      const damp = 1 - Math.exp(-dt / 0.12)
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y)

      if (!reduced) {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const meta = columnMeta[c]
          if (!meta) continue
          const paused = wallHoveredRef.current && pauseOnHover
          const factor = paused || hoveredColRef.current === c ? 0 : 1
          const target = baseVelocities[c] * factor

          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28))
          velocitiesRef.current[c] += (target - velocitiesRef.current[c]) * ease
          let next = (offsetsRef.current[c] ?? 0) + velocitiesRef.current[c] * dt
          next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight
          offsetsRef.current[c] = next

          const el = trackRefs.current[c]
          if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`
        }
      } else {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const el = trackRefs.current[c]
          const meta = columnMeta[c]
          if (el && meta) el.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, applyPlaneTransform])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      if (parallax > 0 && !reduced) {
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        }
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY)
      const tile = hit?.closest<HTMLElement>("[data-col]")
      hoveredColRef.current = tile ? Number(tile.dataset.col) : -1
    },
    [parallax, reduced],
  )

  const handlePointerLeaveWall = useCallback(() => {
    wallHoveredRef.current = false
    pointerRef.current = { x: 0, y: 0 }
    hoveredColRef.current = -1
  }, [])

  const cssVars = useMemo(
    () =>
      ({
        "--dw-tile-w": `${tileWidth}px`,
        "--dw-tile-h": `${tileHeight}px`,
        "--dw-gap": `${gap}px`,
        "--dw-radius": `${radius}px`,
        "--dw-perspective": `${perspective}px`,
        "--dw-lift": `${lift}px`,
        "--dw-edge": `${Math.max(0, (1 - fade) * 100)}%`,
      }) as React.CSSProperties,
    [tileWidth, tileHeight, gap, radius, perspective, lift, fade],
  )

  const rootClass = ["drift-wall", reduced ? "drift-wall--reduced" : "", className].filter(Boolean).join(" ")
  const openItem = openId ? getMedia(openId) : null

  return (
    <>
      <div
        ref={containerRef}
        className={rootClass}
        style={cssVars}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => {
          wallHoveredRef.current = true
        }}
        onPointerLeave={handlePointerLeaveWall}
        aria-hidden="true"
      >
        <div ref={planeRef} className="drift-wall__plane">
          {columnItems.map((col, c) => {
            const meta = columnMeta[c]
            const copies = Array.from({ length: meta.copies })
            return (
              <div className="drift-wall__col" key={`col-${c}`}>
                <div
                  className="drift-wall__track"
                  ref={(el) => {
                    trackRefs.current[c] = el
                  }}
                >
                  {copies.map((_, copyIndex) =>
                    col.map((item, itemIndex) => (
                      <div
                        className="drift-wall__tile"
                        data-col={c}
                        key={`${c}-${copyIndex}-${itemIndex}`}
                        onClick={() => setOpenId(item.id)}
                      >
                        <span className="drift-wall__inner">
                          <Image src={item.src} alt="" fill sizes={`${tileWidth}px`} draggable={false} />
                        </span>
                      </div>
                    )),
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {openItem && <DriftWallLightbox item={openItem} onClose={() => setOpenId(null)} />}
    </>
  )
}

/**
 * The full-size view a tile opens into. Rendered as a sibling of .drift-wall
 * rather than inside it: that ancestor sets `perspective`, and CSS spec makes
 * `perspective` (like `transform`) establish a containing block for
 * position:fixed descendants, which would pin this to the wall's box instead
 * of the viewport.
 */
function DriftWallLightbox({ item, onClose }: { item: ReturnType<typeof getMedia>; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div
      className="driftwall-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
    >
      <button type="button" className="driftwall-lightbox__close" onClick={onClose} autoFocus>
        Close
      </button>
      <figure className="driftwall-lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          sizes="92vw"
          className="driftwall-lightbox__img"
          priority
        />
        {(item.credit || item.license) && (
          <figcaption className="driftwall-lightbox__caption">
            {item.credit}
            {item.license && (
              <>
                <a href={item.license.source}>{item.license.author}</a>
                {" · "}
                {item.license.url ? <a href={item.license.url}>{item.license.name}</a> : item.license.name}
              </>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

/**
 * The photograph credits for a DriftWall — the one place its tiles'
 * attribution is actually reachable, since the wall itself is aria-hidden
 * and every tile's alt is empty (see the component doc above). Takes the
 * same `items` list, so there is one source of truth for which photographs
 * are on the wall and one place their licences are declared: content/media.ts.
 */
export function DriftWallCredits({ items }: { items: readonly DriftWallItem[] }) {
  const credits = useMemo(() => {
    const seen = new Set<string>()
    const out: { id: string; author: string; source: string }[] = []
    for (const item of items) {
      const media = getMedia(item.id)
      if (media.license && !seen.has(media.id)) {
        seen.add(media.id)
        out.push({ id: media.id, author: media.license.author, source: media.license.source })
      }
    }
    return out
  }, [items])

  if (credits.length === 0) return null

  return (
    <p className="driftwall-credits">
      Photographs:{" "}
      {credits.map((credit, i) => (
        <span key={credit.id}>
          <a href={credit.source}>{credit.author}</a>
          {i < credits.length - 1 ? " · " : ""}
        </span>
      ))}
      {" — licensed via Wikimedia Commons."}
    </p>
  )
}
