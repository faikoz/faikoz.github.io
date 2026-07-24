/* ============================================================
   Guided tour for the bc-sales-tool demo.
   Powered by Driver.js (https://driverjs.com) — MIT license.

   This script is fully self-contained. It:
     - loads Driver.js from a CDN on demand
     - injects a "? Take the tour" button next to the Theme button
     - runs the Overview tour the moment the visitor picks a theme
     - runs a short per-dashboard tour the first time each dashboard
       is opened (Deep Insights, Branch, By-Item, EOM)
     - supports interactive "click to advance" steps so the tour can
       hand off to the real UI, e.g. "click Deep Insights →"
   ============================================================ */
(function () {
  var DRIVER_JS  = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js";
  var DRIVER_CSS = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css";

  /* ---- load Driver.js CSS + our own stylesheet ------------- */
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

  /* ================================================================
     TOUR REGISTRY
     ================================================================
     Each entry: {
       seenKey:  localStorage flag so the tour auto-fires only once
       steps:    Driver.js step array
     }

     Step-level convention beyond stock Driver.js:
       waitForClick: true    Hides the Next button and advances when
                             the user clicks the highlighted element.
                             Great for "click Deep Insights →" style.
     ================================================================ */
  var TOURS = {

    /* ---------------- OVERVIEW ---------------- */
    overview: {
      seenKey: "bcSalesTour_overview_v2",
      steps: [
        {
          popover: {
            title: "Welcome to Sales Analytics",
            description:
              "Quick tour of the interface. First step: click the highlighted " +
              "<b>Load sales</b> button so the dashboards have data to work with. " +
              "The rest of the tour opens after the load finishes.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#loadBtn",
          waitForClick: true,
          simulateLoad: true,
          popover: {
            title: "Step 1 · Load sales",
            description:
              "Click <b>Load sales</b> to pull the data using the current " +
              "toolbar date range. The button will show <b>Loading…</b> " +
              "while it runs — the rest of the tour opens once the load finishes.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: ".sidebar",
          popover: {
            title: "Left navigation",
            description:
              "Every dashboard lives here — grouped into <b>Dashboards</b>, " +
              "<b>Time Analytics</b>, <b>Targets &amp; Run Rate</b>, and " +
              "<b>Lists</b>. The active one is highlighted with a yellow bar.",
            side: "right",
            align: "start"
          }
        },
        {
          element: "#headerTitle",
          popover: {
            title: "Current dashboard",
            description: "Updates as you move between dashboards.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#themeBtn",
          popover: {
            title: "Change the look",
            description:
              "Ten interchangeable visual themes — pick one that fits the " +
              "moment. Your choice is remembered per browser.",
            side: "left",
            align: "start"
          }
        },
        {
          element: "#quickRange",
          popover: {
            title: "Quick date range",
            description:
              "Shortcuts for common periods — last 30 days, YTD, current " +
              "fiscal year. Selecting one fills From / To for you.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#locationFilter",
          popover: {
            title: "Branch + salesperson + customer + item filters",
            description:
              "Any combination narrows every chart, KPI, and table across " +
              "all dashboards. The green chips below show which filters are active.",
            side: "bottom",
            align: "start"
          }
        },

        /* ---- KPI header rows ---- */
        {
          element: "#kpiRevenue",
          popover: {
            title: "Header row 1 · Headline KPIs",
            description:
              "The four numbers you'd read out first: <b>Sales</b> (excl. tax), " +
              "<b>Gross Profit $</b>, <b>Gross Profit %</b>, and total " +
              "<b>Quantity sold</b>. All respect the toolbar filters.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#kpiAdjSales",
          popover: {
            title: "Header row 2 · Adjusted KPIs",
            description:
              "The same four numbers <b>net of credit-memo returns</b> — " +
              "what accountants actually report. If returns are heavy in a " +
              "period, expect this row to sit noticeably below row 1.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#kpiPipeOpenAmt",
          popover: {
            title: "Header row 3 · Pipeline (real-time)",
            description:
              "Live counters — these <i>ignore</i> the date filter and always " +
              "show current state: <b>Outstanding Sales Orders</b> (not fully " +
              "shipped), <b>Shipped Not Invoiced</b> (delivered, awaiting " +
              "invoice), and <b>Outstanding Invoices</b> (invoiced, unpaid).",
            side: "bottom",
            align: "start"
          }
        },

        /* ---- Key Overview charts ---- */
        {
          element: "#topCustomersChart",
          popover: {
            title: "Top 10 customers",
            description:
              "Your biggest buyers in the current filter window, ranked by " +
              "revenue. Switch chart type in the dropdown (bar, column, pie, " +
              "doughnut) or flip <b>Gross ↔ Adj</b> to see the same list " +
              "net of returns. <b>Click any bar</b> to drill into that " +
              "customer's own page — invoices, items bought, trend, and drill-down.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#statusChart",
          popover: {
            title: "Invoice status",
            description:
              "Breakdown of invoices by state — Open, Paid, Overdue, etc. " +
              "Use the <b>Count / $ Amount</b> toggle to switch between " +
              "'how many invoices' and 'how much money is in each state'. " +
              "Handy for quickly spotting an overdue-invoice pile-up.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "a[data-tab='deepInsights']",
          waitForClick: true,
          popover: {
            title: "Now try it: click Deep Insights →",
            description:
              "Click the highlighted <b>Deep Insights</b> link. A short " +
              "intro will open once you're there.",
            side: "right",
            align: "start"
          }
        }
      ]
    },

    /* ---------------- DEEP INSIGHTS ---------------- */
    deepInsights: {
      seenKey: "bcSalesTour_deepInsights_v3",
      steps: [
        {
          popover: {
            title: "Deep Insights",
            description:
              "Exploratory views that each answer a different question than " +
              "the operational KPIs on Overview. We'll cover the seven most " +
              "useful. Most charts are clickable — try them out after the tour.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#diSankey",
          popover: {
            title: "Sales flow · salesperson → category",
            description:
              "Ribbon <b>width = revenue</b>. Left column = salespeople, " +
              "right column = item categories. <b>Click a name on either side</b> " +
              "to highlight only that person's or category's flows — click " +
              "again to clear. Great for seeing who sells what.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#diSunburst",
          popover: {
            title: "Sales hierarchy · sunburst",
            description:
              "Two nested rings. <b>Inner ring</b> = salesperson (click to " +
              "highlight only their slice of every category). <b>Outer ring</b> " +
              "= item category within that salesperson. <b>Click an outer " +
              "slice</b> to jump straight into Sales by Item pre-filtered to " +
              "that category. Same story as the Sankey, just wrapped in a circle.",
            side: "right",
            align: "center"
          }
        },
        {
          element: "#diRadar",
          popover: {
            title: "Salesperson performance radar",
            description:
              "Six normalised axes per salesperson — revenue, GP $, GP %, " +
              "invoice count, customer count, avg invoice size. Every axis is " +
              "scaled 0-100 across the team, so the <b>bigger the polygon, " +
              "the stronger overall</b>. Long <b>spikes</b> along one axis " +
              "reveal specialisation (e.g. one salesperson runs on volume, " +
              "another on margin). Use the period dropdown to compare " +
              "last-30-days vs last-12-months shape.",
            side: "left",
            align: "center"
          }
        },
        {
          element: "#diFunnel",
          popover: {
            title: "Sales pipeline funnel",
            description:
              "The document lifecycle in one chart: <b>Quote → Blanket order → " +
              "Sales order → Invoice</b>. Bar length = number of documents at " +
              "that stage. The percentages between stages show your conversion " +
              "rate. Click any bar to view the underlying documents on Overview.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#diPolar",
          popover: {
            title: "Seasonality polar chart",
            description:
              "Twelve monthly spokes on a circular grid. Each ring = one " +
              "fiscal year. Longer spoke = higher sales that month. If your " +
              "business has a season, this chart shows it instantly — spikes " +
              "line up on the same months year after year.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#diRfm",
          popover: {
            title: "RFM customer segmentation",
            description:
              "Classic <b>Recency · Frequency · Monetary</b> analysis. " +
              "<b>X</b> = days since last purchase (log-scaled — left is more " +
              "recent). <b>Y</b> = number of invoices. <b>Bubble size</b> = " +
              "total spend. <b>Colour</b> = segment (Champions, Loyal, At-Risk, " +
              "Lost, etc.). Champions cluster top-left; the ones drifting " +
              "right are your churn risks.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#diGeo",
          popover: {
            title: "Geographic sales",
            description:
              "Sales rolled up by customer city / region on a map. Bubble " +
              "size = revenue. Great for spotting territory gaps or " +
              "confirming where your loyal customers are concentrated.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "a[data-tab='branch']",
          waitForClick: true,
          popover: {
            title: "Next: try Branch Sales →",
            description:
              "Click the highlighted <b>Branch Sales</b> link to see the " +
              "per-branch dashboard.",
            side: "right",
            align: "start"
          }
        }
      ]
    },

    /* ---------------- BRANCH SALES ---------------- */
    branch: {
      seenKey: "bcSalesTour_branch_v1",
      steps: [
        {
          popover: {
            title: "Branch Sales",
            description:
              "Everything from here on is broken out per branch. KPIs at " +
              "the top, comparative charts in the middle, drill-down at the bottom.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#brKpiSales",
          popover: {
            title: "KPI strip",
            description:
              "Gross sales, GP $, GP %, quantity — plus a second row for " +
              "the <i>adjusted</i> versions (net of credit-memo returns).",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#brTrendChart",
          popover: {
            title: "Sales by month",
            description:
              "Grouped columns per branch. Use the dropdown top-right to " +
              "switch chart types (stacked, area, lines, smooth). Click any " +
              "column to filter every dashboard to that branch + month.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#brTopChart",
          popover: {
            title: "Top branches",
            description:
              "Ranked by sales — click any bar to filter to that branch.",
            side: "left",
            align: "center"
          }
        },
        {
          element: "#branchDrillTable",
          popover: {
            title: "Drill-down table",
            description:
              "Branch → Document type → Document number → Line item. " +
              "Click the ▸ arrows to expand a level.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "a[data-tab='byItem']",
          waitForClick: true,
          popover: {
            title: "Next: try Sales by Item →",
            description: "Click the highlighted <b>Sales by Item</b> link.",
            side: "right",
            align: "start"
          }
        }
      ]
    },

    /* ---------------- SALES BY ITEM ---------------- */
    byItem: {
      seenKey: "bcSalesTour_byItem_v1",
      steps: [
        {
          popover: {
            title: "Sales by Item",
            description:
              "Same layout as Branch Sales, but pivoted on items instead " +
              "of branches — top items, category mix, Pareto curve, table.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#itTopItemsChart",
          popover: {
            title: "Top 20 items",
            description:
              "Ranked by sales revenue. Click any bar to filter the item " +
              "table below to just that item.",
            side: "right",
            align: "center"
          }
        },
        {
          element: "#itCategoryChart",
          popover: {
            title: "Sales by category",
            description:
              "Click a slice to filter the item table to just that category.",
            side: "left",
            align: "center"
          }
        },
        {
          element: "#itParetoChart",
          popover: {
            title: "Item Pareto (80/20)",
            description:
              "Cumulative % of sales as you add items. If the curve elbows " +
              "sharply left, a few items drive most of the revenue.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#itemSearch",
          popover: {
            title: "Search the item table",
            description:
              "Type an item number or description to filter the table. " +
              "Column headers sort — click twice to reverse.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#bcSalesTourBtn",
          popover: {
            title: "That's the tour!",
            description:
              "Explore any dashboard from the sidebar — most charts are " +
              "clickable and cross-filter. Try <b>Time Analytics</b> " +
              "(Month-to-Date, Pareto, Forecast) or <b>Targets &amp; Run Rate</b> " +
              "next. You can re-run the tour for whichever dashboard you're on " +
              "from this button any time.",
            side: "left",
            align: "start"
          }
        }
      ]
    }
  };

  /* ---- helpers -------------------------------------------- */
  function hasSeen(key) {
    try { return localStorage.getItem(key) === "1"; }
    catch (e) { return false; }
  }
  function markSeen(key) {
    try { localStorage.setItem(key, "1"); } catch (e) {}
  }

  /* ---- resume-mid-tour bookkeeping ------------------------ */
  // If the user clicks outside / presses Esc / closes a popover mid-tour,
  // we remember which step they were on (per tour key, sessionStorage-scoped
  // so a reload starts fresh). Clicking "Take the tour" again on the same
  // dashboard resumes from that step.
  //
  // We store a stable step *identifier* (selector or welcome-title), not
  // the numeric index — because the step list gets re-filtered on every
  // start (visibility, "Reload sales" skip) so indices can shift.
  function resumeStorageKey(tourKey) { return "bcSalesTour_" + tourKey + "_resumeAt"; }
  function stepId(step, index) {
    if (step && step.element) return "el:" + step.element;
    var title = step && step.popover && step.popover.title;
    if (title) return "title:" + title;
    return "idx:" + index;
  }
  function getResume(tourKey) {
    try { return sessionStorage.getItem(resumeStorageKey(tourKey)); }
    catch (e) { return null; }
  }
  function setResume(tourKey, id) {
    try {
      if (id == null) sessionStorage.removeItem(resumeStorageKey(tourKey));
      else            sessionStorage.setItem(resumeStorageKey(tourKey), id);
    } catch (e) {}
  }

  /* ---- bottom-right "Loading sales data…" toast ----------- */
  function showLoadToast() {
    var t = document.getElementById("bc-tour-load-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "bc-tour-load-toast";
      t.setAttribute("role", "status");
      t.setAttribute("aria-live", "polite");
      t.innerHTML =
        '<div class="bc-tour-toast-spinner" aria-hidden="true"></div>' +
        '<div class="bc-tour-toast-content">' +
          '<div class="bc-tour-toast-title">Loading sales data</div>' +
          '<div class="bc-tour-toast-sub">Fetching from Business Central…</div>' +
        '</div>';
      document.body.appendChild(t);
    }
    // Force reflow so the animation replays if it was already visible.
    t.classList.remove("visible");
    void t.offsetWidth;
    t.classList.add("visible");
  }
  function hideLoadToast() {
    var t = document.getElementById("bc-tour-load-toast");
    if (t) t.classList.remove("visible");
  }

  /* ---- wait for the real "Load sales" load to finish ------ */
  // The demo's own handleLoad() sets the button to disabled + "Loading…"
  // while it runs and flips it back to enabled + "Reload sales" when
  // done. We poll until we see that state change, then hand control
  // back to the tour.
  function waitForLoadComplete(btn, done) {
    if (!btn) { done(); return; }
    var startedAt = Date.now();
    var MAX_MS = 60000; // hard cap so a stuck load doesn't strand the tour

    showLoadToast();

    // On slow devices the button state may not have flipped to "Loading…"
    // yet by the time we start polling. Give it a moment before deciding.
    setTimeout(function tick() {
      var text = (btn.textContent || "").trim();
      var isLoading = btn.disabled === true || /loading/i.test(text);
      if (!isLoading || Date.now() - startedAt > MAX_MS) {
        hideLoadToast();
        done();
      } else {
        setTimeout(tick, 200);
      }
    }, 300);
  }

  /* ---- floating "Take the tour" button --------------------- */
  function injectTourButton() {
    if (document.getElementById("bcSalesTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "bcSalesTourBtn";
    btn.type = "button";
    btn.className = "bc-tour-btn";
    btn.title = "Replay the tour for this dashboard";
    btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='bc-tour-btn-icon' aria-hidden='true'>?</span>" +
                    "<span class='bc-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () {
      // Replay the tour for whichever dashboard is currently active.
      // `resume:true` picks up mid-tour if the user closed / clicked
      // outside earlier in the session — otherwise it starts at 0.
      var active = document.querySelector(".sidebar a[data-tab].active");
      var key = active ? active.dataset.tab : "overview";
      if (!TOURS[key]) key = "overview";
      startTour(key, { force: true, resume: true });
    });

    var themeBtn = document.getElementById("themeBtn");
    if (themeBtn && themeBtn.parentElement) {
      themeBtn.parentElement.insertBefore(btn, themeBtn);
    } else {
      btn.classList.add("bc-tour-btn-floating");
      document.body.appendChild(btn);
    }
  }

  /* ---- tour driver ----------------------------------------- */
  var currentTour = null; // { key, driver, tearDown }

  function stopCurrentTour() {
    if (currentTour && currentTour.driver) {
      try { currentTour.driver.destroy(); } catch (e) {}
    }
    if (currentTour && currentTour.tearDown) currentTour.tearDown();
    currentTour = null;
  }

  function startTour(key, opts) {
    opts = opts || {};
    var spec = TOURS[key];
    if (!spec) return;
    if (!opts.force && hasSeen(spec.seenKey)) return;
    if (!window.driver || !window.driver.js || !window.driver.js.driver) {
      console.warn("[bc-sales-tour] Driver.js not loaded yet");
      return;
    }
    stopCurrentTour();

    // Filter out steps whose target isn't on-screen, and skip the
    // Load-sales step when data is already loaded (button text shows
    // "Reload sales") so replaying the tour doesn't strand the user
    // on step 1 or force an unwanted reload.
    var stepsIn = spec.steps.filter(function (s) {
      if (s.simulateLoad) {
        var loadBtn = document.querySelector(s.element || "#loadBtn");
        if (loadBtn && /reload/i.test(loadBtn.textContent || "")) return false;
      }
      if (!s.element) return true;
      var el = document.querySelector(s.element);
      return el && el.offsetParent !== null;
    });

    // Track which click-listeners we've attached so we can clean up.
    var attached = [];

    // Turn our custom `waitForClick` steps into Driver.js-native steps
    // with an onHighlighted hook.
    var steps = stepsIn.map(function (raw) {
      if (!raw.waitForClick) return raw;

      // Copy so we don't mutate TOURS.
      var s = Object.assign({}, raw, {
        popover: Object.assign({}, raw.popover, {
          showButtons: ["previous", "close"]  // hide Next
        }),
        disableActiveInteraction: false,
        onHighlighted: function (targetEl) {
          if (!targetEl) return;

          // For the "Load sales" step, force-enable the button in case
          // the demo hasn't done so yet (sign-in flow etc.), so the user
          // can actually click it.
          if (raw.simulateLoad) {
            targetEl.disabled = false;
            if (!/reload/i.test(targetEl.textContent || "")) {
              targetEl.textContent = "Load sales";
            }
          }

          var handler = function (ev) {
            targetEl.removeEventListener("click", handler, true);
            if (raw.simulateLoad) {
              // Let the demo's real handleLoad() run — do NOT
              // preventDefault or stopPropagation. Just wait for it
              // to finish, then advance the tour.
              waitForLoadComplete(targetEl, function () {
                if (currentTour && currentTour.driver) {
                  try { currentTour.driver.moveNext(); } catch (e) {}
                }
              });
              return;
            }
            // Give the demo a moment to finish switching tabs before we
            // move on (Driver.js re-highlights instantly otherwise).
            setTimeout(function () {
              if (currentTour && currentTour.driver) {
                try { currentTour.driver.moveNext(); } catch (e) {}
              }
            }, 300);
          };
          // Capture-phase so we run before the demo's real click handler
          // resolves — that's fine, both fire; we do not stop the event.
          targetEl.addEventListener("click", handler, true);
          attached.push({ el: targetEl, handler: handler });
        }
      });
      return s;
    });

    // Track how far the user got so onDestroyed can tell "finished the
    // whole tour" (clear resume) from "abandoned mid-way" (keep resume).
    var lastIndex = 0;

    var d = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "bc-tour-popover",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish",
      progressText: "Step {{current}} of {{total}}",
      steps: steps,
      onHighlightStarted: function (element, step, ctx) {
        var idx = (ctx && ctx.state && typeof ctx.state.activeIndex === "number")
          ? ctx.state.activeIndex : lastIndex;
        lastIndex = idx;
        setResume(key, stepId(steps[idx], idx));
      },
      onDestroyed: function () {
        markSeen(spec.seenKey);
        var reachedEnd = lastIndex >= steps.length - 1;
        if (reachedEnd) setResume(key, null); // completed → clear so next click starts fresh
        // else: leave resume id so "Take the tour" picks up where they left off
        cleanup();
        currentTour = null;
      }
    });

    function cleanup() {
      for (var i = 0; i < attached.length; i++) {
        try { attached[i].el.removeEventListener("click", attached[i].handler, true); }
        catch (e) {}
      }
      attached.length = 0;
    }

    // Work out where to start — resume if asked and we have a saved id.
    var startAt = 0;
    if (opts.resume) {
      var savedId = getResume(key);
      if (savedId) {
        for (var i = 0; i < steps.length; i++) {
          if (stepId(steps[i], i) === savedId) { startAt = i; break; }
        }
      }
    }

    currentTour = { key: key, driver: d, tearDown: cleanup };
    d.drive(startAt);
  }

  // Expose for manual invocation from console or other buttons.
  window.startBcSalesTour = startTour;
  window.bcSalesTours = TOURS;  // handy for tweaking in devtools

  /* ---- wait for the demo's initial "Loading demo data" overlay --- */
  // The demo shows `#demo-loading-overlay` on first paint while it
  // decompresses the captured JSON chunks. We can't start the tour
  // over the top of it — the popover would land behind the overlay.
  // Poll until the overlay is gone (or a hard cap elapses).
  function whenInitialLoadDone(callback) {
    var MAX_MS = 90000; // hard cap so a stuck decompress doesn't strand the tour
    var startedAt = Date.now();
    (function check() {
      var overlay = document.getElementById("demo-loading-overlay");
      if (!overlay || Date.now() - startedAt > MAX_MS) {
        callback();
      } else {
        setTimeout(check, 200);
      }
    })();
  }

  /* ---- theme-picker + tab-change hooks -------------------- */
  function whenThemePicked(callback) {
    if (document.documentElement.dataset.themePicked === "1") {
      callback();
      return;
    }
    var obs = new MutationObserver(function () {
      if (document.documentElement.dataset.themePicked === "1") {
        obs.disconnect();
        callback();
      }
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme-picked"]
    });
  }

  function watchTabChanges() {
    var links = document.querySelectorAll(".sidebar a[data-tab]");
    if (!links.length) return;
    var obs = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.attributeName !== "class") continue;
        var el = r.target;
        if (!el.classList.contains("active")) continue;
        var key = el.dataset.tab;
        // Fire the per-dashboard tour on first visit, but only if the
        // previous tour (if any) has finished — avoids the awkward case
        // where the interactive "click Deep Insights" handoff fires the
        // Deep Insights tour while the Overview tour popover is still up.
        if (TOURS[key]) {
          // Small delay so the tab-content becomes visible and layout
          // settles before we start highlighting elements inside it.
          setTimeout(function (k) {
            return function () { startTour(k); };
          }(key), 350);
        }
      }
    });
    links.forEach(function (a) {
      obs.observe(a, { attributes: true, attributeFilter: ["class"] });
    });
  }

  /* ---- default-theme handling ----------------------------- */
  // First-time visitors see a full-screen theme picker. Per spec we skip
  // it and default to Atelier automatically — users can still switch
  // later via the Theme button in the header. If a theme was already
  // chosen (dataset flag = "1") we leave the user's choice alone.
  function defaultToAtelier() {
    if (document.documentElement.dataset.themePicked === "1") return;

    if (typeof window.applyTheme === "function") {
      try { window.applyTheme("atelier"); } catch (e) {}
    } else {
      // Fallback if the demo's applyTheme() isn't exposed for any reason.
      document.documentElement.classList.add("theme-atelier");
      document.documentElement.dataset.themePicked = "1";
      try { localStorage.setItem("bcSalesTheme", "atelier"); } catch (e) {}
    }

    if (typeof window.hideThemePicker === "function") {
      try { window.hideThemePicker(); } catch (e) {}
    } else {
      var picker = document.getElementById("themePicker");
      if (picker) picker.style.display = "none";
    }
  }

  /* ---- bootstrap ------------------------------------------- */
  function loadDriverThen(callback) {
    var s = document.createElement("script");
    s.src = DRIVER_JS;
    s.onload = callback;
    s.onerror = function () {
      console.error("[bc-sales-tour] failed to load Driver.js from CDN");
    };
    document.head.appendChild(s);
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    defaultToAtelier();
    injectTourButton();
    watchTabChanges();
    loadDriverThen(function () {
      whenInitialLoadDone(function () {
        whenThemePicked(function () {
          // Kick off the Overview tour. All later dashboard tours fire
          // automatically from the tab-change observer.
          startTour("overview");
        });
      });
    });
  });
})();
