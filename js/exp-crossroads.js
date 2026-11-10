/* exp-crossroads.js — Uncharted Coast › The Crossroads.
   #/place/crossroads          → the signpost scene (The Past / The Present)
   #/place/crossroads/past     → The Past: "The Road Behind Me"
   #/place/crossroads/present  → The Present: "The Road I'm Travelling"
   The painting is the stage; the title and story signs are live text; the two painted arrows are the links. */
(function () {
  var ART = "assets/cross/crossroads.webp", HERE = "#/place/crossroads";
  var G = 1100 / 1536;
  function V(r) { return MPM.scene.vars(r.map(function (n) { return n * G; })); }
  function ill(k, cls) { return '<img class="ill ' + (cls || "") + '" src="assets/cross/' + k + '.webp" alt="" draggable="false" loading="lazy" decoding="async">'; }

  /* ---- editable copy ---- */
  var LAND = {
    title: "The Crossroads", tagline: "Every road, every detour, and every unexpected turn brought me here.",
    story: "Every choice, shift, and leap — even the ones that didn’t work out — helped shape who I am today. This is where my story comes together: where I’ve been, and where I am now."
  };
  var PAST = {
    title: "The Past", sub: "The Road Behind Me.", head: "p-books",
    rows: [
      ["p-house", "I grew up in a French-speaking home and attended smaller schools, where I developed a strong connection to my community and the people around me."],
      ["p-laptop", "When COVID hit in Grade 9, everything changed. From that moment until the end of the lockdowns, I completed my schoolwork from home while also helping my nephews with theirs. Those years were unlike anything I had expected my high school experience to be."],
      ["p-signpost", "When I returned to school, I was an eleventh grader who had missed so much of the typical high school experience. I felt the pressure to figure out my future, and I started switching from one path to the next."],
      ["p-toolbox", "I explored becoming a social worker working with Indigenous youth, and then a teacher, combining my love of history and woodworking. But I hadn’t quite found the right fit yet."],
      ["p-draft", "Then, on the first day back after the final lockdown, my woodworking and mechanics teacher suggested I drop my computer programming class and take his design class instead. That decision changed everything."],
      ["p-chair", "In that class, I learned to hand draft, create isometric drawings, and later use AutoCAD. My teacher saw my passion and encouraged me to look into SketchUp over the summer. Through my research, I discovered interior design."],
      ["p-cap", "When September came around, I told my teacher I was considering pursuing interior design. He encouraged me to go for it and reminded me that sometimes the best opportunities come from trying something unexpected. I began applying to colleges, created a very rough portfolio, and was accepted into a few."]
    ],
    quote: "“Sometimes, the road you never intended to take is the one that leads you exactly where you belong.”"
  };
  var PRESENT = {
    title: "The Present", sub: "The Road I’m Travelling.", head: "n-building",
    rows: [
      ["n-cap", "I am currently in my fourth year of the Interior Design program at <b>Georgian College</b>. What started as an unexpected interest in a high school design class has grown into something I genuinely love and want to build my future around."],
      ["n-plans", "Over the past few years, I’ve had the opportunity to explore different areas of design, develop my technical skills, and discover just how much thought goes into creating spaces that work for the people who use them."],
      ["n-hall", "This year, I am focused on my <b>thesis: Canada’s disaster preparedness.</b> My research explores how design can create flexible, resilient spaces that serve as an education centre and a community shelter during natural disasters."],
      ["n-people", "The goal is to create a place where people can learn how to prepare before an emergency happens, while also having a safe and welcoming place to turn to when one does."],
      ["n-sprout", "I want to explore how a building can serve its community every day, through education, workshops, and opportunities to connect, while also being designed to support people during difficult circumstances."],
      [null, "For me, this project represents more than just designing a building. It’s about creating something that has a meaningful purpose, supports people when they need it most, and strengthens the community around it."]
    ],
    quote: "“I’m not at the end of my journey. I’m simply at another crossroads, with a clearer idea of the direction I want to take.”"
  };

  /* torn paper edge on the left (past) or right (present) of a tall panel */
  function torn(side, seed) {
    var s = seed, pts = [], amp = 2;
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    var edge = [];
    for (var y = 0; y <= 100; y += 3.2) edge.push(+(rnd() * amp).toFixed(2));
    if (side === "left") { pts = edge.map(function (x, i) { return x + "% " + Math.min(i * 3.2, 100) + "%"; }); return "polygon(" + pts.concat(["100% 100%", "100% 0%"]).join(",") + ")"; }
    pts = edge.map(function (x, i) { return (100 - x) + "% " + Math.min(i * 3.2, 100) + "%"; });
    return "polygon(0% 0%,0% 100%," + pts.slice().reverse().join(",") + ")";
  }

  MPM.registerExperience("crossroads", function (root, place, sub) {
    return sub === "past" ? chapter(root, PAST, "past") : sub === "present" ? chapter(root, PRESENT, "present") : landing(root);
  });

  /* ------------------------------ landing ------------------------------ */
  function landing(root) {
    var wrap = document.createElement("section");
    wrap.className = "scene cr cr-land";
    wrap.innerHTML =
      '<div class="stage" style="background-image:url(' + ART + ')">' + MPM.scene.back() +
        '<div class="mhero" role="img" aria-label="A signpost at a crossroads at sunset: a cobblestone road to the left, a forest path to the right, and a backpack and plaid blanket at the base." style="' + MPM.scene.crop([179, 180, 921, 567], ART) + '"></div>' +
        '<header class="abs cr-sign cr-title" style="' + V([392, 26, 1130, 246]) + '"><h1>' + LAND.title + '</h1><p>' + LAND.tagline + '</p></header>' +
        '<a class="abs cr-road cr-past" href="' + HERE + '/past" style="' + V([330, 326, 752, 502]) + '" aria-label="The Past: the road behind me"><span>The Past</span></a>' +
        '<a class="abs cr-road cr-present" href="' + HERE + '/present" style="' + V([812, 346, 1254, 502]) + '" aria-label="The Present: the road I’m travelling"><span>The Present</span></a>' +
        '<section class="abs cr-sign cr-story" style="' + V([210, 796, 1328, 1012]) + '"><p>' + LAND.story + '</p></section>' +
      '</div>';
    root.appendChild(wrap);
    function key(e) { if (e.key === "Escape") MPM.router.go("#/atlas"); }
    document.addEventListener("keydown", key);
    return function () { document.removeEventListener("keydown", key); };
  }

  /* ------------------------- Past / Present pages ------------------------- */
  /* A portrait "book page": a clean painted strip (from your Past / Present paintings) beside live parchment text,
     on a blurred copy of the crossroads painting. Phones show a cropped hero instead of the strip. */
  function chapter(root, D, which) {
    var isPast = which === "past";
    var rows = D.rows.map(function (r, i) {
      return (i ? '<div class="cr-sep" aria-hidden="true">&#10022;</div>' : '') +
        '<div class="cr-row' + (r[0] ? '' : ' noico') + '">' + (r[0] ? ill(r[0]) : '') + '<p>' + r[1] + '</p></div>';
    }).join("");
    var nav = isPast
      ? '<a class="cr-pill" href="' + HERE + '">&larr; Back to the Crossroads</a><a class="cr-pill go" href="' + HERE + '/present">The Present &rarr;</a>'
      : '<a class="cr-pill go" href="' + HERE + '/past">&larr; The Past</a><a class="cr-pill" href="' + HERE + '">Back to the Crossroads &rarr;</a>';
    var heroRect = isPast ? [0, 505, 560, 810] : [976, 505, 1536, 810];
    var wrap = document.createElement("section");
    wrap.className = "cr-ch cr-ch-" + which;
    wrap.innerHTML =
      '<div class="cr-bg" style="background-image:url(' + ART + ')" aria-hidden="true"></div>' +
      MPM.scene.back(HERE, "Back to the Crossroads") +
      '<div class="cr-book">' +
        '<div class="cr-strip" style="background-image:url(assets/cross/strip-' + which + '.webp)" role="img" aria-label="' + (isPast ? "A cobblestone road curving past an autumn tree toward a village at sunset." : "A dirt path winding through an autumn forest.") + '"></div>' +
        '<div class="cr-hero" role="img" aria-label="' + (isPast ? "A cobblestone road curving past a stone wall toward a village at sunset." : "A dirt path winding through an autumn forest.") + '" style="' + MPM.scene.crop(heroRect.map(function (n) { return n * G; }), ART) + '"></div>' +
        '<article class="cr-panel" style="--torn:' + torn(isPast ? "left" : "right", isPast ? 17 : 29) + '">' +
          '<header class="cr-head">' + ill(D.head, "head") + '<h1>' + D.title + '</h1><p class="cr-ribbon">' + D.sub + '</p></header>' +
          '<div class="cr-body">' + rows + '</div>' +
          '<blockquote class="cr-quote">' + D.quote + '</blockquote>' +
          '<nav class="cr-nav" aria-label="Crossroads navigation">' + nav + '</nav>' +
        '</article>' +
      '</div>';
    root.appendChild(wrap);
    function key(e) { if (e.key === "Escape") MPM.router.go(HERE); }
    document.addEventListener("keydown", key);
    return function () { document.removeEventListener("keydown", key); };
  }
})();
