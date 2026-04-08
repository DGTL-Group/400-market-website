import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Builds Payload `afterChange` + `afterDelete` hooks that bust Next.js's
 * ISR cache for a content collection's listing and detail pages.
 *
 * Why both `afterChange` AND `afterDelete`:
 *   - afterChange covers create + update (new posts, edits, slug changes)
 *   - afterDelete covers removals (so deleted posts disappear from the
 *     listing immediately instead of lingering in cache for an hour)
 *
 * On a slug change, we revalidate BOTH the new and the old slug paths so
 * the old URL doesn't get stuck serving stale content forever. The old
 * slug lives on `previousDoc` during afterChange.
 *
 * Why a hook factory: Events and News are structurally identical from a
 * cache perspective — same listing path, same `[slug]` detail pattern —
 * so wrap the boilerplate in a builder and let each collection just call
 * `revalidateContent('events')` / `revalidateContent('news')`.
 */

type RevalidateConfig = {
  /** The route segment used in the URL — e.g. 'events' or 'news'. */
  basePath: 'events' | 'news'
}

export function revalidateContentAfterChange({
  basePath,
}: RevalidateConfig): CollectionAfterChangeHook {
  return ({ doc, previousDoc }) => {
    // Refresh the listing page so the change shows up in the archive.
    revalidatePath(`/${basePath}`)

    // Refresh the detail page for the new slug.
    if (typeof doc?.slug === 'string' && doc.slug.length > 0) {
      revalidatePath(`/${basePath}/${doc.slug}`)
    }

    // If the slug changed, also bust the old URL so it doesn't keep
    // serving the pre-rename content.
    if (
      typeof previousDoc?.slug === 'string' &&
      previousDoc.slug.length > 0 &&
      previousDoc.slug !== doc?.slug
    ) {
      revalidatePath(`/${basePath}/${previousDoc.slug}`)
    }

    return doc
  }
}

export function revalidateContentAfterDelete({
  basePath,
}: RevalidateConfig): CollectionAfterDeleteHook {
  return ({ doc }) => {
    revalidatePath(`/${basePath}`)
    if (typeof doc?.slug === 'string' && doc.slug.length > 0) {
      revalidatePath(`/${basePath}/${doc.slug}`)
    }
    return doc
  }
}
