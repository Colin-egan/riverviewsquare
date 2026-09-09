import { tenants, type Tenant } from "@/content/tenants"

export function getTenants(): Tenant[] {
  return tenants
}

export type { Tenant }
