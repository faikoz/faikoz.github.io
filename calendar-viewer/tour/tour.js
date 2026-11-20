/* ============================================================
   Guided tour for the Team Calendar demo (calendar viewer, Demo Apps 5, Nov 2026).
   Powered by Driver.js (https://driverjs.com), MIT licence.

   Built like the other demo tours: every step names the state the page must be in
   (`req`: view, open window) and the tour puts the page there first, so Back and Next
   work both ways; "click" steps wait for the visitor's own click (red pulse, no Next
   button); red X closes, "Take the tour" resumes.

   The page's own script is a module, so the tour reaches it through window.__demoCal
   (added by the demo build). The Demo Apps 3 tour is kept as _tour_demo3_backup.js.
   ============================================================ */
(function () {
  var DRIVER_JS  = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js";
  var DRIVER_CSS = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css";
  function addStylesheet(href) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
  addStylesheet(DRIVER_CSS);

  var S = window.__DEMO_STORY__ || {};
  var HERO = S.hero || { no: "", name: "", next_id: "", next_start: "" };
  var CAL_A = (S.cal_a || {}).short || "Projects", CAL_B = (S.cal_b || {}).short || "Trade";
  var SEEN = "calTour_ironbark_v1", RESUME = "calTour_ironbark_resumeAt";
  function markSeen() { try { localStorage.setItem(SEEN, "1"); } catch (e) {} }
  function getResume() { try { return sessionStorage.getItem(RESUME); } catch (e) { return null; } }
  function setResume(id) { try { if (id == null) sessionStorage.removeItem(RESUME); else sessionStorage.setItem(RESUME, id); } catch (e) {} }
  function stepId(step, i) { return (step.popover && step.popover.title) ? "t:" + step.popover.title : "i:" + i; }
  function $(s) { return document.querySelector(s); }
  function api() { return window.__demoCal || {}; }
  function cal() { return api().calendar || null; }

  /* ---- page state ----------------------------------------- */
  var VIEW = { month: "dayGridMonth", week: "timeGridWeek", day: "timeGridDay", list: "listWeek" };
  function overlay() { return document.getElementById("modal-overlay"); }
  function modalKind() {
    var o = overlay(); if (!o || !o.classList.contains("show")) return null;
    if ($("#modal-body #cust-search-input")) return "search";
    if ($("#modal-body .modal-customer") || !$("#modal-body .modal-back") && !/Account:/.test(($("#modal-body .modal-meta") || {}).textContent || "")) return "event";
    return "customer";
  }
  function closeModal() { var o = overlay(); if (o && o.classList.contains("show")) { o.classList.remove("show"); return true; } return false; }
  function setView(key) {
    var c = cal(); if (!c) return false;
    var changed = false;
    if (c.view.type !== VIEW[key]) { c.changeView(VIEW[key]); changed = true; }
    return changed;
  }
  function gotoHero() {
    var c = cal(); if (!c || !HERO.next_start) return false;
    var d = new Date(HERO.next_start), v = c.view;
    if (d >= v.currentStart && d < v.currentEnd) return false;
    c.gotoDate(d); return true;
  }
  function gotoToday() {
    var c = cal(); if (!c) return false;
    var now = new Date(), v = c.view;
    if (now >= v.currentStart && now < v.currentEnd) return false;
    c.today(); return true;
  }
  function teamsOn() {
    var m = false;
    document.querySelectorAll(".fc-toggleProjects-button.toggle-off, .fc-toggleTrade-button.toggle-off").forEach(function (b) { b.click(); m = true; });
    return m;
  }
  function setModal(want) {
    var cur = modalKind();
    if ((cur || null) === (want || null)) return false;
    if (!want) return closeModal();
    var a = api();
    try {
      if (want === "event") { var ev = cal() && cal().getEventById(HERO.next_id); if (ev) a.openEventModal(ev); }
      else if (want === "search") {
        a.openSearchModal();
        var inp = document.getElementById("cust-search-input");
        if (inp) { inp.value = "westg"; inp.dispatchEvent(new Event("input", { bubbles: true })); }
      } else if (want === "customer") a.openCustomerModal(HERO.no, { fromSearch: true });
    } catch (e) {}
    return true;
  }

  function reconcile(req) {
    if (!req) return false;
    var m = false;
    if (!req.modal) m = setModal(null) || m;
    m = teamsOn() || m;
    if (req.view) m = setView(req.view) || m;
    if (req.hero) m = gotoHero() || m; else if (req.view) m = gotoToday() || m;
    if (req.modal) m = setModal(req.modal) || m;
    if (req.modal === "search") {                 // the visitor opened the lookup by their own click: type the example for them
      var inp = document.getElementById("cust-search-input");
      if (inp && !inp.value) { inp.value = "westg"; inp.dispatchEvent(new Event("input", { bubbles: true })); m = true; }
    }
    retag();
    return m;
  }

  function tag(el, id) {
    var old = document.getElementById(id);
    if (old && old !== el) old.removeAttribute("id");
    if (el && !el.id) el.id = id;
  }
  function heroEventEl() {
    var els = document.querySelectorAll("#calendar .fc-event"), day = (HERO.next_start || "").slice(0, 10);
    for (var i = 0; i < els.length; i++) {
      if ((els[i].textContent || "").indexOf(HERO.no + " |") >= 0) {
        var cell = els[i].closest("[data-date]");
        if (!cell || !day || cell.getAttribute("data-date") === localDay(HERO.next_start)) return els[i];
      }
    }
    return null;
  }
  function localDay(iso) { var d = new Date(iso); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function retag() {
    try {
      var chunks = document.querySelectorAll("#calendar .fc-header-toolbar .fc-toolbar-chunk");
      tag(chunks[0], "tourNav"); tag(chunks[2], "tourViews");
      var tg = $(".fc-toggleProjects-button"); tag(tg ? tg.parentElement : null, "tourTeams");
      tag($("#calendar .fc-view-harness"), "tourGrid");
      tag(heroEventEl(), "tourHeroEvent");
      tag($(".fc-findCustomer-button"), "tourLookupBtn");
      tag($("#modal-body .modal-meta"), "tourMeta");
      tag($("#modal-body .modal-columns") || $("#modal-body .modal-total"), "tourHistory");
      tag($("#modal-body .source-toggles"), "tourSources");
      tag($("#modal-body .cust-search-results"), "tourResults");
      tag($("#modal-body .modal-title"), "tourModalTitle");
    } catch (e) {}
  }

  /* ================================================================
     THE TOUR
     ================================================================ */
  var BASE = { view: "month", modal: null };
  var EVENT = { view: "month", hero: true, modal: "event" };
  var STEPS = [
    {
      req: BASE,
      popover: {
        title: "Welcome to the Team Calendar",
        description:
          "Two teams keep their bookings in their own diaries. This page puts both on one screen that anyone in the business can open, " +
          "without being given access to anybody's mailbox. It is view only. " +
          "Click a booking and you also get the customer's whole quote history. Every customer and booking here is invented for the demo.",
        side: "over", align: "center"
      }
    },
    {
      element: "#status", req: BASE,
      popover: {
        title: "Always up to date",
        description:
          "This line says how many bookings are on screen. In the live tool the page updates by itself within a few minutes of a booking being made, moved or cancelled, " +
          "so nobody has to refresh or ask.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourNav", req: BASE,
      popover: {
        title: "Moving around",
        description:
          "The arrows go back and forward, <b>today</b> brings you home. Older months are fetched when you go to them, so the page stays quick however long the history gets. " +
          "<b>Customer lookup</b> comes later in the tour.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourViews", req: BASE,
      popover: {
        title: "Month, week, day or list",
        description: "Four ways to look at the same bookings. The tour will show the week next.",
        side: "bottom", align: "end"
      }
    },
    {
      element: "#tourGrid", req: { view: "week", modal: null },
      popover: {
        title: "The week",
        description:
          "Each booking sits in its time slot, and bookings at the same time sit side by side. The white band is business hours, the red line is now. " +
          "Green is the " + CAL_A + " team, orange is the " + CAL_B + " team, amber is a public holiday.",
        side: "left", align: "start"
      }
    },
    {
      element: "#tourTeams", req: BASE,
      popover: {
        title: "One team or both",
        description:
          "These two buttons switch a team's bookings off and on. Public holidays always stay. Try them after the tour.",
        side: "bottom", align: "center"
      }
    },
    {
      element: "#tourHeroEvent", req: { view: "month", hero: true, modal: null }, waitForClick: "event",
      popover: {
        title: "Click this booking",
        description:
          "Hovering over a booking shows a small card with the time, the team and the place. Clicking opens the full picture. " +
          "Click this one, next Tuesday's account review with <b>" + HERO.name + "</b>.",
        side: "top", align: "start"
      }
    },
    {
      element: "#tourMeta", req: EVENT,
      popover: {
        title: "The booking",
        description: "When, which team and where. The title carries the account number, the customer, what the visit is for and the quote it belongs to.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourHistory", req: EVENT,
      popover: {
        title: "The customer's quote history",
        description:
          "This is what makes the page more than a calendar. For each team: how many quotes this customer has had and what they were worth, " +
          "then how they ended. <b>Won</b>, <b>Lost</b> with the reason, <b>Still open</b> and <b>Other</b>. " +
          "Whoever is going to the meeting can see in ten seconds how the relationship has been going.",
        side: "top", align: "center"
      }
    },
    {
      element: "#tourSources", req: EVENT, optional: true,
      popover: {
        title: "Old system and ERP",
        description:
          "The history comes from two places: the system the business used before, and the ERP it uses now. Both are on, so the figures are the total. " +
          "Switch one off to see the other alone. For this customer the difference tells a story: far fewer quotes are being won than before.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#modal-appts", req: EVENT,
      popover: {
        title: "Every booking this customer has had",
        description:
          "Past ones in grey, coming ones in black, with the team beside each. Click any line and the calendar goes to that day. " +
          "Here you can see regular visits until September, then a ten-week gap before this meeting.",
        side: "top", align: "center"
      }
    },
    {
      element: "#tourLookupBtn", req: BASE, waitForClick: "search",
      popover: {
        title: "Click Customer lookup",
        description: "You do not have to find a booking first. Click <b>Customer lookup</b>.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourResults", req: { view: "month", modal: "search" },
      popover: {
        title: "Find anyone by number or name",
        description:
          "Type an account number or part of a name. The tour typed <b>westg</b>. The arrow keys move through the list and Enter opens the highlighted customer.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourModalTitle", req: { view: "month", modal: "customer" },
      popover: {
        title: "The same picture, straight from the lookup",
        description:
          "Quote history and every booking for the customer you picked, whether or not they are on the calendar this month. <b>Back to the lookup</b> returns to your search.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#sidebar", req: BASE,
      popover: {
        title: "Coming up",
        description: "The next ten bookings from now, across both teams, for anyone who just wants to know what is on next.",
        side: "left", align: "start"
      }
    },
    {
      element: "#user-info", req: BASE,
      popover: {
        title: "Staff only",
        description:
          "The live page is for staff. They sign in with a link sent to their work email, so there are no passwords to forget. The demo skips that step and shows a demo user as signed in.",
        side: "bottom", align: "end"
      }
    },
    {
      element: "#calTourBtn", req: BASE,
      popover: {
        title: "That's the tour",
        description: "Have a look around: change the view, switch a team off, hover and click a few bookings, or look up a customer. This button starts the tour again.",
        side: "bottom", align: "end"
      }
    }
  ];

  function injectTourButton() {
    if (document.getElementById("calTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "calTourBtn"; btn.type = "button"; btn.className = "cv-tour-btn cv-tour-btn-in-header";
    btn.title = "Replay the guided tour"; btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='cv-tour-btn-icon' aria-hidden='true'>?</span><span class='cv-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () { startTour({ resume: true }); });
    var header = document.querySelector("header");
    var info = document.getElementById("user-info");
    if (header && info) header.insertBefore(btn, info);
    else if (header) header.appendChild(btn);
    else document.body.appendChild(btn);
  }

  function waitFor(test, maxMs, cb) {
    var t0 = Date.now();
    (function check() {
      var ok = false; try { ok = !!test(); } catch (e) {}
      if (ok) setTimeout(cb, 240); else if (Date.now() - t0 > maxMs) cb(); else setTimeout(check, 120);
    })();
  }
  var WAITERS = {
    event: function () { return modalKind() === "event"; },
    search: function () { return modalKind() === "search"; }
  };

  var current = null;
  function startTour(opts) {
    opts = opts || {};
    if (!window.driver || !window.driver.js || !window.driver.js.driver) return;
    if (current) { try { current.destroy(); } catch (e) {} current = null; }
    var attached = [], pulsing = [];
    function pulseOn(el) { if (!el) return; el.classList.remove("driver-no-interaction"); el.classList.add("cv-tour-pulse"); pulsing.push(el); }
    function pulseOff() { pulsing.forEach(function (el) { try { el.classList.remove("cv-tour-pulse"); } catch (e) {} }); pulsing.length = 0; }
    function detach() { attached.forEach(function (h) { document.removeEventListener("click", h, true); }); attached.length = 0; }

    var steps = STEPS.map(function (raw) {
      if (!raw.waitForClick) return raw;
      var s = {}; for (var k in raw) s[k] = raw[k];
      s.disableActiveInteraction = false;
      s.popover = {}; for (var p in raw.popover) s.popover[p] = raw.popover[p];
      s.popover.showButtons = ["previous", "close"];
      s.onHighlighted = function (el) {
        detach(); pulseOff(); pulseOn(el);
        var handler = function (ev) {
          if (!ev.target || !ev.target.closest || !ev.target.closest(raw.element)) return;
          detach(); pulseOff();
          waitFor(WAITERS[raw.waitForClick], 4000, function () { go(lastIndex + 1); });
        };
        document.addEventListener("click", handler, true); attached.push(handler);
      };
      return s;
    });

    var lastIndex = 0, going = false;
    var d = window.driver.js.driver({
      showProgress: true, allowClose: true, allowKeyboardControl: false, disableActiveInteraction: true,
      animate: true, scrollIntoViewOptions: { behavior: "smooth", block: "nearest", inline: "nearest" },
      onNextClick: function () { go(lastIndex + 1); },
      onPrevClick: function () { go(lastIndex - 1); },
      overlayOpacity: 0.55, stagePadding: 6, stageRadius: 8, popoverClass: "cv-tour-popover",
      nextBtnText: "Next →", prevBtnText: "← Back", doneBtnText: "Finish",
      progressText: "Step {{current}} of {{total}}",
      steps: steps,
      onHighlightStarted: function (el, step, ctx) {
        var idx = (ctx && ctx.state && typeof ctx.state.activeIndex === "number") ? ctx.state.activeIndex : lastIndex;
        lastIndex = idx; setResume(stepId(steps[idx], idx)); detach(); pulseOff();
      },
      onDestroyed: function () {
        markSeen();
        if (lastIndex >= steps.length - 1) setResume(null);
        document.removeEventListener("keydown", keyGuard, true);
        pulseOff(); detach();
        try { setModal(null); setView("month"); gotoToday(); } catch (e) {}
        current = null;
      }
    });

    function go(target, dir) {
      if (going) return;
      if (target >= steps.length) { try { d.destroy(); } catch (e) {} return; }
      if (target < 0) return;
      dir = dir || (target >= lastIndex ? 1 : -1);
      var st = steps[target], mutated = false;
      try { mutated = reconcile(st.req); } catch (e) {}
      if (!mutated) {
        if (st.optional && st.element && !document.querySelector(st.element)) { go(target + dir, dir); return; }
        lastIndex = target; try { d.moveTo(target); } catch (e) {} return;
      }
      going = true;
      var t0 = Date.now();
      (function tick() {
        retag();
        var ready = !st.element || document.querySelector(st.element);
        if ((ready && Date.now() - t0 > 180) || Date.now() - t0 > 900) {
          going = false;
          if (st.optional && st.element && !document.querySelector(st.element)) { go(target + dir, dir); return; }
          requestAnimationFrame(function () { lastIndex = target; try { d.moveTo(target); } catch (e) {} });
        } else requestAnimationFrame(tick);
      })();
    }

    function keyGuard(ev) {
      if (current !== d) return;
      var step = steps[lastIndex];
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); try { d.destroy(); } catch (e) {} return; }
      if (ev.key === "ArrowRight" || ev.key === "Enter" || ev.key === " ") {
        if (ev.target && /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName)) return;
        ev.preventDefault(); ev.stopPropagation();
        if (step && step.popover && step.popover.showButtons && step.popover.showButtons.indexOf("next") < 0) return;
        go(lastIndex + 1);
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault(); ev.stopPropagation(); go(lastIndex - 1);
      }
    }
    document.addEventListener("keydown", keyGuard, true);

    var startAt = 0;
    if (opts.resume) {
      var saved = getResume();
      if (saved) for (var i = 0; i < steps.length; i++) { if (stepId(steps[i], i) === saved) { startAt = i; break; } }
    }
    current = d; lastIndex = startAt;
    try { reconcile(steps[startAt].req); } catch (e) {}
    setTimeout(function () { retag(); try { d.drive(startAt); } catch (e) {} }, 250);
  }

  window.startCalTour = startTour;
  window.calTourSteps = STEPS;

  function whenReady(cb) {
    waitFor(function () { return cal() && document.querySelectorAll("#calendar .fc-event").length > 5; }, 20000, cb);
  }
  function loadDriverThen(cb) {
    if (window.driver && window.driver.js) { cb(); return; }
    var s = document.createElement("script"); s.src = DRIVER_JS; s.onload = cb;
    s.onerror = function () { console.error("[cal-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  ready(function () {
    injectTourButton();
    loadDriverThen(function () {
      var begin = function (mode) { if (mode === "tour") whenReady(function () { startTour({}); }); };
      if (window.DemoChooser && typeof window.DemoChooser.whenChosen === "function") window.DemoChooser.whenChosen(begin);
      else document.addEventListener("demo:mode", function (e) { begin(e.detail && e.detail.mode); });
    });
  });
})();
