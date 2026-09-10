import type { SuitePrefill } from "@/components/leasing/suiteEnquiry"

type Listener = (prefill: SuitePrefill) => void

/**
 * A one-way channel from the suite plan to the leasing form.
 *
 * The two live in different client components with a server component
 * between them, so there is no common React ancestor to lift the state
 * into without making the whole leasing page a client component. This is
 * deliberately the smallest thing that works: no context provider wrapping
 * a static page, and no remounting the form via `key`, which would wipe
 * whatever the user had already typed into the other four fields.
 */
export function createEnquiryChannel() {
  const listeners = new Set<Listener>()

  return {
    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    emit(prefill: SuitePrefill): void {
      for (const listener of listeners) listener(prefill)
    },
  }
}

/** The instance the page uses. */
export const enquiryChannel = createEnquiryChannel()
