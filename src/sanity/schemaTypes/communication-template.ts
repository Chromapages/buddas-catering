import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'communicationTemplate',
  title: 'Communication Template',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Template ID',
      type: 'string',
      description: 'Used by the CRM to identify the template (e.g. "lead-confirmation", "stale-nudge")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subject',
      title: 'Email Subject',
      type: 'string',
      description: 'The subject line for email notifications',
    }),
    defineField({
      name: 'content',
      title: 'Body Content',
      type: 'text',
      description: 'The main body of the email or SMS. Use placeholders like {{name}} or {{company}}.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'smsBody',
      title: 'SMS Content',
      type: 'string',
      description: 'Optional shorter version for SMS. If empty, Body Content will be used.',
    }),
    defineField({
      name: 'type',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Lead Outreach', value: 'lead' },
          { title: 'Internal Alert', value: 'internal' },
          { title: 'Customer Engagement', value: 'customer' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'id',
      subtitle: 'subject',
    },
  },
})
