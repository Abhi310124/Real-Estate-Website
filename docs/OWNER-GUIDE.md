# BKR INFRA website — owner's guide

This guide is for whoever looks after the BKR INFRA website day to day. You do not need to
know anything about code. Everything here is done through a web page, in a browser.

The editing area is called the **Studio**. You get to it by adding `/studio` to the end of the
website address — for example `https://www.bkrinfra.com/studio`.

---

## 1. Signing in

1. Go to the website address with `/studio` on the end.
2. Sign in with the account you were given.
3. You will see a menu down the left-hand side: **Projects**, **Leads**, **Amenities** and
   **Site Settings**.

If the sign-in page does not appear, the site has not been deployed yet — ask your developer.

---

## 2. Adding a project

1. Click **Projects** in the left menu, then **Published Projects** or **Hidden Projects** —
   either is fine, you are about to make a new one.
2. Click the **+** (create) button at the top of the list.
3. Work down the form. The fields are grouped into labelled sections so you are never looking
   at everything at once:

   - **Publishing** — leave **Published** switched **off** for now. Switch it on at the very end,
     once you are happy with everything.
   - **Basics** — the project name, its one-line tagline, which category it belongs to
     (Open Plots, Villas, Apartments, Independent Houses, Developers), its status (Upcoming,
     Ongoing, Completed, Sold Out), the area and city, and the RERA number.
   - **Pricing** — the starting price and whether it is in Lakh or Cr. If you would rather not
     publish a price, switch **Price on request** on and leave the number blank.
   - **Media** — the main photo and the gallery photos.
   - **Plans** — floor plans, and the master plan layout if this project has plotted land.
   - **Content** — the description paragraphs, key figures, amenities, specifications,
     construction updates, and nearby landmarks with distances.
   - **SEO** — optional. If you leave it blank the site uses the project name and tagline, which
     is usually fine.

4. The web address for the project (its "slug") fills itself in from the name. You can click
   **Generate** again if you rename the project.
5. **Every photo needs its Alt text box filled in.** See section 8 for what to write.
6. When everything looks right, switch **Published** on.
7. Click **Publish** in the bottom-right corner.

The project appears on the website within seconds of publishing (see section 7).

---

## 3. Removing a project from the website

This is the important one.

1. Click **Projects**, find the project, and open it.
2. Switch **Published** off.
3. Click **Publish**.

**The project disappears from the website immediately, and nothing is deleted.** It vanishes
from the projects list, from the home page, from search engines' next crawl — everywhere. All
its photos, prices and text stay exactly as they were, sitting safely in the Studio under
**Hidden Projects**.

That means you can bring it back at any time by switching **Published** back on and clicking
**Publish** again. Nothing is lost, so you never need to hesitate about hiding something.

You will see `HIDDEN` next to the project's name in the list, so it is always obvious which
ones are live and which are not.

---

## 4. Reordering the featured projects

The home page shows a few projects in a side-scrolling row.

- Switch **Featured** on for the projects you want in that row.
- Use the **Order** number to decide the sequence. **Lower numbers show first** — a project with
  Order 1 appears before one with Order 5.
- Click **Publish** after changing either.

---

## 5. Reading enquiries

1. Click **Leads** in the left menu. The newest enquiry is at the top.
2. Open one to see the person's name, phone number, email if they gave one, which project they
   were looking at, and their message.
3. Change **Status** to record where things stand: **New**, **Contacted**, or **Closed**.
4. Click **Publish**.

**Status is the only field you can change on a lead.** Everything else is locked on purpose —
those are the details the buyer actually typed, and they should stay exactly as submitted.

---

## 6. Changing phone numbers, address, or the announcement bar

Click **Site Settings** in the left menu. Everything here affects the whole website at once:

- **Phone numbers** — the numbers shown in the footer, on the contact page, and behind the
  floating call button.
- **WhatsApp number** — the number the WhatsApp buttons open a chat with.
- **Email** — currently empty. See section 9.
- **Address** — the office address in the footer, on the contact page, and on the map.
- **Announcement bar** — the thin strip across the very top of the site. Switch it **off** to
  remove the strip entirely; switch it on and type your text to show it. You can also give it a
  link so people can click through.
