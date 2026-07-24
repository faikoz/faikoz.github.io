/* ============================================================
   Guided tour for the three-way-forecast demo.
   Powered by Driver.js (https://driverjs.com) — MIT licensed.

   Single-page, five-tab tool: Executive Summary, P&L, Balance
   Sheet, Cash Flow, Visualisations. The tour walks the reader
   through every tab in order, automatically switching tabs as
   it advances so no manual clicking is required — but the
   highlighted controls remain clickable.
   ============================================================ */
(function () {
  var DRIVER_JS  = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js";
  var DRIVER_CSS = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css";

  function addStylesheet(href) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }
  addStylesheet(DRIVER_CSS);

  var thisScript = document.currentScript;
  if (thisScript && thisScript.src) {
    addStylesheet(thisScript.src.replace(/tour\.js(\?.*)?$/, "tour.css"));
  }

  /* ---- storage helpers ------------------------------------ */
  function hasSeen(k)  { try { return localStorage.getItem(k) === "1"; } catch (e) { return false; } }
  function markSeen(k) { try { localStorage.setItem(k, "1"); } catch (e) {} }
  function resumeKey(k) { return "twfTour_" + k + "_resumeAt"; }
  function stepId(step, i) {
    if (step && step.element) return "el:" + step.element;
    var t = step && step.popover && step.popover.title;
    return t ? "title:" + t : "idx:" + i;
  }
  function getResume(k)  { try { return sessionStorage.getItem(resumeKey(k)); } catch (e) { return null; } }
  function setResume(k, id) {
    try {
      if (id == null) sessionStorage.removeItem(resumeKey(k));
      else            sessionStorage.setItem(resumeKey(k), id);
    } catch (e) {}
  }

  /* ---- switch tabs via the demo's own showView() ---------- */
  // Returns true if the tab was actually changed (helps decide whether
  // Driver.js needs a forced re-highlight against the newly-visible view).
  function currentActiveView() {
    var views = ["summary", "pnl", "balance", "cashflow", "charts"];
    for (var i = 0; i < views.length; i++) {
      var v = document.getElementById("view-" + views[i]);
      if (v && v.style.display !== "none" && v.offsetParent !== null) return views[i];
    }
    return null;
  }
  function switchToTabIfNeeded(view) {
    if (!view) return false;
    if (currentActiveView() === view) return false;
    if (typeof window.showView === "function") {
      try { window.showView(view); return true; } catch (e) { return false; }
    }
    return false;
  }

  /* ================================================================
     TOUR REGISTRY — one sequential walk-through of every tab.
     Each step can carry `switchTab: "<view>"` — the tour engine flips
     the active tab in `onHighlightStarted` before Driver.js paints,
     so the highlighted element is always visible even though the
     starting tab was Executive Summary.
     ================================================================ */
  var TOURS = {
    overview: {
      seenKey: "twfTour_overview_v1",
      steps: [

        /* ---------- WELCOME ---------- */
        {
          popover: {
            title: "Three-Way Financial Forecast",
            description:
              "Quick tour of a full <b>three-statement forecast</b> for FY2026 — " +
              "Profit &amp; Loss, Cash Flow, and Balance Sheet, wired together " +
              "so every number is consistent. Press Esc to skip.",
            side: "over",
            align: "center"
          }
        },

        /* ---------- HEADER + KPI SUMMARY ---------- */
        {
          element: "#kpiSummary",
          switchTab: "summary",
          popover: {
            title: "Headline KPIs",
            description:
              "Four numbers that summarise the whole forecast at a glance: " +
              "<b>Projected Revenue</b>, <b>Gross Profit</b> (with margin % below), " +
              "<b>Net Profit</b> (year-on-year vs FY2025), and <b>Year-End Cash</b> " +
              "position. The full detail behind each lives in the tabs below.",
            side: "bottom",
            align: "center"
          }
        },

        /* ---------- TAB BAR ---------- */
        {
          element: "#tab-summary",
          popover: {
            title: "Five views, one dataset",
            description:
              "The tab bar switches between five perspectives on the same " +
              "forecast: <b>Executive Summary</b>, <b>P&amp;L Forecast</b>, " +
              "<b>Balance Sheet</b>, <b>Cash Flow</b>, and <b>Visualisations</b>. " +
              "The tour will step through each one — no need to click.",
            side: "bottom",
            align: "start"
          }
        },

        /* ---------- SUMMARY VIEW ---------- */
        {
          element: "#yoyComparison",
          switchTab: "summary",
          popover: {
            title: "Year-over-Year Comparison",
            description:
              "FY2025 <b>actuals</b> versus FY2026 <b>forecast</b>, side by side. " +
              "Revenue is up ~18.5% but the margin story is more nuanced — " +
              "look at the Gross Profit % line to see how growth is being " +
              "delivered.",
            side: "top",
            align: "center"
          }
        },

        /* ---------- P&L VIEW ---------- */
        {
          element: "#pnlTable",
          switchTab: "pnl",
          popover: {
            title: "P&amp;L Forecast — monthly",
            description:
              "Twelve columns (Jul → Jun) covering Revenue, COGS, Gross " +
              "Profit + %, Expenses, Net Profit, and Net Margin %. Reading " +
              "left-to-right shows the seasonal pattern — quiet Q1, ramp " +
              "into Q2/Q3, softer Q4.",
            side: "top",
            align: "center"
          }
        },

        /* ---------- BALANCE SHEET VIEW ---------- */
        {
          element: "#balanceSheetTable",
          switchTab: "balance",
          popover: {
            title: "Balance Sheet · quarterly",
            description:
              "Snapshot at each quarter end: <b>Total Assets</b>, <b>Total " +
              "Liabilities</b>, <b>Equity</b>, and <b>Working Capital</b>. " +
              "Equity growth here should equal the Net Profit line from " +
              "P&amp;L — because that's how the three statements tie.",
            side: "top",
            align: "center"
          }
        },

        /* ---------- CASH FLOW VIEW ---------- */
        {
          element: "#cashflowTable",
          switchTab: "cashflow",
          popover: {
            title: "Cash Flow — the acid test",
            description:
              "Net Profit + Depreciation → <b>Operating Cash</b> → running " +
              "<b>Cumulative Cash Balance</b>. Even a healthy P&amp;L can " +
              "hide a cash squeeze — watch the cumulative line dip mid-year " +
              "before recovering. That's your working-capital signal.",
            side: "top",
            align: "center"
          }
        },

        /* ---------- CHARTS VIEW ---------- */
        {
          element: "#revenueChart",
          switchTab: "charts",
          popover: {
            title: "Revenue chart",
            description:
              "Bar chart of monthly <b>Revenue</b>, <b>COGS</b>, and <b>Gross " +
              "Profit</b>. The gap between blue (revenue) and red (COGS) is " +
              "your gross-margin story — narrow gaps mean margin pressure.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#cashFlowChart",
          switchTab: "charts",
          popover: {
            title: "Cash-flow chart",
            description:
              "Line chart pairing the <b>Cumulative Cash</b> curve (amber) " +
              "with <b>Monthly Net Profit</b> (purple). The two lines tell " +
              "different stories — profitable months don't always mean " +
              "cash-positive months, and this chart makes the divergence " +
              "impossible to miss.",
            side: "top",
            align: "center"
          }
        },

        /* ---------- WRAP UP ---------- */
        {
          element: "#twfTourBtn",
          popover: {
            title: "That's the tour!",
            description:
              "Explore any of the five tabs freely — every number is live and " +
              "the tables are scrollable. You can re-run this tour any time " +
              "from this button.",
            side: "left",
            align: "start"
          }
        }
      ]
    }
  };

  /* ---- "Take the tour" button ---------------------------- */
  function injectTourButton() {
    if (document.getElementById("twfTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "twfTourBtn";
    btn.type = "button";
    btn.className = "twf-tour-btn";
    btn.title = "Replay the guided tour";
    btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='twf-tour-btn-icon' aria-hidden='true'>?</span>" +
                    "<span class='twf-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () {
      startTour("overview", { force: true, resume: true });
    });
    document.body.appendChild(btn);
  }

  /* ---- tour driver --------------------------------------- */
  var currentTour = null;
  function stopCurrentTour() {
    if (currentTour && currentTour.driver) {
      try { currentTour.driver.destroy(); } catch (e) {}
    }
    currentTour = null;
  }

  function startTour(key, opts) {
    opts = opts || {};
    var spec = TOURS[key];
    if (!spec) return;
    if (!opts.force && hasSeen(spec.seenKey)) return;
    if (!window.driver || !window.driver.js || !window.driver.js.driver) return;
    stopCurrentTour();

    // Filter: keep steps without an element, keep steps that have a
    // `switchTab` (their target only becomes visible after we flip the
    // tab), and drop the rest that aren't currently on-screen.
    var stepsIn = spec.steps.filter(function (s) {
      if (!s.element) return true;
      if (s.switchTab) return true;
      var el = document.querySelector(s.element);
      return el && el.offsetParent !== null;
    });
    if (!stepsIn.length) return;

    // Loop-guard so moveTo(idx) after a tab switch doesn't recurse into
    // another tab switch → another moveTo → ...
    var skipMutations = false;
    var lastIndex = 0;

    var d = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: "twf-tour-popover",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish",
      progressText: "Step {{current}} of {{total}}",
      disableActiveInteraction: false, // let readers click the actual controls
      steps: stepsIn,
      onHighlightStarted: function (element, step, ctx) {
        var idx = (ctx && ctx.state && typeof ctx.state.activeIndex === "number")
          ? ctx.state.activeIndex : lastIndex;
        lastIndex = idx;
        setResume(key, stepId(stepsIn[idx], idx));
        var current = stepsIn[idx];
        if (!current) return;

        // Re-entry from moveTo(idx) after a tab switch — skip mutations
        // (the tab is already switched; letting Driver.js paint now
        // gives it the fresh element bounds).
        if (skipMutations) { skipMutations = false; return; }

        if (current.switchTab) {
          var changed = switchToTabIfNeeded(current.switchTab);
          if (changed) {
            // The target element became visible after display:block —
            // Driver.js's cached reference is stale. Force a full step
            // re-activation on the fresh DOM.
            skipMutations = true;
            setTimeout(function () {
              if (currentTour && currentTour.driver && typeof currentTour.driver.moveTo === "function") {
                try { currentTour.driver.moveTo(idx); } catch (e) { skipMutations = false; }
              } else {
                skipMutations = false;
              }
            }, 50);
          }
        }
      },
      onDestroyed: function () {
        markSeen(spec.seenKey);
        var reachedEnd = lastIndex >= stepsIn.length - 1;
        if (reachedEnd) setResume(key, null);
        currentTour = null;
      }
    });

    var startAt = 0;
    if (opts.resume) {
      var savedId = getResume(key);
      if (savedId) {
        for (var i = 0; i < stepsIn.length; i++) {
          if (stepId(stepsIn[i], i) === savedId) { startAt = i; break; }
        }
      }
    }
    currentTour = { key: key, driver: d };
    d.drive(startAt);
  }

  window.startTwfTour = startTour;
  window.twfTours = TOURS;

  /* ---- wait for the tool to finish first paint ----------- */
  // The demo populates the KPI cards + YoY table on DOMContentLoaded.
  // Give it a beat so the tour doesn't try to highlight "—" placeholders.
  function whenReady(callback) {
    var MAX_MS = 5000;
    var startedAt = Date.now();
    (function check() {
      var kpi = document.getElementById("projectedRevenue");
      var populated = kpi && !/^(—|-)?\s*$/.test((kpi.textContent || "").trim());
      if (populated || Date.now() - startedAt > MAX_MS) {
        setTimeout(callback, 200);
      } else {
        setTimeout(check, 150);
      }
    })();
  }

  /* ---- bootstrap ----------------------------------------- */
  function loadDriverThen(cb) {
    var s = document.createElement("script");
    s.src = DRIVER_JS;
    s.onload = cb;
    s.onerror = function () { console.error("[twf-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  ready(function () {
    injectTourButton();
    loadDriverThen(function () {
      whenReady(function () {
        startTour("overview");
      });
    });
  });
})();
