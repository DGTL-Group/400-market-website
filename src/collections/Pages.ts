import type { CollectionConfig } from 'payload'
import type { Block } from 'payload'
import { isAuthenticated } from './access'
import { formatSlug } from './hooks/formatSlug'

/* ─── Content Blocks ─── */

const RichContent: Block = {
  slug: 'richContent',
  labels: {
    singular: 'Rich Content',
    plural: 'Rich Content Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}

const Hero: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero',
    plural: 'Hero Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'CTA Button Label',
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'CTA Button Link',
    },
  ],
}

const ImageGallery: Block = {
  slug: 'imageGallery',
  labels: {
    singular: 'Image Gallery',
    plural: 'Image Galleries',
  },
  fields: [
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
  ],
}

const CallToAction: Block = {
  slug: 'callToAction',
  labels: {
    singular: 'Call to Action',
    plural: 'Call to Action Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Primary (Yellow)', value: 'primary' },
        { label: 'Secondary (Dark)', value: 'secondary' },
      ],
    },
  ],
}

const ContactInfo: Block = {
  slug: 'contactInfo',
  labels: {
    singular: 'Contact Info',
    plural: 'Contact Info Blocks',
  },
  fields: [
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'hours',
      type: 'richText',
      label: 'Hours of Operation',
    },
    {
      name: 'showMap',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Google Map',
    },
    {
      name: 'googleMapsEmbedUrl',
      type: 'text',
      label: 'Google Maps Embed URL',
      admin: {
        condition: (data, siblingData) => siblingData?.showMap === true,
        description: 'Paste the Google Maps embed iframe src URL.',
      },
    },
  ],
}

/* ─── Pages Collection ─── */

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  versions: {
    drafts: true,
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
      name: 'layout',
      type: 'blocks',
      required: true,
      blocks: [RichContent, Hero, ImageGallery, CallToAction, ContactInfo],
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      admin: {
        description: 'Search engine and social sharing metadata.',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Overrides the page title in search results. Leave blank to use the page title.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
          maxLength: 160,
          admin: {
            description: 'Appears in search results. Keep under 160 characters.',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Social Share Image',
          admin: {
            description: 'Image shown when sharing on social media. Recommended: 1200x630px.',
          },
        },
      ],
    },
  ],
}
