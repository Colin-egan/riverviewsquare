import { partners, type Partner } from "@/content/partners"

export function getPartners(): Partner[] {
  return partners
}

export type { Partner }
