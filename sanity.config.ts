import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

// The plan (2026-09-15-bkr-infra-website.md, Task 19 Step 5) asks for siteSettings to carry
// `__experimental_actions` limited to update/publish. That property only exists on the compiled
// `ObjectSchemaType`, not on the authoring-time `DocumentDefinition` `defineType({type:'document'})`
// actually accepts (confirmed against node_modules/@sanity/types/lib/index.d.ts — see the probe
// this repo's task report documents) — so it does not typecheck against the installed sanity@6.14.1.
// It is also, independently, the wrong tool for the job: `__experimental_actions` is a legacy
// API-level mutation permission (create/update/delete/publish/history), not a Studio UI concern.
// What the plan actually wants — an owner using the Studio can't delete, duplicate or unpublish
// the one Site Settings document — is what `document.actions` below does instead: it's a UI-layer
// resolver, confirmed against Sanity's own documented pattern for singletons, that filters the
// action list per schema type. Keeping `publish` and `discardChanges` (so editing and saving still
// works normally) while dropping `unpublish`/`duplicate`/`delete`/`restore` for siteSettings only.
export default defineConfig({
  // The Studio is mounted at /admin, not /studio: the redesign gives `/studio` to the public
  // practice page (the reference's nav is Projects · Studio · Journal). This must match the
  // catch-all route folder `app/admin/[[...tool]]/` exactly — see the comment in that file.
  basePath: '/admin',
  projectId: projectId ?? '',
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    actions: (prev, context) =>
      context.schemaType === 'siteSettings'
        ? prev.filter(({ action }) => action === 'publish' || action === 'discardChanges')
        : prev,
  },
})
