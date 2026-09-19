import type { DataSource, JournalPost, Project, ProjectSummary, SiteSettings } from './types'

// Six mock projects standing in for Sanity until Task 20 wires the real source.
// Slugs are load-bearing — later tasks assert against these exact strings:
//   bkr-lakeview-enclave    fully populated (masterPlan, brochure, plans, amenities, updates)
//   bkr-skyline-residences  published but sparse — no masterPlan, proves optional sections degrade
//   unpublished-sample      isPublished: false — proves the show/hide switch actually hides
// The remaining three cover the other categories and statuses. Localities, pricing and RERA
// numbers are written to read like real Hyderabad inventory, not lorem ipsum.
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'bkr-lakeview-enclave',
    title: 'BKR Lakeview Enclave',
    slug: 'bkr-lakeview-enclave',
    tagline: 'Gated villas on the waterfront at Kokapet',
    category: 'villas',
    status: 'ongoing',
    isPublished: true,
    featured: true,
    order: 1,
    location: {
      area: 'Kokapet',
      city: 'Hyderabad',
      mapEmbedUrl: 'https://www.google.com/maps?q=Kokapet,Hyderabad&output=embed',
      lat: 17.4001,
      lng: 78.3009,
    },
    priceFrom: 1.85,
    priceUnit: 'Cr',
    priceOnRequest: false,
    unitTypes: ['4 BHK Villa', '5 BHK Villa'],
    heroImage: {
      url: '/placeholder/projects/bkr-lakeview-enclave/hero.jpg',
      alt: 'Twilight view of BKR Lakeview Enclave villas along a landscaped lakefront promenade in Kokapet, Hyderabad',
    },
    overview: [
      'BKR Lakeview Enclave is a gated community of 4 and 5 BHK villas set around a landscaped lakefront promenade in Kokapet, minutes from the Financial District and the Outer Ring Road.',
      'Every villa sits on its own plot with private open space, wide east or west facing frontage, and access to a clubhouse, pool and full-time security — built for families who want a house, not just a flat, without leaving the city behind.',
    ],
    keyStats: [
      { label: 'Total Land Area', value: 24, suffix: ' Acres' },
      { label: 'Villas', value: 182, suffix: '+' },
      { label: 'Open & Green Space', value: 58, suffix: '%' },
      { label: 'Possession', value: 2027 },
    ],
    gallery: [
      { url: '/placeholder/projects/bkr-lakeview-enclave/gallery-1.jpg', alt: 'Landscaped central avenue lined with palms at BKR Lakeview Enclave' },
      { url: '/placeholder/projects/bkr-lakeview-enclave/gallery-2.jpg', alt: 'Clubhouse facade and swimming pool deck at BKR Lakeview Enclave' },
      { url: '/placeholder/projects/bkr-lakeview-enclave/gallery-3.jpg', alt: 'Corner 5 BHK villa elevation with a double-height entrance porch' },
      { url: '/placeholder/projects/bkr-lakeview-enclave/gallery-4.jpg', alt: 'Play area and jogging track for children along the lake edge' },
    ],
    amenities: [
      { title: 'Clubhouse', icon: 'clubhouse', category: 'Leisure' },
      { title: 'Swimming Pool', icon: 'pool', category: 'Leisure' },
      { title: 'Landscaped Gardens', icon: 'garden', category: 'Wellness' },
      { title: 'Childrens Play Area', icon: 'kids-play', category: 'Family' },
      { title: 'Gymnasium', icon: 'gym', category: 'Wellness' },
      { title: '24x7 Security & CCTV', icon: 'security', category: 'Safety' },
    ],
    floorPlans: [
      {
        title: '4 BHK Villa — Type A',
        unitType: '4 BHK',
        area: 3200,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/bkr-lakeview-enclave/floorplan-4bhk-a.jpg', alt: 'Floor plan of the 4 BHK Type A villa at BKR Lakeview Enclave' },
      },
      {
        title: '4 BHK Villa — Type B (Corner)',
        unitType: '4 BHK',
        area: 3450,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/bkr-lakeview-enclave/floorplan-4bhk-b.jpg', alt: 'Floor plan of the 4 BHK Type B corner villa at BKR Lakeview Enclave' },
      },
      {
        title: '5 BHK Villa — Type C',
        unitType: '5 BHK',
        area: 4100,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/bkr-lakeview-enclave/floorplan-5bhk-c.jpg', alt: 'Floor plan of the 5 BHK Type C villa at BKR Lakeview Enclave' },
      },
    ],
    masterPlan: {
      image: {
        url: '/placeholder/projects/bkr-lakeview-enclave/masterplan.jpg',
        alt: 'Site layout plan of BKR Lakeview Enclave showing villa plots A1 to B2 around the central clubhouse and lakefront green belt',
      },
      plots: [
        { label: 'Plot A1', size: '300 sq.yd', facing: 'East', status: 'available', polygon: '60,60 180,60 180,160 60,160' },
        { label: 'Plot A2', size: '267 sq.yd', facing: 'North', status: 'sold', polygon: '190,60 310,60 310,160 190,160' },
        { label: 'Plot A3', size: '300 sq.yd', facing: 'West', status: 'available', polygon: '320,60 440,60 440,160 320,160' },
        { label: 'Plot B1', size: '350 sq.yd', facing: 'North-East', status: 'blocked', polygon: '60,170 180,170 180,270 60,270' },
        { label: 'Plot B2', size: '350 sq.yd', facing: 'South', status: 'available', polygon: '190,170 310,170 310,270 190,270' },
      ],
    },
    specifications: [
      { category: 'Structure', items: ['RCC framed structure designed for Zone II seismic loads', 'Solid concrete block masonry for all external and internal walls'] },
      { category: 'Flooring', items: ['Double-charged vitrified tiles in living, dining and bedrooms', 'Anti-skid ceramic tiles in balconies, utility and toilets'] },
      { category: 'Kitchen & Utility', items: ['Granite platform with stainless steel sink', 'Provision for water purifier, chimney and RO unit', 'Separate utility yard with wash area'] },
      { category: 'Doors & Windows', items: ['Main door in teak wood frame with veneer finish', 'UPVC windows with mosquito mesh shutters'] },
    ],
    constructionUpdates: [
      {
        date: '2026-02-14',
        title: 'Site grading and foundation work completed',
        images: [{ url: '/placeholder/projects/bkr-lakeview-enclave/update-foundation.jpg', alt: 'Foundation work in progress at BKR Lakeview Enclave, Rows A and B' }],
        note: 'Foundation for Villa Rows A and B poured and cured.',
      },
      {
        date: '2026-05-20',
        title: 'Superstructure complete for Rows A and B',
        images: [{ url: '/placeholder/projects/bkr-lakeview-enclave/update-superstructure.jpg', alt: 'Completed superstructure of villa Rows A and B at BKR Lakeview Enclave' }],
      },
      {
        date: '2026-08-10',
        title: 'Clubhouse roofing and internal roads laid',
        images: [{ url: '/placeholder/projects/bkr-lakeview-enclave/update-clubhouse.jpg', alt: 'Clubhouse roofing and paved internal roads at BKR Lakeview Enclave' }],
        note: 'Avenue plantation and street lighting to follow next.',
      },
    ],
    connectivity: [
      { place: 'Outer Ring Road — Gandipet Exit', distance: '3 km' },
      { place: 'Financial District, Nanakramguda', distance: '9 km' },
      { place: 'Gachibowli & Hitec City', distance: '13 km' },
      { place: 'Rajiv Gandhi International Airport', distance: '32 km' },
    ],
    brochureUrl: '/placeholder/brochures/bkr-lakeview-enclave.pdf',
    reraNumber: 'P02200198234',
  },
  {
    id: 'bkr-skyline-residences',
    title: 'BKR Skyline Residences',
    slug: 'bkr-skyline-residences',
    tagline: 'High-rise 2 and 3 BHK homes on the Tellapur skyline',
    category: 'apartments',
    status: 'upcoming',
    isPublished: true,
    featured: true,
    order: 2,
    location: {
      area: 'Tellapur',
      city: 'Hyderabad',
      mapEmbedUrl: 'https://www.google.com/maps?q=Tellapur,Hyderabad&output=embed',
      lat: 17.4592,
      lng: 78.2331,
    },
    priceFrom: 68,
    priceUnit: 'Lakh',
    priceOnRequest: false,
    unitTypes: ['2 BHK', '2.5 BHK', '3 BHK'],
    heroImage: {
      url: '/placeholder/projects/bkr-skyline-residences/hero.jpg',
      alt: 'Rendered elevation of the three BKR Skyline Residences towers rising above Tellapur, Hyderabad',
    },
    // Deliberately sparse: no masterPlan (a single apartment tower has no plotted layout to
    // show), no constructionUpdates yet (pre-launch) and no brochureUrl (not finalised). This
    // is the fixture that proves optional sections degrade instead of crashing.
    overview: [
      'BKR Skyline Residences brings three 19-storey towers of 2, 2.5 and 3 BHK apartments to Tellapur, on the doorstep of the Gachibowli–Financial District IT corridor.',
      'The project is in pre-launch: layout approvals are in hand and bookings are open, with the first tower slated to break ground this quarter.',
    ],
    keyStats: [
      { label: 'Towers', value: 3 },
      { label: 'Total Units', value: 264, suffix: '+' },
      { label: 'Floors', value: 19, suffix: ' Storeys' },
    ],
    gallery: [
      { url: '/placeholder/projects/bkr-skyline-residences/gallery-1.jpg', alt: 'Rendered lobby entrance of BKR Skyline Residences, Tellapur' },
      { url: '/placeholder/projects/bkr-skyline-residences/gallery-2.jpg', alt: 'Rendered rooftop deck overlooking Tellapur from BKR Skyline Residences' },
      { url: '/placeholder/projects/bkr-skyline-residences/gallery-3.jpg', alt: 'Rendered typical living and dining area of a 3 BHK unit at BKR Skyline Residences' },
    ],
    amenities: [
      { title: 'Gymnasium', icon: 'gym' },
      { title: 'Power Backup', icon: 'power-backup' },
      { title: 'Covered Parking', icon: 'parking' },
    ],
    floorPlans: [
      {
        title: '2 BHK',
        unitType: '2 BHK',
        area: 1150,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/bkr-skyline-residences/floorplan-2bhk.jpg', alt: 'Floor plan of a 2 BHK unit at BKR Skyline Residences' },
      },
      {
        title: '3 BHK',
        unitType: '3 BHK',
        area: 1650,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/bkr-skyline-residences/floorplan-3bhk.jpg', alt: 'Floor plan of a 3 BHK unit at BKR Skyline Residences' },
      },
    ],
    specifications: [
      { category: 'Structure', items: ['RCC shear-wall structure for high-rise stability', 'Two lifts per tower with power backup'] },
      { category: 'Flooring', items: ['Vitrified tile flooring in living, dining and bedrooms'] },
    ],
    constructionUpdates: [],
    connectivity: [
      { place: 'Outer Ring Road — Tellapur Exit', distance: '2 km' },
      { place: 'Wipro Circle, Gachibowli', distance: '7 km' },
      { place: 'Hitec City', distance: '12 km' },
      { place: 'ISB Hyderabad', distance: '8 km' },
      { place: 'Rajiv Gandhi International Airport', distance: '35 km' },
    ],
    reraNumber: 'P02200201567',
  },
  {
    id: 'bkr-green-meadows',
    title: 'BKR Green Meadows',
    slug: 'bkr-green-meadows',
    tagline: 'HMDA-approved open plots at Mokila, ready to register',
    category: 'open-plots',
    status: 'completed',
    isPublished: true,
    featured: true,
    order: 3,
    location: {
      area: 'Mokila',
      city: 'Hyderabad',
      mapEmbedUrl: 'https://www.google.com/maps?q=Mokila,Hyderabad&output=embed',
      lat: 17.423,
      lng: 78.169,
    },
    priceFrom: 32,
    priceUnit: 'Lakh',
    priceOnRequest: false,
    unitTypes: ['150 sq.yd', '200 sq.yd', '267 sq.yd'],
    heroImage: {
      url: '/placeholder/projects/bkr-green-meadows/hero.jpg',
      alt: 'Aerial view of the completed open-plot layout at BKR Green Meadows, Mokila, with paved internal roads',
    },
    overview: [
      'BKR Green Meadows is a fully developed, HMDA-approved layout of open residential plots at Mokila, on the Mumbai Highway growth corridor west of Hyderabad.',
      'Roads, drains and electrical ducting are complete and the layout is registration-ready, so buyers can start construction as soon as they choose a plot.',
    ],
    keyStats: [
      { label: 'Total Extent', value: 12, suffix: ' Acres' },
      { label: 'Plots', value: 146 },
      { label: 'Avenue Roads', value: 40, suffix: ' ft wide' },
    ],
    gallery: [
      { url: '/placeholder/projects/bkr-green-meadows/gallery-1.jpg', alt: 'Paved avenue road with street lighting at BKR Green Meadows, Mokila' },
      { url: '/placeholder/projects/bkr-green-meadows/gallery-2.jpg', alt: 'Entrance arch and boundary wall of BKR Green Meadows layout' },
      { url: '/placeholder/projects/bkr-green-meadows/gallery-3.jpg', alt: 'Landscaped park within the BKR Green Meadows layout at Mokila' },
    ],
    amenities: [
      { title: 'Avenue Plantation', icon: 'garden' },
      { title: 'Underground Electricity', icon: 'power-backup' },
      { title: 'Parks & Open Spaces', icon: 'garden' },
      { title: '24x7 Security', icon: 'security' },
    ],
    floorPlans: [],
    specifications: [
      {
        category: 'Infrastructure',
        items: [
          '30 and 40 feet wide BT roads with stormwater drains',
          'Underground electrical ducting to every plot',
          'Individual water and sewerage connection provision',
          'Avenue plantation along all internal roads',
        ],
      },
    ],
    constructionUpdates: [
      {
        date: '2025-11-05',
        title: 'Layout development and road-laying completed',
        images: [{ url: '/placeholder/projects/bkr-green-meadows/update-roads.jpg', alt: 'Completed internal roads at BKR Green Meadows, Mokila' }],
      },
      {
        date: '2026-01-20',
        title: 'HMDA layout approval received; registrations open',
        images: [{ url: '/placeholder/projects/bkr-green-meadows/update-approval.jpg', alt: 'HMDA approval signage at the BKR Green Meadows site office' }],
        note: 'Individual plot registrations are now open at the site office.',
      },
    ],
    connectivity: [
      { place: 'NH-65 (Mumbai Highway)', distance: '3 km' },
      { place: 'Outer Ring Road — Patancheru Exit', distance: '6 km' },
      { place: 'Gachibowli', distance: '22 km' },
      { place: 'Shankarpally Mandal Centre', distance: '5 km' },
    ],
    brochureUrl: '/placeholder/brochures/bkr-green-meadows.pdf',
    reraNumber: 'P02200176890',
  },
  {
    id: 'bkr-sunrise-homes',
    title: 'BKR Sunrise Homes',
    slug: 'bkr-sunrise-homes',
    tagline: 'Independent 3 and 4 BHK houses built for the next decade at Adibatla',
    category: 'independent-houses',
    status: 'ongoing',
    isPublished: true,
    featured: false,
    order: 4,
    location: {
      area: 'Adibatla',
      city: 'Hyderabad',
      mapEmbedUrl: 'https://www.google.com/maps?q=Adibatla,Hyderabad&output=embed',
      lat: 17.235,
      lng: 78.551,
    },
    priceFrom: 78,
    priceUnit: 'Lakh',
    priceOnRequest: false,
    unitTypes: ['3 BHK', '4 BHK'],
    heroImage: {
      url: '/placeholder/projects/bkr-sunrise-homes/hero.jpg',
      alt: 'Row of independent houses under construction at BKR Sunrise Homes, Adibatla, Hyderabad',
    },
    overview: [
      'BKR Sunrise Homes is a gated layout of independent 3 and 4 BHK houses at Adibatla, close to the TSPA aerospace and defence SEZ and the Outer Ring Road.',
      'Each house is built on its own plot with a private terrace and car porch, giving buyers the space of an independent house with the security of a managed layout.',
    ],
    keyStats: [
      { label: 'Independent Houses', value: 64 },
      { label: 'Average Plot Size', value: 200, suffix: ' sq.yd' },
      { label: 'Possession', value: 2027 },
    ],
    gallery: [
      { url: '/placeholder/projects/bkr-sunrise-homes/gallery-1.jpg', alt: 'Completed row of independent houses with car porches at BKR Sunrise Homes' },
      { url: '/placeholder/projects/bkr-sunrise-homes/gallery-2.jpg', alt: 'Internal road and street lighting at BKR Sunrise Homes, Adibatla' },
      { url: '/placeholder/projects/bkr-sunrise-homes/gallery-3.jpg', alt: 'Community hall under construction at BKR Sunrise Homes' },
    ],
    amenities: [
      { title: 'Community Hall', icon: 'clubhouse' },
      { title: 'Parks & Open Spaces', icon: 'garden' },
      { title: '24x7 Security', icon: 'security' },
      { title: 'Underground Drainage', icon: 'power-backup' },
    ],
    floorPlans: [
      {
        title: '3 BHK Independent House',
        unitType: '3 BHK',
        area: 1800,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/bkr-sunrise-homes/floorplan-3bhk.jpg', alt: 'Floor plan of the 3 BHK independent house at BKR Sunrise Homes' },
      },
      {
        title: '4 BHK Independent House',
        unitType: '4 BHK',
        area: 2400,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/bkr-sunrise-homes/floorplan-4bhk.jpg', alt: 'Floor plan of the 4 BHK independent house at BKR Sunrise Homes' },
      },
    ],
    specifications: [
      { category: 'Structure', items: ['RCC framed G+1 structure', 'Vitrified tile flooring throughout'] },
      { category: 'Electrical & Plumbing', items: ['Concealed copper wiring with MCB distribution board', 'CPVC and UPVC plumbing with overhead and sump water storage'] },
    ],
    constructionUpdates: [
      {
        date: '2026-04-02',
        title: 'Foundation complete for Phase 1 (32 houses)',
        images: [{ url: '/placeholder/projects/bkr-sunrise-homes/update-foundation.jpg', alt: 'Foundation work for Phase 1 houses at BKR Sunrise Homes' }],
      },
      {
        date: '2026-07-15',
        title: 'Brickwork and roof slab complete for the first 18 houses',
        images: [{ url: '/placeholder/projects/bkr-sunrise-homes/update-brickwork.jpg', alt: 'Brickwork and roof slab complete on houses at BKR Sunrise Homes' }],
        note: 'Phase 1 handover is targeted for Q2 2027.',
      },
    ],
    connectivity: [
      { place: 'Outer Ring Road Exit 3 — Adibatla', distance: '4 km' },
      { place: 'TSPA Aerospace SEZ', distance: '6 km' },
      { place: 'LB Nagar', distance: '14 km' },
      { place: 'Rajiv Gandhi International Airport', distance: '18 km' },
    ],
    brochureUrl: '/placeholder/brochures/bkr-sunrise-homes.pdf',
    reraNumber: 'P02200188456',
  },
  {
    id: 'bkr-landmark-township',
    title: 'BKR Landmark Township',
    slug: 'bkr-landmark-township',
    tagline: 'A joint-development township taking shape at Ghatkesar',
    category: 'developers',
    status: 'upcoming',
    isPublished: true,
    featured: false,
    order: 5,
    location: {
      area: 'Ghatkesar',
      city: 'Hyderabad',
      mapEmbedUrl: 'https://www.google.com/maps?q=Ghatkesar,Hyderabad&output=embed',
      lat: 17.4449,
      lng: 78.6821,
    },
    priceFrom: null,
    priceUnit: 'Lakh',
    priceOnRequest: true,
    unitTypes: ['120 sq.yd', '166 sq.yd', '200 sq.yd'],
    heroImage: {
      url: '/placeholder/projects/bkr-landmark-township/hero.jpg',
      alt: 'Rendered masterplan view of the proposed BKR Landmark Township joint-development layout at Ghatkesar',
    },
    // This is BKR's "developers" vertical — landowner joint-development, not a direct unit
    // sale — so pricing is by negotiation and priceOnRequest is genuinely true here, not a
    // placeholder default.
    overview: [
      'BKR Landmark Township is a joint-development partnership with six landowning families at Ghatkesar, converting 18 acres of agricultural land into an approved residential layout.',
      'BKR handles design, approvals and infrastructure; developed plots are shared with landowners under a registered joint-development agreement — the model behind BKRs developer-services vertical.',
    ],
    keyStats: [
      { label: 'Total Extent Under Development', value: 18, suffix: ' Acres' },
      { label: 'Landowner Partners', value: 6 },
      { label: 'Planned Plots', value: 210 },
    ],
    gallery: [
      { url: '/placeholder/projects/bkr-landmark-township/gallery-1.jpg', alt: 'Rendered entrance arch for the proposed BKR Landmark Township at Ghatkesar' },
      { url: '/placeholder/projects/bkr-landmark-township/gallery-2.jpg', alt: 'Rendered park and avenue layout for BKR Landmark Township' },
    ],
    amenities: [
      { title: 'Avenue Plantation', icon: 'garden' },
      { title: 'Overhead Street Lighting', icon: 'power-backup' },
      { title: 'Parks', icon: 'garden' },
      { title: 'Boundary Wall & Security', icon: 'security' },
    ],
    floorPlans: [],
    specifications: [
      {
        category: 'Infrastructure',
        items: ['40 feet wide BT roads with side drains', 'Underground electrical and telecom ducting', 'Landscaped parks at every major junction'],
      },
    ],
    constructionUpdates: [],
    connectivity: [
      { place: 'Outer Ring Road Exit 16 — Ghatkesar', distance: '2 km' },
      { place: 'Uppal Metro Station', distance: '10 km' },
      { place: 'ECIL', distance: '8 km' },
      { place: 'Warangal Highway (NH163)', distance: '1 km' },
    ],
    brochureUrl: '/placeholder/brochures/bkr-landmark-township.pdf',
    reraNumber: 'P02200205712',
  },
  {
    id: 'unpublished-sample',
    title: 'BKR Horizon Towers',
    slug: 'unpublished-sample',
    tagline: 'Compact 2 and 3 BHK homes near ECIL — sold out',
    category: 'apartments',
    status: 'sold-out',
    // The show/hide fixture: isPublished false must remove this project from every surface —
    // getProjects, getFeaturedProjects, getProject and getAllProjectSlugs. featured is
    // deliberately true so a missing filter in getFeaturedProjects would actually leak it.
    isPublished: false,
    featured: true,
    order: 0,
    location: {
      area: 'ECIL',
      city: 'Hyderabad',
      mapEmbedUrl: 'https://www.google.com/maps?q=ECIL,Hyderabad&output=embed',
      lat: 17.453,
      lng: 78.557,
    },
    priceFrom: 55,
    priceUnit: 'Lakh',
    priceOnRequest: false,
    unitTypes: ['2 BHK', '3 BHK'],
    heroImage: {
      url: '/placeholder/projects/unpublished-sample/hero.jpg',
      alt: 'Completed BKR Horizon Towers apartment block near ECIL, Hyderabad',
    },
    overview: [
      'BKR Horizon Towers was a 96-unit apartment block near ECIL. The project sold out and was handed over in 2025, so it has been unpublished from the live site.',
    ],
    keyStats: [
      { label: 'Units', value: 96 },
      { label: 'Handover Year', value: 2025 },
    ],
    gallery: [{ url: '/placeholder/projects/unpublished-sample/gallery-1.jpg', alt: 'Completed facade of BKR Horizon Towers near ECIL' }],
    amenities: [
      { title: 'Gymnasium', icon: 'gym' },
      { title: 'Covered Parking', icon: 'parking' },
    ],
    floorPlans: [
      {
        title: '2 BHK',
        unitType: '2 BHK',
        area: 1200,
        areaUnit: 'sq.ft',
        image: { url: '/placeholder/projects/unpublished-sample/floorplan-2bhk.jpg', alt: 'Floor plan of the 2 BHK unit at BKR Horizon Towers' },
      },
    ],
    specifications: [{ category: 'Flooring', items: ['Vitrified tile flooring in all rooms'] }],
    constructionUpdates: [
      {
        date: '2025-06-30',
        title: 'Project fully handed over to owners',
        images: [{ url: '/placeholder/projects/unpublished-sample/update-handover.jpg', alt: 'Handover ceremony at BKR Horizon Towers' }],
      },
    ],
    connectivity: [
      { place: 'ECIL X Roads', distance: '1 km' },
      { place: 'Kushaiguda', distance: '3 km' },
      { place: 'Secunderabad Railway Station', distance: '12 km' },
    ],
    reraNumber: 'P02200142098',
  },
]

