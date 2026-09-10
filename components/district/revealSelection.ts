type Edges = { top: number; bottom: number }

/**
 * Pure. How far a scroller must move so `item` is visible inside `view`.
 *
 * Both are viewport-space edge pairs, i.e. what getBoundingClientRect gives
 * you, so the same maths serves an overflow container and the window. A
 * positive result scrolls down, negative up, and 0 means leave it alone —
 * scrolling an already-visible entry is motion the reader did not ask for.
 *
 * `margin` insets the target so the revealed item does not sit flush against
 * the edge of the scroller with its neighbours cut off mid-word.
 */
export function scrollDeltaToReveal(view: Edges, item: Edges, margin = 0): number {
  const top = view.top + margin
  const bottom = view.bottom - margin

  if (item.top >= top && item.bottom <= bottom) return 0

  // An entry taller than the scroller can never fit. Once it covers the view
  // there is nothing to reveal, and moving it would only swap which part of
  // an already-visible item is on screen.
  if (item.top <= view.top && item.bottom >= view.bottom) return 0

  // Still taller than the view, just not covering it yet. Bottom-aligning
  // would drop the reader into the middle of the entry, past the name they
  // clicked; its top edge is the part worth showing.
  if (item.bottom - item.top > bottom - top) return item.top - top

  if (item.top < top) return item.top - top
  return item.bottom - bottom
}

/** The nearest ancestor that actually scrolls vertically, or null for none. */
function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const overflowY = getComputedStyle(node).overflowY
    const scrolls = overflowY === "auto" || overflowY === "scroll"
    if (scrolls && node.scrollHeight > node.clientHeight) return node
  }
  return null
}

/**
 * Bring `item` into view, moving as little as possible.
 *
 * Deliberately not element.scrollIntoView: that walks every scrollable
 * ancestor and, on the district page, drags the whole document around when
 * all that needed to move was the amenity list beside the map.
 *
 * The list is a capped scroller on wide screens and plain page content on
 * narrow ones (see .explorer__list in globals.css), so both cases have to
 * work — falling back to the window is what makes a pin tap visible on a
 * phone, where the list has no scrollbar of its own.
 */
export function revealItem(item: HTMLElement, margin = 12): void {
  const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth"
  const itemEdges = item.getBoundingClientRect()

  const container = scrollParent(item)
  if (container) {
    const delta = scrollDeltaToReveal(container.getBoundingClientRect(), itemEdges, margin)
    if (delta !== 0) container.scrollBy({ top: delta, behavior })
    return
  }

  const delta = scrollDeltaToReveal({ top: 0, bottom: window.innerHeight }, itemEdges, margin)
  if (delta !== 0) window.scrollBy({ top: delta, behavior })
}
