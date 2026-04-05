import { defineField, defineType } from 'sanity'
import { Utensils } from 'lucide-react'

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  icon: Utensils,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'priceTitle',
      title: 'Price Section Title',
      type: 'string',
      initialValue: 'Price',
      description: 'e.g., "Starting at", "Package Price", etc.',
    }),
    defineField({
      name: 'price',
      title: 'Price Value',
      type: 'string',
      description: 'e.g., $3.50 or $24.50/pp',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'modifiers',
      title: 'Modifiers / Options',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'modifier' }] }],
      description: 'Link reusable choices like "Choice of Protein" or "Extra Sauce"',
    }),
    defineField({
      name: 'dietary',
      title: 'Dietary Info',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Vegan', value: 'vegan' },
          { title: 'Vegetarian', value: 'vegetarian' },
          { title: 'Gluten-Free', value: 'gf' },
          { title: 'Dairy-Free', value: 'df' },
          { title: 'Nut-Free', value: 'nf' },
        ],
      },
    }),
    defineField({
      name: 'isBestseller',
      title: 'Bestseller',
      type: 'boolean',
      initialValue: false,
      description: 'Adds a "Crowd Favorite" or similar badge.',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
        name: 'itemType',
        title: 'Item Availability',
        type: 'string',
        options: {
          list: [
            { title: 'Restaurant Only', value: 'restaurant' },
            { title: 'Catering Only', value: 'catering' },
            { title: 'Both', value: 'both' },
          ],
        },
        initialValue: 'both',
    }),
    defineField({
      name: 'useCaseLabels',
      title: 'Use Case Labels',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g., "Great for offices", "Event Favorite"',
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
    defineField({
      name: 'inclusionsSummary',
      title: 'Inclusions Summary',
      type: 'text',
      rows: 2,
      description: 'e.g., "Includes: Steamed rice, fluffy scrambled eggs, and your selected breakfast protein."',
    }),
    defineField({
      name: 'selectionTitle',
      title: 'Selection Section Title',
      type: 'string',
      initialValue: 'Choose from',
      description: 'e.g., "Choose from", "Pick your protein", etc.',
    }),
    defineField({
      name: 'selectionItems',
      title: 'Selection Items',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'The items the customer chooses FROM.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      category: 'category.title',
      media: 'image',
      price: 'price',
    },
    prepare({ title, category, media, price }) {
      return {
        title,
        subtitle: `${category || 'No category'} • ${price || 'No price'}`,
        media,
      }
    },
  },
})
