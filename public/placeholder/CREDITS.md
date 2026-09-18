# Placeholder asset credits

**Every asset in this directory is generated, not photographed.** There is nothing here to
credit to a third party, and nothing here is licensed from anyone.

## What these are

43 files produced by [`scripts/generate-placeholders.mjs`](../../scripts/generate-placeholders.mjs):

| Kind | Count | What it looks like |
| --- | --- | --- |
| Project hero images | 6 | Abstract dusk skyline, brand palette |
| Gallery images | 15 | As above, varied composition |
| Floor plans | 7 | Line-drawn room plans on cream |
| Construction updates | 8 | Abstract dusk skyline |
| Master plan | 1 | Plotted site layout with roads and plot outlines |
| Brochures | 4 | Single-page PDFs |

Plus `public/hero/home-hero.png`, the home page background, from the same generator.

The generator reads its file list out of `lib/data/mock.ts` rather than hard-coding paths, so a
fixture that gains an image cannot drift out of sync with its asset. Seeding is deterministic, so
re-running produces byte-identical output rather than a fresh diff.

```bash
node scripts/generate-placeholders.mjs          # fills in anything missing
node scripts/generate-placeholders.mjs --force  # regenerates everything
```

## Why generated rather than stock photography

The implementation plan originally called for downloading around 20 architecture photographs
from Unsplash. Generated artwork was used instead, deliberately:

1. **A photograph of somebody else's building on a developer's own marketing site implies they
   built it.** BKR INFRA is a real company; illustrating its project pages with licensed images
   of unrelated developments would misrepresent its portfolio, and a permissive licence does not
   make that accurate. These graphics are unmistakably not photographs, so no viewer can mistake
   one for a finished BKR project.
2. **A floor plan rendered as a dusk photograph misrepresents what the asset is.** The generator
   produces four visually distinct kinds so each stands in for the right thing — plans look like
   plans, the master plan looks like a plotted layout with roads and plot outlines, which is what
   the interactive hotspot overlay on the Lakeview Enclave page sits on top of.
3. **No network dependency and no licence bookkeeping.** The site renders identically offline,
   the e2e suite never reaches out to a third party, and there is no attribution to maintain.

## These are all temporary

Every one of them is replaced with real BKR INFRA photography before launch.
[`docs/OWNER-GUIDE.md`](../../docs/OWNER-GUIDE.md) section 9 lists each item and where in the
Studio to change it — no developer needed for any of them except the home page background.
