import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      description: 'Main contact phone number (used in footer and schema)',
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'string',
      description: 'Used for og:description meta tag',
    }),
    defineField({
      name: 'defaultMetaTitle',
      title: 'Default Meta Title',
      type: 'string',
      description: 'Fallback title for SEO (e.g. "Buddas Catering | Premium Hawaiian Corporate Catering Utah")',
    }),
    defineField({
      name: 'defaultMetaDescription',
      title: 'Default Meta Description',
      type: 'string',
      description: 'Fallback meta description for SEO',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
