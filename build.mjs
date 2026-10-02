// Generates every inner page of the site from assets/films.js + the copy below.
// Usage: node website/build.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(DIR, "assets/films.js"), "utf8"), sandbox);
const { STUDIO, FILMS, ytId: ytIdOf } = sandbox;
const DOMAIN = STUDIO.domain.replace(/\/$/, "");
const OG_IMAGE = `${DOMAIN}/assets/og-image.png`;
const UPDATED = "October 2, 2026";
const film = (slug) => FILMS.find((f) => f.slug === slug);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const num = (i) => `[${String(i + 1).padStart(2, "0")}]`;

/* ------------------------------------------------------------------ */
/* Shared partials                                                     */
/* ------------------------------------------------------------------ */

const NAV = [
  ["work.html", "Work"],
  ["services.html", "Services"],
  ["pricing.html", "Pricing"],
  ["process.html", "Process"],
  ["about.html", "Studio"],
];

const MENU = [
  ["work.html", "Work"],
  ["services.html", "Services"],
  ["pricing.html", "Pricing"],
  ["process.html", "Process"],
  ["real-estate-agents.html", "For Agents"],
  ["brokerages.html", "For Brokerages"],
  ["vacation-rentals.html", "For Hosts"],
  ["commercial.html", "Commercial"],
  ["about.html", "Studio"],
  ["contact.html", "Contact"],
];

