import { project, type Project } from "@/content/project"

/**
 * The only permitted read path for project facts. Pages import this, never
 * content/project.ts directly, so the source can move to a CMS without
 * touching a component.
 */
export function getProject(): Project {
  return project
}

export type { Project }
