import type { FieldHook } from 'payload'

/**
 * Auto-generates a URL-safe slug from a source field (e.g. name, title).
 * Only generates if the slug field is empty or the source field changed.
 */
export const formatSlug =
  (sourceField: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    // If a slug was manually entered, respect it (but still sanitize)
    if (typeof value === 'string' && value.length > 0) {
      return sanitizeSlug(value)
    }

    // Auto-generate from source field on create, or if source changed on update
    if (operation === 'create' || (operation === 'update' && data?.[sourceField] !== originalDoc?.[sourceField])) {
      const source = data?.[sourceField]
      if (typeof source === 'string' && source.length > 0) {
        return sanitizeSlug(source)
      }
    }

    return value
  }

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '') // remove smart quotes
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '') // strip non-alphanumeric
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphens
}
