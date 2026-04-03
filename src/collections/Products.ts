import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'
import { formatSlug } from './hooks/formatSlug'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'priceDisplay', 'active'],
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      label: 'Product Name',
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
      name: 'description',
      type: 'richText',
      label: 'Product Description',
    },
    {
      name: 'priceDisplay',
      type: 'text',
      required: true,
      label: 'Display Price',
      admin: {
        description: 'Human-readable price (e.g. "$5.00"). Actual pricing is managed in Stripe.',
      },
    },
    {
      name: 'stripeProductId',
      type: 'text',
      required: true,
      index: true,
      label: 'Stripe Product ID',
      admin: {
        description: 'Copy from the Stripe Dashboard (e.g. "prod_xxxxx"). Do not edit after initial setup.',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      required: true,
      label: 'Stripe Price ID',
      admin: {
        description: 'Copy from the Stripe Dashboard (e.g. "price_xxxxx"). Used to create Checkout sessions.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Product Image',
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      label: 'Active',
      admin: {
        position: 'sidebar',
        description: 'Only active products appear in the shop.',
      },
    },
  ],
}
