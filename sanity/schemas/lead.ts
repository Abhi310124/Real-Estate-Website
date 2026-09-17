import { defineField, defineType } from 'sanity'

// Written server-side by a future enquiry/site-visit/brochure API route using a write token —
// never created or edited by a site visitor directly. Every field except `status` is readOnly
// in the Studio: editing a lead's name, phone or message after the fact would silently rewrite
// what a prospective buyer actually said, so the only thing an owner can change here is where
// the lead stands in their own follow-up pipeline.
export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', readOnly: true }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', readOnly: true }),
    defineField({ name: 'email', title: 'Email', type: 'string', readOnly: true }),
    defineField({ name: 'message', title: 'Message', type: 'text', readOnly: true }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      readOnly: true,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: 'Enquiry form', value: 'enquiry' },
          { title: 'Site visit request', value: 'site-visit' },
          { title: 'Brochure download', value: 'brochure' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'The only field you edit here — track where this lead stands.',
      initialValue: 'new',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Closed', value: 'closed' },
        ],
      },
    }),
    defineField({ name: 'createdAt', title: 'Created at', type: 'datetime', readOnly: true }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'name', phone: 'phone', status: 'status' },
    prepare({ title, phone, status }: { title?: string; phone?: string; status?: string }) {
      return {
        title: title || '(no name)',
        subtitle: [phone, status].filter(Boolean).join(' · '),
      }
    },
  },
})
