import type { CollectionConfig } from 'payload'
import { isAuthenticated } from './access'
import { formatSlug } from './hooks/formatSlug'

export const Vendors: CollectionConfig = {
  slug: 'vendors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'boothNumber', 'category', 'active'],
    listSearchableFields: ['name', 'boothNumber'],
  },
  access: {
    read: () => true, // public — filtered by active on frontend
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Business Name',
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
        description: 'Auto-generated from name. Edit to customise the URL.',
      },
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
    },
    {
      name: 'boothNumber',
      type: 'text',
      required: true,
      index: true,
      label: 'Booth Number',
      admin: {
        description: 'Booth or stall identifier (e.g. "A12", "B3").',
      },
    },
    {
      name: 'category',
      type: 'select',
      hasMany: true,
      required: true,
      index: true,
      options: [
        { label: 'Antiques', value: 'antiques' },
        { label: 'Collectibles', value: 'collectibles' },
        { label: 'Clothing & Accessories', value: 'clothing' },
        { label: 'Food & Beverages', value: 'food' },
        { label: 'Home Decor', value: 'home-decor' },
        { label: 'Jewelry', value: 'jewelry' },
        { label: 'Arts & Crafts', value: 'crafts' },
        { label: 'Electronics', value: 'electronics' },
        { label: 'Books & Media', value: 'books' },
        { label: 'Health & Beauty', value: 'health-beauty' },
        { label: 'Sports & Outdoors', value: 'sports' },
        { label: 'Toys & Games', value: 'toys' },
        { label: 'Services', value: 'services' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
      maxLength: 300,
      admin: {
        description: '1-3 sentences for the vendor directory listing.',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Contact Email',
      admin: {
        description: 'Internal use — not displayed publicly unless opted in.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Vendor Photo',
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      admin: {
        description: 'Add links to the vendor\'s social media profiles.',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'Profile URL',
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
      label: 'Active',
      admin: {
        position: 'sidebar',
        description: 'Only active vendors appear on the public site.',
      },
    },
  ],
}
