import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'sortOrder'],
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'General', value: 'general' },
        { label: 'Hours & Location', value: 'hours' },
        { label: 'Parking', value: 'parking' },
        { label: 'Vendors', value: 'vendors' },
        { label: 'Shopping & Buying', value: 'buying' },
        { label: 'Gift Certificates', value: 'gift-certificates' },
        { label: 'Events', value: 'events' },
        { label: 'Become a Vendor', value: 'become-a-vendor' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within each category.',
      },
    },
  ],
}
