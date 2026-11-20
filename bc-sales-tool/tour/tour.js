/* ============================================================
   Guided tour for the bc-sales-tool demo.
   Powered by Driver.js (https://driverjs.com) — MIT license.

   This script is fully self-contained. It:
     - loads Driver.js from a CDN on demand
     - injects a "? Take the tour" button next to Load sales / Fast lookup
     - guided mode ("Show me around"): walks Overview → Deep Insights →
       Branch Sales as one continuous tour, then stops and tells the
       visitor the button explains whichever tab is open
     - the button: explains ONLY the tab that is open right now. Tabs
       with a hand-written tour use it; every other tab gets a tour built
       from its own help text + the blocks on the page
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
       appendGeneric: also add the auto-built steps for the page blocks
     }

     Step-level convention beyond stock Driver.js:
       waitForClick: true    Hides the Next button and advances when
                             the user clicks the highlighted element.
       chainOnly: true       Only shown in the continuous guided walk
                             (Overview → Deep Insights → Branch Sales),
                             never when the button replays one tab.
     ================================================================ */
  var MANAGER_NOTE =
    "<div class='bc-tour-note'>Managers' view — this is not part of the " +
    "everyday sales view. In the real tool only the owner and the finance " +
    "group can see it.</div>";

  var TOURS = {

    /* ---------------- OVERVIEW ---------------- */
    overview: {
      seenKey: "bcSalesTour_overview_v4",
      appendGeneric: true,
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
              "Click <b>Load sales</b> to pull the data for the toolbar date " +
              "range. The button shows <b>Loading…</b> while it runs — the rest " +
              "of the tour opens once the load finishes.",
            side: "bottom",
            align: "start"
          }
        },

        {
          element: ".sidebar nav, #tabStrip",
          scrollTop: true,
          popover: {
            title: "Navigation",
            description:
              "Every dashboard lives here — grouped into <b>Dashboards</b>, " +
              "<b>Time Analytics</b>, <b>Targets &amp; Run Rate</b> and, for the " +
              "finance group only, <b>Finance</b>. The active one is highlighted. " +
              "During the tour the page is locked: only what a step asks you to " +
              "click is clickable.",
            side: "right",
            align: "start"
          }
        },

        /* ---- header controls, left to right ---- */
        {
          element: "#tabViewWrap",
          popover: {
            title: "Tab view switch",
            description:
              "ON hides the sidebar and lays every dashboard out as a strip of " +
              "tabs under the filters, so the page uses the full width. OFF is " +
              "the usual sidebar layout. The choice is remembered on this computer.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#loadBtn",
          popover: {
            title: "Load sales / Reload sales",
            description:
              "Loads the data for the <b>Period</b> in the toolbar: posted invoices " +
              "and their lines, credit memos, shipments, value entries for cost, " +
              "locations and customers. After the first load the button reads " +
              "<b>Reload sales</b>.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#loadLookupBtn",
          popover: {
            title: "Fast lookup",
            description:
              "In the real tool a robot captures the sales history at set times " +
              "each day into encrypted snapshots kept in a protected location. " +
              "Picking a slot opens the whole tool from that snapshot in a few " +
              "seconds instead of a multi-minute live pull. The demo shows the " +
              "three daily slots; <b>Load sales</b> already opens the demo snapshot, " +
              "so the slots themselves are on show only.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#bcSalesTourBtn",
          popover: {
            title: "Take the tour",
            description:
              "This button explains <b>whichever tab is open</b>. Switch to any " +
              "dashboard, click it, and you get the walk-through for that tab only.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#themeBtn",
          popover: {
            title: "Theme",
            description:
              "Ten interchangeable visual themes — colours and fonts for the whole " +
              "tool. The demo opens in Pavilion; your choice is kept per browser.",
            side: "left",
            align: "start"
          }
        },
        {
          element: "#helpBtn",
          popover: {
            title: "Help (?)",
            description:
              "Turns help mode on or off. While it is on, hover over anything — a " +
              "tile, a column header, a filter — and a box says what it is and how " +
              "it is worked out.",
            side: "left",
            align: "start"
          }
        },
        {
          element: "#signOutBtn",
          popover: {
            title: "Sign out",
            description:
              "Signs the tool out of the Microsoft account it runs under. The real " +
              "tool reads the ERP, the protected storage and the targets file with that " +
              "account's own permissions.",
            side: "left",
            align: "start"
          }
        },

        /* ---- toolbar ---- */
        {
          element: ".period-frame",
          popover: {
            title: "Period",
            description:
              "The date range every dashboard follows. Type <b>From</b> / <b>To</b>, " +
              "or use <b>Quick range</b> (last 30 / 90 days, 6 / 12 months, year to " +
              "date, current fiscal year) or pick one calendar <b>Month</b>. " +
              "Picking one clears the others.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#locationFilter",
          popover: {
            title: "Branch filter",
            description:
              "Keeps only invoice lines booked to this branch. Line-based, so an " +
              "invoice with lines from two branches is split between them.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#salespersonFilter",
          popover: {
            title: "Salesperson filter",
            description:
              "Keeps only invoices whose header carries this salesperson code.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#customerFilter",
          popover: {
            title: "Customer filter",
            description:
              "Keeps only invoices for one customer. The list holds every customer " +
              "billed in the loaded period.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#itemCombo",
          popover: {
            title: "Item filter",
            description:
              "Type part of an item number or description and pick one. Keeps only " +
              "invoice lines for that item. Any combination of the four filters " +
              "narrows every chart, KPI and table on every dashboard; the chips " +
              "under the toolbar show what is active.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#includeRentalsToggle",
          popover: {
            title: "Rentals switch",
            description:
              "Rental income is left out of every figure by default. Switch it on " +
              "to include it, which is what the ERP and Power BI totals do.",
            side: "bottom",
            align: "end"
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
              "The same numbers <b>net of credit-memo returns</b> — what " +
              "accountants actually report. If returns are heavy in a period, " +
              "expect this row to sit noticeably below row 1.",
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
        {
          element: ".sreconWrap",
          popover: {
            title: "Reconciliation to the P&L",
            description:
              MANAGER_NOTE +
              "Bridges the sales-tool figures to the general ledger: Adjusted " +
              "Sales plus ledger-only postings, less the documents the ledger treats " +
              "differently, equals what the P&L reports — and the same for cost. " +
              "<b>Click a middle tile</b> to drill into the postings behind it. " +
              "When both results say <i>matches the P&L exactly</i>, sales and " +
              "finance are reading the same numbers.",
            side: "top",
            align: "center"
          }
        },

        /* ---- Key Overview charts ---- */
        {
          element: ".chart-view-toggle[data-chart='trend']",
          noExpand: true,
          popover: {
            title: "Gross or Adj",
            description:
              "Most charts carry this switch. <b>Gross</b> is what was invoiced: every sales line at its invoiced value. " +
              "<b>Adj</b> is the same figure after credit notes have been taken off, so returns, price corrections and goodwill " +
              "credits reduce the number. Gross tells you how busy you were; Adj tells you what you actually kept, and it is " +
              "the figure that matches the ledger. The switch on each chart is independent, so you can compare the two side by side.",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: "#topCustomersChart",
          popover: {
            title: "Top 10 customers",
            description:
              "Your biggest buyers in the current filter window, ranked by " +
              "revenue. Switch chart type in the dropdown or flip <b>Gross ↔ Adj</b> " +
              "to see the same list net of returns. <b>Click any bar</b> to drill " +
              "into that customer's own page — invoices, items bought, trend.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#statusChart",
          popover: {
            title: "Invoice status",
            description:
              "Breakdown of invoices by state — Open, Paid, Overdue. Use the " +
              "<b>Count / $ Amount</b> toggle to switch between 'how many' and " +
              "'how much money is in each state'.",
            side: "top",
            align: "center"
          }
        },
        {
          element: ".sidebar a[data-tab='deepInsights'], #tabStrip [data-ts-tab='deepInsights']",
          scrollTop: true,
          waitForClick: true,
          chainOnly: true,
          popover: {
            title: "Now try it: click Deep Insights →",
            description:
              "Click the highlighted <b>Deep Insights</b> link. The tour " +
              "continues there.",
            side: "right",
            align: "start"
          }
        }
      ]
    },

    /* ---------------- DEEP INSIGHTS ---------------- */
    deepInsights: {
      seenKey: "bcSalesTour_deepInsights_v4",
      appendGeneric: true,
      steps: [
        {
          popover: {
            title: "Deep Insights",
            description:
              "Exploratory views that each answer a different question than " +
              "the operational KPIs on Overview. We'll go through every pane on " +
              "this page, top to bottom. Most charts are clickable — try them out after the tour.",
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
              "again to clear.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#diSunburst",
          popover: {
            title: "Sales hierarchy · sunburst",
            description:
              "Two nested rings. <b>Inner ring</b> = salesperson, <b>outer ring</b> " +
              "= item category within that salesperson. <b>Click an outer " +
              "slice</b> to jump straight into Sales by Item pre-filtered to " +
              "that category.",
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
              "invoice count, customer count, avg invoice size. The <b>bigger " +
              "the polygon, the stronger overall</b>; a long spike on one axis " +
              "reveals specialisation.",
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
              "Sales order → Invoice</b>. The percentages between stages are " +
              "your conversion rates. Click any bar to view the documents.",
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
              "fiscal year. If the business has a season, this shows it " +
              "instantly — spikes line up on the same months year after year.",
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
              "<b>X</b> = days since last purchase, <b>Y</b> = number of invoices, " +
              "<b>bubble size</b> = total spend, <b>colour</b> = segment " +
              "(Champions, Loyal, At-Risk, Lost). The ones drifting right are " +
              "your churn risks.",
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
              "size = revenue. Great for spotting territory gaps.",
            side: "top",
            align: "center"
          }
        },
        {
          element: ".sidebar a[data-tab='branch'], #tabStrip [data-ts-tab='branch']",
          scrollTop: true,
          waitForClick: true,
          chainOnly: true,
          popover: {
            title: "Next: click Branch Sales →",
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
      seenKey: "bcSalesTour_branch_v2",
      appendGeneric: true,
      steps: [
        {
          popover: {
            title: "Branch Sales",
            description:
              "Everything here is broken out per branch. KPIs at the top, " +
              "comparative charts in the middle, drill-down at the bottom.",
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
              "switch chart types. Click any column to filter every dashboard " +
              "to that branch + month.",
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
          element: "#bcSalesTourBtn",
          closing: true,
          chainOnly: true,
          popover: {
            title: "That's the guided part",
            description:
              "From here on, explore freely — most charts are clickable and " +
              "cross-filter. Whenever you switch to another tab, click " +
              "<b>Take the tour</b> and you get the explanation for <b>that tab " +
              "only</b>, not the whole walk-through again. Try <b>Time " +
              "Analytics</b> or <b>Targets &amp; Run Rate</b> next.",
            side: "bottom",
            align: "start"
          }
        }
      ]
    },

    /* ---------------- SALES BY ITEM ---------------- */
    byItem: {
      seenKey: "bcSalesTour_byItem_v2",
      appendGeneric: true,
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
        }
      ]
    },

    /* ---------------- PROFIT & LOSS (LEDGER) ---------------- */
    pnl: {
      seenKey: "bcSalesTour_pnl_v1",
      appendGeneric: true,
      steps: [
        {
          popover: {
            title: "Profit & Loss (Ledger)",
            description:
              MANAGER_NOTE +
              "The P&L read straight from the general ledger for the toolbar " +
              "period — income, cost of goods sold, gross profit, expenses and " +
              "net profit, month by month, with every account and every entry " +
              "behind it. Independent of the sales load: this is what the ledger " +
              "itself says.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#pnlCatMode",
          popover: {
            title: "Categories · Default / Custom",
            description:
              "<b>Default</b> lays the statement out by the account category on " +
              "the chart of accounts. <b>Custom</b> uses the finance team's own " +
              "map: revenue, COGS, direct labour, ten operating-expense buckets, " +
              "other income and non-operating costs — the layout the monthly " +
              "report uses.",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: "#pnlExcludeOpening",
          popover: {
            title: "Exclude opening balances",
            description:
              "The go-live opening balances sit inside the ledger as BEGIN* " +
              "documents and inflate a range that includes that day. Tick this " +
              "to leave them out.",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: "#pnlLoadBtn",
          popover: {
            title: "Load ledger",
            description:
              "Reads the general ledger entries for the toolbar range. Click it " +
              "if the figures below still show dashes (free-roam mode loads the " +
              "ledger for you).",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: "a[href*='businesscentral.dynamics.com']",
          popover: {
            title: "Open in the ERP ↗",
            description:
              "Every account and document carries a small arrow. In the live tool " +
              "it opens that account or document in the ERP itself, in a new tab, " +
              "already filtered, so a finance user can go from a number to the " +
              "source entries in one click. In the demo the arrow is on show only " +
              "and shows a note instead.",
            side: "right",
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
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function cleanText(s) {
    return String(s || "").replace(/[▲▼⇅]/g, "").replace(/\s+/g, " ").trim();
  }

  /* ---- step targets ---------------------------------------- */
  function isVisible(el) { return !!el && el.offsetParent !== null; }
  // First visible match of a comma-separated selector list.
  function resolveTarget(selector) {
    var parts = String(selector).split(",");
    for (var i = 0; i < parts.length; i++) {
      var sel = parts[i].trim();
      if (!sel) continue;
      var els = document.querySelectorAll(sel);
      for (var j = 0; j < els.length; j++) if (isVisible(els[j])) return els[j];
    }
    return null;
  }
  // A bare figure, canvas or control -> the pane that holds it.
  function expandTarget(el) {
    var wide = null;
    if (el.matches("select, input, .combo, button#includeRentalsToggle")) wide = el.closest(".field");
    else if (!el.matches(".kpi-row, .card, .panel, .srecon-frame, .sreconWrap, nav, .sidebar, .header, .toolbar, .period-frame"))
      wide = el.closest(".kpi-row, .card, .panel, .srecon-frame");
    return (wide && isVisible(wide)) ? wide : el;
  }

  /* ---- which tab is open ---------------------------------- */
  function activeTabKey() {
    try {
      if (window.state && typeof window.state.tab === "string" && window.state.tab) return window.state.tab;
    } catch (e) {}
    var a = document.querySelector(".sidebar a[data-tab].active");
    if (a) return a.dataset.tab;
    var sec = document.querySelector("section[data-tab-content]:not([style*='display: none']):not([style*='display:none'])");
    return sec ? sec.dataset.tabContent : "overview";
  }

  /* ---- tab help text (exposed by the demo build as BC_HELP_TABS) ---- */
  function tabHelp(key) {
    var raw = window.BC_HELP_TABS && window.BC_HELP_TABS[key];
    if (!raw) {
      var a = document.querySelector(".sidebar a[data-tab='" + key + "']");
      return { title: a ? cleanText(a.textContent) : key, body: "" };
    }
    var div = document.createElement("div");
    div.innerHTML = raw;
    var strong = div.querySelector("strong");
    var title = strong ? cleanText(strong.textContent) : key;
    if (strong) strong.remove();
    var em = div.querySelector("em");
    var note = em ? cleanText(em.textContent) : "";
    if (em) em.remove();
    return { title: title, body: cleanText(div.textContent), note: note };
  }

  /* ---- pane explanations (what it shows, how to read it, what the controls do) ---- */
  var PANE_NOTES = {
"toolbar|customerItem": "Start here. <b>View by</b> decides the direction: pick a customer to see the items they buy and the items they do not, or pick an item to see which customers buy it and which do not. <b>Salesperson</b> narrows the universe to one rep's accounts, <b>Show</b> switches between buyers, non-buyers or both, and <b>Search</b> filters the list. The tiles and charts below update as soon as you choose.",
"toolbar|forecast": "Start here. <b>Method</b> chooses how the projection is built: a straight-line trend fitted to the loaded months, or a three-month moving average that follows recent momentum. <b>Horizon</b> is how many months ahead to project. Press <b>Update forecast</b> after changing either and the chart and table below redraw.",
"toolbar|pareto": "Start here. Tick which Pareto analyses to show side by side: customers by sales, products by gross profit, the sales team by sales, and time and effort per day. Each ticked analysis gets its own curve and table below, so you can compare how concentrated each one is.",
"toolbar|decomposition": "Start here. Choose up to five levels, for example branch, then salesperson, then customer, and press <b>Build tree</b>. The table below rolls sales, gross profit, margin and quantity up through those levels, and each row expands to the next one. Add <b>Document type</b> at any level to switch the tree to all posted documents, with credit notes shown negative.",
"rrhint|branchTarget": "The <b>Targets</b> line shows where the budget figures come from: the name of the budget workbook that was read, and the date it was last changed. In the live tool the workbook sits in a protected folder that only the finance team can edit; the tool reads it, never writes to it. Click the file name to see every budget file found and which one wins where months overlap, and press the <b>\u21bb</b> arrow to re-read the folder after finance has updated the numbers. Every month in the table below is measured against these targets.",
"rrhint": "This line tells you which month the run rate is measuring and which budget file the targets come from. Selling days are weekdays less public holidays. The refresh arrow reloads the targets workbook if finance has updated it.",
"kpi sales excl tax": "The four numbers you read first for the period in the toolbar. <b>Sales</b> is invoiced revenue before GST, <b>Gross Profit $</b> is sales less the cost of the goods sold, <b>Gross Profit %</b> is that margin as a percentage, and <b>Quantity sold</b> is the number of units across every invoice line. Every tab that shows these tiles uses the same definitions.",
"kpi adjusted sales": "The same figures with credit notes taken off. Returns and price adjustments reduce sales, and cost is read from the ERP's value entries, so <b>Adjusted Profit</b> and <b>Adjusted Profit Margin</b> are what the accounts will eventually show. Use the headline row for activity, this row for the true result.",
"kpi outstanding sales orders": "What is still in flight. <b>Outstanding Sales Orders</b> are ordered but not yet shipped, <b>Shipped Not Invoiced</b> has left the warehouse but not been billed, and <b>Outstanding Invoices</b> are billed but unpaid. Below them the reconciliation rows bridge the tool's adjusted sales and cost to the general ledger, line by line, and the yellow tiles explain any posting that is not a sales document.",
"kpi adjusted cost": "The cost side of the reconciliation: the tool's adjusted cost, anything the ledger carries on cost-of-sales accounts that did not come from a sales document (freight in, stock adjustments, price variances), and the result that matches the P&L.",
"revenue over time": "Daily, weekly or monthly revenue for the toolbar period as a smooth area or bars. <b>Split by</b> breaks the line into branches or salespeople, <b>Gross / Adj</b> switches between invoiced sales and sales net of returns. Hover a point for the exact figure.",
"top 10 customers": "The ten customers who bought the most in the period, with their share of revenue. Click a bar to open that customer's own page: trend, what they buy, and every invoice.",
"top 10 items": "The ten products with the highest revenue in the period. Click a bar to see who bought that item and when.",
"sales by branch": "Revenue split by the branch that shipped the goods. Click a slice to filter every page to that branch; click again to clear.",
"sales by salesperson": "Revenue split by the account manager on the invoice. Click a slice to filter the whole tool to that rep.",
"invoice status": "How many invoices in the period are paid, still open or cancelled, by count and by value. A growing open share is an early warning on collections.",
"posting pattern by day of week": "Which weekdays carry the revenue. A trade business usually peaks early in the week; a flat Saturday or a missing Monday here is worth a question.",
"all customers": "Every customer that bought in the period, with sales, gross profit, margin, invoice count and last purchase date. Column headers sort, the search box filters, and a row opens the customer drill-down.",
"sales flow salesperson category": "Where each rep's revenue goes. The bands run from the salesperson on the left to the product category on the right, and their width is the revenue. Click a rep to isolate their flows, click a category to open Sales by Item filtered to it, click again to clear. Gross / Adj switches the figures to net of returns.",
"sales hierarchy sunburst": "The same rep-to-category picture as two nested rings. The inner ring is the salesperson, the outer ring the categories inside that rep. Click an inner segment to highlight a rep, an outer segment to open Sales by Item for that category, hover for the revenue.",
"salesperson performance radar": "Each rep as a polygon over six normalised axes: revenue, gross profit percentage, customers served, invoice count, units sold and average deal size. A large, even shape is a strong all-rounder; a spike shows a specialist. The dropdown narrows it to one loaded year.",
"sales pipeline funnel": "Quotes at the top, outstanding orders in the middle, invoices at the bottom, with the conversion rate between each stage. A wide gap between quotes and orders is a pricing or follow-up problem; between orders and invoices it is a delivery problem. Click a bar to see the underlying documents on the Overview.",
"monthly revenue ridges per category": "One ridge per top product category, stacked down the card. The curve is that category's month-by-month revenue, so a tall, steady ridge is a dependable line and a ridge with a late peak is seasonal. Read it to see which categories move together and which carry the quiet months.",
"sales treemap category item": "Every category as a block sized by revenue, split into its items. Colour is gross margin: red below zero, orange to amber for thin margins, green for healthy ones. A big red or orange block is revenue you are not making money on. Click a block to open Sales by Item for it.",
"customer concentration": "How dependent the business is on a few accounts. The curve shows what share of revenue the top customers make; the steeper it rises, the more concentrated the risk. Compare it against the Pareto tab for the same view by product.",
"item bubble matrix": "Each bubble is an item: quantity sold across, average unit price up, bubble size is revenue and colour is the category. High-volume low-price items sit bottom right, big-ticket slow movers top left. Hover a bubble for the item.",
"top customers slope chart": "Each line is a top customer, joining their revenue in the prior period on the left to the current period on the right. Lines sloping up are growing accounts, lines sloping down are the ones to call this week.",
"period over period": "The whole period against the one before it: sales, cost and gross profit with the difference and the percentage change. The toolbar period sets the current window; the prior window is the same length immediately before it.",
"seasonality polar chart": "Twelve months around the clock, one ring per year. Spikes are busy months. Rings that sit on top of each other mean a stable seasonal pattern; a ring drifting outward is growth, inward is decline.",
"invoice value distribution": "How big a typical invoice is. The horizontal axis is the invoice value on a log scale, each bar counts the invoices in that band, and the title gives the median and mean. A long right tail is a few large project invoices sitting on top of everyday trade.",
"profit density heatmap customer category": "Top customers down the side, categories across, each cell coloured by gross profit. Green cells are where you make money, red cells are combinations that lose it, blanks are categories a customer has never bought. It doubles as a cross-sell map.",
"customer lifecycle stacked area": "Customer counts per month in four bands: new this month, active (bought in the last three months), at risk (three to six months since the last order) and churned (six months or more). A growing grey band is customers slipping away. Click a month to list the customers behind it.",
"top customers sparkline grid": "A tile for each top customer with their total for the period and a small trend line of their monthly buying. The arrow and percentage compare the current month with their first month, so a red arrow on a big tile is a large account in decline.",
"geographic sales australia by state": "Revenue by customer state, darker is more. Hover a state for the figures, click it to drill into council areas, then click a council for its suburbs. Gross / Adj switches to net of returns. Scroll to zoom, drag to pan, Reset zoom puts it back.",
"daily sales calendar heatmap": "Every day of the loaded range as a calendar cell, darker cells are bigger days. It shows the weekly rhythm, public holidays and month-end pushes at a glance. Click a day to set the toolbar to it; the back button restores the previous range.",
"customer cohort retention": "Customers grouped by the month they first bought, and what share of each group was still buying one, two, three months later. Rows that fade quickly mean customers who do not come back; the shape of recent rows tells you whether onboarding is improving.",
"sales by month": "Monthly revenue for the period with one series per branch or rep. Click a month or a series to filter the tables below; click again to clear.",
"top branches by sales": "Branches ranked by revenue for the period. Click a bar to filter the page to that branch.",
"top salespeople by sales": "Reps ranked by revenue for the period. Click a bar to filter the page to that rep.",
"gp vs gp by branch": "Gross profit in dollars as bars and gross margin as the line, per branch. A branch with high dollars and a low line is buying volume with discount; the opposite is a small branch that prices well.",
"gp vs gp by salesperson": "Gross profit dollars as bars and margin as the line, per rep. This is the chart that shows a high-revenue rep who gives the margin away.",
"invoices qty customers by branch": "Activity rather than money: invoice count, units shipped and active customers per branch. Together with revenue it tells you whether a branch is many small jobs or a few big ones.",
"invoices qty customers by salesperson": "Invoice count, units and active customers per rep. A rep with many customers and few units is a counter seller; few customers and large units is a project seller.",
"sales by branch fiscal year month": "A grid of revenue by fiscal year and month for each branch, with year totals, so you can compare July this year with July last year without changing the toolbar. Click a cell to drill.",
"sales by salesperson fiscal year month": "Revenue by fiscal year and month for each rep, with totals. The same month a year earlier sits in the row above it.",
"drill down branch document type document no item line": "The full audit trail. Expand a branch to its document types, a type to its documents, a document to its lines, with sales, cost and margin at every level. Whatever you see on the charts can be traced here to the invoice line.",
"drill down salesperson customer document type document no item line": "The same trail starting from the rep: rep, then their customers, then documents and lines, with sales, cost and margin at each level.",
"top 20 items by sales": "The twenty items with the most revenue in the period. Click a bar to filter the items table below to that product. Gross / Adj switches to net of returns.",
"sales by item category": "Revenue by category with gross profit overlaid, for the top twenty categories in the period.",
"item pareto cumulative of sales": "Items ranked by revenue with the running share on the right axis. The dotted line is eighty percent; the caption tells you what share of the range gets you there, which is usually a small fraction of the catalogue.",
"items": "Every item sold in the period with revenue, units, cost, gross profit and margin. Search by number or name, sort any column, and click a row to see who bought it.",
"kpi universe size": "The size of the cross-sell universe for the customer or item you picked. <b>Universe size</b> is how many items (or customers) are in play, <b>Buyers</b> how many of them have bought, <b>Non-buyers</b> how many have not, and <b>Sales captured</b> the revenue from the buyers.",
"buyer coverage by salesperson": "For the selected view, how many of each rep's customers already buy the item against how many do not. The gap is each rep's call list.",
"monthly sales captured": "Monthly revenue from the buyers in the selected view, so you can see whether coverage is growing or a product is quietly losing customers.",
"kpi sales amount": "The month-end figures for the period: sales, units, gross profit and margin, read exactly as the month-end report presents them.",
"eom report line level detail": "The month-end report at invoice-line level: every line with customer, item, quantity, sales, cost and margin, ready to export. This is the pack that goes to management.",
"drill down customer document type document no item line": "The same month-end data as a tree: customer, then document type, then document, then line, so a question about one customer's month is answered without leaving the page.",
"kpi total quote value": "The quoting activity for the period: total value quoted, the value still open, how many quotes, how many units and the average quote.",
"kpi won": "The outcome of that quoting. <b>Won</b> and <b>Lost</b> are read from the workflow stage on each quote, <b>Archived</b> are historic quotes, <b>Open</b> are still in progress, and the <b>Win rate</b> is won against the total.",
"kpi total blanket order value": "Standing orders for the period: total value, number of orders, units and the average order.",
"quote status": "Quotes by workflow stage, as a count or a value. The stages are read from the campaign field on each quote, so the chart shows how many are won, lost, waiting for follow-up or under price query.",
"order status": "Blanket orders by workflow stage, as a count or a value: won, lost, in follow-up, repricing and so on.",
"top 10 customers quoted": "Who you quote the most. Compare it with the top customers on the Overview: an account quoted often but rarely invoiced is losing on price or follow-up.",
"top 10 items quoted": "The products that appear most in quotes, by value. Items that are quoted a lot but sold little point at a pricing problem.",
"top 10 customers blanket orders": "The customers with the largest standing orders, usually mining, government and the bigger builders.",
"top 10 items blanket orders": "The items most often placed on standing order; the products you must never run out of.",
"by salesperson": "Quoting and win rate per rep: how much each one quotes and how much of it converts. A low win rate with high volume is a rep who quotes everything.",
"by item category": "Quotes and win rate per product category. This is where a category that is lost on price shows up.",
"by assigned user": "The same split by the internal user who prepared the document, so estimators and inside sales are measured alongside the field reps.",
"by campaign": "Documents by workflow stage name, exactly as entered in the ERP, including the reasons a quote was lost.",
"blanket order trend": "Blanket order value by day, week or month, showing when the large standing orders land.",
"sales quotes by customer click to expand to quotes items": "Every customer quoted in the period. Expand a customer to see their quotes, and a quote to see its lines, with value, stage and assigned user.",
"blanket orders by customer click to expand to orders items": "Every customer with a blanket order. Expand to the orders and their lines, with value, stage and status.",
"kpi return rate amount": "Credit notes against sales for the period: the return rate by value, the total credited in dollars and in units, and the profit adjustment those credits made.",
"return rate amount by customer": "The customers with the highest credit value as a share of their sales. A high rate on a big account usually means a delivery or quality issue to deal with.",
"total credit amount by item": "The items most often credited back. A single item spiking here is a faulty batch or a catalogue error.",
"credit memo detail": "Every credit note in the period with customer, item, quantity, value and reason, sortable and exportable.",
"kpi outstanding sales orders|mtd": "Orders scheduled to ship this month that have not shipped, and goods shipped this month not yet invoiced: the revenue still to come before month end.",
"month to date sales performance cumulative": "Sales accumulating day by day from the first of the month to today, against the same days last month and the same month last year. The gap between the lines is the month's pace.",
"mtd details by day": "Each day of the month so far with sales, cost, gross profit and invoice count, so you can see which days carried the month.",
"monthly comparison mat vs previous year mat": "The moving annual total: at each month end, the sum of the previous twelve months, next to the same sum a year earlier. It removes seasonality, so the bars only move when the business is really growing or shrinking.",
"moving annual total details": "The same figures as a table: monthly sales, the twelve-month total, the prior-year total, and the growth in dollars and percent.",
"monthly sales current vs prior month": "Each month against the one before it, green for growth and red for a fall, with the percentage on the bar.",
"period over period growth details": "Month by month: sales, the prior month, the change in dollars and percent, and the gross profit and margin for each month.",
"daily sales by date": "Every day as a row with sales, invoices, units, gross profit and margin, and the weekday, so you can see the daily rhythm and spot unusual days.",
"sales by customer city": "Revenue by the customer's city, top fifteen, which shows where the trade actually is regardless of which branch served it.",
"sales by customer posting group": "Revenue by the customer's posting group in the ERP, usually the trade versus retail versus export split.",
"kpi total unique customers": "Customer retention for the period: how many unique customers bought, how many bought only once, how many came back, and how many have been lost.",
"first appearance vs returning customers by month": "Each month's customers split into those appearing for the first time and those returning. Healthy growth has a steady new slice on top of a large returning base. Click a bar to list them.",
"monthly retention detail click a row to drill": "The same split as a table with the retention rate per month. Click a row to see the customers behind it.",
"actual forecast monthly sales": "Monthly actuals with a projection of the coming months, using either a straight-line trend or a three-month moving average. Switch the method to see how sensitive the forecast is.",
"forecast detail": "The forecast as numbers: each coming month with the projected sales and the method used.",
"kpi total|retentionHistory": "Customers by where they are in their life with you: total, active, new in the last ninety days, returning after a gap, and lost.",
"customer retention detail click a row to drill": "Every customer with first and last purchase, how many months they bought in, and their current status. Click a row for their history.",
"kpi sales|branchTarget": "The period's sales, units, gross profit and margin, which the table below measures against the budget.",
"fiscal year month branch sales vs targets": "Every month of each fiscal year, per branch: actual sales against the budget from the targets workbook, with the variance. Green cells are at or above target, red below.",
"kpi total selling days": "The run-rate clock for the chosen month: how many selling days it has, how many have passed, how many remain, and what share of the month is gone. Selling days are weekdays less public holidays.",
"sales run rate by branch": "Each branch's sales so far this month against its target, the daily rate it is running at, the daily rate it needs for the rest of the month, and a status of on track or behind. The month picker on the right moves to earlier months.",
"sales run rate by salesperson": "The same run-rate table per rep: month so far, target, required daily figure, and on track or behind.",
"margin run rate by branch": "The run rate measured on gross profit dollars instead of sales, against the branch margin budget.",
"margin run rate by salesperson": "Gross profit dollars so far against each rep's margin budget, with the daily figure needed.",
"comparisons sales vs budget": "Charts of the same comparison: target against actual for the selected month, by branch or by rep, and the trend of both across the year.",
"comparisons margin gp vs budget": "Gross profit against the margin budget for the selected month, by rep, and the trend across the year.",
"kpi income": "The profit and loss headline for the toolbar period, straight from the ledger: income, cost of goods sold, the gross profit and margin they give, total expenses and net profit.",
"ledger": "Controls for the ledger view. <b>Load ledger</b> reads the general ledger entries for the toolbar range; the <b>Default / Custom</b> pill switches between the ERP's own account categories and the finance team's grouping; <b>Exclude opening balances</b> leaves out the go-live postings; <b>Export to Excel</b> downloads what you see.",
"profit loss statement": "The statement itself. Click a section to open its accounts, click an account to list every ledger entry behind it. The small arrow beside an account or document opens it in the ERP, in the live tool; in this demo the arrow is shown only. Column headers sort within a section.",
"monthly summary": "Income, cost of sales, expenses and net profit month by month for the loaded range, as a chart and a table, so a one-off month stands out.",
"account map which g l codes go where": "The grouping behind the Custom view: every general ledger account and the line of the statement it feeds. Use it to check why a cost sits where it does."
};
  function normTitle(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function paneNote(title, key, kpiFirstLabel) {
    var k = kpiFirstLabel ? "kpi " + normTitle(kpiFirstLabel) : normTitle(title);
    var k2 = kpiFirstLabel ? k : normTitle(String(title || "").split("\u00b7")[0]);
    return PANE_NOTES[k + "|" + key] || PANE_NOTES[k] || PANE_NOTES[k2 + "|" + key] || PANE_NOTES[k2] || "";
  }

  /* ---- generic per-tab tour, built from the page itself ----- */
  // Any tab without a hand-written tour: an intro from the tool's own
  // help text, then one step per visible block (KPI rows, chart cards,
  // tables) with the block's own heading + meta line.
  function genericSteps(key, withIntro) {
    var sec = document.querySelector("section[data-tab-content='" + key + "']");
    var steps = [];
    var help = tabHelp(key);
    if (withIntro) {
      steps.push({
        popover: {
          title: help.title,
          description: (help.body ? escapeHtml(help.body) : "This dashboard follows the toolbar period and filters.") +
                       (help.note ? "<br><i>" + escapeHtml(help.note) + "</i>" : ""),
          side: "over",
          align: "center"
        }
      });
    }
    if (!sec) return steps;
    var blocks = sec.querySelectorAll(".toolbar, .hint.rr-hint, .kpi-row, .card, .panel, .srecon-frame, .chart-wrap:not(.card .chart-wrap)");
    var n = 0;
    for (var i = 0; i < blocks.length && n < 80; i++) {
      var b = blocks[i];
      if (b.offsetParent === null) continue;
      if (b.closest(".card") && b.closest(".card") !== b) continue; // nested
      var title = "", desc = "";
      if (b.classList.contains("toolbar")) {
        var flabels = Array.prototype.map.call(b.querySelectorAll(".field > label, .field > .label, label"), function (l) { return cleanText(l.textContent); }).filter(Boolean);
        var fbtns = Array.prototype.map.call(b.querySelectorAll("button"), function (x) { return cleanText(x.textContent); }).filter(Boolean);
        title = "Step 1 \u00b7 set up the view";
        var tn = PANE_NOTES["toolbar|" + key] || "";
        desc = (tn || "Choose what this page should show before reading the results below.") +
               (flabels.length ? "<br><span class='bc-tour-sub'>Controls: " + flabels.map(escapeHtml).join(" \u00b7 ") + (fbtns.length ? " \u00b7 " + fbtns.map(escapeHtml).join(" \u00b7 ") : "") + "</span>" : "");
      } else if (b.classList.contains("rr-hint")) {
        title = PANE_NOTES["rrhint|" + key] ? "Where the targets come from" : "Which month, and which targets";
        desc = (PANE_NOTES["rrhint|" + key] || PANE_NOTES["rrhint"]) + "<br><span class='bc-tour-sub'>" + escapeHtml(cleanText(b.textContent)).slice(0, 220) + "</span>";
      } else if (b.classList.contains("kpi-row")) {
        var labels = Array.prototype.map.call(b.querySelectorAll(".kpi .label"), function (l) { return cleanText(l.textContent); }).filter(Boolean);
        if (!labels.length) continue;
        title = "Key figures";
        var kn = paneNote("", key, labels[0]);
        desc = kn ? kn + "<br><span class='bc-tour-sub'>Tiles: " + labels.map(function (l) { return escapeHtml(l); }).join(" · ") + "</span>"
                  : labels.map(function (l) { return "<b>" + escapeHtml(l) + "</b>"; }).join(" · ");
        if (!kn && b.title) desc += "<br>" + escapeHtml(b.title);
      } else if (b.classList.contains("card")) {
        var h3 = b.querySelector(".head h3, h3");
        var meta = b.querySelector(".head .meta, .meta");
        title = h3 ? cleanText(h3.textContent) : "Chart";
        var cn = paneNote(title, key);
        var legend = meta ? escapeHtml(cleanText(meta.textContent)) : "";
        if (cn) desc = cn + (legend ? "<br><span class='bc-tour-sub'>On the chart: " + legend + "</span>" : "");
        else desc = legend || (b.title ? escapeHtml(b.title) : "");
      } else if (b.classList.contains("panel")) {
        var h2 = b.querySelector(".panel-header h2, h2");
        title = h2 ? cleanText(h2.textContent) : "Table";
        var pn = paneNote(title, key);
        desc = pn || (b.title ? escapeHtml(b.title) : "Column headers sort. Click a row or a ▸ arrow where one is shown to drill down.");
      } else {
        var leg = b.querySelector("legend");
        title = leg ? cleanText(leg.textContent) : "Section";
        desc = b.title ? escapeHtml(b.title) : "";
      }
      if (!desc) desc = "This pane follows the toolbar period and filters. Turn on <b>Help (?)</b> in the header and hover any tile or column here for its definition.";
      if (!b.id) b.id = "bcTourBlock_" + key + "_" + i;
      steps.push({
        element: "#" + b.id,
        generic: true,
        popover: { title: title, description: desc, side: "top", align: "center" }
      });
      n++;
    }
    return steps;
  }

  function stepsFor(key, chaining) {
    var spec = TOURS[key];
    var steps = [];
    if (spec) {
      steps = spec.steps.filter(function (s) { return chaining || !s.chainOnly; });
      if (spec.appendGeneric) {
        // The hand-off step ("click the next tab") stays last: generic pane
        // steps slot in before it.
        var tail = [];
        while (steps.length && steps[steps.length - 1].waitForClick && steps[steps.length - 1].chainOnly) tail.unshift(steps.pop());
        steps = steps.concat(genericSteps(key, false)).concat(tail);
      }
    } else {
      steps = genericSteps(key, true);
    }
    return steps;
  }

  /* ---- resume-mid-tour bookkeeping ------------------------ */
  // If the user clicks outside / presses Esc mid-tour, we remember which
  // step they were on (per tour key, sessionStorage-scoped so a reload
  // starts fresh). Clicking "Take the tour" again on the same dashboard
  // resumes from that step.
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

  /* ---- "Loading sales data…" toast ------------------------- */
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
          '<div class="bc-tour-toast-sub">Opening the snapshot…</div>' +
        '</div>';
      document.body.appendChild(t);
    }
    t.classList.remove("visible");
    void t.offsetWidth;
    t.classList.add("visible");
  }
  function hideLoadToast() {
    var t = document.getElementById("bc-tour-load-toast");
    if (t) t.classList.remove("visible");
  }

  /* ---- wait for the real "Load sales" load to finish ------ */
  function waitForLoadComplete(btn, done) {
    if (!btn) { done(); return; }
    var startedAt = Date.now();
    var MAX_MS = 60000;
    showLoadToast();
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

  /* ---- "Take the tour" button ------------------------------ */
  function injectTourButton() {
    if (document.getElementById("bcSalesTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "bcSalesTourBtn";
    btn.type = "button";
    btn.className = "bc-tour-btn";
    btn.title = "Explain the tab that is open";
    btn.setAttribute("aria-label", "Take the guided tour of this tab");
    btn.innerHTML = "<span class='bc-tour-btn-icon' aria-hidden='true'>?</span>" +
                    "<span class='bc-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () {
      // Explain the tab that is open right now, and only that tab.
      // `resume:true` picks up mid-tour if the user closed it earlier.
      chain = null;
      startTour(activeTabKey(), { force: true, resume: true });
    });

    // Sits in the middle header section, right after Load sales / Fast
    // lookup, so it never disturbs the Theme / Sign out grid on the right.
    var loadBtn = document.getElementById("loadBtn");
    var lookupBtn = document.getElementById("loadLookupBtn");
    var lookupWrap = lookupBtn && lookupBtn.parentElement;
    if (loadBtn && loadBtn.parentElement) {
      var row = loadBtn.parentElement;
      var after = (lookupWrap && lookupWrap.parentElement === row) ? lookupWrap : loadBtn;
      row.insertBefore(btn, after.nextSibling);
    } else {
      btn.classList.add("bc-tour-btn-floating");
      document.body.appendChild(btn);
    }
  }

  /* ---- tour driver ----------------------------------------- */
  var currentTour = null; // { key, driver, tearDown }
  // Guided walk: the tabs still to come, in order. null = not chaining.
  var chain = null;

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
    var seenKey = spec ? spec.seenKey : "bcSalesTour_" + key + "_generic_v1";
    if (!opts.force && hasSeen(seenKey)) return;
    if (!window.driver || !window.driver.js || !window.driver.js.driver) {
      console.warn("[bc-sales-tour] Driver.js not loaded yet");
      return;
    }
    stopCurrentTour();

    var chaining = !!opts.chain;

    // Resolve each step's target: the first visible candidate of a
    // comma-separated selector list, widened to its whole pane (KPI row,
    // card, panel, toolbar field) so the highlight never sits on a bare
    // figure. Skip steps whose target isn't on-screen, and the Load-sales
    // step when data is already loaded ("Reload sales").
    var genId = 0;
    var stepsIn = [];
    var covered = [];
    stepsFor(key, chaining).forEach(function (raw) {
      if (raw.simulateLoad) {
        var loadBtn = document.querySelector(raw.element || "#loadBtn");
        if (loadBtn && /reload/i.test(loadBtn.textContent || "")) return;
      }
      if (!raw.element) { stepsIn.push(Object.assign({}, raw)); return; }
      var el = resolveTarget(raw.element);
      if (!el) return;
      if (!raw.waitForClick && !raw.simulateLoad && !raw.noExpand) el = expandTarget(el);
      if (raw.generic) {
        for (var c = 0; c < covered.length; c++) {
          if (covered[c] === el || covered[c].contains(el)) return;
        }
      }
      covered.push(el);
      if (!el.id) el.id = "bcTourTarget_" + (++genId) + "_" + Date.now().toString(36);
      stepsIn.push(Object.assign({}, raw, { element: "#" + el.id }));
    });
    if (!stepsIn.length) return;

    // Walk the page top to bottom: steps are sorted by where their pane sits
    // in the document. The welcome step (no element) stays first, the
    // click-Load-sales step stays second, the tab hand-off stays last.
    (function orderByPage() {
      var head = [], tail = [], body = [];
      stepsIn.forEach(function (st) {
        if (!st.element) { if (!body.length && !tail.length) head.push(st); else body.push(st); return; }
        if (st.simulateLoad) { head.push(st); return; }
        if (st.closing || (st.waitForClick && st.chainOnly)) { tail.push(st); return; }
        body.push(st);
      });
      var pos = function (st) { return st.element ? document.querySelector(st.element) : null; };
      body.sort(function (a, b) {
        var ea = pos(a), eb = pos(b);
        if (!ea || !eb) return 0;
        if (ea === eb) return 0;
        return (ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
      });
      stepsIn = head.concat(body, tail);
    })();

    var attached = [];
    var pulsing = [];

    var steps = stepsIn.map(function (raw) {
      if (!raw.waitForClick) return raw;
      var s = Object.assign({}, raw, {
        popover: Object.assign({}, raw.popover, {
          showButtons: ["previous", "close"]  // hide Next
        }),
        disableActiveInteraction: false,  // the one element the step asks for
        onHighlighted: function (targetEl) {
          if (!targetEl) return;
          // Driver 1.3 applies the global lock to every highlighted element;
          // this is the one element the step asks the visitor to click.
          targetEl.classList.remove("driver-no-interaction");
          targetEl.classList.add("bc-tour-pulse");
          pulsing.push(targetEl);
          if (raw.simulateLoad) {
            targetEl.disabled = false;
            if (!/reload/i.test(targetEl.textContent || "")) {
              targetEl.textContent = "Load sales";
            }
          }
          var handler = function (ev) {
            targetEl.removeEventListener("click", handler, true);
            targetEl.classList.remove("bc-tour-pulse");
            if (raw.simulateLoad) {
              waitForLoadComplete(targetEl, function () {
                if (currentTour && currentTour.driver) {
                  try { currentTour.driver.moveNext(); } catch (e) {}
                }
              });
              return;
            }
            // A hand-off to another tab: that tab's tour starts from the
            // tab-change observer; close this one quietly.
            setTimeout(function () {
              if (currentTour && currentTour.driver) {
                try { currentTour.driver.moveNext(); } catch (e) {}
              }
            }, 300);
          };
          targetEl.addEventListener("click", handler, true);
          attached.push({ el: targetEl, handler: handler });
        }
      });
      return s;
    });

    var lastIndex = 0;

    var d = window.driver.js.driver({
      showProgress: true,
      // The page is locked while a tour runs: the overlay swallows clicks
      // (no close-on-backdrop), the highlighted element is inert unless the
      // step asks for a click. The × button and Esc still end the tour.
      // allowClose shows Driver's own close button (the red X); the overlay
      // click also closes, and "Take the tour" resumes where it left off.
      allowClose: true,
      // Keyboard is handled below: arrows never skip a click-to-advance step.
      allowKeyboardControl: false,
      disableActiveInteraction: true,
      // "nearest": a tall target (the navigation) is not centred by scrolling
      // its own container half-way down.
      scrollIntoViewOptions: { behavior: "instant", block: "nearest", inline: "nearest" },
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
        if (steps[idx] && steps[idx].scrollTop) {
          var toTop = function () {
            try { window.scrollTo({ top: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); }
            document.querySelectorAll(".sidebar, .sidebar nav, .main, .container").forEach(function (sc) { sc.scrollTop = 0; });
          };
          toTop();
          // Driver scrolls the target after this hook; undo that and re-fit the highlight.
          setTimeout(function () { toTop(); try { d.refresh(); } catch (e) {} }, 80);
        }
      },
      onDestroyed: function () {
        markSeen(seenKey);
        var reachedEnd = lastIndex >= steps.length - 1;
        if (reachedEnd) setResume(key, null);
        // Closing a chained tour early ends the guided walk; the button
        // still explains any tab on demand.
        if (chaining && !(chain && chain.length && reachedEnd)) chain = null;
        cleanup();
        currentTour = null;
      }
    });

    function cleanup() {
      document.removeEventListener("keydown", keyGuard, true);
      for (var p = 0; p < pulsing.length; p++) { try { pulsing[p].classList.remove("bc-tour-pulse"); } catch (e) {} }
      pulsing.length = 0;
      for (var i = 0; i < attached.length; i++) {
        try { attached[i].el.removeEventListener("click", attached[i].handler, true); }
        catch (e) {}
      }
      attached.length = 0;
    }

    var startAt = 0;
    if (opts.resume) {
      var savedId = getResume(key);
      if (savedId) {
        for (var i = 0; i < steps.length; i++) {
          if (stepId(steps[i], i) === savedId) { startAt = i; break; }
        }
      }
    }

    function keyGuard(ev) {
      if (!currentTour || currentTour.driver !== d) return;
      var step = steps[lastIndex];
      if (ev.key === "Escape") { ev.preventDefault(); try { d.destroy(); } catch (e) {} return; }
      if (ev.key === "ArrowRight" || ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault(); ev.stopPropagation();
        if (step && step.waitForClick) return;            // the visitor has to click the highlighted element
        try { d.moveNext(); } catch (e) {}
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault(); ev.stopPropagation();
        try { d.movePrevious(); } catch (e) {}
      }
    }
    document.addEventListener("keydown", keyGuard, true);

    currentTour = { key: key, driver: d, tearDown: cleanup };
    d.drive(startAt);
  }

  window.startBcSalesTour = startTour;
  window.bcSalesTours = TOURS;

  /* ---- wait for the demo's initial loading overlay --------- */
  function whenInitialLoadDone(callback) {
    var MAX_MS = 90000;
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

  // The guided walk hands off Overview → Deep Insights → Branch Sales.
  // The next tab's tour starts only when it is the one the chain expects;
  // any other tab change does nothing (the button is the way in).
  function watchTabChanges() {
    var links = document.querySelectorAll(".sidebar a[data-tab]");
    if (!links.length) return;
    var obs = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.attributeName !== "class") continue;
        var el = r.target;
        if (!el.classList || !el.classList.contains("active")) continue;
        var key = el.dataset.tab || el.dataset.tsTab;
        if (!key || !chain || chain[0] !== key) continue;
        chain.shift();
        var last = chain.length === 0;
        setTimeout(function (k, isLast) {
          return function () {
            startTour(k, { force: true, chain: true });
            if (isLast) chain = null;
          };
        }(key, last), 350);
      }
    });
    links.forEach(function (a) {
      obs.observe(a, { attributes: true, attributeFilter: ["class"] });
    });
    // Tab view: the strip under the filters mirrors the sidebar.
    var strip = document.getElementById("tabStrip");
    if (strip) obs.observe(strip, { attributes: true, attributeFilter: ["class"], subtree: true });
  }

  /* ---- default-theme handling ----------------------------- */
  function defaultToPavilion() {
    // Every new visit starts in Pavilion (owner's call, 2026-10-30), even when
    // this browser remembers another theme from an earlier visit. Within one
    // tab session a theme the visitor switches to is kept across reloads.
    var forced = false;
    try { forced = sessionStorage.getItem("bcSalesDemoThemeForced") === "1"; } catch (e) {}
    if (forced && document.documentElement.dataset.themePicked === "1") return;
    try { sessionStorage.setItem("bcSalesDemoThemeForced", "1"); } catch (e) {}

    if (typeof window.applyTheme === "function") {
      try { window.applyTheme("pavilion"); } catch (e) {}
    } else {
      document.documentElement.classList.add("theme-pavilion");
      document.documentElement.dataset.themePicked = "1";
      try { localStorage.setItem("bcSalesTheme", "pavilion"); } catch (e) {}
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
    defaultToPavilion();
    injectTourButton();
    loadDriverThen(function () {
      // The demo chooser (tour/demo-chooser.js) asks the visitor first:
      //   "Show me around"       -> guided walk Overview → Deep Insights →
      //                             Branch Sales, then the button per tab
      //   "I'll discover myself" -> free roam: nothing auto-fires, the
      //                             "? Take the tour" button explains any tab
      var begin = function (mode) {
        if (mode === "explore") { window.__tourExploreMode = true; return; }
        Object.keys(TOURS).forEach(function (k) {
          try { localStorage.removeItem(TOURS[k].seenKey); } catch (e) {}
        });
        watchTabChanges();
        whenInitialLoadDone(function () {
          whenThemePicked(function () {
            chain = ["deepInsights", "branch"];
            startTour("overview", { force: true, chain: true });
          });
        });
      };
      if (window.DemoChooser) window.DemoChooser.whenChosen(begin); else begin("tour");
    });
  });
})();
