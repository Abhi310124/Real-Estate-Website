import { defineArrayMember, defineField, defineType } from 'sanity'

// Singleton: the Studio only ever exposes one editable "Site Settings" document — see
// sanity/structure.ts, which pins the desk item to a fixed document ID instead of listing this
// type. The schema itself is a plain document type so nothing else has to change if that ever
// needs to be revisited.
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phones',
      title: 'Phone numbers',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description:
        'Optional. BKR INFRA has no verified inbox today — leave this blank and the site simply omits the email link everywhere instead of showing a mailto: link that would swallow enquiries. Only fill this in once a real inbox exists.',
      // Deliberately not required — see the description above and lib/data/types.ts's `email?`.
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      description: 'An empty list is fine if there are no social accounts to link yet.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'social',
          fields: [
            defineField({ name: 'platform', title: 'Platform', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'pillars',
      title: 'Pillars',
      type: 'array',
      description: 'The "Why BKR" pillars shown on the homepage, e.g. "DEVELOP", "DESIGN", "DELIVER".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pillar',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'The category filters shown on the projects listing page.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'category',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              options: {
                list: [
                  { title: 'Open Plots', value: 'open-plots' },
                  { title: 'Villas', value: 'villas' },
                  { title: 'Apartments', value: 'apartments' },
                  { title: 'Independent Houses', value: 'independent-houses' },
                  { title: 'Developers', value: 'developers' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      description:
        'The homepage stats band, e.g. "12+ Projects Delivered". Owner-editable because these are figures a business updates every year, not fixed site structure.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', title: 'Value', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'suffix', title: 'Suffix', type: 'string', description: 'e.g. "+", " Lakh+".' }),
          ],
          preview: {
            select: { title: 'label', value: 'value', suffix: 'suffix' },
            prepare({ title, value, suffix }: { title?: string; value?: number; suffix?: string }) {
              return { title, subtitle: `${value ?? ''}${suffix ?? ''}` }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'footerBlurb',
      title: 'Footer blurb',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reraDisclaimer',
      title: 'RERA disclaimer',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'announcementBar',
      title: 'Announcement bar',
      type: 'object',
      fields: [
        defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false }),
        defineField({ name: 'text', title: 'Text', type: 'string' }),
        defineField({ name: 'link', title: 'Link', type: 'string', description: 'A path on this site, e.g. "/projects/bkr-lakeview-enclave".' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'tagline' },
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