- **Pillars**, **Categories**, **Footer text**, **RERA disclaimer** — the standing text used in
  several places across the site.
- **Stats** — the four big numbers on the home page. **These need your real figures** — see
  section 9.

Click **Publish** when you are done.

---

## 7. How long changes take to appear

- **On the live website:** a few seconds. Publish, wait a moment, then refresh the page.
- **On a developer's own machine:** up to about 30 seconds.

The reason for the difference: the live site is told the instant you publish something, so it
refreshes that page straight away. A developer's laptop cannot be reached from the internet, so
instead it simply re-checks for changes every 30 seconds.

If a change has not appeared after a minute on the live site, check that you clicked **Publish**
and not just saved a draft.

---

## 8. Photo guidance

- **Shape:** landscape (wider than tall). Portrait photos get cropped on the website.
- **Size:** at least 2000 pixels wide. Under 1MB per file where you can manage it — large files
  make pages slow to load, and slow pages lose enquiries.
- **Alt text — always fill this in.** Every photo has an **Alt text** box and it is required.

  Alt text is a short description of what the photo shows. It is read aloud to visitors who
  cannot see the image, it is shown if the photo fails to load, and search engines read it too.
  Write what you would say if you were describing the photo to someone over the phone.

  Good: `Completed three-bedroom villa exterior at BKR Lakeview Enclave, Kokapet`
  Not useful: `photo`, `IMG_2043`, `villa`

- Use the **hotspot** tool (click the crop icon on an uploaded image) to mark the most important
  part of the photo. The site crops around that point on smaller screens, so faces and building
  fronts do not get cut off.

---

## 9. Replacing the placeholders before launch

The site currently ships with stand-in content so it could be built and reviewed before the real
material was available. **All of it needs replacing before the site goes public.** Nothing below
is a fault — it is deliberately obvious placeholder material.

### Placeholder photographs and brochures

There are **43 stand-in files**. They are abstract graphics in the brand colours, not
photographs, so nobody will mistake one for a real BKR development:

- **6 main project photos** — one per project.
- **15 gallery photos.**
- **7 floor plans** — drawn as line plans on cream, not photos.
- **8 construction update photos.**
- **1 master plan layout** — the plotted site drawing on the Lakeview Enclave page.
- **4 brochure PDFs** — single-page placeholders.
- **1 home page background** — the wide dusk graphic behind the headline on the front page.

**Where to change them:** open each project in the Studio and replace the images in the
**Media**, **Plans** and **Content** sections. Upload the brochure PDF in the **Plans** section.
The home page background is the one item a developer has to swap for you — ask them.

### Placeholder numbers on the home page

The four big figures on the home page are **placeholders, not verified facts**:

| Shown on the site | Needs |
| --- | --- |
| 12+ Projects Delivered | your real completed-project count |
| 22 Lakh+ Sq.ft. Developed | your real developed area |
| 650+ Families Served | your real number of buyers |
| 9 Years of Excellence | your real years in business |

**Please treat these as urgent.** They are public claims about BKR INFRA, and publishing figures
that are not accurate is a real risk — commercially and legally. Change them in **Site
Settings → Stats**. You do not need a developer.

### Things deliberately left empty

- **Email address** — the site shows no email link anywhere. This is on purpose: an email
  address that does not receive mail would silently swallow enquiries while appearing to work,
  which is worse than showing none. Fill in **Site Settings → Email** and the link appears
  automatically across the footer and contact page.
- **Social media links** — likewise, no social row is shown until you add links in
  **Site Settings → Social links**.

Neither is a bug. Both start working the moment you fill them in.

---

## Quick reference

| I want to… | Where |
| --- | --- |
| Add a property | Projects → **+** |
| Hide a property from the site | open it → **Published** off → **Publish** |
| Bring a hidden property back | Projects → Hidden Projects → **Published** on → **Publish** |
| Change which projects the home page features | **Featured** on, then set **Order** |
| See who has enquired | **Leads** |
| Change a phone number or the address | **Site Settings** |
| Turn the top announcement strip on or off | Site Settings → **Announcement bar** |
| Fix the four home page numbers | Site Settings → **Stats** |
