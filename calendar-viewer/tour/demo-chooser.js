/* ============================================================
   Demo chooser — shared by every faikoz.com demo.

   Shows a modal the moment the demo opens:
       "Show me around"        -> guided tour (the tour script runs as before)
       "I'll discover myself"  -> free roam: the demo loads ALL its data at
                                  once, no tour pops up (the "? Take the
                                  tour" button is still there).

   The demo page sets, before this script:
       window.DEMO_CHOOSER = {
         title:   "Sales Analytics",          // shown in the modal
         blurb:   "...",                      // optional one-liner
         loadAll: async function () { ... }   // optional: load everything
       };

   Everything else reads window.DEMO_MODE ("tour" | "explore") or calls
   DemoChooser.whenChosen(fn). The choice is also kept in sessionStorage so
   a reload inside the same tab keeps the mode without asking again.
   ============================================================ */
(function () {
  var cfg = window.DEMO_CHOOSER || {};
  var KEY = "demoMode:" + (cfg.key || location.pathname);
  var listeners = [];
  var self = window.DemoChooser = {
    mode: null,
    whenChosen: function (fn) { if (self.mode) fn(self.mode); else listeners.push(fn); },
    reset: function () { try { sessionStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  };

  function choose(mode) {
    self.mode = mode;
    window.DEMO_MODE = mode;
    try { sessionStorage.setItem(KEY, mode); } catch (e) {}
    var m = document.getElementById("demo-chooser");
    if (m) { m.classList.add("closing"); setTimeout(function () { m.remove(); }, 220); }
    document.dispatchEvent(new CustomEvent("demo:mode", { detail: { mode: mode } }));
    listeners.splice(0).forEach(function (fn) { try { fn(mode); } catch (e) { console.error(e); } });
    if (mode === "explore") runLoadAll();
  }

  /* ---- free-roam: wait for the captured data, then load everything ---- */
  function whenDemoDataReady(cb) {
    var started = Date.now();
    (function tick() {
      var overlay = document.getElementById("demo-loading-overlay");
      var ready = window.__DEMO_LOADED__ !== false && !overlay;
      if (ready || Date.now() - started > 120000) cb(); else setTimeout(tick, 200);
    })();
  }
  function toast(text, on) {
    var t = document.getElementById("demo-chooser-toast");
    if (!on) { if (t) t.remove(); return; }
    if (!t) { t = document.createElement("div"); t.id = "demo-chooser-toast"; document.body.appendChild(t); }
    t.innerHTML = "<span class='dc-spin'></span>" + text;
  }
  function runLoadAll() {
    if (typeof cfg.loadAll !== "function") return;
    whenDemoDataReady(function () {
      toast("Loading the whole dataset so you can roam freely…", true);
      Promise.resolve().then(cfg.loadAll).catch(function (e) { console.error("[demo-chooser] loadAll failed", e); })
        .then(function () { toast("", false); });
    });
  }

  /* ---- the modal ---- */
  function build() {
    if (document.getElementById("demo-chooser")) return;
    var title = cfg.title || "Interactive demo";
    var blurb = cfg.blurb || "Synthetic data. Nothing here is connected to a real business.";
    var m = document.createElement("div");
    m.id = "demo-chooser";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.setAttribute("aria-labelledby", "demo-chooser-title");
    m.innerHTML =
      "<div class='dc-card'>" +
        "<div class='dc-kicker'>Live demo</div>" +
        "<h1 id='demo-chooser-title'>" + title + "</h1>" +
        "<p class='dc-blurb'>" + blurb + "</p>" +
        "<p class='dc-question'>How would you like to explore it?</p>" +
        "<div class='dc-options'>" +
          "<button type='button' class='dc-opt dc-opt-tour' data-mode='tour'>" +
            "<span class='dc-opt-icon' aria-hidden='true'>&#10148;</span>" +
            "<span class='dc-opt-title'>Show me around</span>" +
            "<span class='dc-opt-desc'>A guided walk-through, one dashboard at a time. Takes a few minutes.</span>" +
          "</button>" +
          "<button type='button' class='dc-opt dc-opt-explore' data-mode='explore'>" +
            "<span class='dc-opt-icon' aria-hidden='true'>&#9881;</span>" +
            "<span class='dc-opt-title'>I’ll discover myself</span>" +
            "<span class='dc-opt-desc'>Everything loads at once and you click through freely. The tour stays one button away.</span>" +
          "</button>" +
        "</div>" +
      "</div>";
    m.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest(".dc-opt");
      if (b) choose(b.dataset.mode);
    });
    document.body.appendChild(m);
    var first = m.querySelector(".dc-opt-tour");
    if (first) setTimeout(function () { try { first.focus(); } catch (e) {} }, 50);
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn();
  }
  ready(function () {
    var remembered = null;
    try { remembered = sessionStorage.getItem(KEY); } catch (e) {}
    if (remembered === "tour" || remembered === "explore") { choose(remembered); return; }
    build();
  });
})();
