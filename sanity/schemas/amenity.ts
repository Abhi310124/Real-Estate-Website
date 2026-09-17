import { defineField, defineType } from 'sanity'

// The exact keys components/project/Amenities.tsx knows how to render (its ICON_PATHS record
// falls back to a generic icon for anything else). Offering only these as choices means an
// editor can never accidentally pick a key that silently renders the fallback icon.
const ICON_OPTIONS = [
  { title: 'Clubhouse', value: 'clubhouse' },
  { title: 'Swimming pool', value: 'pool' },
  { title: 'Garden', value: 'garden' },
  { title: "Kids' play area", value: 'kids-play' },
  { title: 'Gym', value: 'gym' },
  { title: 'Security', value: 'security' },
  { title: 'Power backup', value: 'power-backup' },
  { title: 'Parking', value: 'parking' },
]

export const amenity = defineType({
  name: 'amenity',
  title: 'Amenity',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'What buyers see, e.g. "Swimming Pool" or "24x7 Security & CCTV".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Which icon the site shows next to this amenity.',
      options: { list: ICON_OPTIONS },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description:
        'Optional grouping label, e.g. "Leisure" or "Safety" — for your own organisation in this list; the site does not group by it today.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
})
