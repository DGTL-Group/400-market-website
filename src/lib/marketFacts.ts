// Single source of truth for market facts used across pages.
// Bump FOUNDED_YEAR only if history changes — "years in business" auto-advances.

export const FOUNDED_YEAR = 1986

export function getYearsInBusiness(): number {
  return new Date().getFullYear() - FOUNDED_YEAR
}
