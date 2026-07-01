/* Guy Zyskind — site interactions
   Everything degrades gracefully: content is fully present without JS. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav -------------------------------------------------------- */
  window.toggleMenu = function (btn) {
    var nav = document.getElementById("navmenu");
    if (!nav) return;
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };
  // Close the mobile menu after tapping a link
  var navmenu = document.getElementById("navmenu");
  if (navmenu) {
    navmenu.addEventListener("click", function (e) {
      if (e.target.closest("a") && navmenu.classList.contains("open")) {
        navmenu.classList.remove("open");
        var t = document.querySelector(".menu-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Footer year ------------------------------------------------------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Cipher-resolve: one keyword "decrypts" on load -------------------- */
  // Subject-grounded flourish. The final text is already in the DOM, so with
  // no JS or reduced motion it simply reads normally.
  (function cipher() {
    var el = document.querySelector("[data-cipher]");
    if (!el) return;
    var finalText = el.textContent;
    if (reduceMotion) return;
    // Lock width to avoid reflow while scrambling.
    var w = el.getBoundingClientRect().width;
    el.style.minWidth = w + "px";
    var glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*01<>/{}".split("");
    var frame = 0, total = 26;
    function tick() {
      frame++;
      var revealed = Math.floor((frame / total) * finalText.length);
      var out = "";
      for (var i = 0; i < finalText.length; i++) {
        if (finalText[i] === " ") { out += " "; continue; }
        out += i < revealed ? finalText[i] : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (frame < total) {
        setTimeout(function () { requestAnimationFrame(tick); }, 45);
      } else {
        el.textContent = finalText;
        el.style.minWidth = "";
      }
    }
    setTimeout(function () { requestAnimationFrame(tick); }, 260);
  })();

  /* ---- Reveal on scroll -------------------------------------------------- */
  (function reveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---- Press archive filtering (EN + HE) --------------------------------- */
  (function press() {
    var list = document.getElementById("press-list");
    if (!list) return;
    var q = document.getElementById("q");
    var yearSel = document.getElementById("pyear");
    var langSel = document.getElementById("plang");

    var raw = window.__PRESS || [];
    var data = raw
      .map(function (x) { return Array.isArray(x) ? { title: x[0], date: x[1], url: x[2], lang: x[3] } : x; })
      .sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

    if (yearSel) {
      var years = Array.from(new Set(data.map(function (x) { return (x.date || "").slice(0, 4); }).filter(Boolean)))
        .sort(function (a, b) { return b.localeCompare(a); });
      years.forEach(function (yr) {
        var o = document.createElement("option");
        o.value = yr; o.textContent = yr; yearSel.appendChild(o);
      });
    }

    function render() {
      var term = (q && q.value || "").toLowerCase();
      var yv = (yearSel && yearSel.value) || "";
      var lv = (langSel && langSel.value) || "";
      list.innerHTML = "";
      data.filter(function (item) {
        return (!term || (item.title || "").toLowerCase().indexOf(term) !== -1) &&
               (!yv || (item.date || "").indexOf(yv) === 0) &&
               (!lv || (item.lang || "") === lv);
      }).forEach(function (item) {
        var li = document.createElement("li");
        var sd = document.createElement("span");
        sd.className = "press-date"; sd.textContent = item.date || "";
        var a = document.createElement("a");
        a.href = item.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = item.title;
        li.appendChild(sd); li.appendChild(a);
        list.appendChild(li);
      });
    }

    window.resetFilters = function () {
      if (q) q.value = "";
      if (yearSel) yearSel.value = "";
      if (langSel) langSel.value = "";
      render();
    };

    if (q) q.addEventListener("input", render);
    if (yearSel) yearSel.addEventListener("change", render);
    if (langSel) langSel.addEventListener("change", render);
    render();
  })();
})();
