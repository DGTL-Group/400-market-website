import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'

/**
 * Booths — the physical market stalls, one record per booth.
 *
 * This collection is the source of truth for booth state on the website.
 * External CRM (Frappe or Twenty) pushes updates through n8n → the
 * `/api/webhooks/crm-booth-update` endpoint, which upserts records here.
 *
 * Status semantics:
 *   available — open for new vendor applications
 *   reserved  — held for an incoming vendor (paid invoice, moving in soon).
 *               May or may not have a vendor relation yet.
 *   rented    — occupied. MUST have a vendor relation.
 *   blocked   — permanent non-bookable (storage, admin, fire lane).
 *               Set manually, never touched by the CRM webhook.
 *
 * Multi-booth vendors are expressed through the `vendor` relation alone —
 * two booths sharing the same vendor ARE a linked pair. We do NOT store a
 * separate `linkedGroup` field (that would be a second source of truth).
 *
 * For vendor-less reserved spans (rare: e.g. 3 booths held together while
 * negotiation is in progress), use `reservationGroup` — only then.
 */
export const Booths: CollectionConfig = {
  slug: 'booths',
  admin: {
    useAsTitle: 'boothNumber',
    defaultColumns: ['boothNumber', 'status', 'vendor', 'reservedUntil', 'lastSyncedAt'],
    listSearchableFields: ['boothNumber', 'crmId', 'notes'],
    description:
      'Auto-synced from the CRM via n8n. Management should edit in the CRM, not here. Use this view for diagnosis only.',
  },
  access: {
    read: () => true, // public — the floor plan needs it
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'boothNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Booth Number',
      admin: {
        description: 'Must match the booth number in the CRM exactly (e.g. "1804").',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Rented', value: 'rented' },
        { label: 'Blocked (permanent)', value: 'blocked' },
      ],
      admin: {
        description:
          'Available = open for rent. Reserved = moving in soon. Rented = occupied. Blocked = permanent non-bookable, set manually.',
      },
    },
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      label: 'Vendor',
      admin: {
        description:
          'Required when status is Rented. Multiple booths pointing at the same vendor = linked booths.',
        condition: (data) => data?.status === 'rented' || data?.status === 'reserved',
      },
    },
    {
      name: 'crmId',
      type: 'text',
      unique: true,
      index: true,
      label: 'CRM Record ID',
      admin: {
        position: 'sidebar',
        description:
          'Opaque ID from Frappe / Twenty. Decoupled from booth number so CRM renames do not break sync.',
      },
    },
    {
      name: 'reservationGroup',
      type: 'text',
      label: 'Reservation Group',
      admin: {
        description:
          'Optional. Only used when multiple booths are reserved together WITHOUT a vendor yet. For vendor-backed links, leave blank (the vendor relation does that job).',
        condition: (data) => data?.status === 'reserved' && !data?.vendor,
      },
    },
    {
      name: 'reservedUntil',
      type: 'date',
      label: 'Reserved Until',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => data?.status === 'reserved',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Free-form notes. CRM can pass anything worth logging.',
      },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      label: 'Last Synced',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Stamped by the webhook on every update. For debugging stale records.',
      },
    },
  ],
}
