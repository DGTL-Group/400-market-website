import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'

/**
 * SyncErrors — audit log for CRM webhook payloads that could not be
 * matched to an existing booth (unknown booth number, unknown crmId, etc).
 *
 * The webhook does NOT auto-create booths on mismatch — a typo in the CRM
 * would silently pollute the floor plan. Instead we log here and let DGTL
 * review. Unresolved errors surface in the admin sidebar badge count.
 */
export const SyncErrors: CollectionConfig = {
  slug: 'sync-errors',
  labels: {
    singular: 'Sync Error',
    plural: 'Sync Errors',
  },
  admin: {
    useAsTitle: 'reason',
    defaultColumns: ['reason', 'source', 'timestamp', 'resolved'],
    description:
      'CRM webhook payloads that could not be matched. Resolve by fixing the CRM record (typo, missing booth) or escalating to DGTL.',
  },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  defaultSort: '-timestamp',
  fields: [
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'webhook',
      options: [
        { label: 'CRM Webhook', value: 'webhook' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'reason',
      type: 'text',
      required: true,
      label: 'Reason',
      admin: {
        description: 'Short summary, e.g. "booth number 9999 not found".',
      },
    },
    {
      name: 'payload',
      type: 'json',
      label: 'Raw Payload',
      admin: {
        description: 'The body we received. For forensic review.',
      },
    },
    {
      name: 'resolved',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: 'Resolved',
      admin: {
        position: 'sidebar',
        description: 'Check when the underlying issue is fixed (CRM updated, booth added, etc).',
      },
    },
  ],
}
