/* ============================================================
   Guided tour for the three-way forecast demo (Demo Apps 5, Nov 2026).
   Powered by Driver.js (https://driverjs.com), MIT licence.

   One page, five tabs. Every step names the tab it needs and the tour switches to it
   before the step shows, so Back and Next work both ways. Red X closes; "Take the tour"
   picks it up where it stopped. The Demo Apps 3 version is kept as _tour_demo3_backup.js.
   ============================================================ */
(function () {
  var DRIVER_JS  = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js";
  var DRIVER_CSS = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css";
  function addStylesheet(href) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
  addStylesheet(DRIVER_CSS);

  var S = window.__DEMO_STORY__ || {}, T = S.text || {};
  var RESUME = "twfTour_ironbark_resumeAt";
  function getResume() { try { return sessionStorage.getItem(RESUME); } catch (e) { return null; } }
  function setResume(v) { try { if (v == null) sessionStorage.removeItem(RESUME); else sessionStorage.setItem(RESUME, v); } catch (e) {} }
  function $(s) { return document.querySelector(s); }
  function view() { try { return (0, eval)("currentView"); } catch (e) { return "summary"; } }
  function setView(v) { if (view() === v) return false; try { showView(v); } catch (e) {} return true; }
  function tag(el, id) { var old = document.getElementById(id); if (old && old !== el) old.removeAttribute("id"); if (el && !el.id) el.id = id; }
  function retag() {
    try {
      tag($("#tab-summary").parentElement, "tourTabs");
      tag($("#view-summary .grid"), "tourFourLines");
      tag($("#yoyComparison").closest("table"), "tourYoY");
      tag($("#view-cashflow .bg-yellow-50"), "tourCashNotes");
      tag($("#revenueChart").closest(".shadow-md"), "tourChart1");
      tag($("#cashFlowChart").closest(".shadow-md"), "tourChart2");
      var cards = document.querySelectorAll(".max-w-7xl > .shadow-md"); tag(cards[cards.length - 1], "tourAssumptions");
      tag($("#tourAssumptions .bg-gray-100"), "tourNextStep");
    } catch (e) {}
  }

  var STEPS = [
    { view: "summary", title: "Welcome to the Three-Way Forecast",
      text: "A budget is three statements that have to agree with each other: the profit and loss, the balance sheet and the cash. " +
            "This page shows next year's budget for a fictional distributor with all three in one place, and says in plain words what the numbers mean. Every figure is invented." },
    { view: "summary", el: "#kpiSummary", side: "bottom", title: "The four numbers first",
      text: "Sales for the year, gross profit and its margin, profit after overheads, and the cash left at the end of June. Each is shown against last year, so the direction is clear before any table is opened." },
    { view: "summary", el: "#tourTabs", side: "bottom", title: "Five tabs",
      text: "<b>Overview</b> is the summary. <b>Profit &amp; Loss</b>, <b>Financial Position</b> and <b>Cash</b> are the three statements. <b>Charts</b> draws the year. The tour opens each in turn." },
    { view: "summary", el: "#tourFourLines", side: "top", title: "The year in a few lines",
      text: "On the left, the headline movements. On the right, what stands out, written as sentences: growth of " + (T.growth || "") + ", cost of sales creeping up, and the lean months, " + (T.tight || "") + "." },
    { view: "summary", el: "#tourYoY", side: "top", title: "This year against last year",
      text: "Sales, gross profit and profit for both years, with the difference in dollars and as a percentage. Green is better than last year, red is worse." },
    { view: "pnl", el: "#pnlTable", side: "top", title: "Profit and loss, month by month",
      text: "Sales, cost of sales, gross profit and its percentage, overheads and profit for each month, with the year on the right. The months in red lose money: sales fall in the quiet months and the overheads stay." },
    { view: "balance", el: "#balanceSheetTable", side: "top", title: "Financial position, by quarter",
      text: "What the business owns and owes at the end of each quarter, starting from last June's actual. Profit kept in the business lifts the owners' equity quarter by quarter. The two notes underneath say it in words." },
    { view: "cashflow", el: "#cashflowTable", side: "top", title: "Cash, month by month",
      text: "Profit for the month, depreciation added back, and the cash that leaves in the bank. The bottom line is the one to watch: its low point is " + (S.low_cash_month || "") + "." },
    { view: "cashflow", el: "#tourCashNotes", side: "top", title: "Reading the cash line",
      text: "Three plain notes on what moves the cash: debtors growing with sales, the lean months, and the peaks that pay for stock." },
    { view: "charts", el: "#tourChart1", side: "top", title: "The year as a picture",
      text: "Sales, cost of sales and gross profit as bars for each month. The spring and autumn peaks and the quiet summer are easier to see here than in a table. Hover over a month for its figures." },
    { view: "charts", el: "#tourChart2", side: "top", title: "Cash against profit",
      text: "The shaded line is cash in the bank, the other line is profit for the month. Where profit dips below zero, cash flattens or falls." },
    { view: "summary", el: "#tourAssumptions", side: "top", title: "What the forecast rests on",
      text: "Under every tab: the assumptions behind the numbers on the left, and what could go wrong on the right. A forecast is only as good as these, so they are written down where everyone can see them." },
    { view: "summary", el: "#tourNextStep", side: "top", title: "One suggested next step",
      text: "The page ends with a single practical suggestion that follows from the figures: here, an overdraft of " + (T.facility || "") + " to cover the lean months." },
    { view: "summary", el: "#twfTourBtn", side: "left", title: "That's the tour",
      text: "Click through the tabs yourself and hover over the charts. This button starts the tour again." }
  ];

  function injectTourButton() {
    if (document.getElementById("twfTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "twfTourBtn"; btn.type = "button"; btn.className = "twf-tour-btn";
    btn.title = "Take the guided tour"; btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='twf-tour-btn-icon' aria-hidden='true'>?</span><span>Take the tour</span>";
    btn.addEventListener("click", function () { startTour(true); });
    document.body.appendChild(btn);
  }

  var current = null;
  function startTour(resume) {
    if (!window.driver || !window.driver.js || !window.driver.js.driver) return;
    if (current) { try { current.destroy(); } catch (e) {} current = null; }
    retag();
    var steps = STEPS.map(function (st, g) {
      var step = { popover: { title: st.title, description: st.text, side: st.el ? (st.side || "bottom") : "over", align: st.el ? "start" : "center" } };
      if (st.el) step.element = st.el;
      return step;
    });
    var idx = 0, going = false;
    var d = window.driver.js.driver({
      showProgress: true, allowClose: true, allowKeyboardControl: false, disableActiveInteraction: true,
      animate: true, scrollIntoViewOptions: { behavior: "smooth", block: "center", inline: "nearest" },
      overlayOpacity: 0.55, stagePadding: 6, stageRadius: 10, popoverClass: "twf-tour-popover",
      nextBtnText: "Next →", prevBtnText: "← Back", doneBtnText: "Finish", progressText: "Step {{current}} of {{total}}",
      steps: steps,
      onNextClick: function () { go(idx + 1); },
      onPrevClick: function () { go(idx - 1); },
      onHighlightStarted: function (el, step, ctx) {
        if (ctx && ctx.state && typeof ctx.state.activeIndex === "number") idx = ctx.state.activeIndex;
        setResume(String(idx));
      },
      onDestroyed: function () {
        document.removeEventListener("keydown", keys, true);
        if (idx >= steps.length - 1) setResume(null);
        try { setView("summary"); window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
        current = null;
      }
    });
    function go(g) {
      if (going || g < 0) return;
      if (g >= steps.length) { idx = steps.length - 1; try { d.destroy(); } catch (e) {} return; }
      var changed = setView(STEPS[g].view);
      if (!changed) { idx = g; try { d.moveTo(g); } catch (e) {} return; }
      going = true;
      setTimeout(function () { retag(); going = false; idx = g; try { d.moveTo(g); } catch (e) {} }, STEPS[g].view === "charts" ? 420 : 160);
    }
    function keys(ev) {
      if (current !== d) return;
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); try { d.destroy(); } catch (e) {} return; }
      if (ev.key === "ArrowRight" || ev.key === "Enter") { ev.preventDefault(); ev.stopPropagation(); go(idx + 1); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); ev.stopPropagation(); go(idx - 1); }
    }
    document.addEventListener("keydown", keys, true);
    var startAt = 0;
    if (resume) { var s = parseInt(getResume() || "", 10); if (!isNaN(s) && s > 0 && s < steps.length - 1) startAt = s; }
    current = d; idx = startAt;
    setView(STEPS[startAt].view);
    setTimeout(function () { retag(); try { d.drive(startAt); } catch (e) {} }, 300);
  }
  window.startTwfTour = startTour;
  window.twfTourSteps = STEPS;

  function loadDriverThen(cb) {
    if (window.driver && window.driver.js) { cb(); return; }
    var s = document.createElement("script"); s.src = DRIVER_JS; s.onload = cb;
    s.onerror = function () { console.error("[twf-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  ready(function () {
    injectTourButton();
    loadDriverThen(function () {
      var begin = function (mode) { if (mode === "tour") startTour(false); };
      if (window.DemoChooser && typeof window.DemoChooser.whenChosen === "function") window.DemoChooser.whenChosen(begin);
      else document.addEventListener("demo:mode", function (e) { begin(e.detail && e.detail.mode); });
    });
  });
})();