export const MOCK_SETTINGS: SiteSettings = {
  tagline: 'Redefining Real Estate Excellence',
  phones: ['+91 6301999971', '+91 9676669923'],
  whatsappNumber: '+91 6301999971',
  // `email` is deliberately absent. The brand brief names only the two phone numbers and this
  // address as verified contact facts, and a guessed inbox rendered as a `mailto:` would lose
  // enquiries silently. Consumers omit the link until a real address is supplied.
  address: 'Flat No. 202, Mythri Apartments, Opp. BSNL Office, ECIL, Hyderabad-62',
  // No verified social handles were supplied either — an empty list is a valid state for
  // consumers to degrade to, not an error.
  socials: [],
  pillars: [
    { title: 'DEVELOP', description: 'Identifying and acquiring land in the highest-growth corridors of Hyderabad before the wider market catches on.' },
    { title: 'DESIGN', description: 'Master-planning every layout and elevation for light, livability and long-term value.' },
    { title: 'DELIVER', description: 'Handing over what was promised — on time, to specification, with clear titles and RERA compliance.' },
  ],
  categories: [
    { label: 'Open Plots', value: 'open-plots' },
    { label: 'Villas', value: 'villas' },
    { label: 'Apartments', value: 'apartments' },
    { label: 'Independent Houses', value: 'independent-houses' },
    { label: 'Developers', value: 'developers' },
  ],
  // PLACEHOLDER FIGURES — not verified client facts. Task 12 needs StatsBand numbers and none
  // were supplied, so these were chosen to be conservative and plausible against the six
  // projects already in this fixture file (12 delivered is a believable cumulative count for a
  // developer whose current live roster is 5-6 projects across several years, not an inflated
  // "500+"-style claim). Every one of these four numbers MUST be replaced with the client's real
  // figures before launch — flagged again for Task 19 (the Sanity schema must expose `stats` as
  // an owner-editable array, the same way `pillars` and `categories` already are) and Task 22
  // (the owner guide must call out that these specific four numbers need verification).
  stats: [
    { label: 'Projects Delivered', value: 12, suffix: '+' },
    { label: 'Sq.ft. Developed', value: 22, suffix: ' Lakh+' },
    { label: 'Families Served', value: 650, suffix: '+' },
    { label: 'Years of Excellence', value: 9 },
  ],
  footerBlurb:
    'BKR INFRA develops open plots, villas, apartments and independent houses across fast-growing corridors of Hyderabad, backed by clear titles, RERA-registered projects and on-time handovers.',
  reraDisclaimer:
    'All projects listed here are registered with the Telangana Real Estate Regulatory Authority (TS RERA). RERA registration does not amount to an endorsement of the project. Prospective buyers are advised to verify all project details, including RERA registration numbers, independently before making any investment decision.',
  announcementBar: {
    enabled: true,
    text: 'Now open for booking — BKR Lakeview Enclave, Kokapet',
    link: '/projects/bkr-lakeview-enclave',
  },
}

