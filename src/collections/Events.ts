import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'
import { formatSlug } from './hooks/formatSlug'
import {
  revalidateContentAfterChange,
  revalidateContentAfterDelete,
} from './hooks/revalidateContent'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'startDate', 'recurring'],
  },
  defaultSort: '-startDate',
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  versions: {
    drafts: true,
  },
  // Bust the ISR cache instantly on every admin edit / create / delete so
  // the listing and detail pages reflect changes without waiting for the
  // 1-hour revalidate window. See ./hooks/revalidateContent.ts.
  hooks: {
    afterChange: [revalidateContentAfterChange({ basePath: 'events' })],
    afterDelete: [revalidateContentAfterDelete({ basePath: 'events' })],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      label: 'Event Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from name.',
      },
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      index: true,
      label: 'Start Date & Time',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date & Time',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Leave blank for single-day events.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      label: 'Event Description',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      admin: {
        description: 'Where within the market (e.g. "Main Hall", "Outdoor Lot"). Defaults to market address if blank.',
      },
    },
    {
      name: 'recurring',
      type: 'checkbox',
      defaultValue: false,
      label: 'Recurring Event',
    },
    {
      name: 'recurrenceNote',
      type: 'text',
      label: 'Recurrence Pattern',
      admin: {
        description: 'e.g. "Every Saturday", "First Sunday of each month".',
        condition: (data) => data?.recurring === true,
      },
    },
  ],
}
