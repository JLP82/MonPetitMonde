/* ------------------------------------------------------------------
   data.js — the single source of truth for hotspots, regions,
   destinations and the portfolio. Edit here, not in the components.
   Coordinates are pixels on the original 1199 x 1312 artwork.
------------------------------------------------------------------- */
window.MPM = window.MPM || {};

MPM.ART = { w: 1199, h: 1312 };

/* Set this when the live portfolio URL exists (Design Studio page, Phase 3). */
MPM.PORTFOLIO_URL = "";

/* ---------------- Bookshelf ---------------- */
/* kind: "route" = clickable; "decor" = visible object, NOT interactive. */
MPM.BOOKSHELF = [
  { id: "atlas",    label: "The Atlas",       kind: "route", to: "#/atlas",
    box: [245, 145, 515, 400] },
  { id: "favourites", label: "Favourite Books — Storykeeper's Library", kind: "route", to: "#/place/storykeepers-library",
    box: [785, 185, 1040, 400] },
  { id: "design",   label: "Design Manuals — Interior Design Portfolio", kind: "route", to: "#/portfolio",
    box: [160, 435, 355, 645] },
  { id: "recipes",  label: "Recipe Books — The Kitchen", kind: "route", to: "#/place/kitchen",
    box: [495, 440, 725, 650] },
  { id: "puzzle",   label: "The Puzzle — Puzzle Chamber", kind: "route", to: "#/place/puzzle-chamber",
    box: [480, 695, 815, 885] },
  /* The Globe opens the map too (updated by the owner). */
  { id: "globe",    label: "The Globe — the Fantasy Atlas", kind: "route", to: "#/atlas", box: [840, 665, 1025, 890] },
  /* The candle at the bottom of the bookcase is the post office: Contact — The Post Stop. */
  { id: "candle",   label: "The Candle — The Post Stop", kind: "route", to: "#/place/post-stop", box: [885, 955, 975, 1058] }
];

/* ---------------- Contact (The Post Stop) ----------------
   Delivery is configurable; nothing is hardcoded. Set ONE of:
     endpoint — a form-to-email service URL that accepts a JSON POST (e.g. Formspree / Web3Forms / your own),
     email    — an address; the visitor's mail app is opened with the letter pre-filled (mailto fallback).
   With neither set, the form validates but reports that delivery isn't connected yet. */
MPM.CONTACT = {
  endpoint: "",
  email: "Joseelouisepilon@gmail.com",
  subjects: ["Just saying hello", "A question", "A project opportunity", "Something else"]
};

/* ---------------- Regions ---------------- */
MPM.REGIONS = {
  "whispering-woods":  { name: "Whispering Woods",  theme: "Curiosity, imagination, observation and storytelling." },
  "makers-range":      { name: "Maker's Range",     theme: "Creativity, craftsmanship, design and problem-solving." },
  "hearthlands":       { name: "The Hearthlands",   theme: "Family, roots, traditions, warmth and belonging." },
  "cartographers-keep":{ name: "Cartographer's Keep", theme: "Reflection, knowledge, strategy and design thinking." },
  "uncharted-coast":   { name: "Uncharted Coast",   theme: "Growth, courage, possibility and adventure." }
};

/* ---------------- Map landmarks ----------------
   box = [x1, y1, x2, y2] on the map artwork.
   special: "library" plays the book-closing transition back to the bookshelf.   */
