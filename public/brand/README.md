# Brand assets

Drop the BKR INFRA logo here. Expected filenames (either is enough to start):

| file | what it is | used for |
| --- | --- | --- |
| `bkr-logo.svg` | the full lockup — BKR + INFRA + the flanking orange rules | footer, and anywhere the mark has room to breathe |
| `bkr-logo-mark.svg` | optional: BKR only, no INFRA | the fixed header band, which is only ~41px tall |

SVG is strongly preferred: it scales to any size, stays crisp on high-DPI screens, costs
almost nothing to load, and — the reason it matters here — its fills can be recoloured in CSS,
which is what lets ONE file work over both the navy and the cream chapters.

A transparent PNG at 1000px wide or more is a workable fallback. If PNG is all there is, two
files are needed rather than one (a navy-ink version for cream chapters and a cream-ink version
for navy ones), because a raster cannot recolour itself.

Once a file is here, the palette in `lib/tokens.ts` gets corrected to the navy and orange
sampled from it rather than the values estimated from a screenshot.


## What is actually in here

| file | what | used by |
| --- | --- | --- |
| `bkr-logo-letters.png` | alpha mask, letterforms only | `LogoMark` — painted in `currentColor` |
| `bkr-logo-accent.png` | alpha mask, wedge + rules only | `LogoMark` — painted in the brand orange |
| `bkr-lockup-letters.png` | as above, plus the tagline line | `LogoMark variant="lockup"` |
| `bkr-lockup-accent.png` | as above | `LogoMark variant="lockup"` |
| `bkr-lockup-light.png` | a FLAT cream-ink image, transparent ground | `app/opengraph-image.tsx` only |

The masks are the real mechanism: two alpha channels, one painted `currentColor` and one painted
orange, which is what lets a raster logo adapt to a navy or a cream ground the way an SVG would.

`bkr-lockup-light.png` is the exception and exists for one reason: the Open Graph card is rendered by
Satori, which supports only a subset of CSS and has no `mask-image`. That route therefore needs a
pre-coloured image, and since the card's ground is navy it needs the cream-ink one.

All five were extracted from the supplied artwork by un-compositing it off its flat near-white ground
(see the block comment in `components/brand/LogoMark.tsx`). If a true vector of the logo ever turns
up, all five become unnecessary.
