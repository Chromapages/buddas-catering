import { defineField, defineType } from 'sanity'
import { Package } from 'lucide-react'

export const cateringPackage = defineType({
  name: 'cateringPackage',
  title: 'Catering Package',
  type: 'document',
  icon: Package,
  fields: [
    defineField({
      name: 'name',
      title: 'Package Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., Island Buffet Trays, Breakfast Sliders Tray',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catering Bucket',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'e.g., Breakfast Catering, Lunch & Dinner Catering, etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Marketing Description',
      type: 'text',
      rows: 3,
      description: 'A punchy summary of what makes this package great.',
    }),
    defineField({
      name: 'startingAt',
      title: 'Starting Price (for Marketing)',
      type: 'string',
      description: 'e.g., "Starting at $18.50/pp"',
    }),
    defineField({
      name: 'image',
      title: 'Package Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'useCaseLabels',
      title: 'Use Case Labels',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g., "Great for offices", "Event Favorite"',
    }),
    defineField({
      name: 'pricingTier',
      title: 'Pricing Tiers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Tier Label (e.g. Small)', validation: (Rule) => Rule.required() },
            { name: 'range', type: 'string', title: 'Headcount Range (e.g. 10-15 people)', validation: (Rule) => Rule.required() },
            { name: 'price', type: 'number', title: 'Price', validation: (Rule) => Rule.required() },
          ],
        },
      ],
    }),
    defineField({
      name: 'includedItems',
      title: 'Included Items',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'menuItem' }] }],
      description: 'The standard items that come with this package.',
    }),
    defineField({
      name: 'modifiers',
      title: 'Selectable Options / Upgrades',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'modifier' }] }],
      description: 'Link choices like "Select Protein" or "Upgrade to Fried Rice"',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Hidden', value: 'hidden' },
          { title: 'Sold Out', value: 'soldOut' },
        ],
      },
      initialValue: 'active',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category.title',
      media: 'image',
    },
  },
})