function header(R, active) {
  const home = R || "./";
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="${home}"><img src="${R}assets/logo.png" alt="${STUDIO.name}" width="86" height="60"><span class="brand-tag">Cinematic walkthrough agency</span></a>
  <div class="header-actions">
    <nav class="nav" aria-label="Primary navigation">${NAV.map(([href, label]) => `<a href="${R}${href}"${href === active ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
    <a class="btn btn-light header-cta" href="${R}contact.html?intent=sample" data-cursor="Free">Free sample</a>
    <button class="menu" id="menu-open" type="button" aria-expanded="false" aria-controls="site-menu">Menu</button>
  </div>
</header>
<div class="site-menu" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu">
  <button class="menu menu-close" id="menu-close" type="button">Close</button>
  <nav aria-label="All pages">
    <a href="${home}">Showreel</a>
    ${MENU.map(([href, label]) => `<a href="${R}${href}"${href === active ? ' aria-current="page"' : ""}>${label}</a>`).join("\n    ")}
  </nav>
  <div class="menu-side">
    <p>We turn static listing photos into 4K cinematic walkthroughs and platform-ready reels for Colorado agents, brokerages and Airbnb hosts. No crew, no scheduling, back in under 24 hours.</p>
    <a class="btn btn-light" href="${R}contact.html?intent=sample">Get a free sample of your listing</a>
    <div class="links"><a href="${R}virtual-twilight.html">Virtual Twilight</a><a href="${R}boulder-real-estate-video.html">Boulder</a><a href="${R}service-areas.html">Service Areas</a><a href="${R}faq.html">FAQ</a></div>
    <p><a href="mailto:${STUDIO.email}">${STUDIO.email}</a></p>
  </div>
</div>`;
}

function footer(R) {
  const col = (title, links) => `<div class="footer-col"><h2>${title}</h2><ul>${links.map(([h, l]) => `<li><a href="${R}${h}">${l}</a></li>`).join("")}</ul></div>`;
  return `<footer class="site-footer">
  <div class="footer-top">
    <div class="footer-brand">
      <a class="brand" href="${R || "./"}"><img src="${R}assets/logo.png" alt="${STUDIO.name}" width="94" height="66"></a>
      <p>The cinematic walkthrough agency. Homes, Airbnbs, golf courses, gyms, hotels and every space in between, turned from still photos into 4K films in under 24 hours. Based in Boulder, Colorado.</p>
      <p><a class="text-link" href="mailto:${STUDIO.email}">${STUDIO.email}</a></p>
    </div>
    ${col("Services", [["services.html#walkthroughs", "Cinematic walkthroughs"], ["services.html#reels", "Social reels"], ["virtual-twilight.html", "Virtual twilight"], ["services.html#addons", "Voiceover &amp; add-ons"], ["pricing.html", "Pricing"]])}
    ${col("Who we serve", [["real-estate-agents.html", "Real estate agents"], ["brokerages.html", "Brokerages &amp; teams"], ["vacation-rentals.html", "Airbnb &amp; rental hosts"], ["commercial.html", "Gyms, golf &amp; commercial"], ["service-areas.html", "Service areas"]])}
    ${col("Studio", [["work.html", "Work"], ["process.html", "Process"], ["about.html", "About the studio"], ["faq.html", "FAQ"], ["contact.html", "Contact"]])}
  </div>
  <img class="footer-logo" src="${R}assets/logo.png" alt="" aria-hidden="true" width="821" height="573" loading="lazy">
  <div class="footer-bottom">
    <p>All video content is generated from original listing photography. No structural or architectural modifications are made. Videos are intended for marketing purposes only. &copy; <span data-year>2026</span> ${STUDIO.name}, Boulder, Colorado.</p>
    <nav aria-label="Legal"><a href="${R}privacy.html">Privacy</a><a href="${R}terms.html">Terms</a><a href="${R}sitemap.xml">Sitemap</a></nav>
  </div>
</footer>
<div class="custom-cursor" aria-hidden="true"><span class="cursor-orbit"></span><span class="cursor-dot"></span><span class="cursor-label">Enter</span></div>`;
}

function hero({ kicker, title, long, lede, actions = "", media, crumbs, size = "", side = "" }) {
  return `<section class="hero ${size}">
  ${media ? `<div class="hero-media" ${media} aria-hidden="true"></div>` : ""}
  <div class="hero-inner">
    <div>
      ${crumbs || ""}
      <p class="kicker reveal">${kicker}</p>
      <h1 class="display reveal${long ? " long" : ""}">${title}</h1>
    </div>
    <div class="reveal">
      <p class="lede">${lede}</p>
      ${actions ? `<div class="btn-row">${actions}</div>` : ""}
      ${side}
    </div>
  </div>
</section>`;
}

const head = (kicker, title, text = "") => `<div class="section-head reveal"><div><p class="kicker">${kicker}</p><h2 class="display">${title}</h2></div>${text ? `<p>${text}</p>` : ""}</div>`;

const ctaBand = (R, { title = "Your listing,<br>in motion.", text = "Send us the link to a current listing. We'll cut a free sample reel from its photos so you can see the quality before you spend a dollar.", film: f = "estate" } = {}) => `<section class="cta-band reveal">
  <div class="hero-media" data-film="${f}" aria-hidden="true"></div>
  <h2 class="display">${title}</h2>
  <p>${text}</p>
  <div class="btn-row"><a class="btn btn-light" href="${R}contact.html?intent=sample" data-cursor="Free">Get my free sample</a><a class="btn btn-ghost" href="${R}pricing.html">See pricing</a></div>
</section>`;

const filmCard = (R, f, i) => `<a class="film-card reveal" href="${R}work/${f.slug}.html" data-film="${f.slug}" data-category="${esc(f.category)}" data-cursor="Watch">
  <span class="tag">${num(i)} ${esc(f.category)}</span>
  <span class="meta"><b>${esc(f.title)}</b><span>${esc(f.label)} &middot; ${esc(f.place)}</span></span>
</a>`;
const filmGrid = (R, slugs, three = false) => `<div class="film-grid${three ? " three" : ""}">${slugs.map((s) => filmCard(R, film(s), FILMS.indexOf(film(s)))).join("\n")}</div>`;

const stats = () => `<div class="stats reveal">
  <div class="stat"><b>&lt;24h</b><span>From photos received to finished files</span></div>
  <div class="stat"><b>4K</b><span>Cinematic resolution, graded and stabilized</span></div>
  <div class="stat"><b>3</b><span>Formats per film: 9:16, 16:9 and 1:1</span></div>
  <div class="stat"><b>0</b><span>Film crews, shoot days or showings disrupted</span></div>
</div>`;

const faqList = (items) => `<div class="faq">${items.map(([q, a]) => `<details class="reveal"><summary>${q}</summary><div class="answer"><p>${a}</p></div></details>`).join("\n")}</div>`;
const faqSchema = (items) => ({
  "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q.replace(/<[^>]+>/g, ""), acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })),
});

const crumbsHtml = (R, items) => `<ol class="breadcrumbs reveal" aria-label="Breadcrumb"><li><a href="${R || "./"}">Home</a></li>${items.map(([href, label], i) => (i === items.length - 1 ? `<li aria-current="page">${label}</li>` : `<li><a href="${R}${href}">${label}</a></li>`)).join("")}</ol>`;

const STUDIO_REF = { "@id": `${DOMAIN}/#studio` };
const service = (name, description, price, extra = {}) => ({
  "@type": "Service",
  name,
  description,
  provider: STUDIO_REF,
  areaServed: { "@type": "State", name: "Colorado" },
  ...(price ? { offers: { "@type": "Offer", price: String(price), priceCurrency: "USD" } } : {}),
  ...extra,
});

/* ------------------------------------------------------------------ */
/* Shared content                                                      */
/* ------------------------------------------------------------------ */

const ADDONS = [
  ["AI luxury voiceover", "A deep, warm narrator voice reads a four-sentence script we write around the home's best features. Turns a walkthrough into a story.", "+$150 / video"],
  ["Virtual twilight", "Your daytime exterior, converted to dusk: deep blue sky, glowing windows, soft landscape uplighting. Architecture untouched.", "+$75 / photo"],
  ["Neighborhood lifestyle intro", "A five-second opener of the place itself before the tour: the Flatirons, Pearl Street, Chautauqua trails, the farmers market.", "+$100 / listing"],
  ["Multi-platform format pack", "An unbranded MLS-compliant cut, a 4:5 feed version and custom cover frames for every platform you post on.", "+$100"],
  ["Same-day rush", "Photos in by noon Mountain Time, finished files the same evening. Guaranteed.", "+$100 / listing"],
  ["Agent personal brand reel", "A 15-second cinematic reel about you, not the house: your headshot, Boulder B-roll and a voiceover introduction. Made to be your pinned post.", "+$200"],
  ["Monthly market update video", "A 30-second animated reel with the month's median price, days on market and inventory for your area. Stay visible between listings.", "+$200 / month"],
];
const addonsHtml = () => `<div class="addons">${ADDONS.map(([t, d, p]) => `<div class="addon reveal"><h3>${t}</h3><p>${d}</p><b>${p}</b></div>`).join("")}</div>`;

const SHOTS = [
  ["Living room &amp; great room", "Slow, steady push-in across the floor toward the windows, with golden-hour light and a shallow depth of field."],
  ["Kitchen", "An elegant orbit around the island so stone, steel and the flow to the living space all read in one move."],
  ["Primary bedroom", "A calm left-to-right tracking shot in soft daylight that reveals the room the way a buyer walks into it."],
  ["Bathroom &amp; spa", "A slow forward dolly into the bath with warm vanity light, the tub and the stone surfaces in frame."],
  ["Exterior front", "A cinematic pull-back from the facade under a Colorado-blue sky, low and rising like a drone."],
  ["Mountain view exterior", "A rising aerial-style pull-back at blue hour with the peaks behind and the windows glowing warm."],
  ["Deck, patio &amp; outdoor living", "A forward walk out onto the deck toward the view: fire pit, string lights, golden hour."],
];

const RULE = `<div class="disclaimer-box reveal"><strong>Motion and light only.</strong> All video content is generated from original listing photography. We never add rooms, pools, views, finishes or features that aren't in your photos, and we make no structural or architectural modifications. Videos are intended for marketing purposes only.</div>`;

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

const pages = [];
const page = (p) => pages.push(p);

/* Services ---------------------------------------------------------- */
page({
  file: "services.html",
  title: "Real Estate Video Services: Walkthroughs, Reels & Virtual Twilight | Python Walkthroughs",
  description: "Cinematic walkthroughs for homes, Airbnbs, golf courses, gyms and hotels, plus vertical reels, virtual twilight and AI voiceover. Made from your photos, delivered in under 24 hours.",
  active: "services.html",
  crumbs: [["services.html", "Services"]],
  schema: [
    service("Cinematic real estate walkthrough video", "30 to 45 second 4K cinematic walkthrough made from listing photos, delivered in vertical, horizontal and square formats within 24 hours.", 350),
    service("Real estate social reels", "Vertical 9:16 reels for Instagram, TikTok and YouTube Shorts made from listing photos."),
    service("Virtual twilight conversion", "Daytime exterior real estate photos converted to dusk with glowing windows, architecture unchanged.", 75),
  ],
  body: (R) => `${hero({
    kicker: "Services",
    title: "Every space,<br>a film.",
    lede: "Your photographer already captured the space. We give it motion, light and a score: cinematic walkthroughs and social reels for homes, Airbnbs, golf courses, gyms and hotels, cut from the photos you already have. No shoot day, no crew on site, no two-week wait for an edit.",
    actions: `<a class="btn btn-light" href="${R}contact.html?intent=sample" data-cursor="Free">Get a free sample</a><a class="btn btn-ghost" href="${R}pricing.html">See pricing</a>`,
    media: 'data-film="estate"',
    crumbs: crumbsHtml(R, [["services.html", "Services"]]),
  })}
<main id="main">
<section class="section">
  ${head("What we make", "Six ways to<br>sell the feeling.", "Every deliverable is built from your original listing photography, graded to a consistent cinematic look and exported for every place you post.")}
  <div class="grid grid-3">
    <article class="card reveal" id="walkthroughs"><span class="num">[01]</span><h3>Cinematic walkthrough films</h3><p>A 30 to 45 second 4K tour with gimbal-smooth camera motion through every key room: push-ins, orbits, tracking shots and a closing exterior reveal. Music, address, price and your branding included.</p><span class="price-tag">From $350</span></article>
    <article class="card reveal" id="reels"><span class="num">[02]</span><h3>Social reels</h3><p>Vertical cuts built for Instagram Reels, TikTok and YouTube Shorts. A hook in the first second, tight pacing, on-screen text and a clear call to action. Two reels per listing come standard on retainers.</p><span class="price-tag">Included on retainers</span></article>
    <article class="card reveal" id="twilight"><span class="num">[03]</span><h3>Virtual twilight</h3><p>The image luxury listings lead with. We convert a daytime exterior into a deep-blue dusk scene with warm, glowing windows and soft uplighting, keeping the architecture exactly as it is.</p><a class="price-tag text-link" href="${R}virtual-twilight.html">+$75 per photo &rarr;</a></article>
    <article class="card reveal" id="brand"><span class="num">[04]</span><h3>Agent brand reels</h3><p>A 15-second cinematic introduction to you: headshot, Boulder B-roll and a narrated intro. Agents pin it to the top of their profile because it sells the person, not just the property.</p><span class="price-tag">+$200</span></article>
    <article class="card reveal" id="market"><span class="num">[05]</span><h3>Market update videos</h3><p>A 30-second animated reel each month with median price, days on market and inventory for your area. The easiest way to stay in the feed between listings.</p><span class="price-tag">+$200 / month</span></article>
    <article class="card reveal" id="rentals"><span class="num">[06]</span><h3>Vacation rental films</h3><p>Walkthroughs and Instagram reels for Airbnb and VRBO hosts who want guests booking direct. Seasonal refresh films keep a mountain property looking current all year.</p><a class="price-tag text-link" href="${R}vacation-rentals.html">From $300 &rarr;</a></article>
  </div>
</section>

<section class="section alt">
  ${head("Every format", "One film.<br>Three frames.", "Each project ships in the three shapes the internet actually uses, so you never have to crop a horizontal video into a vertical feed again.")}
  <div class="grid grid-3">
    <div class="card reveal"><div class="icon">9:16</div><h3>Vertical</h3><p>Instagram Reels, TikTok, YouTube Shorts and Stories. Where buyers and guests scroll first.</p></div>
    <div class="card reveal"><div class="icon">16:9</div><h3>Horizontal</h3><p>The MLS, YouTube, Zillow, your website and the email you send to your sphere.</p></div>
    <div class="card reveal"><div class="icon">1:1</div><h3>Square</h3><p>Facebook, LinkedIn and paid social placements that still favor the square frame.</p></div>
  </div>
</section>

<section class="section" id="addons">
  ${head("Add-ons", "Make it<br>unmissable.", "Add these to any package. Most cost us minutes and earn you a noticeably better listing launch.")}
  ${addonsHtml()}
</section>

<section class="section tight">
  ${RULE}
</section>
${ctaBand(R)}
</main>`,
});

/* Pricing ----------------------------------------------------------- */
const pricingFaq = [
  ["Do you offer a free trial?", "Yes. Send us a link to one of your current listings and we'll cut a short vertical reel from its photos for free. It's yours to post whether or not you hire us."],
  ["How do I pay?", "Every project is invoiced through Stripe, so you can pay by card or bank transfer. Retainers are billed monthly at the start of each cycle."],
  ["What counts as a listing on a retainer?", "One property address. Each listing on a retainer gets a full cinematic walkthrough, two social reels and all three formats."],
  ["Can I change plans?", "Yes. Move between the single listing package and the retainers at any time. Changes take effect on your next billing cycle."],
  ["Do unused listings roll over?", "Retainer listings reset each month. If you consistently need more, the Brokerage Team package covers up to 10 listings across your team."],
];
const priceCard = ({ name, price, per = "", desc, items, cta, href, featured, badge }) => `<article class="price-card reveal${featured ? " featured" : ""}">
  ${badge ? `<span class="badge">${badge}</span>` : ""}
  <h3>${name}</h3><p class="muted">${desc}</p>
  <p class="price">$${price}${per ? `<small> ${per}</small>` : ""}</p>
  <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>
  <a class="btn ${featured ? "btn-light" : "btn-ghost"}" href="${href}">${cta}</a>
</article>`;
const agentPlans = (R) => `<div class="price-grid">
  ${priceCard({ name: "Single Listing", price: "350", desc: "One property, one cinematic film.", items: ["1 cinematic walkthrough (30 to 45 seconds)", "Vertical, horizontal and square formats", "Delivered within 24 hours", "1 round of revisions"], cta: "Start a listing", href: `${R}contact.html?package=single` })}
  ${priceCard({ name: "Agent Retainer", price: "1,200", per: "/ month", desc: "For agents listing every month.", items: ["Up to 4 listings per month", "Walkthrough plus 2 social reels per listing", "All 3 formats included", "Virtual twilight included", "Priority 12-hour turnaround", "Unlimited revisions"], cta: "Become a retainer client", href: `${R}contact.html?package=agent-retainer`, featured: true, badge: "Most popular" })}
  ${priceCard({ name: "Brokerage Team", price: "2,500", per: "/ month", desc: "For teams that want one consistent look.", items: ["Up to 10 listings per month across the team", "Everything in the Agent Retainer", "Branded intro and outro with logo and agent headshot", "Monthly neighborhood market update video", "Dedicated Slack or WhatsApp request channel"], cta: "Talk to us", href: `${R}contact.html?package=brokerage` })}
</div>`;
const hostPlans = (R) => `<div class="price-grid two">
  ${priceCard({ name: "Listing Boost", price: "300", desc: "Refresh one rental in a day.", items: ["1 cinematic property walkthrough (30 to 45 seconds)", "2 short social reels optimized for Instagram", "Delivered within 24 hours"], cta: "Boost my listing", href: `${R}contact.html?package=listing-boost` })}
  ${priceCard({ name: "Host Retainer", price: "800", per: "/ month", desc: "For hosts and managers with a portfolio.", items: ["Up to 3 properties", "Seasonal refresh film every quarter", "Social reels for direct-booking promotion", "Virtual twilight exterior shots"], cta: "Start a host retainer", href: `${R}contact.html?package=host-retainer`, featured: true, badge: "Best value" })}
</div>`;

page({
  file: "pricing.html",
  title: "Real Estate Video Pricing | Listing Films from $350 | Python Walkthroughs",
  description: "Transparent pricing for cinematic real estate videos: $350 single listing films, $1,200/month agent retainers, $2,500/month brokerage packages and Airbnb host plans from $300.",
  active: "pricing.html",
  crumbs: [["pricing.html", "Pricing"]],
  schema: [
    {
      "@type": "OfferCatalog",
      name: "Python packages",
      itemListElement: [
        ["Single Listing Package", 350], ["Agent Monthly Retainer", 1200], ["Brokerage Team Package", 2500], ["Listing Boost Package", 300], ["Host Monthly Retainer", 800],
      ].map(([name, price]) => ({ "@type": "Offer", name, price: String(price), priceCurrency: "USD", seller: STUDIO_REF })),
    },
    faqSchema(pricingFaq),
  ],
  body: (R) => `${hero({
    kicker: "Pricing",
    title: "A fraction of<br>a film crew.",
    lede: "Flat, published prices. No day rates, no travel fees, no surprise invoices. Start with a free sample, then pick the plan that fits how often you list.",
    actions: `<a class="btn btn-light" href="${R}contact.html?intent=sample" data-cursor="Free">Get a free sample first</a>`,
    size: "compact",
    media: 'data-film="golf"',
    crumbs: crumbsHtml(R, [["pricing.html", "Pricing"]]),
  })}
<main id="main">
<section class="section">
  ${head("Real estate agents &amp; brokerages", "Listing<br>packages.", "Every package includes cinematic camera motion, color grading, licensed music, text overlays with address, price and your branding, and delivery to a shared folder.")}
  ${agentPlans(R)}
</section>
<section class="section alt">
  ${head("Airbnb &amp; vacation rental hosts", "Host<br>packages.", "Built for Superhosts and property managers in Boulder, Nederland, Estes Park and across the Colorado mountains.")}
  ${hostPlans(R)}
</section>
<section class="section" id="addons">
  ${head("Add-ons", "Stack the<br>launch.", "Available on every package. Retainer clients get virtual twilight and all three formats at no extra charge.")}
  ${addonsHtml()}
</section>
<section class="section">
  ${head("Billing questions", "Straight<br>answers.")}
  ${faqList(pricingFaq)}
  <p class="muted reveal" style="margin-top:28px">More questions? Read the full <a class="text-link" href="${R}faq.html">FAQ</a> or <a class="text-link" href="${R}contact.html">talk to us</a>.</p>
</section>
${ctaBand(R, { film: "golf" })}
</main>`,
});

/* Process ----------------------------------------------------------- */
page({
  file: "process.html",
  title: "How It Works: From Listing Photos to Cinematic Video in 24 Hours | Python Walkthroughs",
  description: "Send a listing link, get a 4K cinematic walkthrough back in under 24 hours. See our six-step process, our shot library and exactly what we need from you.",
  active: "process.html",
  crumbs: [["process.html", "Process"]],
  schema: [{
    "@type": "HowTo",
    name: "How to turn listing photos into a cinematic walkthrough video",
    totalTime: "PT24H",
    step: ["Send the listing", "We storyboard", "We create the motion", "We edit and brand", "We deliver", "You review"].map((name, i) => ({ "@type": "HowToStep", position: i + 1, name })),
  }],
  body: (R) => `${hero({
    kicker: "Process",
    title: "Photos in.<br>Film out.",
    lede: "You never schedule a crew, prep the house twice or chase an editor. You send a link. Within 24 hours a finished, branded film is waiting in your folder in every format you need.",
    actions: `<a class="btn btn-light" href="${R}contact.html">Send your first listing</a>`,
    size: "compact",
    media: 'data-film="loft"',
    crumbs: crumbsHtml(R, [["process.html", "Process"]]),
  })}
<main id="main">
<section class="section">
  ${head("Six steps", "The 24-hour<br>pipeline.")}
  <div class="steps">
    <div class="step reveal"><h3>Send the listing</h3><p>Drop us a Zillow or MLS link, or share a folder of 15 to 40 high-resolution photos. Add the address, price and any branding you want on screen.</p></div>
    <div class="step reveal"><h3>We storyboard</h3><p>We pick the strongest frames and plan a camera move for each room, then sequence them the way a buyer would walk the home: arrival, gathering spaces, kitchen, retreat, view.</p></div>
    <div class="step reveal"><h3>We create the motion</h3><p>Each photo becomes a smooth, cinematic shot with natural light and depth. Every clip is checked by an editor; anything that warps, morphs or adds something that isn't there gets thrown out.</p></div>
    <div class="step reveal"><h3>We edit and brand</h3><p>Clips are cut to music, color graded to one consistent look and finished with your address, price, logo and contact details. Voiceover and twilight are added here if you ordered them.</p></div>
    <div class="step reveal"><h3>We deliver</h3><p>Vertical, horizontal and square exports land in your shared folder in under 24 hours, or within 12 hours on a retainer. You get a message the moment they're ready.</p></div>
    <div class="step reveal"><h3>You review</h3><p>Want a different song, a slower open or a new headline? Single listings include one round of revisions. Retainers include unlimited revisions.</p></div>
  </div>
</section>

<section class="section alt">
  ${head("Shot library", "A move for<br>every room.", "Our camera language is standardized, so every film feels expensive and every client gets the same quality on every listing.")}
  <div class="grid grid-3">
    ${SHOTS.map(([t, d], i) => `<div class="card reveal"><span class="num">${num(i)}</span><h3>${t}</h3><p>${d}</p></div>`).join("\n    ")}
    <div class="card reveal"><span class="num">[08]</span><h3>Your rule, not ours</h3><p>Prefer a specific opening shot or a room left out? Tell us when you send the listing. We'll build the storyboard around it.</p></div>
  </div>
</section>

<section class="section">
  <div class="split">
    <div class="reveal"><p class="kicker">What we need</p><h2 class="display">Your part<br>takes two minutes.</h2></div>
    <div class="reveal prose">
      <ul>
        <li><strong>Photos.</strong> A listing link or 15 to 40 high-resolution images. Professional photography gives the best results.</li>
        <li><strong>The basics.</strong> Address, price and anything you want highlighted, like a view, a renovation or acreage.</li>
        <li><strong>Branding.</strong> Your logo, headshot, brokerage colors and contact line. We save it for every future film.</li>
        <li><strong>Usage rights.</strong> Confirmation that you're allowed to use the listing photography for marketing. Most agents are, through their photographer agreement.</li>
      </ul>
      <p>That's it. No lockbox codes, no staging day, no one walking through your seller's home.</p>
    </div>
  </div>
</section>
<section class="section tight">${RULE}</section>
${ctaBand(R, { film: "loft", title: "Try the<br>pipeline free." })}
</main>`,
});

/* Work -------------------------------------------------------------- */
const categories = [...new Set(FILMS.map((f) => f.category))];
page({
  file: "work.html",
  title: "Work: Cinematic Real Estate Walkthrough Examples | Python Walkthroughs",
  description: "Watch cinematic walkthrough examples for mountain estates, golf course homes, Airbnb cabins, city lofts, ranches, lake houses, boutique hotels and virtual twilight, all made from listing photos.",
  active: "work.html",
  crumbs: [["work.html", "Work"]],
  schema: [{
    "@type": "ItemList",
    name: "Cinematic walkthrough examples",
    itemListElement: FILMS.map((f, i) => ({ "@type": "ListItem", position: i + 1, url: `${DOMAIN}/work/${f.slug}.html`, name: `${f.label} walkthrough` })),
  }],
  body: (R) => `${hero({
    kicker: "Work",
    title: "Any space.<br>On film.",
    lede: "Mountain estates, golf clubs, Airbnb cabins, penthouses, ranches, lake houses, hotels and gyms. Every film below started as a set of still photos. Pick a space to see how we move through it.",
    actions: `<a class="btn btn-light" href="${R}contact.html?intent=sample" data-cursor="Free">Get one for your listing</a>`,
    size: "compact",
    media: 'data-film="cabin"',
    crumbs: crumbsHtml(R, [["work.html", "Work"]]),
  })}
<main id="main">
<section class="section">
  <div class="filters reveal" role="group" aria-label="Filter by property type">
    <button type="button" data-filter="all" aria-pressed="true">All</button>
    ${categories.map((c) => `<button type="button" data-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join("")}
  </div>
  ${filmGrid(R, FILMS.map((f) => f.slug), true)}
</section>
<section class="section tight">${stats()}</section>
<section class="section">
  <div class="split">
    <div class="reveal"><p class="kicker">Why it works</p><h2 class="display">Stills get<br>scrolled past.</h2></div>
    <div class="reveal prose">
      <p>Social feeds reward motion. A carousel of listing photos asks a buyer to do the work of imagining the home; a cinematic walkthrough does it for them, in the format the platform wants to show.</p>
      <p>Our films keep everything that makes your photography good, including the composition, the light and the staging, and add the one thing a photo can't have: the feeling of walking in.</p>
      <p><a class="text-link" href="${R}process.html">See how we make them &rarr;</a></p>
    </div>
  </div>
</section>
${ctaBand(R, { film: "cabin" })}
</main>`,
});

/* Case studies ------------------------------------------------------ */
const CASES = {
  estate: {
    h1: "Mountain Estate",
    seo: "Luxury Mountain Home Video Walkthrough, Boulder CO",
    intro: "Mountain-modern homes are all glass, light and long sightlines, which is exactly what a still photo flattens. This film walks in through the entry, holds on the great room and the view beyond it, then moves through the primary suite and finishes in the kitchen.",
    shots: [["Exterior pull-back", "A low, rising reveal of the facade against the Colorado sky."], ["Great-room push-in", "A steady glide across the floor toward the window wall."], ["Kitchen orbit", "A slow arc around the island to show stone, steel and flow."], ["Deck walk-out", "We step outside into the view and hold on the light."]],
    pairs: ["Virtual twilight for the hero exterior", "AI luxury voiceover", "Neighborhood lifestyle intro"],
    related: ["golf", "ranch", "dusk"],
  },
  golf: {
    h1: "Golf Course",
    seo: "Golf Course & Golf Club Video Walkthroughs, Colorado",
    intro: "Golf sells the setting. For clubs we open wide on the landscape, then fly the signature holes in the order a golfer plays them, built to drive memberships, tournaments and events. For course-side homes we start on the fairway and move back toward the rooms that look out at the grass. If the footage shows the green, the film shows the green. If it doesn't, we don't invent one.",
    shots: [["Clubhouse arrival", "A slow approach to the entrance, then the doors open onto the view."], ["First-tee reveal", "A rising move that lets the course unfold toward the mountains."], ["Course-view great room", "A push-in toward the windows that frame the fairway."], ["Patio glide", "A forward walk out to the patio, eyes on the green."]],
    pairs: ["Membership-drive social reels", "Virtual twilight over the course", "AI luxury voiceover"],
    related: ["estate", "gym", "hotel"],
  },
  cabin: {
    h1: "Airbnb Cabin",
    seo: "Airbnb Cabin Video for Vacation Rental Hosts, Nederland CO",
    intro: "Guests book a feeling, not a floor plan. This cabin film is about the treetop arrival, the timber great room and the glow of the windows at dusk, and it's cut vertical first for Instagram and TikTok, where direct bookings start.",
    shots: [["Snow-light exterior", "A gentle pull-back that sets the scene in the trees."], ["Fireplace push-in", "The warmest corner of the cabin, slowly coming closer."], ["Loft pan", "A calm pan across the sleeping loft and its beams."], ["Hot-tub deck", "We walk out to the tub at dusk and hold on the steam."]],
    pairs: ["Seasonal refresh on the Host Retainer", "Social reels for direct booking", "Virtual twilight exterior"],
    related: ["lake", "hotel", "ranch"],
  },
  loft: {
    h1: "City Penthouse",
    seo: "Condo & Penthouse Video Walkthrough, Denver CO",
    intro: "City buyers scroll fast. This film hooks on the window wall, moves through the kitchen and the primary suite, then finishes on the roof deck with the skyline. It's tight, modern and built for launch-day posting.",
    shots: [["Skyline window glide", "Straight to the view, because that's what they're paying for."], ["Kitchen-island orbit", "A clean arc that shows the island, the finishes and the flow."], ["Primary-suite track", "Left to right through the bedroom and into the light."], ["Amenity sweep", "Rooftop, gym or lobby, if it's in your photo set."]],
    pairs: ["Multi-platform format pack", "Same-day rush", "AI luxury voiceover"],
    related: ["estate", "hotel", "dusk"],
  },
  ranch: {
    h1: "Acreage Ranch",
    seo: "Ranch & Acreage Property Video, Boulder County CO",
    intro: "Acreage is hard to photograph and easy to feel in motion. We open on the land, move through the residence, the water and the arena, and finish on horseback at golden hour. If your set includes aerials, we use them; if it doesn't, we won't invent acres.",
    shots: [["Drone-style pull-back", "Rising away from the home to show the land around it."], ["Barn approach", "A slow forward move toward the barn or arena."], ["Porch walk-out", "Out the front door and into the evening light."], ["Great room", "The gathering space, with the land framed in the windows."]],
    pairs: ["AI luxury voiceover", "Virtual twilight", "Neighborhood lifestyle intro"],
    related: ["estate", "cabin", "lake"],
  },
  lake: {
    h1: "Lake House",
    seo: "Lake House & Second Home Video, Estes Park CO",
    intro: "Second-home buyers and vacation guests are buying the water. This film opens on the house from above, lingers on the pool terrace and the lake-view rooms, then pulls out over the water, and it's refreshed each season on the Host Retainer so the listing never looks out of date.",
    shots: [["Dock-level glide", "Low over the water toward the house."], ["Window wall at golden hour", "A push-in toward the glass with the lake beyond."], ["Fire-pit patio", "A forward walk to the fire as the light drops."], ["Guest suite", "A tracking shot through the bunk room or guest suite."]],
    pairs: ["Seasonal refresh films", "Virtual twilight", "Social reels"],
    related: ["cabin", "golf", "ranch"],
  },
  hotel: {
    h1: "Resort Hotel",
    seo: "Hotel & Resort Video Walkthrough, Colorado",
    intro: "Hospitality lives on Instagram. We cut a hero film from your property photography or architectural renders, from the arrival drive through the gardens and pool deck to a full flyover, then keep the feed full with a monthly batch of reels between campaigns.",
    shots: [["Lobby dolly", "A slow move through the front door and into the space."], ["Suite reveal", "The room as a guest sees it on arrival."], ["Spa bath", "A forward dolly into soft, warm vanity light."], ["Rooftop at blue hour", "The view, the lounge and the lights coming on."]],
    pairs: ["Monthly social reels", "AI luxury voiceover", "Multi-platform format pack"],
    related: ["loft", "cabin", "lake"],
  },
  gym: {
    h1: "Fitness Club",
    seo: "Gym & Fitness Club Video Walkthrough, Denver CO",
    intro: "People join a gym after they picture themselves in it. This film moves like a launch trailer: the building, the walk down the lobby, a wide sweep across the equipment floor and a finish in the free-weight zone. Cut vertical for membership drives and horizontal for your site and leasing decks.",
    shots: [["Lobby glide", "Through the doors and past the front desk, the way a new member arrives."], ["Strength-floor orbit", "A wide arc that shows the scale of the equipment floor."], ["Studio reveal", "A tracking move into the class studio with the lights up."], ["Recovery spa", "A slow dolly into the sauna, cold plunge or locker suite."]],
    pairs: ["Membership-drive reels every month", "AI voiceover with your offer", "Multi-platform format pack"],
    related: ["hotel", "loft", "golf"],
  },
  dusk: {
    h1: "Virtual Twilight",
    seo: "Virtual Twilight Real Estate Photo Conversion, Colorado",
    intro: "Twilight exteriors are the image luxury listings lead with because they glow in a feed. We convert a daytime exterior into dusk with a deep blue-purple sky, warm windows and soft landscape uplighting, while the architecture and landscaping stay exactly as photographed.",
    shots: [["Sky conversion", "Daylight becomes a deep, even blue-hour sky."], ["Window glow", "Every interior window lit with warm, golden light."], ["Landscape uplighting", "Soft light on trees, paths and stone."], ["Motion pass", "Optional: a slow push-in that turns the still into a moving hero shot."]],
    pairs: ["Cinematic walkthrough", "Social reels", "Included free on retainers"],
    related: ["estate", "golf", "loft"],
  },
};

const shotsFor = (f, c) => (f.scenes && f.scenes.length ? f.scenes.map((s) => [s.title, s.text]) : c.shots);

function scrollFilm(f, c) {
  const scenes = f.scenes && f.scenes.length ? f.scenes : c.shots.map(([title, text]) => ({ title, text }));
  const id = ytIdOf(f.youtube);
  const poster = id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : f.image;
  return `<section class="scrollfilm" data-film="${f.slug}" style="--chapters:${scenes.length}" aria-label="${esc(c.h1)} scroll-driven film">
  <div class="sf-sticky">
    <div class="sf-media"${poster ? ` style="background-image:url('${poster}')"` : ""}></div>
    <div class="sf-shade" aria-hidden="true"></div>
    <div class="sf-mark" aria-hidden="true"><i></i><span>Chapter</span><b>01</b></div>
    <div class="sf-hud"><span class="kicker">Scroll to move through the film</span><span class="sf-scrollhint" aria-hidden="true"></span></div>
    <ol class="sf-chapters">${scenes
      .map(
        (s, j) =>
          `<li class="sf-chapter${j === 0 ? " is-active" : ""}"${s.end ? ` data-start="${s.start}" data-end="${s.end}"` : ""}><span class="num">${String(j + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`
      )
      .join("")}</ol>
    <div class="sf-progress" aria-hidden="true"><span class="sf-time">00:00</span><span class="sf-bar"><i></i></span>${f.credit ? `<span class="sf-credit">Footage &middot; ${esc(f.credit)}</span>` : ""}</div>
  </div>
</section>`;
}

FILMS.forEach((f, i) => {
  const c = CASES[f.slug];
  if (!c) return;
  const prev = FILMS[(i - 1 + FILMS.length) % FILMS.length];
  const next = FILMS[(i + 1) % FILMS.length];
  page({
    file: `work/${f.slug}.html`,
    title: `${c.seo} | Python Walkthroughs`,
    description: `${f.summary} Made from listing photos and delivered in under 24 hours.`,
    active: "work.html",
    crumbs: [["work.html", "Work"], [`work/${f.slug}.html`, c.h1]],
    schema: [{ "@type": "CreativeWork", name: `${c.h1} cinematic walkthrough`, about: f.place, creator: STUDIO_REF, description: f.summary }],
    body: (R) => `${hero({
      kicker: `${num(i)} ${esc(f.category)} &middot; ${esc(f.place)}`,
      title: esc(c.h1),
      long: c.h1.length > 12,
      lede: esc(f.summary),
      actions: `<a class="btn btn-light" href="${R}contact.html?film=${f.slug}" data-cursor="Start">Get this for my listing</a><a class="btn btn-ghost" href="#film">Watch the film</a>`,
      media: `data-film="${f.slug}"`,
      size: "compact",
      crumbs: crumbsHtml(R, [["work.html", "Work"], [`work/${f.slug}.html`, esc(c.h1)]]),
    })}
<main id="main">
${scrollFilm(f, c)}
<section class="section" id="film">
  ${head("The full film", "Watch it<br>end to end.")}
  <div class="reveal"><div class="player" data-player="${f.slug}" aria-label="${esc(c.h1)} walkthrough video"></div>${f.credit ? `<p class="player-credit">Footage by ${esc(f.credit)}, embedded from YouTube.</p>` : ""}</div>
</section>
<section class="section tight">
  <div class="split">
    <div class="reveal"><p class="kicker">The brief</p><h2 class="display">${esc(f.title)}</h2><p class="lede" style="margin-top:24px">${esc(c.intro)}</p></div>
    <dl class="facts reveal">${f.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
  </div>
</section>
<section class="section">
  ${head("Shot list", "How we<br>move through it.")}
  <div class="grid grid-4">${shotsFor(f, c).map(([t, d], j) => `<div class="card reveal"><span class="num">${num(j)}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
</section>
<section class="section alt">
  <div class="split">
    <div class="reveal"><p class="kicker">Pair it with</p><h2 class="display">Make it<br>land harder.</h2></div>
    <div class="reveal prose"><ul>${c.pairs.map((p) => `<li>${p}</li>`).join("")}</ul><p><a class="text-link" href="${R}services.html#addons">See every add-on &rarr;</a></p></div>
  </div>
</section>
<section class="section">
  ${head("Keep watching", "More<br>films.")}
  ${filmGrid(R, c.related, true)}
  <div class="btn-row reveal"><a class="btn btn-ghost" href="${R}work/${prev.slug}.html">&larr; ${esc(prev.label)}</a><a class="btn btn-ghost" href="${R}work/${next.slug}.html">${esc(next.label)} &rarr;</a></div>
</section>
${ctaBand(R, { film: f.slug, title: "Want this<br>for yours?", text: `Send us a listing and we'll cut a free sample in the style of our ${esc(f.label.toLowerCase())} film.` })}
</main>`,
  });
});

/* Agents ------------------------------------------------------------ */
const agentFaq = [
  ["Do I need to schedule anything at the property?", "No. We work entirely from your existing listing photos, so there's no shoot day, no crew in your seller's home and nothing to coordinate."],
  ["Can I post the film on the MLS?", "Yes. The horizontal cut is made for the MLS and Zillow. If your MLS prohibits branding in media, add the format pack and we'll include an unbranded version."],
  ["Will it look like AI?", "It shouldn't, and if a clip does, it doesn't ship. Every shot is reviewed by an editor and anything that warps, morphs or invents detail is removed."],
  ["What if my listing photos aren't great?", "Better photos make better films, but we can work with most professional sets. If a photo won't hold up in motion, we'll leave it out rather than force it."],
];
page({
  file: "real-estate-agents.html",
  title: "Real Estate Listing Videos for Agents in Boulder & Colorado | Python Walkthroughs",
  description: "Win listings and sell faster with cinematic walkthroughs and Instagram reels made from your listing photos. Same-day options, your branding, $1,200/month for up to 4 listings.",
  active: "real-estate-agents.html",
  crumbs: [["real-estate-agents.html", "For Agents"]],
  schema: [service("Listing video marketing for real estate agents", "Cinematic walkthroughs and social reels made from listing photos for real estate agents.", 350), faqSchema(agentFaq)],
  body: (R) => `${hero({
    kicker: "For real estate agents",
    title: "Listings<br>that move.",
    lede: "Give every listing the launch your $2M listings get. We turn the photos you already paid for into a cinematic walkthrough and two scroll-stopping reels with your name on them, back before your open house.",
    actions: `<a class="btn btn-light" href="${R}contact.html?intent=sample" data-cursor="Free">Get a free sample of my listing</a><a class="btn btn-ghost" href="#plans">Agent pricing</a>`,
    media: 'data-film="estate"',
    crumbs: crumbsHtml(R, [["real-estate-agents.html", "For Agents"]]),
  })}
<main id="main">
<section class="section tight">${stats()}</section>
<section class="section">
  ${head("The difference", "Skip the<br>shoot day.")}
  <div class="grid grid-2">
    <div class="card reveal"><span class="num">Traditional video</span><h3>A crew, a calendar and a wait</h3><p>Book a videographer days out. Prep and stage the home a second time. Work around your seller's schedule. Wait for the edit. Then crop the horizontal file yourself to post it on Instagram.</p></div>
    <div class="card reveal"><span class="num">Python</span><h3>A link and a day</h3><p>Send us the listing link. Within 24 hours you have a branded cinematic walkthrough, two vertical reels and every format ready to post, for a fraction of the cost of a crew.</p></div>
  </div>
</section>
<section class="section alt">
  ${head("What you get", "Built for how<br>agents sell now.")}
  <div class="grid grid-3">
    <div class="card reveal"><div class="icon">01</div><h3>Stop the scroll</h3><p>Motion beats a carousel in every feed. Your listing shows up as a film, not another stack of photos.</p></div>
    <div class="card reveal"><div class="icon">02</div><h3>Win the listing appointment</h3><p>Show sellers exactly how their home will be marketed. A cinematic film in your pitch is a reason to choose you.</p></div>
    <div class="card reveal"><div class="icon">03</div><h3>Your brand on every frame</h3><p>Logo, headshot, colors and contact line on every film, so every share sends buyers back to you.</p></div>
    <div class="card reveal"><div class="icon">04</div><h3>One asset, every channel</h3><p>MLS, Zillow, YouTube, Instagram, TikTok, Facebook and email, already sized for each one.</p></div>
    <div class="card reveal"><div class="icon">05</div><h3>Ready before the open house</h3><p>Under 24 hours as standard and 12 on a retainer. Launch the listing and the film on the same day.</p></div>
    <div class="card reveal"><div class="icon">06</div><h3>Stay visible between listings</h3><p>Personal brand reels and monthly market updates keep you in the feed when you don't have a new listing.</p></div>
  </div>
</section>
<section class="section">
  ${head("Examples", "Made for<br>your market.")}
  ${filmGrid(R, ["estate", "golf", "loft"], true)}
</section>
<section class="section alt" id="plans">
  ${head("Agent pricing", "Pick your<br>pace.")}
  ${agentPlans(R)}
</section>
<section class="section">
  ${head("Agent questions", "Before you<br>ask.")}
  ${faqList(agentFaq)}
</section>
${ctaBand(R)}
</main>`,
});

/* Brokerages -------------------------------------------------------- */
page({
  file: "brokerages.html",
  title: "Real Estate Video for Brokerages & Teams | Python Walkthroughs",
  description: "One consistent, branded cinematic look across every agent's listings. Up to 10 listing films a month, branded intros, monthly market updates and a dedicated request channel for $2,500/month.",
  active: "brokerages.html",
  crumbs: [["brokerages.html", "For Brokerages"]],
  schema: [service("Brokerage real estate video package", "Up to 10 cinematic listing films per month for brokerage teams, with branded intros and outros and monthly market updates.", 2500)],
  body: (R) => `${hero({
    kicker: "For brokerages &amp; teams",
    title: "One look.<br>Every agent.",
    lede: "Your brand shouldn't depend on which agent hired which videographer. We give your whole team the same cinematic standard on every listing, with your logo on every frame and a single channel to request it.",
    actions: `<a class="btn btn-light" href="${R}contact.html?package=brokerage">Talk about your team</a>`,
    media: 'data-film="hotel"',
    crumbs: crumbsHtml(R, [["brokerages.html", "For Brokerages"]]),
  })}
<main id="main">
<section class="section">
  ${head("The team package", "$2,500 a month.<br>Ten films.", "Everything in the Agent Retainer, scaled across your team and wrapped in your brokerage identity.")}
  <div class="grid grid-3">
    <div class="card reveal"><span class="num">[01]</span><h3>Up to 10 listings a month</h3><p>Shared across the team however you like. Each gets a walkthrough, two reels and all three formats.</p></div>
    <div class="card reveal"><span class="num">[02]</span><h3>Branded intro and outro</h3><p>Your brokerage logo and the listing agent's headshot open and close every film. Consistent, recognizable, yours.</p></div>
    <div class="card reveal"><span class="num">[03]</span><h3>Monthly market update</h3><p>A neighborhood market video every month that the whole team can post, with your branding on it.</p></div>
    <div class="card reveal"><span class="num">[04]</span><h3>Dedicated channel</h3><p>A private Slack or WhatsApp channel where any agent can drop a listing link and get a film back.</p></div>
    <div class="card reveal"><span class="num">[05]</span><h3>Priority turnaround</h3><p>12-hour delivery and unlimited revisions on every listing in the package.</p></div>
    <div class="card reveal"><span class="num">[06]</span><h3>A recruiting edge</h3><p>Premium video on every listing is a benefit agents notice when they're choosing where to hang their license.</p></div>
  </div>
</section>
<section class="section alt">
  ${head("Onboarding", "Live in<br>a week.")}
  <div class="steps">
    <div class="step reveal"><h3>Brand kit</h3><p>Send your logo files, fonts, colors and agent headshots. We build your branded intro, outro and lower-thirds.</p></div>
    <div class="step reveal"><h3>Pilot listings</h3><p>We cut films for two or three current listings so your team can see the look before rollout.</p></div>
    <div class="step reveal"><h3>Channel live</h3><p>We open your request channel and walk your agents through it in a 15-minute call.</p></div>
    <div class="step reveal"><h3>Monthly review</h3><p>A quick monthly check-in on volume, results and anything you want to change.</p></div>
  </div>
</section>
<section class="section">${head("The look", "What your team<br>gets.")}${filmGrid(R, ["estate", "loft", "dusk"], true)}</section>
${ctaBand(R, { film: "hotel", title: "Put your team<br>in motion.", text: "Tell us about your brokerage and we'll cut pilot films for three of your current listings." })}
</main>`,
});

/* Vacation rentals -------------------------------------------------- */
const hostFaq = [
  ["Will video get me more bookings?", "We can't promise a number, and anyone who does is guessing. What a film gives you is shareable content for Instagram, TikTok and your direct-booking site, which is where guests who don't pay platform fees come from."],
  ["Can I use the film on Airbnb and VRBO?", "Use the stills and the film wherever each platform allows. Most hosts get the most value from the reels on Instagram and on their own booking site."],
  ["What's a seasonal refresh?", "On the Host Retainer we make a new film each quarter that reflects the season, like snow on the deck in winter or aspens in fall, using updated photos you send us."],
  ["Do you work with property managers?", "Yes. The Host Retainer covers up to three properties, and we can quote larger portfolios."],
];
page({
  file: "vacation-rentals.html",
  title: "Airbnb & Vacation Rental Video for Colorado Hosts | Python Walkthroughs",
  description: "Cinematic walkthroughs and Instagram reels for Airbnb and VRBO hosts in Boulder, Nederland and Estes Park. Made from your listing photos, delivered in 24 hours, from $300.",
  active: "vacation-rentals.html",
  crumbs: [["vacation-rentals.html", "For Hosts"]],
  schema: [service("Vacation rental video marketing", "Cinematic walkthroughs and social reels for Airbnb and vacation rental hosts made from listing photos.", 300), faqSchema(hostFaq)],
  body: (R) => `${hero({
    kicker: "For Airbnb &amp; vacation rental hosts",
    title: "Book them<br>before arrival.",
    lede: "Guests book a feeling: the fire, the view, the hot tub under the stars. We turn your listing photos into a cinematic walkthrough and Instagram reels that sell the stay and send guests to your direct-booking link.",
    actions: `<a class="btn btn-light" href="${R}contact.html?package=listing-boost">Boost my listing</a><a class="btn btn-ghost" href="#host-plans">Host pricing</a>`,
    media: 'data-film="cabin"',
    crumbs: crumbsHtml(R, [["vacation-rentals.html", "For Hosts"]]),
  })}
<main id="main">
<section class="section">
  ${head("Why video", "Own your<br>guests.", "Platforms own the search. You can own the story. Video gives you content guests actually share, and a reason to follow you instead of a listing.")}
  <div class="grid grid-3">
    <div class="card reveal"><div class="icon">01</div><h3>Direct-booking content</h3><p>Reels made for Instagram and TikTok that point guests to your own site and away from platform fees.</p></div>
    <div class="card reveal"><div class="icon">02</div><h3>A listing that feels alive</h3><p>A walkthrough shows flow and atmosphere in a way a photo grid can't.</p></div>
    <div class="card reveal"><div class="icon">03</div><h3>Always in season</h3><p>Quarterly refresh films keep a mountain property looking right whether it's ski season or aspen season.</p></div>
  </div>
</section>
<section class="section alt">${head("Host films", "Mountain<br>stays.")}${filmGrid(R, ["cabin", "lake", "hotel"], true)}</section>
<section class="section" id="host-plans">${head("Host pricing", "Simple<br>plans.")}${hostPlans(R)}</section>
<section class="section alt">
  ${head("Where we work", "Colorado's<br>best stays.")}
  <div class="area-grid">
    <div class="area reveal"><h3>Boulder</h3><p>Foothills homes, Mapleton Hill guest houses and Pearl Street condos.</p></div>
    <div class="area reveal"><h3>Nederland</h3><p>A-frames, cabins and mountain retreats above town.</p></div>
    <div class="area reveal"><h3>Estes Park</h3><p>Lake homes and cabins at the gateway to Rocky Mountain National Park.</p></div>
    <div class="area reveal"><h3>Lyons &amp; Allenspark</h3><p>River-side cottages and hideaways along the Peak to Peak.</p></div>
    <div class="area reveal"><h3>Summit County</h3><p>Ski-in condos and chalets in Breckenridge, Keystone and Frisco.</p></div>
    <div class="area reveal"><h3>Anywhere</h3><p>We work from photos, so we can serve hosts anywhere in the US.</p></div>
  </div>
</section>
<section class="section">${head("Host questions", "Good<br>questions.")}${faqList(hostFaq)}</section>
${ctaBand(R, { film: "cabin", title: "See your stay<br>in motion.", text: "Send us your Airbnb or VRBO link and we'll cut a free sample reel from your photos." })}
</main>`,
});

/* Commercial -------------------------------------------------------- */
page({
  file: "commercial.html",
  title: "Gym, Golf Course, Hotel & Commercial Video Walkthroughs | Python Walkthroughs",
  description: "Cinematic walkthroughs for gyms, golf clubs, hotels, offices, restaurants and event venues. Made from your existing photos, delivered in under 24 hours, built to sell memberships, bookings and leases.",
  active: "commercial.html",
  crumbs: [["commercial.html", "Commercial"]],
  schema: [service("Commercial property video walkthroughs", "Cinematic walkthrough videos for gyms, golf clubs, hotels, offices and commercial spaces made from existing photography.", null)],
  body: (R) => `${hero({
    kicker: "Gyms, golf &amp; commercial",
    title: "Not just<br>houses.",
    lede: "If people walk through it, we can film it. Gyms selling memberships, golf clubs selling tee times, hotels selling nights, landlords selling square footage. Same pipeline, same 24 hours, same cinematic finish.",
    actions: `<a class="btn btn-light" href="${R}contact.html?intent=sample" data-cursor="Free">Get a free sample</a><a class="btn btn-ghost" href="${R}pricing.html">Pricing</a>`,
    media: 'data-film="gym"',
    crumbs: crumbsHtml(R, [["commercial.html", "Commercial"]]),
  })}
<section class="section">
  ${head("Spaces we film", "Every door<br>has a story.", "Commercial projects are quoted per space. Most fit the Single Listing price or a monthly retainer.")}
  <div class="grid grid-3">
    <div class="card reveal"><div class="icon">01</div><h3>Gyms &amp; fitness studios</h3><p>Launch trailers for new locations and monthly membership-drive reels. Strength floors, studios, pools and recovery suites.</p></div>
    <div class="card reveal"><div class="icon">02</div><h3>Golf courses &amp; clubs</h3><p>Clubhouse arrivals, first-tee reveals and course flyovers built from your course photography. For memberships, events and real estate.</p></div>
    <div class="card reveal"><div class="icon">03</div><h3>Hotels &amp; hospitality</h3><p>Lobby, suites, spa and rooftop, cut for booking pages and Instagram with fresh reels every month.</p></div>
    <div class="card reveal"><div class="icon">04</div><h3>Offices &amp; coworking</h3><p>Leasing films that show the light, the amenities and the flow before a tenant ever books a tour.</p></div>
    <div class="card reveal"><div class="icon">05</div><h3>Restaurants &amp; venues</h3><p>Event spaces, wedding venues and dining rooms that sell the atmosphere before the inquiry.</p></div>
    <div class="card reveal"><div class="icon">06</div><h3>Retail &amp; new developments</h3><p>Pre-launch films from renderings or finished photography, for leasing teams and sales galleries.</p></div>
  </div>
</section>
<section class="section alt">${head("Commercial films", "See it<br>in motion.")}${filmGrid(R, ["gym", "golf", "hotel"], true)}</section>
<section class="section">
  <div class="split">
    <div class="reveal"><p class="kicker">How it works</p><h2 class="display">Same pipeline.<br>Bigger spaces.</h2></div>
    <div class="reveal prose">
      <p>Send us your existing photography, or the photos from your website or booking page. We storyboard a route through the space, give every shot cinematic motion, cut it to music and add your brand, offer and call to action.</p>
      <p>You get vertical, horizontal and square files in under 24 hours, ready for Instagram, your website, Google Business Profile and paid ads.</p>
      <p><a class="text-link" href="${R}process.html">See the full process &rarr;</a></p>
    </div>
  </div>
</section>
${ctaBand(R, { film: "gym", title: "Your space,<br>in motion.", text: "Send us a link to your gym, club, hotel or venue and we'll cut a free sample reel from your photos." })}`,
});

/* Virtual twilight -------------------------------------------------- */
const twilightFaq = [
  ["Is virtual twilight allowed in listings?", "Virtual twilight changes the sky and the lighting, not the property. We never alter architecture or landscaping. Some MLSs ask that enhanced images be labeled; we recommend following your MLS's rules."],
  ["Which photos work best?", "A straight-on daytime exterior with clear sky and visible windows. Front elevations and mountain-view backs are ideal."],
  ["How fast is it?", "Twilight conversions are delivered with your film, within 24 hours, or on their own the same day."],
];
page({
  file: "virtual-twilight.html",
  title: "Virtual Twilight Real Estate Photos | $75 Day-to-Dusk Conversion | Python Walkthroughs",
  description: "Turn daytime exterior listing photos into dramatic twilight images with glowing windows and deep blue skies, with the architecture unchanged. $75 per photo, included on retainers.",
  active: "virtual-twilight.html",
  crumbs: [["virtual-twilight.html", "Virtual Twilight"]],
  schema: [service("Virtual twilight photo conversion", "Day-to-dusk conversion of real estate exterior photos with glowing windows and twilight sky, architecture unchanged.", 75), faqSchema(twilightFaq)],
  body: (R) => `${hero({
    kicker: "Virtual twilight",
    title: "Day to dusk.<br>$75.",
    lede: "A real twilight shoot means a photographer on site at exactly the right twenty minutes. Ours means sending us the daytime exterior you already have. Deep blue sky, warm glowing windows, soft uplighting, with the architecture exactly as it is.",
    actions: `<a class="btn btn-light" href="${R}contact.html?package=twilight">Convert my exterior</a>`,
    size: "compact",
    media: 'data-film="dusk"',
    crumbs: crumbsHtml(R, [["virtual-twilight.html", "Virtual Twilight"]]),
  })}
<main id="main">
<section class="section">
  <div class="reveal"><div class="player" data-player="dusk" aria-label="Virtual twilight example"></div></div>
</section>
<section class="section tight">
  <div class="split">
    <div class="reveal"><p class="kicker">What changes</p><h2 class="display">The light.<br>Nothing else.</h2></div>
    <dl class="facts reveal">
      <div><dt>Sky</dt><dd>Replaced with a deep blue-purple dusk sky.</dd></div>
      <div><dt>Windows</dt><dd>Every interior window glows with warm, golden light.</dd></div>
      <div><dt>Landscape</dt><dd>Soft uplighting on trees, paths and stone.</dd></div>
      <div><dt>Architecture</dt><dd>Untouched. Same home, same landscaping, same lot.</dd></div>
      <div><dt>Price</dt><dd>$75 per exterior photo. Included free on every retainer.</dd></div>
    </dl>
  </div>
</section>
<section class="section">${head("Twilight questions", "Before you<br>convert.")}${faqList(twilightFaq)}</section>
${ctaBand(R, { film: "dusk", title: "Make it<br>glow.", text: "Send us one daytime exterior and we'll convert it free so you can see the result." })}
</main>`,
});

/* Boulder ----------------------------------------------------------- */
page({
  file: "boulder-real-estate-video.html",
  title: "Boulder Real Estate Video & Listing Walkthroughs | Python Walkthroughs",
  description: "Boulder's real estate video studio. Cinematic walkthroughs and reels for listings in Mapleton Hill, Chautauqua, Newlands, North Boulder, Gunbarrel and beyond, delivered in under 24 hours.",
  active: "boulder-real-estate-video.html",
  crumbs: [["service-areas.html", "Service Areas"], ["boulder-real-estate-video.html", "Boulder"]],
  schema: [service("Boulder real estate video", "Cinematic real estate walkthrough videos for Boulder, Colorado listings.", 350, { areaServed: { "@type": "City", name: "Boulder" } })],
  body: (R) => `${hero({
    kicker: "Boulder, Colorado",
    title: "Made in<br>Boulder.",
    lede: "We're a Boulder studio making films for Boulder listings. We know the Flatirons light, the Mapleton Hill porches and the foothills glass, and we know buyers here are shopping on their phones before they ever book a showing.",
    actions: `<a class="btn btn-light" href="${R}contact.html?intent=sample" data-cursor="Free">Free sample for my Boulder listing</a>`,
    media: 'data-film="estate"',
    crumbs: crumbsHtml(R, [["service-areas.html", "Service Areas"], ["boulder-real-estate-video.html", "Boulder"]]),
  })}
<main id="main">
<section class="section">
  <div class="split">
    <div class="reveal"><p class="kicker">Why video in Boulder</p><h2 class="display">A market that<br>scrolls first.</h2></div>
    <div class="reveal prose">
      <p>Boulder buyers include relocating tech and research professionals, CU families and second-home buyers from out of state. Many see a listing on a screen long before they see it in person. A cinematic walkthrough gives them the flow of the home, the light and the view in thirty seconds.</p>
      <p>For luxury listings that's table stakes. For everything else it's an edge, because most listings in town still launch with photos alone.</p>
      <p>Our <strong>Boulder lifestyle intro</strong> opens your film with the place itself: the Flatirons, Pearl Street, the Chautauqua trails and the Saturday farmers market. It's five seconds that tell a buyer from out of state why they want to live here.</p>
    </div>
  </div>
</section>
<section class="section alt">
  ${head("Neighborhoods", "Every corner<br>of town.")}
  <div class="area-grid">
    ${[["Mapleton Hill", "Historic homes, tree-lined streets and porches made for a slow push-in."], ["Chautauqua &amp; Flatirons", "Foothills homes where the view is the whole story."], ["Newlands", "Modern rebuilds and classic ranches minutes from downtown."], ["North Boulder", "New construction, Wonderland Lake and open-space views."], ["Table Mesa &amp; South Boulder", "Family homes close to trails and NCAR."], ["Gunbarrel &amp; Niwot", "Larger lots, golf course homes and mountain panoramas."], ["Downtown &amp; Pearl Street", "Condos and lofts a block from everything."], ["Boulder County foothills", "Mountain-modern estates and acreage up the canyons."], ["University Hill", "Investment properties and character homes near CU."]].map(([t, d]) => `<div class="area reveal"><h3>${t}</h3><p>${d}</p></div>`).join("\n    ")}
  </div>
</section>
<section class="section">${head("Boulder films", "Local<br>examples.")}${filmGrid(R, ["estate", "hotel", "ranch"], true)}</section>
<section class="section alt">${head("Boulder pricing", "Same prices<br>for everyone.")}${agentPlans(R)}</section>
${ctaBand(R, { title: "Boulder listing?<br>Let's film it.", text: "Send us any current Boulder listing and we'll turn its photos into a free sample reel." })}
</main>`,
});

/* Service areas ----------------------------------------------------- */
const AREAS = [
  ["Boulder", "Our home base: foothills estates, Mapleton Hill classics and downtown lofts.", "boulder-real-estate-video.html"],
  ["Louisville &amp; Superior", "Family homes and new construction along US-36."],
  ["Lafayette &amp; Erie", "Fast-growing neighborhoods where standing out matters."],
  ["Longmont &amp; Niwot", "Acreage, golf course communities and mountain views."],
  ["Nederland", "A-frames, cabins and Airbnb retreats in the trees.", "vacation-rentals.html"],
  ["Estes Park &amp; Lyons", "Lake houses and cabins near Rocky Mountain National Park.", "vacation-rentals.html"],
  ["Denver", "Penthouses, lofts and luxury homes across the metro.", "work/loft.html"],
  ["Cherry Hills Village", "Estate homes and golf-course properties south of Denver.", "work/golf.html"],
  ["Golden &amp; Evergreen", "Mountain-modern homes and foothills acreage."],
  ["Summit &amp; Eagle Counties", "Ski chalets and condos in Breckenridge, Vail and beyond."],
  ["Fort Collins", "Northern Colorado homes and new developments."],
  ["Anywhere in the US", "We work from photos, so location is never a barrier."],
];
page({
  file: "service-areas.html",
  title: "Service Areas: Real Estate Video Across Boulder, Denver & Colorado | Python Walkthroughs",
  description: "Cinematic listing videos for Boulder, Louisville, Longmont, Nederland, Estes Park, Denver, Cherry Hills Village, Summit County and anywhere in the US. No travel fees, ever.",
  active: "service-areas.html",
  crumbs: [["service-areas.html", "Service Areas"]],
  schema: [service("Real estate video across Colorado", "Cinematic real estate walkthrough videos made remotely from listing photos for properties across Colorado and the US.", null, { areaServed: AREAS.map(([n]) => ({ "@type": "Place", name: n.replace("&amp;", "&") })) })],
  body: (R) => `${hero({
    kicker: "Service areas",
    title: "No travel fees.<br>Ever.",
    lede: "Because every film is built from your listing photos, we never need to be on site. We're based in Boulder and focused on the Front Range and Colorado's mountain towns, but we can make a film for a listing anywhere.",
    actions: `<a class="btn btn-light" href="${R}contact.html">Send us a listing</a>`,
    size: "compact",
    media: 'data-film="ranch"',
    crumbs: crumbsHtml(R, [["service-areas.html", "Service Areas"]]),
  })}
<main id="main">
<section class="section">
  <div class="area-grid">
    ${AREAS.map(([t, d, href]) => `<div class="area reveal"><h3>${href ? `<a class="text-link" href="${R}${href}">${t}</a>` : t}</h3><p>${d}</p></div>`).join("\n    ")}
  </div>
</section>
<section class="section tight"><div class="ticker" aria-hidden="true"><div class="ticker-track">${[...AREAS, ...AREAS].map(([t]) => `<span>${t}</span>`).join("")}</div></div></section>
${ctaBand(R, { film: "ranch" })}
</main>`,
});

/* About ------------------------------------------------------------- */
page({
  file: "about.html",
  title: "About Python | Next-Generation Real Estate Media, Boulder CO",
  description: "Python is a Boulder real estate media studio turning static listing photos into 4K cinematic walkthroughs and social reels for agents, brokerages and Airbnb hosts.",
  active: "about.html",
  crumbs: [["about.html", "Studio"]],
  schema: [{ "@type": "AboutPage", name: "About Python", about: STUDIO_REF }],
  body: (R) => `${hero({
    kicker: "The studio",
    title: "Cinema without<br>the crew.",
    long: true,
    lede: "Python is a next-generation walkthrough agency in Boulder. We transform static photos of any property, from homes and Airbnbs to golf courses and gyms, into high-converting 4K cinematic walkthroughs and social reels, without the friction and expense of an on-site camera crew.",
    media: 'data-film="lake"',
    crumbs: crumbsHtml(R, [["about.html", "Studio"]]),
  })}
<main id="main">
<section class="section">
  <div class="split">
    <div class="reveal"><p class="kicker">Our why</p><h2 class="display">Every listing<br>deserves a film.</h2></div>
    <div class="reveal prose">
      <p>Video sells homes, but for most listings it's still too slow and too expensive to bother with. A crew has to be booked, the home staged twice and the edit waited on. So the $3M listing gets a film and everything else gets a slideshow.</p>
      <p>We built Python to close that gap. We work from the photography you already have and deliver fully edited, platform-ready films in under 24 hours, for top-producing agents, luxury brokerages and premier Airbnb hosts across Boulder and Colorado.</p>
      <p>The result is simple: modern listings that catch a buyer's attention, do well on social and sell faster.</p>
    </div>
  </div>
</section>
<section class="section alt">
  ${head("What we believe", "Four<br>rules.")}
  <div class="grid grid-4">
    <div class="card reveal"><span class="num">[01]</span><h3>Speed is service</h3><p>Under 24 hours, every time. We reply to messages in minutes, not days.</p></div>
    <div class="card reveal"><span class="num">[02]</span><h3>Honest pictures</h3><p>Motion and light only. We never add what isn't there, because your reputation is on every frame.</p></div>
    <div class="card reveal"><span class="num">[03]</span><h3>Craft over volume</h3><p>A human editor reviews every clip. If it doesn't look expensive, it doesn't ship.</p></div>
    <div class="card reveal"><span class="num">[04]</span><h3>Your brand first</h3><p>Our name isn't on your films. Yours is.</p></div>
  </div>
</section>
<section class="section">
  ${head("The team", "Four people.<br>One pipeline.", "A small, fast team where every listing has a clear owner from first message to final file.")}
  <div class="team">
    <article class="member reveal"><div class="avatar">R</div><h3>Reda</h3><span class="role">Co-Founder &amp; CEO</span><p>Reda built Python from the ground up: the brand, the site, the workflow and the playbook the whole team runs on. He sets the creative bar and makes sure every film that ships is one we'd put our name on.</p></article>
    <article class="member reveal"><div class="avatar">E</div><h3>Ethan</h3><span class="role">Head of Partnerships</span><p>Ethan works side by side with Reda and Sulay on every major account, from the first pitch to the retainer. If you're a brokerage, hotel or club, he's the one making sure the partnership delivers.</p></article>
    <article class="member reveal"><div class="avatar">S</div><h3>Sulay</h3><span class="role">Co-Founder &amp; COO</span><p>Your point of contact from first message to final file. Sulay scopes every project, runs client partnerships and answers fast, usually within fifteen minutes.</p></article>
    <article class="member reveal"><div class="avatar">J</div><h3>Jacob</h3><span class="role">Head of Production</span><p>Every photo set lands with Jacob. He directs the camera motion, grades the color, cuts the edit and exports every format.</p></article>
    <article class="member reveal"><div class="avatar">D</div><h3>Dolev</h3><span class="role">Head of Research &amp; Growth</span><p>Dolev tracks the Colorado market every morning, including new listings, neighborhoods and what's moving, so our films and market updates stay sharp.</p></article>
    <article class="member reveal"><div class="avatar">S</div><h3>Shalom</h3><span class="role">Creative Director, Social</span><p>Shalom shapes how our films perform on Instagram and TikTok: hooks, pacing, captions, and the before-and-after content that shows what's possible.</p></article>
  </div>
</section>
<section class="section tight">${stats()}</section>
${ctaBand(R, { film: "lake", title: "Work with<br>the studio.", text: "Start with a free sample. If you love it, we'll talk about your next listing." })}
</main>`,
});

/* FAQ --------------------------------------------------------------- */
const FAQ_GROUPS = [
  ["Getting started", [
    ["How does it work if you never visit the property?", "We work entirely from your existing listing photos. Each photo becomes a cinematic shot with smooth camera motion and natural light, and we cut those shots into one edited film with music and your branding."],
    ["What do you need from me?", "A link to the listing or 15 to 40 high-resolution photos, plus the address, price and any branding you want on screen. That's it."],
    ["Can I really get a free sample?", "Yes. Send us the link to one of your current listings and we'll cut a short vertical reel from its photos. It's yours to post, no strings attached."],
    ["Do you work outside Boulder?", "Yes. We focus on Boulder, the Front Range and Colorado's mountain towns, but because we work from photos we can serve listings anywhere in the US."],
  ]],
  ["Quality &amp; honesty", [
    ["Is this made with AI?", "We use AI-assisted motion tools together with traditional editing and color grading. Every clip is generated from your original photography and reviewed by a human editor, and anything that warps, morphs or invents detail is cut."],
    ["Will the video show features that don't exist?", "Never. We don't add rooms, pools, views, furniture or finishes that aren't in your photos, and we make no structural or architectural changes. Misrepresenting a property violates real estate advertising rules, and we take that seriously."],
    ["Is virtual twilight allowed?", "Virtual twilight changes the sky and lighting, not the property. Some MLSs ask that enhanced images be labeled; we recommend following your MLS's rules."],
    ["Do I need the rights to the listing photos?", "You should have permission to use the listing photography for marketing. Most agents do through their agreement with their photographer. If you're not sure, check with your photographer before sending."],
  ]],
  ["Delivery &amp; formats", [
    ["How fast will I get my video?", "Within 24 hours of receiving your photos. Retainer clients get priority 12-hour delivery, and same-day rush is available on any listing."],
    ["What formats do I get?", "Every film is delivered in 4K in three shapes: vertical 9:16 for Reels and TikTok, horizontal 16:9 for the MLS and YouTube, and square 1:1 for Facebook."],
    ["Can I post it on the MLS?", "Yes. The horizontal cut is made for the MLS. If your MLS doesn't allow branding, add the format pack and we'll include an unbranded version."],
    ["What about music?", "Every film is scored with commercially licensed music suitable for social media. If you have a track you'd like, tell us and we'll check its license."],
    ["How many revisions do I get?", "Single listings include one round of revisions. Retainer and brokerage clients get unlimited revisions."],
  ]],
  ["Pricing &amp; billing", [
    ["How much does it cost?", "Single listing films are $350. The Agent Retainer is $1,200 a month for up to four listings, and the Brokerage Team package is $2,500 a month for up to ten. Host plans start at $300. See <a class=\"text-link\" href=\"pricing.html\">pricing</a> for details."],
    ["How do I pay?", "We invoice through Stripe, so you can pay by card or bank transfer. Retainers are billed monthly."],
    ["Who owns the finished video?", "You receive a license to use the finished film to market the property and your business on any platform, for as long as you like."],
  ]],
];
const allFaq = FAQ_GROUPS.flatMap(([, items]) => items);
page({
  file: "faq.html",
  title: "FAQ: Real Estate Video From Listing Photos | Python Walkthroughs",
  description: "Answers about how Python turns listing photos into cinematic walkthroughs: turnaround, formats, MLS use, AI and honesty, virtual twilight, pricing and billing.",
  active: "faq.html",
  crumbs: [["faq.html", "FAQ"]],
  schema: [faqSchema(allFaq)],
  body: (R) => `${hero({
    kicker: "FAQ",
    title: "Good<br>questions.",
    lede: "Everything agents, brokers and hosts usually ask before their first film. Don't see yours? Email us and you'll hear back within the hour during business hours.",
    actions: `<a class="btn btn-light" href="${R}contact.html">Ask us anything</a>`,
    size: "short",
    crumbs: crumbsHtml(R, [["faq.html", "FAQ"]]),
  })}
<main id="main">
<section class="section" style="padding-top:20px">
  ${FAQ_GROUPS.map(([g, items]) => `<div class="faq-group"><h2 class="display reveal">${g}</h2>${faqList(items.map(([q, a]) => [q, a.replace('href="pricing.html"', `href="${R}pricing.html"`)]))}</div>`).join("\n  ")}
</section>
${ctaBand(R)}
</main>`,
});

/* Contact ----------------------------------------------------------- */
page({
  file: "contact.html",
  title: "Contact Python | Get a Free Sample Listing Video",
  description: "Send us a listing link and get a free cinematic sample reel. Start a project, ask about retainers or book a call with the Python team in Boulder, CO.",
  active: "contact.html",
  crumbs: [["contact.html", "Contact"]],
  schema: [{ "@type": "ContactPage", name: "Contact Python", about: STUDIO_REF }],
  body: (R) => `${hero({
    kicker: "Contact",
    title: "Let's film<br>your listing.",
    lede: "Send us a listing link for a free sample, start a paid project or ask about a retainer. A real person replies, usually within fifteen minutes during business hours.",
    size: "short",
    crumbs: crumbsHtml(R, [["contact.html", "Contact"]]),
  })}
<main id="main">
<section class="section" style="padding-top:20px">
  <div class="split">
    <form class="form reveal" id="contact-form" novalidate>
      <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="f-phone">Phone <span class="muted">(optional)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
      <div class="field"><label for="f-role">I am a</label><select id="f-role" name="role" required><option>Real estate agent</option><option>Brokerage or team lead</option><option>Airbnb or vacation rental host</option><option>Property manager</option><option>Builder or developer</option><option>Something else</option></select></div>
      <div class="field full"><label for="f-package">I'm interested in</label><select id="f-package" name="package" required>
        <option value="sample">A free sample of my listing</option>
        <option value="single">Single Listing ($350)</option>
        <option value="agent-retainer">Agent Retainer ($1,200/mo)</option>
        <option value="brokerage">Brokerage Team ($2,500/mo)</option>
        <option value="listing-boost">Listing Boost for hosts ($300)</option>
        <option value="host-retainer">Host Retainer ($800/mo)</option>
        <option value="twilight">Virtual twilight ($75/photo)</option>
        <option value="other">Something else</option>
      </select></div>
      <div class="field full"><label for="f-listing">Listing link <span class="muted">(Zillow, MLS, Airbnb or a photo folder)</span></label><input id="f-listing" name="listing" type="url" inputmode="url" placeholder="https://"></div>
      <div class="field full"><label for="f-message">Anything we should know?</label><textarea id="f-message" name="message" placeholder="Features to highlight, branding, deadlines…"></textarea></div>
      <button class="btn btn-light" type="submit" data-cursor="Send">Send it over</button>
      <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
      <p class="form-note">Submitting opens your email app with everything filled in. We only use your details to reply to you. See our <a class="text-link" href="${R}privacy.html">privacy policy</a>.</p>
    </form>
    <div class="reveal">
      <ul class="contact-list">
        <li><b>Email</b><a class="text-link" href="mailto:${STUDIO.email}">${STUDIO.email}</a></li>
        ${STUDIO.phone ? `<li><b>Phone</b><a class="text-link" href="tel:${STUDIO.phone.replace(/[^\d+]/g, "")}">${STUDIO.phone}</a></li>` : ""}
        ${STUDIO.calendly ? `<li><b>Book a call</b><a class="text-link" href="${STUDIO.calendly}" target="_blank" rel="noopener">Pick a 15-minute slot</a></li>` : ""}
        <li><b>Studio</b><span>Boulder, Colorado. We work remotely with clients everywhere.</span></li>
        <li><b>Hours</b><span>Monday to Saturday, 8am to 9pm Mountain Time.</span></li>
        ${STUDIO.instagram || STUDIO.tiktok ? `<li><b>Social</b><span>${[STUDIO.instagram && `<a class="text-link" href="${STUDIO.instagram}" target="_blank" rel="noopener">Instagram</a>`, STUDIO.tiktok && `<a class="text-link" href="${STUDIO.tiktok}" target="_blank" rel="noopener">TikTok</a>`].filter(Boolean).join(" &middot; ")}</span></li>` : ""}
      </ul>
      <div style="margin-top:40px">
        <p class="kicker">What happens next</p>
        <div class="steps">
          <div class="step"><h3>We reply</h3><p>Usually within 15 minutes during business hours.</p></div>
          <div class="step"><h3>We cut</h3><p>Your sample or project, in under 24 hours.</p></div>
          <div class="step"><h3>You post</h3><p>Every format, ready to go live.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>
</main>`,
});

/* Legal ------------------------------------------------------------- */
page({
  file: "privacy.html",
  title: "Privacy Policy | Python Walkthroughs",
  description: "How Python collects, uses and protects the information you share with us.",
  active: "privacy.html",
  crumbs: [["privacy.html", "Privacy"]],
  body: (R) => `${hero({ kicker: "Legal", title: "Privacy.", lede: `Last updated ${UPDATED}.`, size: "short", crumbs: crumbsHtml(R, [["privacy.html", "Privacy"]]) })}
<main id="main"><section class="section" style="padding-top:20px"><div class="prose reveal">
  <p>${STUDIO.name} ("we", "us") respects your privacy. This policy explains what we collect when you visit our website or work with us, and how we use it.</p>
  <h2>What we collect</h2>
  <ul><li><strong>Information you send us:</strong> your name, email, phone number, listing links, photos, branding assets and anything you include in a message.</li><li><strong>Payment information:</strong> handled by our payment processor, Stripe. We never see or store your full card number.</li><li><strong>Basic usage data:</strong> standard server logs and, if enabled, privacy-friendly analytics that tell us which pages are visited.</li></ul>
  <h2>How we use it</h2>
  <ul><li>To reply to you and deliver the work you ask for.</li><li>To send invoices and project updates.</li><li>To improve our website and services.</li></ul>
  <p>We do not sell your personal information. We share it only with the service providers we need to run the business, such as file storage, email and payment processing, and only for those purposes.</p>
  <h2>Embedded video</h2>
  <p>Some pages embed videos from YouTube. We use YouTube's privacy-enhanced mode where possible, but YouTube may set cookies once you play a video. See Google's privacy policy for details.</p>
  <h2>Your photos and files</h2>
  <p>Photos and assets you send us are used only to make your films. We may show finished work in our portfolio unless you ask us not to.</p>
  <h2>Your choices</h2>
  <p>You can ask us to access, correct or delete your information at any time by emailing <a class="text-link" href="mailto:${STUDIO.email}">${STUDIO.email}</a>.</p>
  <h2>Contact</h2>
  <p>${STUDIO.name}, Boulder, Colorado. <a class="text-link" href="mailto:${STUDIO.email}">${STUDIO.email}</a></p>
</div></section></main>`,
});

page({
  file: "terms.html",
  title: "Terms of Service | Python Walkthroughs",
  description: "The terms that apply when you use the Python website and services.",
  active: "terms.html",
  crumbs: [["terms.html", "Terms"]],
  body: (R) => `${hero({ kicker: "Legal", title: "Terms.", lede: `Last updated ${UPDATED}.`, size: "short", crumbs: crumbsHtml(R, [["terms.html", "Terms"]]) })}
<main id="main"><section class="section" style="padding-top:20px"><div class="prose reveal">
  <p>These terms apply when you use this website or hire ${STUDIO.name} ("we", "us") to create video content.</p>
  <h2>Content disclaimer</h2>
  <p><strong>All video content is generated from original listing photography. No structural or architectural modifications are made. Videos are intended for marketing purposes only.</strong> Films and enhanced images, including virtual twilight, depict camera motion and lighting applied to your photos. They are not a substitute for an in-person showing, inspection or survey.</p>
  <h2>Your materials</h2>
  <p>By sending us photos, logos, headshots or other materials, you confirm that you have the right to use them for marketing and to let us edit them for you. You're responsible for complying with your MLS, brokerage and local advertising rules, including any rules about labeling enhanced images.</p>
  <h2>Free samples</h2>
  <p>Free sample videos are provided as-is for you to use in marketing the property shown. A free sample doesn't oblige you to buy anything.</p>
  <h2>Orders, delivery and revisions</h2>
  <ul><li>Turnaround times start when we receive your complete photo set and project details.</li><li>Revisions are included as described in your package: one round for single listings, unlimited on retainers.</li><li>Revisions cover edits to the delivered film, like music, pacing, text and shot order, not a new project.</li></ul>
  <h2>Payment</h2>
  <p>Single projects are invoiced on order. Retainers are billed monthly in advance. Invoices are processed securely through Stripe.</p>
  <h2>License</h2>
  <p>Once paid, you receive a non-exclusive, perpetual license to use the finished films to market the property and your business on any platform. We may show the work in our portfolio unless you ask us not to.</p>
  <h2>Limitation of liability</h2>
  <p>Our total liability for any claim relating to our services is limited to the amount you paid for the specific project. We are not liable for indirect or consequential losses, including lost sales or bookings.</p>
  <h2>Changes</h2>
  <p>We may update these terms from time to time. The date at the top shows the latest version.</p>
  <h2>Contact</h2>
  <p>Questions? Email <a class="text-link" href="mailto:${STUDIO.email}">${STUDIO.email}</a>.</p>
</div></section></main>`,
});

/* 404 --------------------------------------------------------------- */
page({
  file: "404.html",
  title: "Page not found | Python Walkthroughs",
  description: "This page doesn't exist.",
  noindex: true,
  absolute: true,
  body: (R) => `${hero({
    kicker: "404",
    title: "Wrong<br>turn.",
    lede: "This page doesn't exist, but plenty of beautiful homes do.",
    actions: `<a class="btn btn-light" href="${R}">Back to the showreel</a><a class="btn btn-ghost" href="${R}work.html">See the work</a>`,
    media: 'data-film="cabin"',
  })}`,
});

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */

const SNAKES = {
  "services.html": "reticulated", "pricing.html": "ball", "process.html": "carpet", "work.html": "greentree",
  "real-estate-agents.html": "burmese", "brokerages.html": "blood", "vacation-rentals.html": "greentree",
  "commercial.html": "reticulated", "virtual-twilight.html": "albino", "boulder-real-estate-video.html": "burmese",
  "service-areas.html": "carpet", "about.html": "albino", "faq.html": "ball", "contact.html": "reticulated",
  "privacy.html": "ball", "terms.html": "carpet", "404.html": "blood",
};
const CASE_SNAKES = ["reticulated", "ball", "greentree", "albino", "carpet", "blood", "burmese"];
function snakeFor(file) {
  if (SNAKES[file]) return SNAKES[file];
  const i = FILMS.findIndex((f) => file === `work/${f.slug}.html`);
  return CASE_SNAKES[Math.max(0, i) % CASE_SNAKES.length];
}

function layout(p) {
  const depth = p.file.split("/").length - 1;
  const R = p.absolute ? "/" : "../".repeat(depth);
  const url = `${DOMAIN}/${p.file}`;
  const graph = [
    {
      "@type": "ProfessionalService",
      "@id": `${DOMAIN}/#studio`,
      name: STUDIO.name,
      url: `${DOMAIN}/`,
      email: STUDIO.email,
      logo: `${DOMAIN}/assets/icon-512.png`,
      image: OG_IMAGE,
      priceRange: "$300 - $2,500",
      address: { "@type": "PostalAddress", addressLocality: "Boulder", addressRegion: "CO", addressCountry: "US" },
    },
    ...(p.crumbs ? [{
      "@type": "BreadcrumbList",
      itemListElement: [["", "Home"], ...p.crumbs].map(([href, name], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${DOMAIN}/${href}` })),
    }] : []),
    ...(p.schema || []),
  ];
  return `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="format-detection" content="telephone=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Python">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">\n<meta name="robots" content="index, follow, max-image-preview:large">`}
<meta name="theme-color" content="#0e3473">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${STUDIO.name}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<link rel="icon" href="${R}assets/favicon-64.png" type="image/png">
<link rel="apple-touch-icon" href="${R}assets/apple-touch-icon.png">
<link rel="manifest" href="${R}site.webmanifest">
<link rel="preconnect" href="https://d2ol7oe51mr4n9.cloudfront.net" crossorigin>
<link rel="stylesheet" href="${R}assets/site.css">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body>
${header(R, p.active)}
<main id="main">
${p.body(R).replace('<main id="main">', "").replace(/<\/main>\s*$/, "")}
</main>
${footer(R)}
<script src="${R}assets/films.js"></script>
<script src="${R}assets/site.js"></script>
<script src="${R}assets/snake.js"></script>
<script>PythonSnake.mount({ mode: "scroll", species: "${snakeFor(p.file)}" });</script>
</body>
</html>
`;
}

for (const p of pages) {
  const out = path.join(DIR, p.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, layout(p));
}

const sitemapPages = [{ file: "", priority: "1.0" }, ...pages.filter((p) => !p.noindex).map((p) => ({ file: p.file, priority: p.file.startsWith("work/") ? "0.7" : ["privacy.html", "terms.html"].includes(p.file) ? "0.3" : "0.8" }))];
fs.writeFileSync(path.join(DIR, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map((p) => `  <url><loc>${DOMAIN}/${p.file}</loc><lastmod>2026-10-02</lastmod><priority>${p.priority}</priority></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(DIR, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIR, "site.webmanifest"), JSON.stringify({ name: STUDIO.name, short_name: STUDIO.shortName, start_url: "/", display: "standalone", background_color: "#090807", theme_color: "#090807", icons: [{ src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" }, { src: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] }, null, 2) + "\n");

console.log(`Built ${pages.length} pages + index.html, sitemap.xml, robots.txt, site.webmanifest`);
