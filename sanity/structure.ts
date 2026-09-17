import type { StructureResolver } from 'sanity/structure'

// A deliberate desk rather than Sanity's default "one flat list per schema type": Projects
// splits into Published/Hidden so the owner can see at a glance what is live without opening
// every document, Leads defaults to newest-first so new enquiries surface immediately, and Site
// Settings is pinned to its single document (see siteSettings.ts) instead of listing as a
// document type an owner could accidentally duplicate.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Projects')
        .child(
          S.list()
            .title('Projects')
            .items([
              S.listItem()
                .title('Published')
                .child(
                  S.documentList()
                    .title('Published Projects')
                    .filter('_type == "project" && isPublished == true')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
              S.listItem()
                .title('Hidden')
                .child(
                  S.documentList()
                    .title('Hidden Projects')
                    .filter('_type == "project" && isPublished == false')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
            ]),
        ),
      S.listItem()
        .title('Leads')
        .child(
          S.documentList()
            .title('Leads')
            .filter('_type == "lead"')
            .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
        ),
      S.listItem()
        .title('Amenities')
        .child(S.documentTypeList('amenity').title('Amenities')),
      S.listItem()
        .title('Site Settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