const toSummary = (p: Project): ProjectSummary => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  tagline: p.tagline,
  category: p.category,
  status: p.status,
  isPublished: p.isPublished,
  featured: p.featured,
  order: p.order,
  location: { area: p.location.area, city: p.location.city },
  priceFrom: p.priceFrom,
  priceUnit: p.priceUnit,
  priceOnRequest: p.priceOnRequest,
  unitTypes: p.unitTypes,
  heroImage: p.heroImage,
})

// Publish-gating lives here, in one place, so both sources (mock and — from Task 20 — Sanity)
// behave identically. Every method below reads from `published()`, never from
// `MOCK_PROJECTS` directly, so hiding a project via `isPublished` removes it from every query.
const published = () => MOCK_PROJECTS.filter((p) => p.isPublished)

/**
 * Five journal posts: one for each of the four themes the practice writes about, plus the piece on
 * clarity that the other four kept implying and none of them stated.
 *
 * **Five, not four, and the fifth is not padding.** The home page's Journal grid shows four and
 * `JournalPreview` slices to exactly that, so a fourth post is all that route ever needed. `/journal`
 * is the listing, and a listing that shows every post it has is a listing whose top item is also its
 * last — there is no sense of a body of writing behind the one being featured. The fifth post is what
 * makes the featured row on that page a *selection* rather than a label on the only thing available.
 *
 * **Order in this array is editorial, not functional.** `publishedPosts()` sorts by date, so the
 * newest post is the one every consumer sees first regardless of where it sits here. It is kept
 * newest-first anyway because that is the order a reader of this file expects, and because the
 * newest entry is the one that becomes `/journal`'s featured row — worth being able to see at a
 * glance which record that is.
 *
 * **Every `coverImage.url` is a frame `components/project/photo.ts` lists as usable, and every `alt`
 * describes the photograph actually at that path.** Both halves of that matter and the second is the
 * easier one to lose: an `alt` written for the picture an editor had in mind rather than the one on
 * disk passes every automated check we have — the a11y suite asserts that alt text exists, not that
 * it is true — while telling a screen-reader user something about the page that is simply false.
 * `photo.ts` documents which of the 26 frames are not contemporary residential development at all
 * (a barn, log cabins, a person in a field); those are unusable here for the same reason they are
 * unusable in a project gallery, and a cover is the most prominent slot on the site for one to land
 * in. When genuine BKR INFRA photography replaces the placeholder set, these five paths and these
 * five descriptions change together or not at all.
 *
 * `unpublished-journal-sample` is deliberately `isPublished: false` so the gating on every journal
 * query has something to actually exclude — the same role `unpublished-sample` plays for projects.
 * Without it, a query that forgot its `isPublished` filter would pass every test.
 */
