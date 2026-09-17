import { defineArrayMember, defineField, defineType } from 'sanity'

// Shared by every image field below (heroImage, gallery, floor plan images, master-plan image,
// construction-update images, the SEO og:image). Referenced directly rather than spread into
// each `fields: [...]` array, so TypeScript keeps inferring the literal `type: 'string'` union
// member instead of widening it — see the sibling fields for why each image also repeats
// `options: { hotspot: true }` inline instead of sharing that too.
const REQUIRED_ALT = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  description:
    'Describe the image for screen readers and search engines — e.g. "Twilight view of BKR Lakeview Enclave villas along the lakefront promenade."',
  validation: (Rule) => Rule.required(),
})

const PLOT_STATUS_OPTIONS = [
  { title: 'Available', value: 'available' },
  { title: 'Blocked', value: 'blocked' },
  { title: 'Sold', value: 'sold' },
]

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fieldsets: [
    {
      name: 'publishing',
      title: 'Publishing',
      description: 'Whether this project is live, featured, and where it sorts.',
      options: { columns: 3 },
    },
    { name: 'basics', title: 'Basics' },
    { name: 'pricing', title: 'Pricing', options: { columns: 3 } },
    { name: 'media', title: 'Media' },
    { name: 'plans', title: 'Plans' },
    { name: 'content', title: 'Content' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- Publishing ---------------------------------------------------------------------
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      fieldset: 'publishing',
      initialValue: false,
      description:
        'Turn this on to show the project on the website. Turn it off to remove it — the project is hidden immediately, nothing is deleted.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      fieldset: 'publishing',
      initialValue: false,
      description: 'Show this project in the homepage featured carousel.',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      fieldset: 'publishing',
      description: 'Lower numbers sort first in project listings and the featured carousel.',
      validation: (Rule) => Rule.integer(),
    }),

    // --- Basics --------------------------------------------------------------------------
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      fieldset: 'basics',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      fieldset: 'basics',
      description: 'Used in the project’s URL. Generated from the title — only change it if you need to.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      fieldset: 'basics',
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
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      fieldset: 'basics',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Ongoing', value: 'ongoing' },
          { title: 'Completed', value: 'completed' },
          { title: 'Sold Out', value: 'sold-out' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      fieldset: 'basics',
      description: 'One line shown under the title on cards and the hero — e.g. "Gated villas on the waterfront at Kokapet".',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fieldset: 'basics',
      fields: [
        defineField({ name: 'area', title: 'Area', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'city', title: 'City', type: 'string', initialValue: 'Hyderabad', validation: (Rule) => Rule.required() }),
        defineField({
          name: 'mapEmbedUrl',
          title: 'Map embed URL',
          type: 'url',
          description: 'A Google Maps embed link for this location.',
        }),
        defineField({ name: 'lat', title: 'Latitude', type: 'number' }),
        defineField({ name: 'lng', title: 'Longitude', type: 'number' }),
      ],
    }),
    defineField({
      name: 'unitTypes',
      title: 'Unit types',
      type: 'array',
      fieldset: 'basics',
      of: [defineArrayMember({ type: 'string' })],
      description: 'e.g. "4 BHK Villa", "150 sq.yd" — whatever unit types this project actually offers.',
    }),
    defineField({
      name: 'reraNumber',
      title: 'RERA number',
      type: 'string',
      fieldset: 'basics',
      validation: (Rule) => Rule.required(),
    }),

    // --- Pricing -------------------------------------------------------------------------
    defineField({
      name: 'priceFrom',
      title: 'Price from',
      type: 'number',
      fieldset: 'pricing',
      description: 'Starting price. Leave blank and turn on "Price on request" if pricing is negotiated case by case.',
    }),
    defineField({
      name: 'priceUnit',
      title: 'Price unit',
      type: 'string',
      fieldset: 'pricing',
      initialValue: 'Lakh',
      options: {
        list: [
          { title: 'Lakh', value: 'Lakh' },
          { title: 'Cr', value: 'Cr' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priceOnRequest',
      title: 'Price on request',
      type: 'boolean',
      fieldset: 'pricing',
      initialValue: false,
      description: 'Turn on when pricing is by negotiation rather than a fixed starting price (e.g. developer joint-ventures).',
    }),

    // --- Media ---------------------------------------------------------------------------
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      fields: [REQUIRED_ALT],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      fieldset: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [REQUIRED_ALT, defineField({ name: 'caption', title: 'Caption', type: 'string' })],
        }),
      ],
    }),
    defineField({
      name: 'brochure',
      title: 'Brochure (PDF)',
      type: 'file',
      fieldset: 'media',
      description: 'Optional. The brochure download button only appears on the site once a file is uploaded here.',
      options: { accept: 'application/pdf' },
    }),

    // --- Plans ---------------------------------------------------------------------------
    defineField({
      name: 'floorPlans',
      title: 'Floor plans',
      type: 'array',
      fieldset: 'plans',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'floorPlan',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'unitType', title: 'Unit type', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'area', title: 'Area', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'areaUnit', title: 'Area unit', type: 'string', initialValue: 'sq.ft', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [REQUIRED_ALT],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'unitType', media: 'image' },
          },
        }),
      ],
    }),
    defineField({
      name: 'masterPlan',
      title: 'Master plan',
      type: 'object',
      fieldset: 'plans',
      description: 'Optional. Leave empty for projects with no plotted layout to show (e.g. a single apartment tower).',
      fields: [
        defineField({
          name: 'image',
          title: 'Master plan image',
          type: 'image',
          options: { hotspot: true },
          fields: [REQUIRED_ALT],
        }),
        defineField({
          name: 'plots',
          title: 'Plots',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'plot',
              fields: [
                defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'size', title: 'Size', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'facing', title: 'Facing', type: 'string' }),
                defineField({
                  name: 'status',
                  title: 'Status',
                  type: 'string',
                  options: { list: PLOT_STATUS_OPTIONS },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'polygon',
                  title: 'Polygon points',
                  type: 'string',
                  description: 'SVG points relative to the master-plan image’s viewBox, e.g. "60,60 180,60 180,160 60,160". Ask your developer if unsure.',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {
                select: { title: 'label', subtitle: 'status' },
              },
            }),
          ],
        }),
      ],
    }),

    // --- Content -------------------------------------------------------------------------
    defineField({
      name: 'keyStats',
      title: 'Key stats',
      type: 'array',
      fieldset: 'content',
      description: 'Short highlight numbers shown near the top of the project page, e.g. "24 Acres", "182+ Villas".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'keyStat',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', title: 'Value', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'suffix', title: 'Suffix', type: 'string', description: 'e.g. " Acres", "+", " Storeys".' }),
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
      name: 'overview',
      title: 'Overview',
      type: 'array',
      fieldset: 'content',
      description: 'The description paragraphs shown on the project page. Add one entry per paragraph.',
      of: [defineArrayMember({ type: 'text', rows: 4 })],
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      fieldset: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'amenity' }] })],
    }),
    defineField({
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      fieldset: 'content',
      description: 'Grouped construction specifications, e.g. "Structure", "Flooring", each with a list of details.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'specGroup',
          fields: [
            defineField({ name: 'category', title: 'Category', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'category', items: 'items' },
            prepare({ title, items }: { title?: string; items?: string[] }) {
              return { title, subtitle: `${items?.length ?? 0} item(s)` }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'constructionUpdates',
      title: 'Construction updates',
      type: 'array',
      fieldset: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'constructionUpdate',
          fields: [
            defineField({ name: 'date', title: 'Date', type: 'date', validation: (Rule) => Rule.required() }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [REQUIRED_ALT] })],
            }),
            defineField({ name: 'note', title: 'Note', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'date' },
          },
        }),
      ],
    }),
    defineField({
      name: 'connectivity',
      title: 'Connectivity',
      type: 'array',
      fieldset: 'content',
      description: 'Nearby landmarks and their distance, e.g. "Outer Ring Road — 3 km".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'connectivityItem',
          fields: [
            defineField({ name: 'place', title: 'Place', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'distance', title: 'Distance', type: 'string', validation: (Rule) => Rule.required() }),
          ],
          preview: {
            select: { title: 'place', subtitle: 'distance' },
          },
        }),
      ],
    }),

    // --- SEO -------------------------------------------------------------------------------
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fieldset: 'seo',
      description: 'Optional overrides for search engines and social sharing. Sensible defaults are used when left blank.',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta title', type: 'string' }),
        defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3 }),
        defineField({
          name: 'ogImage',
          title: 'Social share image',
          type: 'image',
          options: { hotspot: true },
          fields: [REQUIRED_ALT],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'heroImage',
      category: 'category',
      status: 'status',
      isPublished: 'isPublished',
    },
    prepare({ title, media, category, status, isPublished }) {
      return {
        title: title || '(untitled project)',
        media,
        subtitle: [category, status, isPublished ? null : 'HIDDEN'].filter(Boolean).join(' · '),
      }
    },
  },
})