MPM.PLACES = [
  { id: "storykeepers-library", name: "Storykeeper's Library", region: "whispering-woods", box: [215, 330, 335, 440],
    blurb: "My favourite books: individual book presentations, summaries and personal ratings.", status: "Phase 3" },
  { id: "theatre-glade", name: "Theatre Glade", region: "whispering-woods", box: [440, 335, 560, 445],
    blurb: "An enchanted outdoor theatre gallery of musical programmes, favourite songs and theatrical experiences.", status: "Phase 3" },
  { id: "hidden-clearing", name: "The Hidden Clearing", region: "whispering-woods", box: [290, 460, 405, 550],
    blurb: "A quiet little place for the talents that don't always make it onto a résumé.", status: "Phase 3" },

  { id: "design-studio", name: "The Design Studio", region: "makers-range", box: [690, 305, 860, 440],
    blurb: "Where ideas become spaces: the doorway to my interior design portfolio.", status: "Phase 3" },
  { id: "woodworkers-workshop", name: "The Woodworker's Workshop", region: "makers-range", box: [900, 395, 1060, 525],
    blurb: "The Woodshop: a wooden-themed Tetris game and a few wood types to brush up on.", status: "Phase 3" },
  { id: "library", name: "The Library", region: "makers-range", box: [985, 205, 1100, 345], special: "library",
    blurb: "Close the book and return to the bookshelf where the journey started." },

  { id: "homestead", name: "The Homestead", region: "hearthlands", box: [90, 708, 330, 832], to: "#/place/kitchen",
    blurb: "Opens The Kitchen: homemade bread and a story about my grandmother.", status: "Phase 3" },
  { id: "garden", name: "The Garden", region: "hearthlands", box: [335, 800, 415, 905],
    blurb: "The Three Sisters: an interactive planting activity about corn, beans and squash.", status: "Phase 3" },
  { id: "sugar-shack", name: "The Sugar Shack", region: "hearthlands", box: [115, 905, 345, 1015],
    blurb: "An illustrated maple syrup knowledge space, with a family tradition called du réduit.", status: "Phase 3" },

  { id: "cartographers-keep", name: "Cartographer's Keep", region: "cartographers-keep", box: [500, 580, 740, 850],
    blurb: "Reflection, knowledge and design thinking. Home of the Merge & Collect game.", status: "Phase 3",
    extra: { label: "Open the interior design portfolio", to: "#/portfolio" } },
  { id: "puzzle-chamber", name: "The Puzzle Chamber", region: "cartographers-keep", box: [480, 880, 585, 1000],
    blurb: "The Animal Parade: assemble jigsaw puzzles to discover eight animal companions.", status: "Phase 3" },

  { id: "lighthouse", name: "The Lighthouse of Possibility", region: "uncharted-coast", box: [985, 540, 1115, 720],
    blurb: "A cozy room at the top of the lighthouse, with a guided breathing meditation.", status: "Phase 3" },
  { id: "crossroads", name: "The Crossroads", region: "uncharted-coast", box: [905, 855, 1035, 940],
    blurb: "The paved road is the Past, the dirt trail is the Present: where I've been and where I am now.", status: "Phase 3" },
  { id: "tidal-observatory", name: "The Tidal Observatory", region: "uncharted-coast", box: [770, 935, 905, 1070],
    blurb: "A little French lesson from a favourite childhood book.", status: "Phase 3" }
];

/* Pages that are reachable from the bookshelf but have no map pin of their own.
   (The Kitchen is reached from the Recipe Books and from the Homestead.) */
MPM.EXTRA_PLACES = [
  { id: "post-stop", name: "The Post Stop", region: "hearthlands", blurb: "Leave me a little letter.", status: "Phase 3" },
  { id: "kitchen", name: "The Kitchen", region: "hearthlands",
    blurb: "Homemade white bread, a French bread recipe and a story about my grandmother.", status: "Phase 3" }
];

/* ---------------- Portfolio (PDF pages rendered as images in assets/portfolio) ---------------- */
MPM.PORTFOLIO = {
  pageCount: 34,
  pdf: "assets/portfolio.pdf",
  sections: [
    { id: "intro",     title: "Introduction",              from: 1,  to: 3  },
    { id: "voyageurs", title: "Restaurant — Les Voyageurs", from: 4,  to: 13 },
    { id: "acorn",     title: "Retirement & Montessori — Acorn & Oak", from: 14, to: 20 },
    { id: "modunest",  title: "Office — Modunest",          from: 21, to: 28 },
    { id: "hibernation", title: "Hotel — Hibernation Hotel", from: 29, to: 33 },
    { id: "contact",   title: "Contact",                    from: 34, to: 34 }
  ]
};

MPM.placeById = function (id) {
  return MPM.PLACES.concat(MPM.EXTRA_PLACES).find(function (p) { return p.id === id; });
};