const MOCK_JOURNAL: JournalPost[] = [
  {
    id: 'jp-1',
    title: 'Designing for Long-Term Living Rather Than Trends',
    slug: 'designing-for-long-term-living',
    excerpt:
      'A house that photographs well in its first year and dates in its fifth has solved the wrong problem.',
    body: [
      'The materials that age well are rarely the ones that look newest on handover day. Brick weathers, timber silvers, stone takes on the colour of the place it sits in. Finishes chosen for immediate effect tend to move in the opposite direction.',
      'We plan for the second decade rather than the first year. That shapes small decisions — where a downpipe runs, how a threshold sheds water, whether a junction can be repaired without being replaced — long before it shapes anything visible.',
    ],
    coverImage: {
      url: '/photography/exterior-05.jpg',
      alt: 'White cubic massing in raking afternoon sun, seen from the street',
    },
    publishedAt: '2026-08-14',
    isPublished: true,
  },
  {
    id: 'jp-2',
    title: 'The Role of Material Honesty in a Warm Climate',
    slug: 'material-honesty-warm-climate',
    excerpt:
      'Hyderabad asks different questions of a building than a temperate climate does, and the answers are mostly about shade.',
    body: [
      'Deep reveals, generous eaves and screened openings do more for comfort here than any amount of glazing specification. Shade is cheaper than cooling, and it lasts longer.',
      'Material honesty is not an aesthetic position in this climate so much as a practical one: surfaces that show what they are tend also to be the ones that survive being rained on for three months a year.',
    ],
    coverImage: {
      url: '/photography/exterior-04.jpg',
      alt: 'White villa with deep eaves shading a planted forecourt',
    },
    publishedAt: '2026-07-02',
    isPublished: true,
  },
  {
    id: 'jp-3',
    title: 'Balancing Openness, Privacy, and Everyday Comfort',
    slug: 'openness-privacy-comfort',
    excerpt:
      'Open plan is a means, not a goal. The useful question is which rooms need to be closable.',
    body: [
      'A single volume that cannot be subdivided works well for entertaining and badly for a household where two people need to do different things at the same time.',
      'We tend toward plans that open fully and close partially — sliding partitions, offset sightlines, a study that can be shut without being isolated. The flexibility is what makes a plan last through a family changing shape.',
    ],
    coverImage: {
      url: '/photography/interior-01.jpg',
      alt: 'Living room open to a stair, with a pool beyond the full-height glazing',
    },
    publishedAt: '2026-05-21',
    isPublished: true,
  },
  {
    id: 'jp-4',
    title: 'Creating a Strong Relationship Between Home and Site',
    slug: 'home-and-site',
    excerpt: 'The first drawing we make of any plot is not of a building.',
    body: [
      'It is of where the sun lands in June and December, where water runs after rain, which neighbouring windows look in, and which trees are worth keeping.',
      'Everything afterwards is a response to that drawing. A plan developed before the site is understood can only be adjusted to fit it, never shaped by it.',
    ],
    coverImage: {
      url: '/photography/interior-05.jpg',
      alt: 'Black upper storey over timber cladding, beside a mature gum kept on the plot',
    },
    publishedAt: '2026-03-09',
    isPublished: true,
  },
  {
    id: 'jp-5',
    title: 'Choosing Clarity Over Complication in a Floor Plan',
    slug: 'clarity-over-complication',
    excerpt:
      'A plan a family can read at a glance is doing more work than one that has to be explained.',
    body: [
      'Complication in a plan is usually a deferred decision. A room that could be a study or a second sitting room is often neither, because nothing about it commits: no wall is thick enough to sit against, no window is placed for one use over another, and the door is in the middle.',
      'Those questions cost nothing to settle on paper and a great deal to settle later. The test we use is whether someone can walk a plan once and know where they would eat, where they would work and where the house goes quiet — before anybody has explained it to them.',
    ],
    coverImage: {
      url: '/photography/exterior-03.jpg',
      alt: 'Open-plan living room reading straight through to a timber deck',
    },
    publishedAt: '2026-01-26',
    isPublished: true,
  },
  {
    id: 'jp-hidden',
    title: 'Unpublished Journal Sample',
    slug: 'unpublished-journal-sample',
    excerpt: 'Never served. Exists so publish-gating has something to exclude.',
    body: ['If this is ever visible on the site, a journal query has lost its isPublished filter.'],
    coverImage: { url: '/photography/detail-08.jpg', alt: 'Placeholder' },
    publishedAt: '2026-09-01',
    isPublished: false,
  },
]

const publishedPosts = () =>
  MOCK_JOURNAL.filter((p) => p.isPublished).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

export const mockSource: DataSource = {
  async getProjects(filter) {
    return published()
      .filter((p) => (filter?.category ? p.category === filter.category : true))
      .filter((p) => (filter?.status ? p.status === filter.status : true))
      .sort((a, b) => a.order - b.order)
      .map(toSummary)
  },
  async getFeaturedProjects() {
    return published()
      .filter((p) => p.featured)
      .sort((a, b) => a.order - b.order)
      .map(toSummary)
  },
  async getProject(slug) {
    return published().find((p) => p.slug === slug) ?? null
  },
  async getAllProjectSlugs() {
    return published().map((p) => p.slug)
  },
  async getSiteSettings() {
    return MOCK_SETTINGS
  },
  async getJournalPosts() {
    return publishedPosts()
  },
  async getJournalPost(slug) {
    return publishedPosts().find((p) => p.slug === slug) ?? null
  },
  async getAllJournalSlugs() {
    return publishedPosts().map((p) => p.slug)
  },
}
