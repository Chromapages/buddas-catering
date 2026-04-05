import { defineField, defineType } from 'sanity'
import { Settings2 } from 'lucide-react'

export const modifier = defineType({
  name: 'modifier',
  title: 'Menu Modifier / Add-on',
  type: 'document',
  icon: Settings2,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., Choice of Protein, Side Swaps, Extra Sauce',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      description: 'Helpful context for the user (e.g., "Pick one protein for your platter")',
    }),
    defineField({
      name: 'type',
      title: 'Modifier Type',
      type: 'string',
      options: {
        list: [
          { title: 'Choice (Pick One)', value: 'choice' },
          { title: 'Multiple (Pick Many)', value: 'multiple' },
          { title: 'Optional Add-on', value: 'addon' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Option Name', validation: (Rule) => Rule.required() },
            { name: 'priceDelta', type: 'number', title: 'Price Delta', initialValue: 0, description: 'e.g., +2.00 or -1.00' },
            { name: 'isDefault', type: 'boolean', title: 'Default Option', initialValue: false },
          ],
          preview: {
            select: {
              title: 'name',
              price: 'priceDelta',
            },
            prepare({ title, price }) {
              const val = price || 0
              const priceText = val === 0 ? 'No extra cost' : `${val > 0 ? '+' : ''}${val.toFixed(2)}`
              return {
                title,
                subtitle: priceText,
              }
            },
          },
        },
      ],
    }),
  ],
})
