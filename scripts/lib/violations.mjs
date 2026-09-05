// Serious and critical block a deploy. Moderate and minor are reported and
// pass. An unrecognised impact blocks: a gate that fails safe is the only kind
// worth having.
const BLOCKING = new Set(["serious", "critical"])
const ADVISORY = new Set(["moderate", "minor"])

export function partitionViolations(violations) {
  const blocking = []
  const advisory = []
  for (const violation of violations) {
    if (ADVISORY.has(violation.impact)) advisory.push(violation)
    else blocking.push(violation)
  }
  return { blocking, advisory }
}

export { BLOCKING, ADVISORY }
