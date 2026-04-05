import { defineField, defineType } from 'sanity'
import { Tag } from 'lucide-react'

export const category = defineType({
  name: 'category',
  title: 'Menu Category',
  type: 'document',
  icon: Tag,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., Breakfast, Lunch & Dinner Catering, Rolls & Pastries',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Category Type',
      type: 'string',
      options: {
        list: [
          { title: 'Restaurant', value: 'restaurant' },
          { title: 'Catering', value: 'catering' },
          { title: 'Both', value: 'both' },
        ],
      },
      initialValue: 'both',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      description: 'Used for manual sorting on the menu pages.',
    }),
    defineField({
        name: 'description',
        title: 'Description',
        type: 'text',
        description: 'Optional summary for the category page.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle.charAt(0).toUpperCase() + subtitle.slice(1),
      }
    },
  },
})
