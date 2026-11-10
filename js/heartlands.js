/* heartlands.js — Hearthlands region: The Kitchen, The Sugar Shack, The Garden.
   The concept paintings are the stage. Every baked-in text panel is covered by a live HTML parchment panel
   (same position as the painting, real selectable text), and the little illustrations are cropped out of
   the paintings (assets/hearth/*.webp). All copy lives in the objects below so it is easy to edit.
   Coordinates are in the original 1536 x 1024 painting; V() converts them to the shared scene grid. */
(function () {
  var G = 1100 / 1536;
  function V(r) { return MPM.scene.vars(r.map(function (n) { return n * G; })); }
  function hero(url, r) { return MPM.scene.crop(r.map(function (n) { return n * G; }), url); }
  function ill(k, cls) { cls = (cls || "") + (/^(s-reduit|s-photo|k-polaroid|g-bed)$/.test(k) ? " keep" : ""); return '<img class="ill ' + cls + '" draggable="false" src="assets/hearth/' + k + '.webp" alt="" loading="lazy" decoding="async">'; }
  function panel(cls, rect, inner, attrs) { return '<section class="abs hp ' + cls + '" style="' + V(rect) + '"' + (attrs || "") + '>' + inner + '</section>'; }
  function card(cls, rect, title, illKey, body) {
    return panel(cls, rect, '<h2>' + title + '</h2><div class="hp-row">' + ill(illKey) + '<div class="hp-txt">' + body + '</div></div>');
  }
  function steps(list) {
    return '<ol class="hp-steps">' + list.map(function (s, i) {
      return '<li>' + ill(s.ill) + '<h3><span class="num">' + (i + 1) + '</span> ' + s.name + '</h3><p>' + s.text + '</p></li>';
    }).join("") + '</ol>';
  }

  /* Shared mount: stage + panels + back button + Escape. Returns a cleanup function. */
  function mount(root, o) {
    var wrap = document.createElement("section");
    wrap.className = "scene hearth " + o.cls;
    wrap.innerHTML =
      '<div class="stage" style="background-image:url(' + o.art + ')">' + MPM.scene.back() +
        '<div class="mhero" role="img" aria-label="' + o.alt + '" style="' + hero(o.art, o.hero) + '"></div>' +
        o.panels +
      '</div>';
    root.appendChild(wrap);
    var extraClose = o.onEscape || function () { return false; };
    function key(e) { if (e.key === "Escape" && !extraClose()) MPM.router.go("#/atlas"); }
    document.addEventListener("keydown", key);
    return function () { document.removeEventListener("keydown", key); if (o.cleanup) o.cleanup(); };
  }

  /* ============================== THE KITCHEN ============================== */
  var KITCHEN = {
    title: "The Kitchen", ribbon: "A Bread Knowledge Space",
    intro: "Explore the history, craft, and simple magic of homemade bread — from a few humble ingredients to a warm, fresh loaf.",
    process: { title: "The Bread-Making Process", sub: "From simple ingredients to a soft, homemade loaf.", steps: [
      { ill: "k-gather", name: "Gather", text: "Start with a few simple ingredients: flour, water, yeast, salt, and a pinch of sugar." },
      { ill: "k-mix", name: "Mix", text: "Combine the ingredients to form a soft, slightly sticky dough." },
      { ill: "k-rise", name: "Rise", text: "Let the dough rest and rise until it has roughly doubled in size." },
      { ill: "k-shape", name: "Shape", text: "Gently shape the dough into a loaf and place it in a greased pan." },
      { ill: "k-bake", name: "Bake", text: "Bake until golden, with a soft, tender interior and a lightly crisp crust." }] },
    tradition: "Bread has nourished communities for thousands of years. Many cultures, including Indigenous Peoples and early settlers, have long used local grains, simple ingredients, and shared baking knowledge to create bread that brought people together.",
    science: "Bread rises thanks to yeast, a living microorganism that feeds on the sugars in flour. As it works, it produces carbon dioxide (tiny bubbles) that make the dough expand, giving bread its soft, airy texture.",
    ingredients: [["Flour", "provides structure and body."], ["Water", "brings the dough together and activates yeast."], ["Yeast", "a natural leavening agent that makes the dough rise."], ["Salt", "adds flavour and helps control the rise."], ["Sugar", "just a pinch feeds the yeast and can help with browning and a softer crumb."]],
    white: "A classic, everyday loaf with a soft, tender crumb and a lightly crisp crust. It’s simple, comforting, and a perfect example of how a few basic ingredients can create something truly special.",
    why: ["My grandmother made homemade bread all the time, and one of the little things she always said was that you can only make bread on a sunny day, or it won’t rise properly or turn out well. She never got the chance to teach me how to make it, but now, whenever I bake bread, I feel more connected to her.",
          "It’s a simple act, but it brings back memories of her kitchen, the warmth of home, and the traditions she lived every day."],
    tipTitle: "A Grandmother’s Tip", quote: "“Only make bread on a sunny day.”",
    tipText: "It was something my grandmother always believed, that the warmth and steady, bright weather helped the dough rise just right.",
    tips: ["Use fresh, good-quality ingredients.", "Let the dough rise in a warm, draft-free place.", "Be patient — good bread takes time.", "Shape the dough gently to keep the air inside.", "Bake until golden brown."],
    taste: "Homemade bread is more than just food. It’s about care, patience, and the simple joy of creating something from scratch to share with the people you love."
  };

  MPM.registerExperience("kitchen", function (root) {
    var K = KITCHEN;
    var panels =
      panel("hp-title hp-k-title", [38, 6, 534, 268], '<h1>' + K.title + '</h1><p class="rbn">' + K.ribbon + '</p><p>' + K.intro + '</p>') +
      panel("hp-k-process", [836, 8, 1532, 402], '<h2 class="big">' + K.process.title + '</h2><p class="sub">' + K.process.sub + '</p>' + steps(K.process.steps)) +
      card("hp-k-tradition", [8, 478, 412, 742], "A Long-Standing Tradition", "k-oven", '<p>' + K.tradition + '</p>') +
      card("hp-k-science", [414, 478, 752, 742], "The Science of Bread", "k-jar", '<p>' + K.science + '</p>') +
      card("hp-k-ingr", [754, 478, 1136, 742], "Ingredients &amp; Their Role", "k-ingr",
        '<ul class="bul">' + K.ingredients.map(function (i) { return '<li><b>' + i[0] + '</b> — ' + i[1] + '</li>'; }).join("") + '</ul>') +
      card("hp-k-white", [1138, 478, 1530, 742], "A Simple White Bread", "k-loaf", '<p>' + K.white + '</p>') +
      card("hp-k-why", [4, 736, 548, 1012], "Why It Matters to Me", "k-polaroid", '<p>' + K.why[0] + '</p><p>' + K.why[1] + ' <span class="heart" aria-hidden="true">&#9825;</span></p>') +
      panel("hp-k-tip", [546, 736, 812, 1012], ill("k-sun", "sun") + '<h2>' + K.tipTitle + '</h2><p class="quote">' + K.quote + '</p><p>' + K.tipText + '</p>') +
      panel("hp-k-tips", [814, 736, 1168, 1012], '<h2>Tips for a Great Loaf</h2><ul class="check">' + K.tips.map(function (t) { return '<li>' + t + '</li>'; }).join("") + '</ul>') +
      card("hp-k-taste", [1166, 736, 1532, 1012], "A Taste of Tradition", "k-toast", '<p>' + K.taste + '</p>');
    return mount(root, { cls: "hp-kitchen", art: "assets/hearth/kitchen.webp", hero: [200, 262, 840, 478],
      alt: "A sunny kitchen counter with a fresh loaf of bread, sliced, a striped mixing bowl and a window onto green fields.", panels: panels });
  });

  /* ============================== THE SUGAR SHACK ============================== */
  var SHACK = {
    banner: "A Maple Knowledge Space",
    intro: "Explore the history, science, and tradition behind maple syrup, a beloved part of Canadian and Franco-Ontarian culture.",
    flow: { title: "From Tree to Table", steps: [
      { ill: "s-tap", name: "Tap", text: "In early spring, maple trees are tapped so their sap can be collected." },
      { ill: "s-collect", name: "Collect", text: "Gather the clear, watery sap, which contains natural sugars." },
      { ill: "s-boil", name: "Boil", text: "The sap is heated in an evaporator to remove water and concentrate the sugars." },
      { ill: "s-filter", name: "Filter", text: "The syrup is filtered to remove “sugar sand” and other mineral deposits." },
      { ill: "s-bottle", name: "Bottle", text: "The finished maple syrup is graded, bottled, and ready to enjoy!" }] },
    reduit: ["Before syrup, there is <i>réduit</i>.", "As maple sap boils, water evaporates and the natural sugars become more concentrated. Before reaching finished syrup, the liquid becomes thicker, darker, and sweeter. This concentrated maple sap is known in French as <i>réduit</i>."],
    science: ["In late winter and early spring, shifts in temperature cause pressure changes inside the tree, which make the sap flow.", "Maple sap is mostly water (about 98%) with a small amount of natural sugar (about 2–3%). By boiling the sap, the water evaporates, leaving behind the concentrated, sweet maple syrup."],
    grades: [["s-golden", "Golden", "Delicate flavour and light colour."], ["s-amber", "Amber", "Rich, classic maple flavour."], ["s-dark", "Dark", "Robust, strong maple taste."]],
    deep: "Maple sugaring has long been part of Indigenous knowledge and culture across many Nations, with diverse practices, traditions, and uses. It later became a cherished tradition in French-Canadian communities, including here in Ontario, where sugar shacks (<i>cabanes à sucre</i>) have been places of gathering, food, and community for generations.",
    canadian: "Sugar shacks are more than just places to make syrup — they’re seasonal gathering spaces. Families and communities come together to enjoy maple treats like fresh syrup, maple taffy on snow, and traditional meals, celebrating the change of seasons and the return of spring.",
    why: ["Growing up, making maple syrup was more than just a springtime tradition in my family. My grandfather made his own syrup, and I remember helping him collect the sap from the trees. It was one of those little experiences that made childhood special, spending time together while learning something that had been passed down through generations.",
          "The Sugar Shack represents more than how maple syrup is made. For me, it’s about family, tradition, learning from one another, and the little moments — like <i>du réduit</i> — that stay with us long after childhood has passed."]
  };

  MPM.registerExperience("sugar-shack", function (root) {
    var S = SHACK;
    var panels =
      panel("hp-title hp-s-title", [88, 6, 374, 312], '<h1><span>The</span>Sugar<br>Shack</h1>') +
      panel("hp-s-banner", [700, 8, 1508, 150], '<h1>' + S.banner + '</h1><p>' + S.intro + '</p>') +
      panel("hp-s-flow", [733, 150, 1502, 456], '<h2 class="ribbon-h">' + S.flow.title + '</h2>' + steps(S.flow.steps)) +
      panel("hp-s-reduit", [288, 462, 778, 722], '<h2 class="red">Du Réduit</h2><div class="hp-row">' + ill("s-reduit") + '<div class="hp-txt"><p class="lead">' + S.reduit[0] + '</p><p>' + S.reduit[1] + '</p></div></div>') +
      panel("hp-s-science", [790, 466, 1162, 718], '<h2>The Science of Maple</h2><div class="hp-row">' + ill("s-twig") + '<div class="hp-txt"><p>' + S.science[0] + '</p><p>' + S.science[1] + '</p></div></div>') +
      panel("hp-s-grades", [1164, 466, 1502, 718], '<h2>Maple Syrup Grades</h2><ul class="grades">' + S.grades.map(function (g) {
        return '<li>' + ill(g[0]) + '<b>' + g[1] + '</b><span>' + g[2] + '</span></li>'; }).join("") + '</ul>') +
      card("hp-s-deep", [8, 706, 396, 994], "A Deep-Rooted Tradition", "s-basket", '<p>' + S.deep + '</p>') +
      card("hp-s-canadian", [398, 722, 784, 994], "A Canadian &amp; Franco-Ontarian Tradition", "s-mug", '<p>' + S.canadian + '</p>') +
      panel("hp-s-why", [786, 702, 1516, 1008], '<h2>Why It Matters to Me</h2><div class="hp-row wide">' + ill("s-photo") + '<div class="hp-txt"><p>' + S.why[0] + '</p><p>' + S.why[1] + '</p></div></div>');
    return mount(root, { cls: "hp-shack", art: "assets/hearth/sugar-shack.webp", hero: [350, 30, 735, 470],
      alt: "A rustic sugar shack at dusk with steam rising from the evaporator, stacked firewood and silver sap buckets on the maple trees.", panels: panels });
  });

  /* ============================== THE GARDEN ============================== */
  var GARDEN = {
    title: "The Garden", intro: "Plan, plant, and learn about traditional and companion planting methods.",
    nav: [["g-n1", "The Three Sisters", "sisters"], ["g-n2", "Plan Your Garden", "plan"], ["g-n3", "Other Companion Plants", "other"], ["g-n4", "Resources &amp; Tips", "resources"]],
    plan: { title: "Plan Your Three Sisters Garden", help: "Drag and drop the plants into the garden bed to see how the Three Sisters work together!", choose: "Choose a plant and place it in the garden:" },
    plants: { corn: { name: "Corn", role: "supports", img: "g-corn", say: "Corn grows tall and strong, a natural trellis for the beans." },
              beans: { name: "Beans", role: "nourishes", img: "g-beans", say: "Beans climb the corn and add nitrogen to the soil." },
              squash: { name: "Squash", role: "protects", img: "g-squash", say: "Squash spreads across the ground, keeping moisture in and weeds out." } },
    /* centres of the six planting circles, as % of the garden-bed picture */
    spots: [[27.7, 42.6], [48.5, 29.8], [69.3, 39.1], [45.9, 63], [20.8, 75.7], [77.4, 74.9]],
    sisters: { title: "The Three Sisters", intro: "A traditional Indigenous planting method that brings three plants together — corn, beans, and squash — to support each other, the soil, and a more resilient harvest.",
      cards: [["g-c", "Corn", "Grows tall and strong, providing a natural trellis for the beans to climb."], ["g-b", "Beans", "Climb the corn and add nitrogen to the soil, which helps all three plants grow."], ["g-s", "Squash", "Spreads across the ground, keeping moisture in, blocking weeds, and helping to protect the soil."]],
      how: [["g-soil", "Prepare", "Choose a sunny spot and enrich the soil with compost."], ["g-seeds", "Plant", "Start with corn (first), then add beans once it’s 10–15 cm tall, followed by squash around the base."], ["g-sprout", "Grow", "Let them grow together, and watch how they support and strengthen each other!"]],
      why: ["A sustainable, time-tested planting method", "Improves soil health", "Reduces the need for weeding", "Conserves moisture", "Honours Indigenous knowledge and traditions"] },
    /* not in the concept art, so honestly marked as coming later */
    later: { other: "Other Companion Plants", resources: "Resources &amp; Tips" }
  };

  MPM.registerExperience("garden", function (root) {
    var D = GARDEN, spots = [null, null, null, null, null, null], picked = "", modal = null;
    var P = D.sisters;
    var nav = D.nav.map(function (n, i) {
      return panel("hp-g-nav", [10, 280 + i * 90, 214, 358 + i * 90],
        '<button type="button" class="gnav" data-go="' + n[2] + '">' + ill(n[0]) + '<span>' + n[1] + '</span></button>');
    }).join("");
    var spotHtml = D.spots.map(function (s, i) {
      return '<button type="button" class="spot" data-i="' + i + '" style="left:' + s[0] + '%;top:' + s[1] + '%" aria-label="Planting spot ' + (i + 1) + ': empty"></button>';
    }).join("");
    var chips = Object.keys(D.plants).map(function (k) {
      var p = D.plants[k];
      return '<button type="button" class="chip" data-p="' + k + '" aria-pressed="false">' + ill(p.img) + '<b>' + p.name + '</b><span>(' + p.role + ')</span></button>';
    }).join("");
    var panels =
      panel("hp-title hp-g-title", [134, 46, 564, 234], '<h1>' + D.title + '</h1><p>' + D.intro + '</p>') +
      nav +
      panel("hp-g-plan", [262, 314, 814, 950],
        '<h2>' + D.plan.title + '</h2><p class="sub">' + D.plan.help + ' <button type="button" class="info" aria-label="How the plants help each other" id="g-info">i</button></p>' +
        '<div class="bed">' + ill("g-bed") + spotHtml + '</div>' +
        '<p class="gstatus" role="status" aria-live="polite" id="g-status">Place corn, beans, and squash to see how they work together.</p>' +
        '<p class="choose">' + D.plan.choose + '</p><div class="chips">' + chips + '</div>' +
        '<div class="gbtns"><button type="button" class="gbtn" id="g-reset">&#8634; Reset Garden</button><button type="button" class="gbtn go" id="g-full">&#10059; See the Full Plan</button></div>', ' id="plan" tabindex="-1"') +
      panel("hp-g-sisters", [818, 22, 1524, 990],
        '<h2 class="big">' + P.title + '</h2><p class="intro">' + P.intro + '</p>' +
        '<div class="sis">' + ill("g-sisters", "plant") + '<ul class="sis-cards">' + P.cards.map(function (c) {
          return '<li>' + ill(c[0]) + '<div><b>' + c[1] + '</b><p>' + c[2] + '</p></div></li>'; }).join("") + '</ul></div>' +
        '<h3 class="how-h">How to Plant It</h3><ol class="how">' + P.how.map(function (h, i) {
          return '<li>' + ill(h[0]) + '<h4><span class="num">' + (i + 1) + '</span> ' + h[1] + '</h4><p>' + h[2] + '</p></li>'; }).join("") + '</ol>' +
        '<div class="why"><h3>Why It Matters</h3><ul class="check">' + P.why.map(function (w) { return '<li>' + w + '</li>'; }).join("") + '</ul></div>', ' id="sisters" tabindex="-1"');

    var cleanupDrag = function () {};
    var off = mount(root, { cls: "hp-garden", art: "assets/hearth/garden.webp", hero: [556, 0, 828, 312],
      alt: "A farm at sunset seen over a rustic wooden fence, framed by autumn vines.", panels: panels,
      onEscape: function () { if (modal) { closeModal(); return true; } return false; },
      cleanup: function () { closeModal(); cleanupDrag(); } });

    var scene = root.querySelector(".hp-garden"), statusEl = scene.querySelector("#g-status");
    var spotEls = scene.querySelectorAll(".spot"), chipEls = scene.querySelectorAll(".chip");

    function say(t) { statusEl.textContent = t; }
    function counts() { var c = { corn: 0, beans: 0, squash: 0 }; spots.forEach(function (s) { if (s) c[s]++; }); return c; }
    function paint() {
      spotEls.forEach(function (el, i) {
        var k = spots[i];
        el.classList.toggle("on", !!k);
        el.innerHTML = k ? ill(D.plants[k].img) : "";
        el.setAttribute("aria-label", "Planting spot " + (i + 1) + ": " + (k ? D.plants[k].name + " (press to remove)" : "empty"));
      });
      chipEls.forEach(function (el) { var on = el.getAttribute("data-p") === picked; el.setAttribute("aria-pressed", on ? "true" : "false"); el.classList.toggle("sel", on); });
    }
    function place(i, k) {
      var c0 = counts();
      spots[i] = k; paint();
      var c = counts();
      if (c.corn && c.beans && c.squash) say("Corn supports, beans nourish, squash protects. Together they make a more resilient harvest!");
      else if (k === "beans" && !c0.corn && !c.corn) say("Beans climb the corn. Try planting corn nearby first.");
      else if (k === "squash" && !c.corn) say("Squash spreads around the base. Corn goes in first.");
      else say(D.plants[k].say);
    }
    function pickChip(k) { picked = picked === k ? "" : k; paint(); if (picked) say(D.plants[picked].name + " selected. Choose a spot in the bed."); }

    /* click / keyboard: choose a plant, then a spot (or press a planted spot to clear it) */
    chipEls.forEach(function (el) { el.addEventListener("click", function () { if (!el._dragged) pickChip(el.getAttribute("data-p")); el._dragged = false; }); });
    spotEls.forEach(function (el, i) {
      el.addEventListener("click", function () {
        if (picked) { place(i, picked); picked = ""; paint(); }
        else if (spots[i]) { spots[i] = null; paint(); say("Removed. Pick a plant to place it somewhere else."); }
        else say("Choose a plant first, then pick a spot.");
      });
    });

    /* drag & drop with pointer events (mouse, touch, pen) */
    var ghost = null, dragKey = "", sx = 0, sy = 0, moved = false;
    function overSpot(x, y) { var t = document.elementFromPoint(x, y); return t && t.closest ? t.closest(".spot") : null; }
    function onDown(e) {
      var chip = e.target.closest(".chip"); if (!chip || (e.button && e.button !== 0)) return;
      dragKey = chip.getAttribute("data-p"); sx = e.clientX; sy = e.clientY; moved = false;
      document.addEventListener("pointermove", onMove); document.addEventListener("pointerup", onUp); document.addEventListener("pointercancel", onUp);
    }
    function onMove(e) {
      if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 6) return;
      if (!moved) { moved = true; ghost = document.createElement("div"); ghost.className = "ghost"; ghost.innerHTML = ill(D.plants[dragKey].img); document.body.appendChild(ghost); }
      e.preventDefault(); ghost.style.transform = "translate(" + (e.clientX - 34) + "px," + (e.clientY - 34) + "px)";
      var s = overSpot(e.clientX, e.clientY); spotEls.forEach(function (el) { el.classList.toggle("hot", el === s); });
    }
    function onUp(e) {
      document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); document.removeEventListener("pointercancel", onUp);
      spotEls.forEach(function (el) { el.classList.remove("hot"); });
      if (ghost) { ghost.remove(); ghost = null; }
      if (moved) {
        var chip = scene.querySelector('.chip[data-p="' + dragKey + '"]'); if (chip) chip._dragged = true;
        var s = e.type === "pointerup" ? overSpot(e.clientX, e.clientY) : null;
        if (s) { place(+s.getAttribute("data-i"), dragKey); picked = ""; paint(); }
      }
      dragKey = "";
    }
    var plan = scene.querySelector("#plan");
    plan.addEventListener("pointerdown", onDown);
    cleanupDrag = function () { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); if (ghost) ghost.remove(); };

    scene.querySelector("#g-reset").addEventListener("click", function () { spots = [null, null, null, null, null, null]; picked = ""; paint(); say("The bed is clear. Place corn, beans, and squash to see how they work together."); });
    scene.querySelector("#g-info").addEventListener("click", function () { say("Corn supports the beans, beans nourish the soil, and squash protects it. Together they help each other grow."); });

    /* dialogs: the full plan, and honest "coming later" notes for the two sections that have no concept art yet */
    function openModal(html, label) {
      closeModal();
      modal = document.createElement("div"); modal.className = "hp-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-label", label);
      modal.innerHTML = '<div class="hp-dlg">' + html + '<p class="dlg-actions"><button type="button" class="gbtn go" data-close>Close</button></p></div>';
      modal.addEventListener("click", function (e) { if (e.target === modal || e.target.hasAttribute("data-close")) closeModal(); });
      document.body.appendChild(modal); modal.querySelector("[data-close]").focus();
    }
    function closeModal() { if (modal) { modal.remove(); modal = null; } }
    scene.querySelector("#g-full").addEventListener("click", function () {
      var c = counts(), total = c.corn + c.beans + c.squash;
      openModal('<h2>Your Three Sisters Plan</h2><p class="sum">' + (total ? 'In your bed: <b>' + c.corn + '</b> corn, <b>' + c.beans + '</b> beans, <b>' + c.squash + '</b> squash.' : 'Your bed is empty so far. Add some plants, then come back to see the plan.') + '</p>' +
        '<ol class="plan-steps">' + P.how.map(function (h) { return '<li><b>' + h[1] + '.</b> ' + h[2] + '</li>'; }).join("") + '</ol>' +
        '<ul class="roles">' + P.cards.map(function (c2) { return '<li><b>' + c2[1] + '.</b> ' + c2[2] + '</li>'; }).join("") + '</ul>', "Your Three Sisters plan");
    });
    scene.addEventListener("click", function (e) {
      var b = e.target.closest(".gnav"); if (!b) return;
      var go = b.getAttribute("data-go");
      scene.querySelectorAll(".gnav").forEach(function (n) { n.classList.toggle("cur", n === b); });
      if (go === "sisters" || go === "plan") {
        var t = scene.querySelector("#" + go); t.focus({ preventScroll: true }); t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
        t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
      } else {
        openModal('<h2>' + D.later[go] + '</h2><p>This section is coming soon. Its content hasn’t been added to the site yet.</p>', D.later[go]);
      }
    });
    paint();
    return off;
  });
})();
