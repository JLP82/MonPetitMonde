/* exp-theatre.js — The Theatre Gallery (Whispering Woods).  #/place/theatre-glade
   A wall of 8 vintage programmes; click one to open it (stays in the gallery). Edit MUSICALS to change anything:
   story, songs, rating and review are live text. `review` is intentionally left for the owner to write — only supplied details are used. */
(function () {
  var AW = 1536, AH = 1024, GW = 1672, GH = 941;
  var MUSICALS = [
    { id: "hadestown", title: "Hadestown", rating: 5, art: "hadestown",
      story: "A folk-opera retelling of the myth of Orpheus and Eurydice. Orpheus, a gifted young musician, follows his love down to Hadestown, the underworld ruled by Hades and Persephone, and tries to win her back with his song.",
      songs: ["Wait for Me", "Flowers", "Epic III", "If It’s True"], review: "Even though we were sitting in the nosebleeds, Hadestown was absolutely phenomenal. The atmosphere, music and storytelling carried all the way through the theatre, and I was completely captivated from beginning to end. One of my biggest highlights was the actor playing Hades. In my opinion, his performance was even better than the version on the original soundtrack. There was something about his voice, stage presence and interpretation of the character that made Hades particularly memorable. The entire production was hauntingly beautiful, and it’s a show I could happily watch again and again." },
    { id: "hamilton", title: "Hamilton", rating: 4.5, art: "hamilton",
      story: "The story of Alexander Hamilton, an immigrant who rises from poverty to become one of America’s Founding Fathers, told through hip-hop, R&B and show tunes.",
      songs: ["Wait for It", "Burn", "Washington on Your Side", "Who Lives, Who Dies, Who Tells Your Story"], review: "Getting to see Hamilton live was such an incredible experience. We were seated on the ground floor, which made the entire performance even more immersive. Being so close to the stage meant we could really appreciate the performers’ expressions, choreography and the incredible energy they brought to every scene. The music, storytelling and staging were absolutely captivating, and seeing everything come together live made me appreciate the production even more. It’s one of those shows that makes you forget you’re sitting in an audience and pulls you right into the story." },
    { id: "wicked", title: "Wicked", rating: 4.5, art: "wicked",
      story: "The untold story of the witches of Oz. Wicked follows the unlikely friendship between Elphaba, the misunderstood witch with green skin, and Glinda, the popular and privileged girl, and how their choices shape the land of Oz.",
      songs: ["Defying Gravity", "For Good", "I’m Not That Girl", "No Good Deed"],
      review: "Wicked will always hold a special place in my heart because it was the first live musical I ever saw. When I was in elementary school, my class was preparing to perform The Wizard of Oz, and our teacher decided to introduce us to a professional theatre production. Wicked was playing in Toronto, so we went to see it together. I went with one of my good friends, and that experience became the beginning of a friendship that grew much stronger over time. It gave us something special to share and talk about, and it’s a memory I’ll always treasure. Beyond the personal connection, the music, costumes, performances and magical world of Oz completely captivated me. It was my introduction to the magic of live musical theatre, and I don’t think I could have asked for a better first show.", highlight: "first live musical" },
    { id: "anastasia", title: "Anastasia", rating: 5, art: "anastasia",
      story: "A young woman with no memory of her past sets out for Paris to find her family, joining two con men who think she could pass as the lost Grand Duchess Anastasia, while a Soviet officer pursues her.",
      songs: ["In My Dreams", "Stay, I Pray You", "In a Crowd of Thousands", "Once Upon a December"], review: "Review pending — I’ve enjoyed discovering this musical through its music, and I look forward to sharing more about it." },
    { id: "prince", title: "The Prince of Egypt", rating: 5, art: "prince",
      story: "Raised as a prince of Egypt, Moses learns the truth of his heritage and must choose between the only family he has known and the freedom of his people.",
      songs: ["Faster", "Dance to the Day", "Through Heaven’s Eyes", "Simcha"], review: "Review pending — I’ve enjoyed discovering this musical through its music, and I look forward to sharing more about it." },
    { id: "heights", title: "In the Heights", rating: 4, art: "heights",
      story: "Over three sweltering summer days in New York’s Washington Heights, a close-knit community of dreamers chases love, home and a better future.",
      songs: ["Benny’s Dispatch", "Breathe", "Blackout", "When the Sun Goes Down"], review: "Review pending — I’ve enjoyed discovering this musical through its music, and I look forward to sharing more about it." },
    { id: "comeaway", title: "Come From Away", rating: 5, art: "comeaway",
      story: "After the events of 9/11, thirty-eight planes are diverted to the small town of Gander, Newfoundland. Locals and stranded passengers form unexpected friendships in the days that follow.",
      songs: ["Welcome to the Rock", "Darkness and Trees", "Prayer", "Me and the Sky"], review: "Come From Away was a show I had been waiting years to see, so finally getting the opportunity to experience it live was incredibly special. And it absolutely did not disappoint. The storytelling, music and performances were so powerful, and knowing that the story was based on real people and real events made everything even more emotional. It beautifully captures the kindness of strangers, the strength of community and the way people can come together during the most difficult circumstances. I genuinely cried watching it. It’s one of those rare productions that makes you laugh, cry and walk away feeling a little more hopeful about humanity. After waiting so long to see it, I’m so glad I finally did." },
    { id: "pieces", title: "In Pieces", rating: 4, art: "pieces",
      story: "A new musical about a group of people whose lives overlap in one city, each piecing together who they are and where they belong.",
      songs: ["Bloom", "Caffeinated", "Ohio", "Get Up and Go"], review: "Review pending — I’ve enjoyed discovering this musical through its music, and I look forward to sharing more about it." }
  ];
  /* poster + rating plaque of each programme on the gallery painting (px of 1672x941) */
  var HOT = [[993, 190, 1140, 420], [1150, 188, 1303, 420], [1313, 184, 1467, 418], [1475, 176, 1630, 418],
             [993, 449, 1140, 686], [1150, 449, 1303, 690], [1315, 449, 1470, 690], [1477, 443, 1630, 686]];
  function gpos(r) { return "left:" + (r[0] / GW * 100).toFixed(3) + "%;top:" + (r[1] / GH * 100).toFixed(3) + "%;width:" + ((r[2] - r[0]) / GW * 100).toFixed(3) + "%;height:" + ((r[3] - r[1]) / GH * 100).toFixed(3) + "%"; }
  function gpatch(r) { var fw = (r[2] - r[0]) / GW, fh = (r[3] - r[1]) / GH;
    return "background-image:url(assets/theatre/gallery.webp);background-size:" + (100 / fw).toFixed(3) + "% " + (100 / fh).toFixed(3) + "%;background-position:" + (r[0] / (GW - (r[2] - r[0])) * 100).toFixed(3) + "% " + (r[1] / (GH - (r[3] - r[1])) * 100).toFixed(3) + "%"; }
  var EMPTY = "Review coming soon.";
  /* where the live text sits on the programme painting (px of the 1536x1024 art) */
  var BOX = { story: [790, 318, 1068, 497], songs: [785, 543, 1042, 702], review: [1088, 543, 1398, 716], rating: [1120, 770, 1352, 870] };

  function rt(r) { return (r % 1 ? r.toFixed(1) : r) + " / 5"; }
  function stars(r) { var h = ""; for (var i = 1; i <= 5; i++) h += '<i class="' + (r >= i ? "f" : r >= i - 0.5 ? "h" : "e") + '"></i>'; return '<span class="th-stars" role="img" aria-label="' + rt(r) + ' stars">' + h + "</span>"; }
  function pos(r) { return "left:" + (r[0] / AW * 100).toFixed(3) + "%;top:" + (r[1] / AH * 100).toFixed(3) + "%;width:" + ((r[2] - r[0]) / AW * 100).toFixed(3) + "%;height:" + ((r[3] - r[1]) / AH * 100).toFixed(3) + "%"; }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function reviewHTML(m) {
    if (!m.review) return '<span class="th-empty">' + EMPTY + "</span>";
    var t = esc(m.review);
    if (m.highlight) t = t.replace(esc(m.highlight), '<mark>' + esc(m.highlight) + "</mark>");
    return t;
  }
  function songsHTML(m) { return '<ul class="th-songs">' + m.songs.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>"; }

  MPM.registerExperience("theatre-glade", function (root) {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cur = -1, lastBtn = null;
    MUSICALS.forEach(function (m) { var i = new Image(); i.src = "assets/theatre/c-" + m.id + ".webp"; });
    var wrap = document.createElement("section"); wrap.className = "scene th";
    wrap.innerHTML =
      '<div class="stage th-stage">' + MPM.scene.back("#/atlas", "Back to the Whispering Woods map") +
      '<h1 class="th-title">The Theatre Gallery</h1>' +
      '<div class="th-hots" role="list">' + MUSICALS.map(function (m, i) {
          return '<button type="button" role="listitem" class="th-hot" data-i="' + i + '" style="' + gpos(HOT[i]) + ";" + gpatch(HOT[i]) + '" aria-label="Open the ' + esc(m.title) + ' programme, rated ' + rt(m.rating) + '"></button>'; }).join("") + '</div>' +
      '<div class="th-gal"><p class="th-sub">Every show leaves a little music behind.</p><div class="th-board" role="list">' +
        MUSICALS.map(function (m, i) {
          return '<button type="button" role="listitem" class="th-card" data-i="' + i + '" aria-label="Open the ' + esc(m.title) + ' programme, rated ' + rt(m.rating) + '">' +
            '<span class="pic" style="background-image:url(assets/theatre/c-' + m.id + '.webp)"></span><span class="nm">' + esc(m.title) + '</span>' + stars(m.rating) + '</button>';
        }).join("") + '</div></div>' +
      '<div class="th-open" hidden role="dialog" aria-modal="true" aria-label="Programme"></div>' +
      '</div>';
    root.appendChild(wrap);
    var $ = function (s) { return wrap.querySelector(s); };
    var stage = $(".th-stage"), gal = $(".th-gal"), hots = $(".th-hots"), op = $(".th-open");

    function fill(i) {
      var m = MUSICALS[i];
      op.style.backgroundImage = "url(assets/theatre/" + m.art + ".webp)";
      op.setAttribute("aria-label", m.title + " — programme");
      op.innerHTML =
        '<button type="button" class="th-x" data-act="close" aria-label="Close programme">✕ <span>Close</span></button>' +
        '<button type="button" class="th-nav th-p" data-act="prev" aria-label="Previous musical">‹</button>' +
        '<button type="button" class="th-nav th-n" data-act="next" aria-label="Next musical">›</button>' +
        /* desktop: live text over the painted programme */
        '<div class="th-d th-story" style="' + pos(BOX.story) + '">' + esc(m.story) + '</div>' +
        '<div class="th-d th-songlist" style="' + pos(BOX.songs) + '">' + songsHTML(m) + '</div>' +
        '<div class="th-d th-rev" style="' + pos(BOX.review) + '"><div class="th-revtxt" tabindex="0" role="region" aria-label="My review of ' + esc(m.title) + '">' + reviewHTML(m) + '</div>' + (m.review && m.review.length > 220 ? '<button type="button" class="th-more" data-act="more" aria-expanded="false">Read full review</button>' : '') + '</div>' +
        '<div class="th-d th-rate" style="' + pos(BOX.rating) + '">' + stars(m.rating) + '<b>' + rt(m.rating) + '</b></div>' +
        /* phones: stacked */
        '<div class="th-mob"><div class="th-cover" role="img" aria-label="' + esc(m.title) + ' programme cover" style="background-image:url(assets/theatre/c-' + m.id + '.webp)"></div>' +
          '<p class="th-pres">The Theatre Gallery Presents</p><h2>' + esc(m.title) + '</h2><p class="th-off">Official Programme</p>' +
          '<section><h3>The Story</h3><p>' + esc(m.story) + '</p></section>' +
          '<section><h3>Favourite Songs</h3>' + songsHTML(m) + '</section>' +
          '<section><h3>My Review</h3><p>' + reviewHTML(m) + '</p></section>' +
          '<section><h3>My Rating</h3><div class="th-rate2">' + stars(m.rating) + '<b>' + rt(m.rating) + '</b></div></section>' +
          '<div class="th-ticket"><small>Theatre Gallery</small><b>Admit One</b><span>★ ★ ★</span></div></div>';
    }
    function open(i, from) {
      var first = cur < 0; cur = (i + MUSICALS.length) % MUSICALS.length; fill(cur);
      if (from) lastBtn = from;
      op.hidden = false; gal.setAttribute("aria-hidden", "true"); gal.inert = true; hots.inert = true; stage.classList.add("is-open");
      if (!reduce && op.animate) op.animate(first
        ? [{ opacity: 0, transform: "perspective(1800px) rotateY(-55deg) scale(.5)" }, { opacity: 1, transform: "none" }]
        : [{ opacity: .2, transform: "translateX(" + (arguments[2] || 0) + "px)" }, { opacity: 1, transform: "none" }],
        { duration: first ? 620 : 300, easing: "cubic-bezier(.2,.8,.25,1)" });
      var x = op.querySelector(".th-x"); if (x) x.focus({ preventScroll: true });
      stage.scrollIntoView && window.matchMedia("(max-width: 860px)").matches && window.scrollTo(0, 0);
    }
    function close() {
      if (cur < 0) return; cur = -1; op.hidden = true; gal.inert = false; hots.inert = false; gal.removeAttribute("aria-hidden"); stage.classList.remove("is-open");
      if (lastBtn) lastBtn.focus({ preventScroll: true });
    }
    wrap.addEventListener("click", function (e) {
      var c = e.target.closest(".th-card, .th-hot"), a = e.target.closest("[data-act]");
      if (c) { open(+c.dataset.i, c); return; }
      if (a) { var k = a.dataset.act; if (k === "more") { var rv = op.querySelector(".th-rev"), big = rv.classList.toggle("big"); a.textContent = big ? "\u2715 Close review" : "Read full review"; a.setAttribute("aria-expanded", big); if (big) rv.querySelector(".th-revtxt").focus({ preventScroll: true }); } else if (k === "close") close(); else if (k === "next") open(cur + 1, null, 40); else if (k === "prev") open(cur - 1, null, -40); }
    });
    function key(e) {
      if (cur < 0) return;
      if (e.key === "Escape") { e.stopImmediatePropagation(); var bg = op.querySelector(".th-rev.big"); if (bg) { bg.querySelector(".th-more").click(); } else close(); }
      else if (e.key === "ArrowRight") open(cur + 1, null, 40); else if (e.key === "ArrowLeft") open(cur - 1, null, -40);
      else if (e.key === "Tab") { var f = [].slice.call(op.querySelectorAll("button")).filter(function (b) { return b.offsetParent; }); if (!f.length) return; var fi = f[0], la = f[f.length - 1]; if (e.shiftKey && document.activeElement === fi) { e.preventDefault(); la.focus(); } else if (!e.shiftKey && document.activeElement === la) { e.preventDefault(); fi.focus(); } }
    }
    document.addEventListener("keydown", key, true);
    wrap._th = { open: open, close: close, state: function () { return cur; }, MUSICALS: MUSICALS };
    return function () { document.removeEventListener("keydown", key, true); };
  });
})();
