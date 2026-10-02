/*
 * Python: site config and walkthrough reel.
 *
 * This is the only file you need to edit to swap videos.
 *
 *   youtube : paste any YouTube link (watch?v=, youtu.be/, /shorts/, /embed/) or a bare id.
 *             When set, the homepage portal, the work grid and the case-study page all play it.
 *   start   : second the homepage loop starts at (skip intros / logos).
 *   end     : optional second the homepage loop ends at (0 = play to the end).
 *   scenes  : optional [{ start, end, title, text }] chapters for the scroll-driven film on the case page
 *             (seconds within the YouTube video; each chapter gets one screen of scroll).
 *   credit  : who shot the footage, shown under the film. Clear rights before using anyone else's video.
 *   clip    : mp4 fallback used when `youtube` is empty (a short CapCut export works great).
 *   image   : still image fallback when there is no video at all.
 *
 * Changes here show up instantly in the browser. Re-run `node website/build.mjs`
 * only when you change titles, labels or facts so the static SEO pages pick them up.
 */
(function (root) {
  var BASE = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";
  var MEDIA = {
    MARS_BG: BASE + "/3c83091e-4046-4fd6-adbb-2edb728be79a.mp4",
    TO_EARTH: BASE + "/fc3ded42-e845-41f3-a830-5cab512d79cd.mp4",
    TO_VENUS: BASE + "/b30f64d9-1637-477a-83df-d0fc6461a422.mp4",
    TO_MARS: BASE + "/5fc5651c-3b5d-4171-b507-87f7e635d1b4.mp4",
    MERCURY: BASE + "/d6fb8b6b-c15e-4aaa-9cf7-45bbb5e33372.jpg"
  };

  root.STUDIO = {
    name: "Python",
    shortName: "Python",
    domain: "https://pythonwalkthroughs.com",
    email: "hello@pythonwalkthroughs.com",
    phone: "",
    calendly: "",
    // Leave blank to hide; paste full profile URLs to show them on the contact page.
    instagram: "",
    tiktok: "",
    city: "Boulder",
    region: "CO",
    introClip: MEDIA.TO_MARS,
    // H.264 clip swapped in when a browser can't decode a video (e.g. HEVC on Firefox/Windows).
    fallbackClip: MEDIA.TO_EARTH,
    media: MEDIA
  };

  root.FILMS = [
    {
      slug: "estate",
      title: "Estate",
      label: "Mountain Estate",
      category: "Residential",
      place: "Mountain-view luxury residence",
      youtube: "https://www.youtube.com/watch?v=9fxWxOVJtrM",
      start: 52,
      end: 62,
      clip: MEDIA.MARS_BG,
      image: "",
      credit: "Ladd Group",
      scenes: [
        { start: 52, end: 56.5, title: "The entry", text: "Through the front door into stone, timber and a chandelier-lit entry." },
        { start: 56.5, end: 61, title: "Great room", text: "Beams, stone and a wall of glass, with the fire lit and the mountains outside." },
        { start: 99, end: 103, title: "Primary suite", text: "A slow move through the bedroom and into the spa bath." },
        { start: 112, end: 118, title: "The kitchen", text: "A glide along the island, the range and the finishes buyers zoom in on." }
      ],
      summary: "A mountain-view luxury residence: the entry, a timber great room, the primary suite and the chef's kitchen.",
      facts: [
        ["Property:", "Mountain-view luxury residence with timber and stone."],
        ["Shot list:", "Entry, great room, primary suite, kitchen."],
        ["Delivered:", "9:16, 16:9 and 1:1 exports in under 24 hours."],
        ["Best for:", "$1M+ listings that need to stop the scroll on day one."]
      ]
    },
    {
      slug: "golf",
      title: "Golf",
      label: "Golf Course",
      category: "Golf & Resort",
      place: "Coastal golf links",
      youtube: "https://www.youtube.com/watch?v=Bavma0rLE68",
      start: 106,
      end: 117,
      clip: MEDIA.TO_EARTH,
      image: "",
      credit: "Tony Young / Helicam Films",
      scenes: [
        { start: 8, end: 15.5, title: "Clubhouse to coast", text: "One rising move from the clubhouse roof out to the bay, the beach and the first fairways." },
        { start: 83.5, end: 93, title: "Along the cliffs", text: "Low along the cliff-top holes, surf on one side and green on the other." },
        { start: 101, end: 117.5, title: "The beach holes", text: "The signature shot. Turquoise water, white sand and the course right on the edge." },
        { start: 150.5, end: 157, title: "Fairway glide", text: "A slow glide down the fairway toward the green, the way a golfer plays it." }
      ],
      summary: "A seaside golf club flown hole by hole: clubhouse-to-coast reveal, cliff-top fairways, the beach holes and a glide to the green.",
      facts: [
        ["Property:", "Coastal golf links with cliff-top and beachside holes."],
        ["Shot list:", "Clubhouse-to-coast reveal, cliff-top flyover, beach holes, fairway glide."],
        ["Delivered:", "Hero film plus social reels for memberships, events and real estate."],
        ["Best for:", "Golf clubs, resort communities and course-side listings."]
      ]
    },
    {
      slug: "cabin",
      title: "Cabin",
      label: "Airbnb Cabin",
      category: "Vacation Rental",
      place: "Log cabin in the pines",
      youtube: "https://youtu.be/00VBp5mnV20",
      start: 2,
      end: 11,
      clip: MEDIA.TO_VENUS,
      image: "",
      credit: "Divinity Creative",
      scenes: [
        { start: 2, end: 11, title: "Into the pines", text: "We drop through the treetops and land on the roofline, the way a guest first spots it." },
        { start: 44, end: 50, title: "The great room", text: "Timber, stone and two stories of glass, held long enough to feel the warmth." },
        { start: 84, end: 89, title: "The kitchen", text: "A slow pass along the island and the range, where the group actually gathers." },
        { start: 134, end: 140, title: "Primary suite", text: "Soft light, a big bed and the forest right outside the window." },
        { start: 168, end: 184, title: "Lit up at dusk", text: "Every window glowing against the pines. The shot that books the weekend." }
      ],
      summary: "A log-cabin getaway cut for direct bookings: treetop arrival, timber great room, kitchen, suite and the cabin glowing at dusk.",
      facts: [
        ["Property:", "Log-cabin vacation rental on a wooded lot."],
        ["Shot list:", "Treetop arrival, great room, kitchen pass, primary suite, dusk exterior."],
        ["Delivered:", "Walkthrough plus two Instagram reels for direct booking."],
        ["Best for:", "Superhosts who want guests booking off Instagram, not just Airbnb."]
      ]
    },
    {
      slug: "loft",
      title: "Loft",
      label: "City Penthouse",
      category: "Residential",
      place: "Full-floor residence, Manhattan",
      youtube: "https://youtu.be/GV2QZbMO0CM",
      start: 298,
      end: 314,
      clip: MEDIA.TO_MARS,
      image: "",
      credit: "Walks & Wall Street",
      scenes: [
        { start: 85, end: 100, title: "Window wall", text: "Floor-to-ceiling glass and the street below, the first thing every buyer walks toward." },
        { start: 120, end: 133, title: "Chef's kitchen", text: "Stone, oak and integrated appliances, framed as one clean line." },
        { start: 143, end: 153, title: "Primary suite", text: "A calm move into the bedroom and the light that comes with it." },
        { start: 295, end: 315, title: "Private roof deck", text: "Up top: planters, lounge seating and the skyline in every direction." }
      ],
      summary: "A full-floor city residence: the window wall, a chef's kitchen, the primary suite and a private roof deck with skyline views.",
      facts: [
        ["Property:", "Full-floor city residence with a private roof deck."],
        ["Shot list:", "Window wall, kitchen, primary suite, roof-deck skyline."],
        ["Delivered:", "Vertical reel for launch day, horizontal cut for the MLS."],
        ["Best for:", "Condos, lofts and new-development launches."]
      ]
    },
    {
      slug: "ranch",
      title: "Ranch",
      label: "Acreage Ranch",
      category: "Land & Ranch",
      place: "190-acre equestrian estate",
      youtube: "https://www.youtube.com/watch?v=9fxWxOVJtrM",
      start: 2,
      end: 10,
      clip: MEDIA.MARS_BG,
      image: "",
      credit: "Ladd Group",
      scenes: [
        { start: 2, end: 9, title: "The land", text: "Pines, meadows and open water from above. Acreage first, before a single room." },
        { start: 84, end: 86.6, title: "Private lake", text: "Still water, perfect reflections. The view that makes the price make sense." },
        { start: 52, end: 62, title: "The residence", text: "Under the timber portico and into the great room, fire already lit." },
        { start: 127, end: 130.6, title: "The arena", text: "A rider crossing the covered arena under heavy timber trusses." },
        { start: 145, end: 151, title: "Golden hour", text: "Sun dropping through the pines and the whole property glowing. This is the lifestyle you're selling." }
      ],
      summary: "A 190-acre equestrian estate: open meadows, a private lake, the main residence, a covered arena and the property at golden hour.",
      facts: [
        ["Property:", "190-acre equestrian estate with a luxury residence."],
        ["Shot list:", "Meadows, private lake, residence, covered arena, golden hour."],
        ["Delivered:", "Long horizontal cut for YouTube plus vertical teasers."],
        ["Best for:", "Land, acreage and horse properties that photos undersell."]
      ]
    },
    {
      slug: "lake",
      title: "Lake",
      label: "Lake House",
      category: "Vacation Rental",
      place: "Modern lakehouse in the pines",
      youtube: "https://youtu.be/22cgnDI4Dj4",
      start: 84,
      end: 95,
      clip: MEDIA.TO_EARTH,
      image: "",
      credit: "Modern Movement Creative",
      scenes: [
        { start: 16.5, end: 21.5, title: "The arrival", text: "Black cladding and glass set into the rocks and the pines, pool glowing below." },
        { start: 32, end: 39, title: "Pool terrace", text: "The pool, the loungers and the glass wall behind them, all in one frame." },
        { start: 40, end: 47, title: "Great room", text: "Vaulted ceilings and a wall of windows facing the water." },
        { start: 84, end: 95, title: "Lake-view living", text: "A slow glide through the living spaces with the lake in every window." },
        { start: 112, end: 118, title: "Wake to the water", text: "The primary suite, the bed facing the glass and the lake right there through the trees." }
      ],
      summary: "A modern lakehouse in the pines: aerial arrival, the pool terrace, a vaulted great room and a suite that wakes up to the water.",
      facts: [
        ["Property:", "Modern lakehouse on a wooded shoreline."],
        ["Shot list:", "Aerial arrival, pool terrace, great room, lake-view living, primary suite."],
        ["Delivered:", "Seasonal refresh each quarter on the host retainer."],
        ["Best for:", "Second homes and premium short-term rentals."]
      ]
    },
    {
      slug: "hotel",
      title: "Hotel",
      label: "Resort Hotel",
      category: "Hospitality",
      place: "Five-star resort tower",
      youtube: "https://youtu.be/L5kJjInKASQ",
      start: 160,
      end: 176,
      clip: MEDIA.TO_VENUS,
      image: "",
      credit: "Studio Contour",
      scenes: [
        { start: 10, end: 24, title: "The arrival", text: "Up the drive toward the towers, the way a guest pulls in." },
        { start: 125, end: 140, title: "Garden court", text: "Palms, water and sculpted landscaping between the buildings." },
        { start: 160, end: 178, title: "Pool deck", text: "Along the pool, looking up at balconies stacked to the sky." },
        { start: 210, end: 232, title: "Tower flyover", text: "A full orbit of the tower from above. Scale, setting, everything." }
      ],
      summary: "A five-star resort tower walked from the drive: arrival, the garden court, the pool deck and a full flyover of the tower.",
      facts: [
        ["Property:", "Five-star resort tower with gardens and pool deck."],
        ["Shot list:", "Arrival drive, garden court, pool deck, tower flyover."],
        ["Delivered:", "Hero film plus a monthly batch of social reels."],
        ["Best for:", "Hotels, resorts, pre-construction and multi-unit operators."]
      ]
    },
    {
      slug: "gym",
      title: "Gym",
      label: "Fitness Club",
      category: "Commercial",
      place: "Fitness center in an office campus",
      youtube: "https://youtu.be/oIl8EIANML0",
      start: 10,
      end: 23,
      clip: MEDIA.TO_MARS,
      image: "",
      credit: "ZEN LENS",
      scenes: [
        { start: 1, end: 6.6, title: "The building", text: "Brick, glass and a clean entry canopy. First impressions for tenants and members." },
        { start: 6.8, end: 8.2, title: "Lobby corridor", text: "Through the doors and down the hall, the walk every member makes." },
        { start: 10, end: 23, title: "Equipment floor", text: "A wide, steady sweep across the full strength and cardio floor." },
        { start: 24, end: 30, title: "Free weights", text: "Racks, dumbbells and daylight. The corner serious lifters look for first." }
      ],
      summary: "A fitness center inside an office campus: the building, the lobby walk, a sweep across the equipment floor and the free-weight zone.",
      facts: [
        ["Property:", "Fitness center inside a commercial office campus."],
        ["Shot list:", "Building arrival, lobby corridor, equipment-floor sweep, free weights."],
        ["Delivered:", "Membership-drive reels plus a horizontal hero film."],
        ["Best for:", "Gyms, studios, wellness clubs and commercial leasing."]
      ]
    },
    {
      slug: "dusk",
      title: "Dusk",
      label: "Virtual Twilight",
      category: "Add-on",
      place: "Any exterior, anywhere",
      youtube: "https://youtu.be/00VBp5mnV20",
      start: 168,
      end: 184,
      clip: "",
      image: MEDIA.MERCURY,
      credit: "Divinity Creative",
      scenes: [
        { start: 168, end: 176, title: "Window glow", text: "Every window lit warm against the trees. The look we build from your daytime photos." },
        { start: 176, end: 184, title: "Blue hour", text: "Deep evening sky, soft light on the stone and timber, architecture untouched." }
      ],
      summary: "Daytime exteriors converted to twilight: deep blue sky, warm windows, soft uplighting, with the architecture left exactly as it is.",
      facts: [
        ["Service:", "Day-to-dusk conversion of your daytime exterior photos."],
        ["Look:", "Deep blue sky, glowing windows, soft landscape uplighting."],
        ["Price:", "+$75 per exterior photo, included on retainers."],
        ["Best for:", "The hero image that leads your listing and your reel."]
      ]
    }
  ];

  root.guardVideo = function (video) {
    var fallback = root.STUDIO.fallbackClip;
    function check() {
      if (!fallback || video.dataset.fellBack) return;
      if (video.error || (video.readyState >= 2 && !video.videoWidth)) {
        video.dataset.fellBack = "1";
        video.src = fallback;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }
    }
    video.addEventListener("loadeddata", check);
    video.addEventListener("error", check);
    return video;
  };

  // YouTube picks its stream from the player's layout size, so background players are laid out at
  // 4K (1080p on phones, which already have dense screens) and scaled down to cover the viewport.
  if (typeof document !== "undefined") {
    var sizeYouTube = function () {
      var w = innerWidth > 900 ? 3840 : 1920;
      var cover = Math.max(innerWidth * 1.2, innerHeight * 1.2 * 16 / 9);
      var s = document.documentElement.style;
      s.setProperty("--yt-w", w + "px");
      s.setProperty("--yt-h", (w * 9) / 16 + "px");
      s.setProperty("--yt-scale", (cover / w).toFixed(4));
    };
    sizeYouTube();
    addEventListener("resize", sizeYouTube);
  }

  // Calls back once the player is streaming at 1080p or better (or after `ms`), so nobody sees the blurry ramp-up.
  root.whenSharp = function (player, cb, ms) {
    var t0 = Date.now(), done = false;
    (function poll() {
      if (done) return;
      var q = "";
      try { q = player.getPlaybackQuality(); } catch (e) {}
      if (/hd1080|hd1440|hd2160|highres/.test(q) || Date.now() - t0 > (ms || 4000)) { done = true; cb(); return; }
      setTimeout(poll, 150);
    })();
  };

  root.ytId = function (value) {
    if (!value) return "";
    var v = String(value).trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    var m = v.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : "";
  };
})(typeof window !== "undefined" ? window : globalThis);
