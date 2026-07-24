/* ============================================================
   Guided tour for the forecast-tool demo.
   Powered by Driver.js (https://driverjs.com) — MIT license.

   Self-contained: loads Driver.js from a CDN, injects a floating
   "? Take the tour" button in the header, and waits for the demo's
   own loading overlay to hide before starting.
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

  /* ---- helpers -------------------------------------------- */
  function hasSeen(key) {
    try { return localStorage.getItem(key) === "1"; } catch (e) { return false; }
  }
  function markSeen(key) {
    try { localStorage.setItem(key, "1"); } catch (e) {}
  }
  function resumeStorageKey(k) { return "forecastTour_" + k + "_resumeAt"; }
  function stepId(step, index) {
    if (step && step.element) return "el:" + step.element;
    var title = step && step.popover && step.popover.title;
    if (title) return "title:" + title;
    return "idx:" + index;
  }
  function getResume(k) {
    try { return sessionStorage.getItem(resumeStorageKey(k)); } catch (e) { return null; }
  }
  function setResume(k, id) {
    try {
      if (id == null) sessionStorage.removeItem(resumeStorageKey(k));
      else            sessionStorage.setItem(resumeStorageKey(k), id);
    } catch (e) {}
  }

  /* ================================================================
     TOUR REGISTRY
     Only one tour (Overview) since forecast-tool is a single-page app.
     ================================================================ */
  var TOURS = {
    overview: {
      seenKey: "forecastTour_overview_v5",
      steps: [
        {
          popover: {
            title: "Welcome to the Forecast Tool",
            description:
              "Quick tour of the interface. This is a demand-forecasting tool " +
              "that suggests how much of each item to order for the next few " +
              "months — with a built-in container-loading planner. Data has " +
              "already loaded, so let's walk through the screen.",
            side: "over",
            align: "center"
          }
        },
        {
          element: ".header",
          popover: {
            title: "Header · connection + progress",
            description:
              "The header shows connection status (top-left) and overall " +
              "load progress. In the real tool you'd sign into Business " +
              "Central / Wiise here; the demo uses pre-captured data.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#bcConnectionPanel",
          popover: {
            title: "Data source",
            description:
              "Two ways to feed the tool: <b>connect to BC/Wiise</b> (live " +
              "pull) or <b>upload a CSV/XLSX</b> file with your sales history. " +
              "In the demo we've already loaded a synthetic dataset.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#statsBar",
          popover: {
            title: "Dataset stats",
            description:
              "At-a-glance summary of what's loaded: <b>unique items</b>, " +
              "total transactions, months of history, and the date range " +
              "covered by the loaded data.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#dateFrom",
          popover: {
            title: "Date-range filter",
            description:
              "Narrow the analysis to a specific date window. The forecast " +
              "is rebuilt from whatever range is active — useful for " +
              "excluding pandemic-era outliers, or focusing on last-12-months.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#searchInput",
          popover: {
            title: "Item search",
            description:
              "Type to filter the results table by <b>item number</b> or " +
              "<b>description</b>. Handy when you want to sanity-check a " +
              "specific SKU's forecast before ordering.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#vendorSearchInput",
          popover: {
            title: "Vendor filter",
            description:
              "Filter to items from a specific vendor — perfect for building " +
              "purchase orders one supplier at a time.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#locationToggles",
          popover: {
            title: "Location toggle",
            description:
              "Restrict to one warehouse / branch, or leave on <b>All</b>. " +
              "The forecast will only use sales from the selected locations.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#tableHeaderBar",
          popover: {
            title: "Forecast method selector",
            description:
              "Five algorithms available: <b>Standard</b> (simple avg), " +
              "<b>WMA</b> (weighted moving avg), <b>LinReg</b> (linear " +
              "regression), <b>Holt</b> (double exponential smoothing), " +
              "<b>Seasonal</b> (Holt-Winters). Click any button to instantly " +
              "recompute the table.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#tableScroll",
          popover: {
            title: "Forecast results table",
            description:
              "One row per item, showing historical sales stats and the " +
              "predicted quantity for the next N months. <b>Click any column " +
              "header</b> to sort; <b>click a row</b> to open a drill-down " +
              "with the item's monthly history chart.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#paginationBar",
          popover: {
            title: "Paging",
            description:
              "Set page size (25/50/100/250/500), then click page numbers " +
              "to navigate. Export the currently-filtered results with the " +
              "<b>CSV button</b> up in the toolbar.",
            side: "top",
            align: "center"
          }
        },
        /* ---- Interactive: click ITEMNO591 → open detail modal ----
           Moved BEFORE the container-planning walkthrough so this happens
           first. resetVendor clears any vendor filter that may have been
           set by a previous replay of the container walk-through — that
           way ITEMNO591's row is guaranteed to be in the (unfiltered)
           results table. postModal:true keeps this step in the tour even
           when the target link isn't currently rendered. */
        {
          element: "#tableBody a[onclick*=\"'ITEMNO591'\"]",
          waitForModal: true,
          scrollIntoView: true,
          resetVendor: true,
          postModal: true,
          popover: {
            title: "Try it: click ITEMNO591",
            description:
              "<b>ITEMNO591</b> is highlighted in the results table as a " +
              "walk-through example. Click the item-number link to open its " +
              "full detail popup — the tour continues inside.",
            side: "right",
            align: "start"
          }
        },

        /* ---- Detail modal walkthrough ----
           postModal:true tells the pre-filter to keep these steps even
           though their target either isn't visible yet (#detailTitle
           lives inside the hidden #detailModal) or doesn't exist yet
           (#tourFcKpi etc. are assigned by tagForecastModalSections()
           after the modal opens). */
        {
          element: "#detailTitle",
          postModal: true,
          popover: {
            title: "Item detail popup",
            description:
              "Everything the tool knows about the selected item — " +
              "historical usage, forecasts under every method, current " +
              "inventory position, and where the item is used across locations.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#tourFcKpi",
          postModal: true,
          popover: {
            title: "Headline numbers",
            description:
              "<b>Total Used</b> = every unit sold across the loaded range. " +
              "<b>Monthly Avg</b> = simple mean per month. " +
              "The three coloured cards are the <b>Standard forecast</b> " +
              "for 3, 6, and 12 months ahead (green → amber → red as the " +
              "horizon grows).",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "button[onclick*='toggleAdvForecast']",
          postModal: true,
          waitForAdvPanel: true,
          popover: {
            title: "Try it: click Advanced Forecast Methods",
            description:
              "Click the highlighted <b>Advanced Forecast Methods</b> button. " +
              "A panel expands below showing four alternative forecasts " +
              "side-by-side so you can sanity-check the Standard number.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#tourAdvMethod1",
          postModal: true,
          popover: {
            title: "1. Weighted Moving Average (WMA)",
            description:
              "Averages the last N months of sales, but with <b>linearly " +
              "increasing weights</b> — the most recent month counts more " +
              "than months further back. The pills show each month's actual " +
              "sales and its weight %. Good for items whose demand rate is " +
              "gently drifting up or down. Displays 3M/6M/12M forecasts and " +
              "(if orders are loaded) the resulting Net to Purchase.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#tourAdvMethod2",
          postModal: true,
          popover: {
            title: "2. Linear Regression",
            description:
              "Fits a straight <b>trend line</b> through every complete " +
              "month of history and projects it forward. The slope tells " +
              "you whether demand is growing, flat, or shrinking. Good for " +
              "items on a steady growth/decline trajectory — but it doesn't " +
              "know about seasonality or shocks.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#tourAdvMethod3",
          postModal: true,
          popover: {
            title: "3. Exponential Smoothing (Holt)",
            description:
              "Holt's method tracks <b>two things at once</b>: the current " +
              "demand level and its trend, both smoothed with weights that " +
              "decay exponentially. More responsive than Linear Regression " +
              "to recent changes without over-reacting to a single spike. " +
              "The classic go-to for non-seasonal series with drift.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#tourAdvMethod4",
          postModal: true,
          popover: {
            title: "4. Seasonal Decomposition",
            description:
              "Splits the history into <b>level + trend + repeating annual " +
              "pattern</b>, then re-composes it forward. If your item has " +
              "a clear peak season (school-holiday spikes, Q4 push, etc.), " +
              "this is the method that will pick it up — the other three " +
              "just average it away. Needs at least ~12 months of history to work.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#tourFcCustomBlock",
          postModal: true,
          popover: {
            title: "Custom Forecast",
            description:
              "The teal panel lets you build a <b>bespoke forecast</b> for " +
              "this item: pick a method, type a non-standard horizon (e.g. " +
              "7.5 months), and add a safety uplift %. Useful when the item " +
              "is on a promotion or has a longer supplier lead time than the " +
              "usual 3/6/12M buckets cover.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#tourFcInventoryHead",
          postModal: true,
          popover: {
            title: "Inventory & Orders",
            description:
              "Current stock, quantity already committed on open sales " +
              "orders, and quantity incoming on purchase orders. These are " +
              "the three numbers that turn a forecast into an actual " +
              "purchase decision.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#tourFcNetHead",
          postModal: true,
          popover: {
            title: "Net to Purchase",
            description:
              "The bottom line: <b>Forecast + Sales Orders − Inventory − " +
              "Purchase Orders</b>. If this is positive, you need to buy that " +
              "many more to cover demand. If it's zero, you're already covered " +
              "by stock and incoming POs. Shown for the 3M / 6M / 12M horizons.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#tourFcUsageHead",
          postModal: true,
          popover: {
            title: "Usage by Location",
            description:
              "How the item's total usage splits across your branches / " +
              "warehouses. If one location is running the vast majority of " +
              "the demand, that's your candidate for the shipping-to " +
              "address on the next PO.",
            side: "top",
            align: "center"
          }
        },

        /* ---- Container-planning walkthrough (moved AFTER the modal walk)
           closeModalFirst hides the item-detail popup before highlighting
           the container section, and resetItemSearch clears the leftover
           "ITEMNO591" filter so VN12's other items are visible when the
           container plan is built. */
        {
          element: "#containerSection",
          closeModalFirst: true,
          resetItemSearch: true,
          popover: {
            title: "Container Planning",
            description:
              "The second half of the tool: given the forecast, how do you " +
              "fill a shipping container efficiently? We'll walk through it " +
              "using vendor <b>VN12</b> and a <b>6-month</b> horizon as an example.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#vendorSearchInput",
          presetVendor: "VN12",
          popover: {
            title: "Step 1 · Filter to one vendor",
            description:
              "Container planning is done <b>one vendor at a time</b> — you " +
              "typically build a purchase order per supplier. The vendor " +
              "search has been pre-set to <b>VN12</b> as a walk-through.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#containerPeriod",
          presetPeriod: "6",
          popover: {
            title: "Step 2 · Forecast period",
            description:
              "How far ahead to plan: 3, 6, or 12 months (or a custom span). " +
              "We've set it to <b>6 months</b> — a common horizon for overseas " +
              "shipments where the current lead time is 2-3 months.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#containerPctInput",
          popover: {
            title: "Step 3 · Safety uplift %",
            description:
              "Add a percentage cushion before packing — useful for slow " +
              "movers or when demand is trending up. The quick-set buttons " +
              "cover 0 / 10 / 20 / 30 / 50%. We'll leave it at 0 for the demo.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#fillContainerBtn",
          waitForContainerResult: true,
          scrollIntoView: true,
          popover: {
            title: "Step 4 · Click Optimize Containers",
            description:
              "Click the highlighted <b>Optimize Containers</b> button. The " +
              "tool runs the packing algorithm and shows the load plan below.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#containerSummary",
          postContainerResult: true,
          popover: {
            title: "Container summary",
            description:
              "The KPI row across the top:<br>" +
              "• <b>Total CBM</b> — total cubic-metres of all items needed<br>" +
              "• <b>Containers (65 CBM)</b> — how many 65 m³ containers that fills<br>" +
              "• <b>Remaining CBM</b> — spare space inside the last container<br>" +
              "• <b>Utilisation %</b> — how full the containers are on average<br>" +
              "Aim for high utilisation — spare CBM is wasted shipping cost.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#containerContent",
          postContainerResult: true,
          popover: {
            title: "Container plan table",
            description:
              "One row per item in the shipment: forecast quantity → " +
              "packaging unit → order units → order (EACH) → CBM per each " +
              "→ total CBM. Edit <b>Order Units</b> to bump / trim any " +
              "line and the totals recompute live. Columns sort — click a " +
              "header. Items without CBM data listed at the bottom are " +
              "skipped from the pack.",
            side: "top",
            align: "center"
          }
        },
        {
          popover: {
            title: "That's the tour!",
            description:
              "You've seen the whole tool: forecasting engine, container " +
              "planner, and the per-item drill-down. Explore any of the " +
              "five forecast methods, tweak the uplift, or click through " +
              "more items. You can re-run this tour any time from the " +
              "<b>? Take the tour</b> button in the header.",
            side: "over",
            align: "center"
          }
        }
      ]
    }
  };

  /* ---- "Take the tour" button ----------------------------- */
  function injectTourButton() {
    if (document.getElementById("forecastTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "forecastTourBtn";
    btn.type = "button";
    btn.className = "fc-tour-btn";
    btn.title = "Replay the guided tour";
    btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='fc-tour-btn-icon' aria-hidden='true'>?</span>" +
                    "<span class='fc-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () {
      startTour("overview", { force: true, resume: true });
    });
    // Prefer to sit inside the header (top-right); fall back to floating.
    var header = document.querySelector(".header");
    if (header) {
      btn.classList.add("fc-tour-btn-in-header");
      header.appendChild(btn);
    } else {
      btn.classList.add("fc-tour-btn-floating");
      document.body.appendChild(btn);
    }
  }

  /* ---- tour driver ----------------------------------------- */
  var currentTour = null;
  function stopCurrentTour() {
    if (currentTour && currentTour.driver) {
      try { currentTour.driver.destroy(); } catch (e) {}
    }
    currentTour = null;
  }

  /* ---- Item-detail modal helpers -------------------------- */
  // The demo's detail popup renders a big HTML blob into #detailContent
  // without stable IDs on each section. This helper tags the KPI strip,
  // Custom Forecast block, and the three h3 section headers so the tour
  // can target them.
  function tagForecastModalSections() {
    var content = document.getElementById("detailContent");
    if (!content) return;

    // KPI strip — first direct-child <div> of #detailContent.
    var kpi = content.querySelector(":scope > div");
    if (kpi && !kpi.id) kpi.id = "tourFcKpi";

    // Custom Forecast block — contains #detailCustomMonths input.
    var monthsInput = document.getElementById("detailCustomMonths");
    if (monthsInput) {
      // Walk up until we find the outer teal wrapper (that has the
      // "Custom Forecast" h3 as its first child).
      var node = monthsInput.parentElement;
      while (node && node !== content) {
        var firstH3 = node.querySelector(":scope > h3");
        if (firstH3 && /custom forecast/i.test(firstH3.textContent || "")) {
          if (!node.id) node.id = "tourFcCustomBlock";
          break;
        }
        node = node.parentElement;
      }
    }

    // Section h3s: Inventory & Orders, Net to Purchase, Usage by Location.
    var h3s = content.querySelectorAll(":scope > h3");
    h3s.forEach(function (h) {
      var t = (h.textContent || "").trim();
      if (/^Inventory/i.test(t) && !h.id)              h.id = "tourFcInventoryHead";
      else if (/^Net to Purchase/i.test(t) && !h.id)   h.id = "tourFcNetHead";
      else if (/^Usage by Location/i.test(t) && !h.id) h.id = "tourFcUsageHead";
    });
  }

  function isDetailModalOpen() {
    var m = document.getElementById("detailModal");
    return !!(m && m.classList.contains("active"));
  }
  function waitForDetailModal(callback) {
    var MAX_MS = 15000;
    var startedAt = Date.now();
    (function check() {
      if (isDetailModalOpen()) {
        // Give the render a moment to finish before tagging.
        setTimeout(function () { tagForecastModalSections(); callback(); }, 200);
      } else if (Date.now() - startedAt > MAX_MS) {
        callback(); // hard cap so we don't strand the tour
      } else {
        setTimeout(check, 150);
      }
    })();
  }
  function closeDetailModal() {
    var m = document.getElementById("detailModal");
    if (!m || !m.classList.contains("active")) return false;
    m.classList.remove("active");
    return true;
  }

  /* ---- Advanced Forecast Methods panel helpers ------------ */
  // Tag each of the four method h3s' parent panel with a stable id so
  // the tour can highlight them individually. Panels only exist in the
  // DOM after the user clicks Advanced Forecast Methods.
  function tagForecastAdvMethods() {
    var panel = document.getElementById("advForecastPanel");
    if (!panel) return;
    var h3s = panel.querySelectorAll("h3");
    h3s.forEach(function (h) {
      var t = (h.textContent || "").trim();
      var parent = h.parentElement;
      if (!parent) return;
      if (/^1\./.test(t) && !parent.id)      parent.id = "tourAdvMethod1";
      else if (/^2\./.test(t) && !parent.id) parent.id = "tourAdvMethod2";
      else if (/^3\./.test(t) && !parent.id) parent.id = "tourAdvMethod3";
      else if (/^4\./.test(t) && !parent.id) parent.id = "tourAdvMethod4";
    });
  }
  function isAdvPanelVisible() {
    var p = document.getElementById("advForecastPanel");
    if (!p) return false;
    var style = window.getComputedStyle(p);
    return style.display !== "none" && p.offsetParent !== null;
  }
  function waitForAdvPanel(callback) {
    var MAX_MS = 6000;
    var startedAt = Date.now();
    (function check() {
      if (isAdvPanelVisible()) {
        setTimeout(function () { tagForecastAdvMethods(); callback(); }, 200);
      } else if (Date.now() - startedAt > MAX_MS) {
        callback();
      } else {
        setTimeout(check, 120);
      }
    })();
  }

  /* ---- Container-planning walkthrough helpers ------------- */
  // Programmatically pick a vendor via the demo's own selectVendor().
  function presetVendorIfNeeded(vendorNo) {
    if (!vendorNo || typeof window.selectVendor !== "function") return false;
    // Don't clobber the user's own selection.
    var input = document.getElementById("vendorSearchInput");
    if (input && input.value && !new RegExp(vendorNo, "i").test(input.value)) return false;
    // Already on this vendor?
    if (typeof window.selectedVendor !== "undefined"
        && String(window.selectedVendor).toUpperCase() === vendorNo.toUpperCase()) return false;
    try { window.selectVendor(vendorNo); return true; } catch (e) { return false; }
  }

  // Clear the vendor filter — but only if one is actually set. Calling
  // selectVendor("") when the vendor was already empty still triggers
  // applyFilters() → renderTable(), which rebuilds tbody and invalidates
  // Driver.js's cached target element. Skipping the no-op avoids that.
  // Returns true if a mutation actually happened.
  function resetVendorFilter() {
    var input = document.getElementById("vendorSearchInput");
    var alreadyEmpty = (!input || !input.value || !input.value.trim());
    // Cross-check the demo's own state if exposed.
    if (typeof window.selectedVendor !== "undefined" && !window.selectedVendor) alreadyEmpty = true;
    if (alreadyEmpty) return false;
    if (typeof window.selectVendor === "function") {
      try { window.selectVendor(""); return true; } catch (e) {}
    }
    var clearBtn = document.getElementById("vendorClear");
    if (input) input.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    return true;
  }

  // Clear the item search box and fire the events the demo listens for.
  // Returns true if a mutation actually happened.
  function resetItemSearch() {
    var input = document.getElementById("searchInput");
    if (!input || !input.value) return false;
    input.value = "";
    input.dispatchEvent(new Event("input",  { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // Set the container forecast period ("3" / "6" / "12" / "custom").
  function presetContainerPeriodIfNeeded(value) {
    if (!value) return false;
    var sel = document.getElementById("containerPeriod");
    if (!sel) return false;
    if (sel.value === String(value)) return false;
    sel.value = String(value);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // Detect that the Optimize button has produced a result. The demo
  // populates #containerContent with a table; we consider it "ready"
  // as soon as containerContent has any child element AND the fill
  // button's text has changed (it flips from "Optimize Containers…" to
  // "Optimize to N Container(s)…" or "Expand to N Containers…").
  function isContainerResultReady() {
    var content = document.getElementById("containerContent");
    if (!content || !content.children.length) return false;
    // A table row inside means the plan rendered.
    return !!content.querySelector("table");
  }
  function waitForContainerResult(callback) {
    var MAX_MS = 8000;
    var startedAt = Date.now();
    (function check() {
      if (isContainerResultReady()) {
        setTimeout(callback, 200);
      } else if (Date.now() - startedAt > MAX_MS) {
        callback();
      } else {
        setTimeout(check, 150);
      }
    })();
  }

  /* ---- Presearch the results table to a specific item ---- */
  // Fills the search box + fires input/change events so the demo's
  // filter re-renders down to just the target item. Always applies
  // (previous "already visible" guard meant the table stayed unfiltered
  // when the target happened to be on page 1, which made the highlight
  // spot hard to pick out).
  function presearchItemIfNeeded(itemNo) {
    if (!itemNo) return false;
    var input = document.getElementById("searchInput");
    if (!input) return false;
    if (input.value && input.value.trim().toUpperCase() === itemNo.toUpperCase()) return false;
    input.value = itemNo;
    input.dispatchEvent(new Event("input",  { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function startTour(key, opts) {
    opts = opts || {};
    var spec = TOURS[key];
    if (!spec) return;
    if (!opts.force && hasSeen(spec.seenKey)) return;
    if (!window.driver || !window.driver.js || !window.driver.js.driver) return;
    stopCurrentTour();

    var stepsIn = spec.steps.filter(function (s) {
      if (!s.element) return true;
      // Modal-content steps: keep them regardless of current visibility —
      // their targets only appear (or only get their IDs assigned) after
      // the interactive "click an item" step opens the detail modal.
      if (s.postModal) return true;
      // Container-result tooltips: their target elements exist but are
      // empty / unpopulated until the user clicks Optimize.
      if (s.postContainerResult) return true;
      var el = document.querySelector(s.element);
      return el && el.offsetParent !== null;
    });

    // Wrap interactive/modal-aware steps so Driver.js sees standard hooks.
    var attached = [];
    var stepsOut = stepsIn.map(function (raw) {
      var isInteractive = raw.waitForModal || raw.waitForAdvPanel || raw.waitForContainerResult;
      if (!isInteractive && !raw.closeModalFirst) return raw;
      var s = Object.assign({}, raw);
      s.disableActiveInteraction = false;

      if (isInteractive) {
        s.popover = Object.assign({}, raw.popover, {
          // no Next button — user must click the highlighted element
          showButtons: ["previous", "close"]
        });
        s.onHighlighted = function (targetEl) {
          if (targetEl && raw.scrollIntoView) {
            try { targetEl.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          }
          // Document-level delegation — survives DOM re-renders that
          // would leave a directly-attached listener orphaned on a
          // removed node (e.g. after the vendor filter re-renders the
          // results table).
          var selector = raw.element;
          var handler = function (ev) {
            if (!selector) return;
            var target = ev.target;
            if (!target || !target.closest) return;
            var matched = target.closest(selector);
            if (!matched) return;
            document.removeEventListener("click", handler, true);
            var waiter = raw.waitForAdvPanel        ? waitForAdvPanel :
                         raw.waitForContainerResult ? waitForContainerResult :
                                                      waitForDetailModal;
            waiter(function () {
              if (currentTour && currentTour.driver) {
                try { currentTour.driver.moveNext(); } catch (e) {}
              }
            });
          };
          document.addEventListener("click", handler, true);
          attached.push({ el: document, handler: handler });
        };
      }
      // closeModalFirst is handled inside the driver's onHighlightStarted.
      return s;
    });

    var lastIndex = 0;
    // Flag set when we call moveTo(idx) after a DOM mutation to force
    // Driver.js to re-query the target element. On re-entry into
    // onHighlightStarted the mutations are skipped so we don't loop.
    var skipMutations = false;
    var d = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "fc-tour-popover",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish",
      progressText: "Step {{current}} of {{total}}",
      steps: stepsOut,
      onHighlightStarted: function (element, step, ctx) {
        var idx = (ctx && ctx.state && typeof ctx.state.activeIndex === "number")
          ? ctx.state.activeIndex : lastIndex;
        lastIndex = idx;
        setResume(key, stepId(stepsOut[idx], idx));
        var current = stepsOut[idx];
        if (!current) return;

        // Re-entry from moveTo(idx) after a mutation — skip so we don't
        // loop and don't re-mutate the DOM (which would invalidate the
        // just-fetched fresh element again).
        if (skipMutations) { skipMutations = false; return; }

        var mutated = false;
        if (current.closeModalFirst)  mutated = closeDetailModal()               || mutated;
        if (current.resetVendor)      mutated = resetVendorFilter()              || mutated;
        if (current.resetItemSearch)  mutated = resetItemSearch()                || mutated;
        if (current.presearchItem)    mutated = presearchItemIfNeeded(current.presearchItem) || mutated;
        if (current.presetVendor)     mutated = presetVendorIfNeeded(current.presetVendor)   || mutated;
        if (current.presetPeriod)     mutated = presetContainerPeriodIfNeeded(current.presetPeriod) || mutated;

        // If any mutation actually replaced DOM (search/vendor filter
        // triggers tbody.innerHTML replacement), Driver.js is holding a
        // stale target-element reference. Force a full re-activation of
        // this step so it re-queries the selector on the fresh DOM.
        // Driver.js's built-in refresh() only recomputes stage bounds
        // from the cached element, which is exactly what's stale here.
        if (mutated) {
          skipMutations = true;
          setTimeout(function () {
            if (currentTour && currentTour.driver && typeof currentTour.driver.moveTo === "function") {
              try { currentTour.driver.moveTo(idx); } catch (e) { skipMutations = false; }
            } else {
              skipMutations = false;
            }
          }, 40);
        }
      },
      onDestroyed: function () {
        markSeen(spec.seenKey);
        var reachedEnd = lastIndex >= stepsOut.length - 1;
        if (reachedEnd) setResume(key, null);
        for (var i = 0; i < attached.length; i++) {
          try { attached[i].el.removeEventListener("click", attached[i].handler, true); }
          catch (e) {}
        }
        attached.length = 0;
        currentTour = null;
      }
    });

    var startAt = 0;
    if (opts.resume) {
      var savedId = getResume(key);
      if (savedId) {
        for (var i = 0; i < stepsOut.length; i++) {
          if (stepId(stepsOut[i], i) === savedId) { startAt = i; break; }
        }
      }
    }
    currentTour = { key: key, driver: d };
    d.drive(startAt);
  }

  window.startForecastTour = startTour;
  window.forecastTours = TOURS;

  /* ---- wait for the demo's initial "Loading demo data" overlay --- */
  function whenInitialLoadDone(callback) {
    var MAX_MS = 90000;
    var startedAt = Date.now();
    (function check() {
      var overlay = document.getElementById("demo-forecast-overlay");
      var controlsReady = (function () {
        var c = document.getElementById("controlsBar");
        return c && c.offsetParent !== null; // visible
      })();
      if ((!overlay && controlsReady) || Date.now() - startedAt > MAX_MS) {
        callback();
      } else {
        setTimeout(check, 200);
      }
    })();
  }

  /* ---- bootstrap ------------------------------------------ */
  function loadDriverThen(callback) {
    var s = document.createElement("script");
    s.src = DRIVER_JS;
    s.onload = callback;
    s.onerror = function () { console.error("[forecast-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  ready(function () {
    injectTourButton();
    loadDriverThen(function () {
      whenInitialLoadDone(function () {
        startTour("overview");
      });
    });
  });
})();
