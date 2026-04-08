import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'
import { formatSlug } from './hooks/formatSlug'
import {
  revalidateContentAfterChange,
  revalidateContentAfterDelete,
} from './hooks/revalidateContent'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishDate', 'author'],
  },
  defaultSort: '-publishDate',
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
    afterChange: [revalidateContentAfterChange({ basePath: 'news' })],
    afterDelete: [revalidateContentAfterDelete({ basePath: 'news' })],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from title.',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Post Content',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 200,
      label: 'Excerpt',
      admin: {
        description: 'Short summary for the archive listing and social sharing.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Author',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      index: true,
      label: 'Publish Date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      index: true,
      options: [
        { label: 'Filter 1', value: 'filter1' },
        { label: 'Filter 2', value: 'filter2' },
        { label: 'Filter 3', value: 'filter3' },
        { label: 'Filter 4', value: 'filter4' },
        { label: 'Filter 5', value: 'filter5' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
