/* ============================================================
   Guided tour for the forecast-tool demo (Demo Apps 5, Ironbark).
   Powered by Driver.js (https://driverjs.com) — MIT license.

   The demo opens in TAB VIEW (Linen theme) and the tour walks that
   layout: filter bar, tab strip, Forecast Results, the item window,
   Order Planner (with a vendor drill), Priority Lanes (with a lane
   opened), Container Planner (via the overseas vendor note), Predicted
   Forecast, then the header controls.

   Every step declares the page state it needs (`req`). Before a step is
   shown the engine puts the page into that state, whichever direction
   the visitor is travelling, so Back and Next always land on a working
   screen: windows are opened or closed, tabs switched, the vendor and
   the search set, the container optimised, the lane expanded.

   Click-to-advance steps (`waitForClick` or a waitFor* flag) hide the
   Next button, pulse the element and move on once the thing the click
   opens is on screen. Placeholders FS-140039 etc. are filled in by
   scripts/inject_forecast_v5.py.
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
  if (thisScript && thisScript.src) addStylesheet(thisScript.src.replace(/tour\.js(\?.*)?$/, "tour.css"));

  var HERO = "FS-140039", HERO_VENDOR = "V-20001", HERO_VENDOR_NAME = "Ridgeline Tools (Ningbo) Co., Ltd";
  var ERP_FROM = "2025-07-01", LEGACY_FROM = "2023-12-01", LEGACY_TO = "2025-06-30";

  function fmtMonth(iso) {
    var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return m[parseInt(iso.slice(5, 7), 10) - 1] + " " + iso.slice(0, 4);
  }
  // tab strip order: Forecast Results, Container Planner, Predicted Forecast, Order Planner, Priority Lanes
  var TAB = { results: 1, container: 2, predicted: 3, planner: 4, lanes: 5 };
  function tabBtn(key) { return "#wsTabBtns button:nth-of-type(" + TAB[key] + ")"; }

  /* ---- helpers -------------------------------------------- */
  function hasSeen(key) { try { return localStorage.getItem(key) === "1"; } catch (e) { return false; } }
  function markSeen(key) { try { localStorage.setItem(key, "1"); } catch (e) {} }
  function resumeStorageKey(k) { return "forecastTour_" + k + "_resumeAt"; }
  function stepId(step, index) {
    var title = step && step.popover && step.popover.title;
    return "s:" + index + "|" + (title || "");
  }
  function getResume(k) { try { return sessionStorage.getItem(resumeStorageKey(k)); } catch (e) { return null; } }
  function setResume(k, id) {
    try { if (id == null) sessionStorage.removeItem(resumeStorageKey(k)); else sessionStorage.setItem(resumeStorageKey(k), id); } catch (e) {}
  }
  function isVisible(el) { return !!el && el.offsetParent !== null; }
  function g(name) { try { return (0, eval)("typeof " + name + " === 'undefined' ? undefined : " + name); } catch (e) { return undefined; } }
  function currentTab() { var t = g("wsTab"); return t || ""; }
  function firstText(el) { return (el && el.textContent || "").replace(/\s+/g, " ").trim(); }

  // common requirements: the results tab, nothing open
  var BASE = { modal: false, adv: false, tab: "results" };
  var IN_MODAL = { tab: "results", search: HERO, modal: true, adv: false };
  var IN_ADV = { tab: "results", search: HERO, modal: true, adv: true };

  /* ================================================================
     TOUR REGISTRY
     ================================================================ */
  var BASEC = { modal: false, adv: false, plannerOpen: false };
  var IN_MODAL_C = { modal: true, adv: false, plannerOpen: false, search: HERO };
  var IN_ADV_C = { modal: true, adv: true, plannerOpen: false, search: HERO };
  var TOURS = {
    tabs: {
      seenKey: "forecastTour_tabs_ironbark_v3",
      steps: [
        {
          popover: {
            title: "Welcome to the Item Demand Forecast tool",
            description:
              "This is the buying side of the business. For every item it shows what has been used, " +
              "what the next months look like, what is in stock and on order, and what needs buying. " +
              "Everything on screen is invented for the demo. We'll start by loading the data.",
            side: "over", align: "center"
          }
        },
        {
          element: "#bcConnectBtn",
          waitForClick: true,
          simulateLoad: true,
          popover: {
            title: "Click Login & Load All Data",
            description:
              "In the live tool this signs you in and pulls the item ledger, the item list, vendors, branch stock, " +
              "open orders and min/max levels straight from the ERP. In the demo it opens the generated dataset. " +
              "Click the button to load it.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#bcConnectionPanel",
          req: { top: true, modal: false, adv: false },
          popover: {
            title: "Where the data comes from",
            description:
              "This panel is the connection to the ERP and the data options. <b>Fast lookup</b> opens one of three snapshots captured each day, " +
              "so nobody waits for the ERP. <b>Include legacy history</b> is ticked: the old system's entries (" + fmtMonth(LEGACY_FROM) + " to " +
              fmtMonth(LEGACY_TO) + ") sit in front of the ERP data, which starts " + fmtMonth(ERP_FROM) + ". <b>Include custom/special items</b> " +
              "shows the indent lines, hidden by default. <b>Manual upload</b> takes Excel exports instead of a connection.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#statsBar",
          req: { top: true, modal: false, adv: false },
          popover: {
            title: "What is loaded",
            description:
              "Unique items, transactions, months of history and the date range. With the legacy history in, that is three full " +
              "years, enough for the seasonal method. The small arrow above tucks this panel away again.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgDates",
          req: { top: false, modal: false, adv: false, tab: "results" },
          popover: {
            title: "Date range",
            description:
              "The filter bar is the control room of the tool: every setting here applies to every tab at once. First the dates. " +
              "They set the slice of history the whole tool works from, so usage, averages and every forecast come from this window only. " +
              "<b>Date From / To</b> narrow it, for example to the last twelve months to drop an old spike. <b>Apply</b> recalculates, " +
              "<b>Reset</b> goes back to all the data loaded.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgLoc",
          req: BASE,
          popover: {
            title: "Branches",
            description:
              "These buttons choose which part of the company you are looking at. <b>All</b> is company-wide. Pick one or more branch codes " +
              "and usage, stock, open orders and min/max levels all switch to that branch's own figures, in every tab. Mackay opened in June, " +
              "so it only has a few months behind it.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgMethod",
          req: BASE,
          popover: {
            title: "Forecast method",
            description:
              "These five buttons choose <b>how the tool turns past usage into a forecast</b>. One method at a time, and it drives everything: " +
              "the forecast columns, the item window, the Order Planner, the lanes and the container plan. " +
              "<b>Standard</b> is the plain monthly average. <b>WMA</b> (weighted moving average) leans on the most recent months. " +
              "<b>Linear Regression</b> fits a trend line and follows it. <b>Exp. Smoothing</b> tracks the current level and its trend together. " +
              "<b>Seasonal</b> repeats last year's pattern month by month. Standard is the safe default; the others are for items that are " +
              "trending or seasonal.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgHorizon",
          req: BASE,
          popover: {
            title: "How far ahead, and a safety margin",
            description:
              "This row sets <b>how far ahead you are buying for</b>. <b>3M / 6M / 12M</b> are the usual horizons and the box takes any number " +
              "of months; the Order Planner, the Container Planner and Net to Purchase all follow it. <b>Increase %</b> adds a cushion on top " +
              "of every forecast, typed or with the quick buttons, for a promotion, a price rise or a supplier with a long lead time.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgChips",
          req: BASE,
          popover: {
            title: "Display options",
            description:
              "These chips change <b>how the buying quantities are shown</b>, not the forecast itself. <b>Order to Min</b> buys only up to the " +
              "minimum level instead of the full horizon. <b>Round up</b> rounds to whole units. <b>Reorder policy</b> hides back-to-back items " +
              "that are never stocked. <b>Stock gauge</b> and <b>Status</b> switch those two columns on and off. A chip dims when it does not " +
              "apply to the open tab.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgShow",
          req: BASE,
          popover: {
            title: "Planner buckets and page size",
            description:
              "These settings shape the two planning tabs. <b>Period</b> splits the Order Planner into weekly or monthly buckets. " +
              "<b>Group by</b> lists it by vendor (one card per supplier) or by item (one long list). <b>Show</b> sets how many rows a page holds, " +
              "in every table.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgSearch",
          req: BASE,
          popover: {
            title: "Find an item",
            description:
              "The two search boxes narrow every tab to what you type. This one finds items: type an item number or part of a description, " +
              "the list under the box shows every match, arrow keys and Enter pick one.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgVendor",
          req: BASE,
          popover: {
            title: "One vendor at a time",
            description:
              "The vendor box narrows the tool to one supplier: type a number or a name. Buying is done per supplier, and the Container Planner " +
              "needs a vendor picked before it can plan a load.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#wsTabs",
          req: BASE,
          popover: {
            title: "The tabs",
            description:
              "Five views of the same data. <b>Forecast Results</b> is the full item table. <b>Container Planner</b> packs an import order into " +
              "containers. <b>Predicted Forecast</b> shows what that order covers. <b>Order Planner</b> is the buying list per vendor. " +
              "<b>Priority Lanes</b> sorts items by urgency. The export buttons on the right take whatever the open tab shows (switched off in " +
              "the demo). We'll visit each tab in turn.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tableScroll",
          req: { modal: false, adv: false, tab: "results", search: "" },
          popover: {
            title: "The results table",
            description:
              "One row per item, in five groups. <b>Usage</b> is what was used in the date range and the monthly rate. <b>Forecast</b> is what the " +
              "chosen method expects over 3, 6 and 12 months. <b>Stock & Orders</b> comes from the ERP: on hand, min and max, open sales orders, " +
              "open purchase orders. <b>Net to Purchase</b> is forecast plus sales orders, minus stock, minus what is already on order. " +
              "The <b>Status</b> stripe: ORDER NOW under a month of cover, WATCH under three, OK, and OVER past twelve or above the max level. " +
              "Click a column header to sort, click an item number to open its window.",
            side: "top", align: "center"
          }
        },
        {
          element: "#paginationBar",
          req: BASE,
          popover: {
            title: "Paging",
            description: "Page numbers for the filtered list. The count on the right of the table header tells you how many items the current filters leave.",
            side: "top", align: "center"
          }
        },
        /* ---- the item window ---- */
        {
          element: "#tableBody a[onclick*=\"'" + HERO + "'\"]",
          waitForModal: true,
          scrollIntoView: true,
          req: { modal: false, adv: false, tab: "results", vendor: "", search: HERO },
          popover: {
            title: "Try it: open " + HERO,
            description:
              "This is the tool earning its keep: a fast-moving screw with the stock run down and nothing on order. It is also used in a kit, " +
              "which you will see inside. Click the item number to open its window.",
            side: "right", align: "start"
          }
        },
        {
          element: "#detailTitle",
          req: IN_MODAL,
          popover: {
            title: "The item window",
            description: "Everything the tool knows about one item: monthly history, every forecast method, stock and orders, and usage by branch.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tourFcAssembly",
          req: IN_MODAL,
          optional: true,
          popover: {
            title: "Sold, and used in assembly",
            description:
              "This screw is also consumed when the Roofing Fastener Pack is put together, so the window splits the usage three ways: " +
              "<b>sold directly</b>, <b>consumed in assembly</b>, and the <b>combined</b> figure the forecast is built on. Assembly use is " +
              "real demand too, so nothing is missed when a kit sells well.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tourFcKpi",
          req: IN_MODAL,
          popover: {
            title: "Headline numbers",
            description:
              "<b>Total Used</b> over the loaded range and the <b>Monthly Avg</b> it works out to. The three coloured cards are the Standard " +
              "forecast for 3, 6 and 12 months ahead. The chart under them is the last twelve months, month by month.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "button[onclick*='openAdvModal']",
          waitForAdvPanel: true,
          req: IN_MODAL,
          popover: {
            title: "Try it: click Advanced Forecast Methods",
            description: "Click the highlighted button. A window opens with the four other methods one under the other, so you can sanity-check the Standard number.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tourAdvMethod1",
          req: IN_ADV,
          popover: {
            title: "Weighted moving average",
            description:
              "The last months of usage, with the most recent counting most. The pills show each month and its weight. " +
              "Good for items whose rate is gently drifting up or down.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tourAdvMethod2",
          req: IN_ADV,
          popover: {
            title: "Linear regression",
            description: "A straight trend line through every complete month, projected forward. The slope says whether demand is growing, flat or shrinking.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tourAdvMethod3",
          req: IN_ADV,
          popover: {
            title: "Exponential smoothing (Holt)",
            description: "Tracks the current level and its trend at the same time, reacting to recent change without chasing a single spike.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tourAdvMethod4",
          req: IN_ADV,
          popover: {
            title: "Seasonal",
            description:
              "Splits the history into level, trend and the repeating yearly pattern, then builds it forward. For hi-vis in autumn or " +
              "batteries before Christmas this is the method that sees it coming. Needs about a year of history.",
            side: "top", align: "start"
          }
        },
        {
          element: "#tourFcCustomBlock",
          req: IN_MODAL,
          popover: {
            title: "Custom forecast",
            description: "Pick a method, type any horizon, add a safety percentage. Useful for a promotion or a supplier with a long lead time.",
            side: "top", align: "start"
          }
        },
        {
          element: "#tourFcInventoryHead",
          req: IN_MODAL,
          popover: {
            title: "Inventory and orders",
            description: "Stock on hand, what customers have on open sales orders, and what is already coming on purchase orders, per branch.",
            side: "top", align: "start"
          }
        },
        {
          element: "#tourFcNetHead",
          req: IN_MODAL,
          popover: {
            title: "Net to purchase",
            description:
              "Forecast plus sales orders, minus inventory, minus purchase orders. Positive means buy that many more; zero means " +
              "stock and incoming orders already cover it. Shown for 3, 6 and 12 months.",
            side: "top", align: "start"
          }
        },
        {
          element: "#tourFcUsageHead",
          req: IN_MODAL,
          popover: {
            title: "Usage by branch",
            description: "How the item's usage splits across the branches, with the month-by-month breakdown next to it, so you know where the next order should land.",
            side: "top", align: "start"
          }
        },
        /* ---- Order Planner tab ---- */
        {
          element: tabBtn("planner"),
          waitForTab: "planner",
          scrollTop: true,
          req: { modal: false, adv: false, tab: "results", search: "" },
          popover: {
            title: "Try it: open the Order Planner tab",
            description: "This turns the whole table into a buying list, grouped by vendor, in weekly or monthly buckets. Click the tab.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerSummary",
          scrollTop: true,
          req: { modal: false, tab: "planner", plannerVendor: null },
          popover: {
            title: "The buying list",
            description:
              "The three figures on top: items that need ordering, net units over the horizon and the weekly rate. Below, one card per vendor " +
              "with its item count and units a week, biggest first. The buckets, grouping, horizon and method come from the filter bar above.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerContent .pv-tile",
          waitForPlannerVendor: true,
          scrollIntoView: true,
          req: { tab: "planner", plannerVendor: null },
          popover: {
            title: "Try it: open a vendor card",
            description: "Click the first card. The planner drills into that supplier and shows its full ordering schedule.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerContent table tr",
          req: { tab: "planner", plannerVendor: "ANY" },
          popover: {
            title: "The vendor's ordering schedule",
            description:
              "One line per item the supplier should send: net to buy over the horizon, then the quantity per bucket across the weeks (or " +
              "months), so a purchase order can be split into deliveries. Click an item number to open its window. In the live tool the " +
              "export turns this list into the purchase order.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerSummary [onclick*='wsPlannerVendorBack']",
          waitForClick: true,
          waitForPlannerBack: true,
          req: { tab: "planner", plannerVendor: "ANY" },
          popover: {
            title: "Try it: back to all vendors",
            description: "Click <b>All vendors</b> to return to the cards.",
            side: "bottom", align: "start"
          }
        },
        /* ---- Priority Lanes tab ---- */
        {
          element: tabBtn("lanes"),
          waitForTab: "lanes",
          scrollTop: true,
          req: { tab: "planner", plannerVendor: null },
          popover: {
            title: "Try it: open Priority Lanes",
            description: "Click the tab. Every live item is sorted into four lanes by months of cover, so the urgent ones are on top.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerSummary",
          scrollTop: true,
          req: { tab: "lanes", laneOpen: false },
          popover: {
            title: "Four lanes",
            description:
              "<b>ORDER NOW</b> under a month of cover, <b>WATCH</b> one to three months, <b>HEALTHY</b>, and <b>OVERSTOCKED</b> above max or " +
              "past twelve months. These four counters are the split; the four columns underneath list each lane's vendors with the net units to buy.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerContent div[onclick^='toggleLaneVendor']",
          waitForLane: true,
          scrollIntoView: true,
          req: { tab: "lanes", laneOpen: false },
          popover: {
            title: "Try it: open a vendor in ORDER NOW",
            description: "Click the first vendor in the ORDER NOW lane to see which of its items are about to run out.",
            side: "right", align: "start"
          }
        },
        {
          element: "#tourLaneItems",
          req: { tab: "lanes", laneOpen: true },
          popover: {
            title: "The items in the lane",
            description:
              "One card per item with the net units to buy. This is the morning check: the ORDER NOW lane is what gets ordered today. " +
              "Click an item card to open its window, or click the vendor again to fold the list.",
            side: "right", align: "start"
          }
        },
        /* ---- Container Planner tab ---- */
        {
          element: tabBtn("container"),
          waitForTab: "container",
          scrollTop: true,
          req: { tab: "lanes", vendor: "" },
          popover: {
            title: "Try it: open the Container Planner",
            description: "Click the tab. This is for imported ranges: how much of a 65 cubic-metre container does the buying fill, and how do we fill the rest properly?",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#demoOverseasNote",
          waitForVendor: true,
          req: { tab: "container", vendor: "" },
          popover: {
            title: "Try it: pick an imported range",
            description:
              "Container planning only works for vendors whose items carry cubic-metre data, in this company the overseas makers listed here. " +
              "Click <b>" + HERO_VENDOR + "</b>, the house brand, or any other one. You can also type a code in the Vendor box.",
            side: "top", align: "center"
          }
        },
        {
          element: "#containerSummary",
          req: { tab: "container", vendor: "ANY" },
          popover: {
            title: "What the horizon fills",
            description:
              "Total cubic metres for the Forecast Period chosen above, how many containers that is, the space left in the last one and how " +
              "full they are. Spare space is wasted freight, which is what the next button is for.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fillContainerBtn",
          waitForContainerResult: true,
          scrollIntoView: true,
          req: { tab: "container", vendor: "ANY" },
          popover: {
            title: "Try it: click Optimize Containers",
            description: "Click the highlighted button. The tool rounds every line to full cartons and tops the order up to a full container with the lines that run out soonest.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#containerContent",
          req: { tab: "container", vendor: "ANY", optimised: true },
          popover: {
            title: "The load plan",
            description:
              "One row per item: net to purchase, carton size, cartons to order, units, cubic metres each and in total. Edit the cartons and " +
              "the totals follow. Items without cubage are listed at the bottom so nothing is forgotten.",
            side: "top", align: "center"
          }
        },
        /* ---- Predicted Forecast tab ---- */
        {
          element: tabBtn("predicted"),
          waitForTab: "predicted",
          scrollTop: true,
          req: { tab: "container", vendor: "ANY", optimised: true },
          popover: {
            title: "Try it: open Predicted Forecast",
            description: "Click the tab. It only lights up once a container has been optimised, because it is built from those adjusted quantities.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#wsPredictedHost",
          req: { tab: "predicted", vendor: "ANY", optimised: true },
          popover: {
            title: "Predicted forecast",
            description:
              "What the container order means month by month: for each item in the plan, the quantity on the way against the forecast, " +
              "so you can see how long the shipment lasts and which lines will need the next order first.",
            side: "top", align: "center"
          }
        },
        /* ---- header controls ---- */
        {
          element: "#wsToggleWrap",
          noExpand: true,
          scrollTop: true,
          req: { modal: false, adv: false },
          popover: {
            title: "Tab view",
            description:
              "Tab view is on. Flip it off and the same tool becomes one long page: results, container planner and the Order Planner as a " +
              "popup, with the filters next to each part. Flip it back any time.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#themeBtn",
          noExpand: true,
          req: { modal: false, adv: false },
          popover: {
            title: "Themes",
            description: "This is Linen. There are ten looks for the same tool, from a dark boardroom to a brutalist orange. Saved on this device.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#helpBtn",
          noExpand: true,
          req: { modal: false, adv: false },
          popover: {
            title: "Help mode",
            description: "Switch it on and hover anything on the page for a plain-language explanation of what it is and how to read it.",
            side: "bottom", align: "start"
          }
        },
        {
          req: { modal: false, adv: false, vendor: "", search: "", tab: "results" },
          popover: {
            title: "That's the tour",
            description:
              "Open items, change the method or the horizon, try another vendor in the container, flip the view, pick a theme. Everything " +
              "recalculates live. Replay this walk any time from <b>Take the tour</b>.",
            side: "over", align: "center"
          }
        }
      ]
    },
    classic: {
      seenKey: "forecastTour_classic_ironbark_v1",
      steps: [
        {
          popover: {
            title: "Welcome to the Item Demand Forecast tool",
            description:
              "This is the buying side of the business. For every item it shows what has been used, what the next months look like, " +
              "what is in stock and on order, and what needs buying. Everything on screen is invented for the demo. You are on the classic " +
              "single page (Tab view is off). We'll start by loading the data.",
            side: "over", align: "center"
          }
        },
        {
          element: "#bcConnectBtn",
          waitForClick: true,
          simulateLoad: true,
          popover: {
            title: "Click Login & Load All Data",
            description:
              "In the live tool this signs you in and pulls the item ledger, the item list, vendors, branch stock, open orders and min/max " +
              "levels straight from the ERP. In the demo it opens the generated dataset. Click the button to load it.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#bcConnectionPanel",
          req: { top: true, modal: false, adv: false, plannerOpen: false },
          popover: {
            title: "Where the data comes from",
            description:
              "This panel is the connection to the ERP and the data options. <b>Fast lookup</b> opens one of three snapshots captured each day. " +
              "<b>Include legacy history</b> is ticked: the old system's entries (" + fmtMonth(LEGACY_FROM) + " to " + fmtMonth(LEGACY_TO) +
              ") sit in front of the ERP data, which starts " + fmtMonth(ERP_FROM) + ". <b>Include custom/special items</b> shows the indent lines. " +
              "<b>Manual upload</b> takes Excel exports instead of a connection.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#statsBar",
          req: { top: true, modal: false, adv: false, plannerOpen: false },
          popover: {
            title: "What is loaded",
            description: "Unique items, transactions, months of history and the date range. With the legacy history in, that is three full years. The small arrow above tucks this panel away.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgDates",
          req: { top: false, modal: false, adv: false, plannerOpen: false },
          popover: {
            title: "Date range",
            description:
              "The filter bar sets what the whole page works from. First the dates: they pick the slice of history every figure is built on. " +
              "<b>Date From / To</b> narrow it, <b>Apply</b> recalculates, <b>Reset</b> goes back to all the data loaded.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgLoc",
          req: BASEC,
          popover: {
            title: "Branches",
            description:
              "These buttons choose which part of the company you look at. <b>All</b> is company-wide; one or more branch codes switch usage, stock, " +
              "open orders and min/max to that branch's own figures. Mackay opened in June, so it has a few months only.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgSearch",
          req: BASEC,
          popover: {
            title: "Find an item",
            description: "The two search boxes narrow the page to what you type. This one finds items by number or description; the list under it shows every match.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#fgVendor",
          req: BASEC,
          popover: {
            title: "One vendor at a time",
            description:
              "The vendor box narrows the page to one supplier. Buying is done per supplier, and the Container Planner further down only appears " +
              "once a vendor is picked. The two buttons on the right export the table and open the Order Planner.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tableHeaderBar",
          req: BASEC,
          popover: {
            title: "Method and display options",
            description:
              "This bar controls how the table is calculated and shown. The <b>Method</b> buttons choose how past usage becomes a forecast: " +
              "<b>Standard</b> is the plain monthly average, <b>WMA</b> leans on recent months, <b>Linear Regression</b> follows the trend, " +
              "<b>Exp. Smoothing</b> tracks level and trend together, <b>Seasonal</b> repeats last year's pattern. The chips on the left change the " +
              "display only: <b>Order to Min</b> buys up to the minimum level, <b>Round up</b> rounds to whole units, <b>Reorder policy</b> hides " +
              "back-to-back items, <b>Stock gauge</b> and <b>Status</b> switch those columns.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#tableScroll",
          req: { modal: false, adv: false, plannerOpen: false, search: "" },
          popover: {
            title: "The results table",
            description:
              "One row per item, in five groups. <b>Usage</b> is what was used in the date range and the monthly rate. <b>Forecast</b> is what the " +
              "chosen method expects over 3, 6 and 12 months. <b>Stock & Orders</b> comes from the ERP. <b>Net to Purchase</b> is forecast plus sales " +
              "orders, minus stock, minus what is on order. The <b>Status</b> stripe: ORDER NOW under a month of cover, WATCH under three, OK, OVER past " +
              "twelve or above max. Click a header to sort, an item number to open its window.",
            side: "top", align: "center"
          }
        },
        {
          element: "#paginationBar",
          req: BASEC,
          popover: {
            title: "Paging",
            description: "Page numbers for the filtered list; the count on the right of the table header says how many items the filters leave.",
            side: "top", align: "center"
          }
        },
        {
          element: "#tableBody a[onclick*=\"'" + HERO + "'\"]",
          waitForModal: true,
          req: { modal: false, adv: false, plannerOpen: false, vendor: "", search: HERO },
          popover: {
            title: "Try it: open " + HERO,
            description:
              "This is the tool earning its keep: a fast-moving screw with the stock run down and nothing on order. It is also used in a kit, " +
              "which you will see inside. Click the item number to open its window.",
            side: "right", align: "start"
          }
        },
        { element: "#detailTitle", req: IN_MODAL_C, popover: { title: "The item window", description: "Everything the tool knows about one item: monthly history, every forecast method, stock and orders, and usage by branch.", side: "bottom", align: "start" } },
        { element: "#tourFcAssembly", req: IN_MODAL_C, optional: true, popover: { title: "Sold, and used in assembly", description: "This screw is also consumed when the Roofing Fastener Pack is put together, so the window splits the usage three ways: <b>sold directly</b>, <b>consumed in assembly</b>, and the <b>combined</b> figure the forecast is built on. Assembly use is real demand too.", side: "bottom", align: "start" } },
        { element: "#tourFcKpi", req: IN_MODAL_C, popover: { title: "Headline numbers", description: "<b>Total Used</b> over the loaded range and the <b>Monthly Avg</b> it works out to. The three coloured cards are the Standard forecast for 3, 6 and 12 months; the chart under them is the last twelve months.", side: "bottom", align: "start" } },
        { element: "button[onclick*='openAdvModal']", waitForAdvPanel: true, req: IN_MODAL_C, popover: { title: "Try it: click Advanced Forecast Methods", description: "Click the highlighted button. A window opens with the four other methods one under the other.", side: "bottom", align: "start" } },
        { element: "#tourAdvMethod1", req: IN_ADV_C, popover: { title: "Weighted moving average", description: "The last months of usage, with the most recent counting most. The pills show each month and its weight. Good for items whose rate is gently drifting.", side: "bottom", align: "start" } },
        { element: "#tourAdvMethod2", req: IN_ADV_C, popover: { title: "Linear regression", description: "A straight trend line through every complete month, projected forward. The slope says whether demand is growing, flat or shrinking.", side: "bottom", align: "start" } },
        { element: "#tourAdvMethod3", req: IN_ADV_C, popover: { title: "Exponential smoothing (Holt)", description: "Tracks the current level and its trend at the same time, reacting to recent change without chasing a single spike.", side: "bottom", align: "start" } },
        { element: "#tourAdvMethod4", req: IN_ADV_C, popover: { title: "Seasonal", description: "Splits the history into level, trend and the repeating yearly pattern, then builds it forward. Needs about a year of history.", side: "top", align: "start" } },
        { element: "#tourFcCustomBlock", req: IN_MODAL_C, popover: { title: "Custom forecast", description: "Pick a method, type any horizon, add a safety percentage. Useful for a promotion or a supplier with a long lead time.", side: "top", align: "start" } },
        { element: "#tourFcInventoryHead", req: IN_MODAL_C, popover: { title: "Inventory and orders", description: "Stock on hand, what customers have on open sales orders, and what is already coming on purchase orders, per branch.", side: "top", align: "start" } },
        { element: "#tourFcNetHead", req: IN_MODAL_C, popover: { title: "Net to purchase", description: "Forecast plus sales orders, minus inventory, minus purchase orders. Positive means buy that many more. Shown for 3, 6 and 12 months.", side: "top", align: "start" } },
        { element: "#tourFcUsageHead", req: IN_MODAL_C, popover: { title: "Usage by branch", description: "How the item's usage splits across the branches, with the month-by-month breakdown next to it.", side: "top", align: "start" } },
        /* ---- Order Planner popup ---- */
        {
          element: "button[onclick*='openOrderPlanner']",
          waitForPlannerModal: true,
          req: { modal: false, adv: false, plannerOpen: false, search: "" },
          popover: {
            title: "Try it: open the Order Planner",
            description: "This turns the whole table into a buying list, grouped by vendor, in weekly or monthly buckets. Click the button.",
            side: "bottom", align: "end"
          }
        },
        {
          element: "#plannerControls",
          req: { plannerOpen: true, plannerTab: "planner", plannerVendorModal: false },
          popover: {
            title: "Planner controls",
            description:
              "The planner has its own settings. <b>Period</b> splits the schedule into weekly or monthly buckets, <b>Group by</b> lists it per vendor " +
              "or per item, <b>Location</b> narrows to a branch, <b>Horizon</b> and <b>Method</b> are the forecast settings, and the two tabs at the top " +
              "switch between the Order Planner and Priority Lanes.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerSummary",
          req: { plannerOpen: true, plannerTab: "planner", plannerVendorModal: false },
          popover: {
            title: "The buying list",
            description: "Items that need ordering, net units over the horizon and the weekly rate. Below, one card per vendor with its item count and units a week, biggest first.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerContent .pv-tile",
          waitForVendorModal: true,
          req: { plannerOpen: true, plannerTab: "planner", plannerVendorModal: false },
          popover: { title: "Try it: open a vendor card", description: "Click the first card. The planner opens that supplier's full ordering schedule.", side: "bottom", align: "start" }
        },
        {
          element: "#plannerVendorContent table tr",
          req: { plannerOpen: true, plannerVendorModal: true },
          popover: {
            title: "The vendor's ordering schedule",
            description:
              "One line per item the supplier should send: net to buy over the horizon, then the quantity per bucket across the weeks (or months), " +
              "so a purchase order can be split into deliveries. In the live tool the export turns this into the purchase order. Close it with the X.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerTabs button:nth-of-type(2)",
          waitForPlannerTab: "lanes",
          req: { plannerOpen: true, plannerTab: "planner", plannerVendorModal: false },
          popover: { title: "Try it: open Priority Lanes", description: "Click the tab. Every live item is sorted into four lanes by months of cover, so the urgent ones are on top.", side: "bottom", align: "start" }
        },
        {
          element: "#plannerSummary",
          req: { plannerOpen: true, plannerTab: "lanes", laneOpen: false },
          popover: {
            title: "Four lanes",
            description:
              "<b>ORDER NOW</b> under a month of cover, <b>WATCH</b> one to three months, <b>HEALTHY</b>, and <b>OVERSTOCKED</b> above max or past twelve " +
              "months. These four counters are the split; the columns underneath list each lane's vendors with the net units to buy.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#plannerContent div[onclick^='toggleLaneVendor']",
          waitForLane: true,
          req: { plannerOpen: true, plannerTab: "lanes", laneOpen: false },
          popover: { title: "Try it: open a vendor in ORDER NOW", description: "Click the first vendor in the ORDER NOW lane to see which of its items are about to run out.", side: "right", align: "start" }
        },
        {
          element: "#tourLaneItems",
          req: { plannerOpen: true, plannerTab: "lanes", laneOpen: true },
          popover: { title: "The items in the lane", description: "One card per item with the net units to buy. This is the morning check: the ORDER NOW lane is what gets ordered today. Click a card to open its window.", side: "right", align: "start" }
        },
        /* ---- Container Planner section ---- */
        {
          element: "#fgVendor",
          waitForVendorPick: true,
          pulse: "#vendorSearchInput",
          scrollTop: true,
          req: { plannerOpen: false, modal: false, adv: false, vendor: "" },
          popover: {
            title: "Try it: pick an imported vendor",
            description:
              "Container planning only works for vendors whose items carry cubic-metre data; in this company those are the overseas makers, " +
              "<b>V-20001 to V-20008</b>. Click in the Vendor box, the list shows every supplier, and pick one of them, for example <b>" + HERO_VENDOR +
              " " + HERO_VENDOR_NAME + "</b>, the house brand. The Container Planning section then appears under the table.",
            side: "bottom", align: "start"
          }
        },
        {
          element: "#containerSection",
          req: { plannerOpen: false, modal: false, adv: false },
          popover: {
            title: "Container Planner",
            description:
              "The question here: how much of a 65 cubic-metre container does the buying for this vendor fill, and how do we fill the rest properly? " +
              "The method buttons on the left switch the forecast behind it.",
            side: "top", align: "center"
          }
        },
        { element: "#containerPeriod", popover: { title: "How far ahead", description: "3, 6 or 12 months, or a custom span. Three months is the default; six suits an overseas supplier with a two to three month lead time.", side: "bottom", align: "start" } },
        { element: "#containerPctInput", popover: { title: "Safety uplift", description: "A percentage cushion on top of the forecast. The quick buttons give 0 to 50 percent. We'll leave it at zero.", side: "bottom", align: "start" } },
        { element: "#fillContainerBtn", waitForContainerResult: true, popover: { title: "Try it: click Optimize Containers", description: "Click the highlighted button. The tool rounds every line to full cartons and tops the order up to a full container with the lines that run out soonest.", side: "bottom", align: "start" } },
        { element: "#containerSummary", req: { optimised: true }, popover: { title: "Container summary", description: "Total cubic metres, how many containers that is, the space left in the last one and how full they are.", side: "bottom", align: "start" } },
        { element: "#containerContent", req: { optimised: true }, popover: { title: "The load plan", description: "One row per item: net to purchase, carton size, cartons to order, units, cubic metres each and in total. Edit the cartons and the totals follow.", side: "top", align: "center" } },
        { element: "#predictForecastBtn", waitForPredicted: true, req: { optimised: true }, popover: { title: "Try it: click Predicted Forecast", description: "Click the button. It is built from the adjusted container quantities, so it only works after an optimise.", side: "bottom", align: "start" } },
        { element: "#predictedForecastPanel", req: { optimised: true, predicted: true }, popover: { title: "Predicted forecast", description: "What the container order means month by month: for each item in the plan, the quantity on the way against the forecast, so you can see how long the shipment lasts and which lines need the next order first.", side: "top", align: "center" } },
        /* ---- header controls ---- */
        { element: "#wsToggleWrap", noExpand: true, scrollTop: true, req: { modal: false, adv: false, plannerOpen: false }, popover: { title: "Tab view", description: "Tab view is off, so everything sits on one long page. Flip it on and the same tool becomes tabs with the filters across the top. The tour works in either layout.", side: "bottom", align: "start" } },
        { element: "#themeBtn", noExpand: true, req: { modal: false, adv: false, plannerOpen: false }, popover: { title: "Themes", description: "Ten looks for the same tool, from a dark boardroom to a brutalist orange. Saved on this device.", side: "bottom", align: "start" } },
        { element: "#helpBtn", noExpand: true, req: { modal: false, adv: false, plannerOpen: false }, popover: { title: "Help mode", description: "Switch it on and hover anything on the page for a plain-language explanation of what it is and how to read it.", side: "bottom", align: "start" } },
        { req: { modal: false, adv: false, plannerOpen: false, vendor: "", search: "" }, popover: { title: "That's the tour", description: "Open items, change the method or the horizon, pick another vendor for the container, flip to Tab view, pick a theme. Everything recalculates live. Replay this walk any time from <b>Take the tour</b>.", side: "over", align: "center" } }
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
    btn.innerHTML = "<span class='fc-tour-btn-icon' aria-hidden='true'>?</span><span class='fc-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () { startTour("auto", { force: true, resume: true }); });
    var header = document.querySelector(".header");
    if (header) { btn.classList.add("fc-tour-btn-in-header"); header.appendChild(btn); }
    else { btn.classList.add("fc-tour-btn-floating"); document.body.appendChild(btn); }
  }

  /* ---- generic waiter ------------------------------------- */
  function waitFor(test, after, maxMs, callback) {
    var startedAt = Date.now();
    (function check() {
      var ok = false;
      try { ok = !!test(); } catch (e) { ok = false; }
      if (ok) setTimeout(function () { if (after) { try { after(); } catch (e) {} } callback(); }, 260);
      else if (Date.now() - startedAt > maxMs) callback();
      else setTimeout(check, 150);
    })();
  }

  /* ---- item window ---------------------------------------- */
  function tagModal() {
    var content = document.getElementById("detailContent");
    if (!content) return;
    if (!document.getElementById("tourFcKpi")) {
      var cards = content.querySelectorAll("div");
      for (var k = 0; k < cards.length; k++) {
        if (firstText(cards[k]) === "Total Used" && cards[k].children.length === 0) {
          var kCard = cards[k].parentElement, kRow = kCard && kCard.parentElement;
          if (kRow && kRow !== content) { kRow.id = "tourFcKpi"; break; }
        }
      }
    }
    var monthsInput = document.getElementById("detailCustomMonths");
    if (monthsInput) {
      var node = monthsInput.parentElement;
      while (node && node !== content) {
        var firstH3 = node.querySelector(":scope > h3");
        if (firstH3 && /custom forecast/i.test(firstH3.textContent || "")) { if (!node.id) node.id = "tourFcCustomBlock"; break; }
        node = node.parentElement;
      }
    }
    content.querySelectorAll("h3").forEach(function (h) {
      var t = firstText(h);
      var block = h.parentElement || h;
      if (/^Inventory/i.test(t) && !block.id) block.id = "tourFcInventoryHead";
      else if (/^Net to Purchase/i.test(t) && !block.id) block.id = "tourFcNetHead";
      else if (/^Usage by Location/i.test(t) && !block.id) block.id = "tourFcUsageHead";
    });
    // the three usage cards of an item that is sold AND consumed in a kit
    if (!document.getElementById("tourFcAssembly")) {
      var labels = content.querySelectorAll("div");
      for (var i = 0; i < labels.length; i++) {
        if (/^Assembly Consumption\b/i.test(firstText(labels[i])) && labels[i].children.length === 0) {
          var card = labels[i].parentElement, row = card && card.parentElement;
          if (row && row !== content) { row.id = "tourFcAssembly"; break; }
        }
      }
    }
  }
  function modalOpen() { var m = document.getElementById("detailModal"); return !!(m && m.classList.contains("active")); }
  function openModal() {
    if (modalOpen()) return false;
    if (typeof window.showItemDetail !== "function") return false;
    try { window.showItemDetail(HERO); } catch (e) { return false; }
    tagModal();
    return true;
  }
  function closeModal() {
    if (!modalOpen()) return false;
    if (typeof window.closeDetail === "function") window.closeDetail(); else document.getElementById("detailModal").classList.remove("active");
    return true;
  }
  function waitForModal(cb) { waitFor(modalOpen, tagModal, 15000, cb); }

  /* ---- advanced methods popup ----------------------------- */
  function tagAdv() {
    var panel = document.getElementById("advModalContent");
    if (!panel) return;
    panel.querySelectorAll("h3").forEach(function (h) {
      var t = firstText(h), parent = h.parentElement;
      if (!parent) return;
      if (/^1\./.test(t) && !parent.id) parent.id = "tourAdvMethod1";
      else if (/^2\./.test(t) && !parent.id) parent.id = "tourAdvMethod2";
      else if (/^3\./.test(t) && !parent.id) parent.id = "tourAdvMethod3";
      else if (/^4\./.test(t) && !parent.id) parent.id = "tourAdvMethod4";
    });
  }
  function advOpen() { var m = document.getElementById("advModal"); return !!(m && m.classList.contains("active")); }
  function advReady() { return advOpen() && !!document.querySelector("#advModalContent h3"); }
  function openAdv() {
    if (advOpen() || !modalOpen() || typeof window.openAdvModal !== "function") return false;
    try { window.openAdvModal(); } catch (e) { return false; }
    tagAdv();
    return true;
  }
  function closeAdv() {
    if (!advOpen()) return false;
    if (typeof window.closeAdvModal === "function") window.closeAdvModal(); else document.getElementById("advModal").classList.remove("active");
    return true;
  }
  function waitForAdv(cb) { waitFor(advReady, tagAdv, 6000, cb); }

  /* ---- tabs, planner, lanes -------------------------------- */
  function tabReady(key) {
    if (currentTab() !== key) return false;
    if (key === "planner" || key === "lanes") return !!document.querySelector("#plannerContent *");
    if (key === "predicted") return !!document.querySelector("#wsPredictedHost *");
    if (key === "container") return isVisible(document.getElementById("wsContainerHint")) || isVisible(document.getElementById("containerSection"));
    return true;
  }
  function waitForTab(key) { return function (cb) { waitFor(function () { return tabReady(key); }, null, 12000, cb); }; }
  function selectTab(key) {
    if (currentTab() === key || typeof window.wsSelectTab !== "function") return false;
    try { window.wsSelectTab(key); } catch (e) { return false; }
    return true;
  }
  function plannerVendorOpen() { return !!g("wsPlannerVendor"); }
  function openPlannerVendor() {
    if (plannerVendorOpen()) return false;
    var tile = document.querySelector("#plannerContent .pv-tile");
    var m = tile && /openPlannerVendor\('([^']*)'\)/.exec(tile.getAttribute("onclick") || "");
    if (!m || typeof window.openPlannerVendor !== "function") return false;
    try { window.openPlannerVendor(m[1]); } catch (e) { return false; }
    return true;
  }
  function closePlannerVendor() {
    if (!plannerVendorOpen() || typeof window.wsPlannerVendorBack !== "function") return false;
    try { window.wsPlannerVendorBack(); } catch (e) { return false; }
    return true;
  }
  function waitForPlannerVendor(cb) { waitFor(function () { return plannerVendorOpen() && !!document.querySelector("#plannerContent table"); }, null, 10000, cb); }
  function waitForPlannerBack(cb) { waitFor(function () { return !plannerVendorOpen() && !!document.querySelector("#plannerContent .pv-tile"); }, null, 10000, cb); }
  function laneOpenCount() { var s = g("lanesOpenVendors"); return s && typeof s.size === "number" ? s.size : 0; }
  function tagLane() {
    var rows = document.querySelectorAll("#plannerContent div[onclick^='toggleLaneVendor']");
    for (var i = 0; i < rows.length; i++) {
      if (/^▾/.test(firstText(rows[i])) && rows[i].nextElementSibling) { rows[i].nextElementSibling.id = "tourLaneItems"; return; }
    }
  }
  function openLane() {
    if (laneOpenCount() > 0) { tagLane(); return false; }
    var row = document.querySelector("#plannerContent div[onclick^='toggleLaneVendor']");
    var m = row && /toggleLaneVendor\('([^']*)'\)/.exec(row.getAttribute("onclick") || "");
    if (!m || typeof window.toggleLaneVendor !== "function") return false;
    try { window.toggleLaneVendor(m[1]); } catch (e) { return false; }
    tagLane();
    return true;
  }
  function closeLanes() {
    var s = g("lanesOpenVendors");
    if (!s || !s.size) return false;
    try { s.clear(); if (typeof window.renderPlannerLanesView === "function") window.renderPlannerLanesView(); } catch (e) { return false; }
    return true;
  }
  function waitForLane(cb) { waitFor(function () { return laneOpenCount() > 0 && !!document.querySelector("#plannerContent div[onclick^='toggleLaneVendor'] + div"); }, tagLane, 8000, cb); }

  /* ---- classic page: planner popup, vendor popup, predicted panel ---- */
  function plannerModalOpen() { var m = document.getElementById("plannerModal"); return !!(m && m.classList.contains("active")); }
  function vendorModalOpen() { var m = document.getElementById("plannerVendorModal"); return !!(m && m.classList.contains("active")); }
  function setPlannerOpen(open) {
    if (open) { if (plannerModalOpen() || typeof window.openOrderPlanner !== "function") return false; try { window.openOrderPlanner(); } catch (e) { return false; } return true; }
    if (!plannerModalOpen()) return false;
    try { if (typeof window.closePlannerVendor === "function") window.closePlannerVendor(); if (typeof window.closePlanner === "function") window.closePlanner(); } catch (e) {}
    return true;
  }
  function setVendorModal(open) {
    if (open) {
      if (vendorModalOpen()) return false;
      var tile = document.querySelector("#plannerContent .pv-tile");
      var m = tile && /openPlannerVendor\('([^']*)'\)/.exec(tile.getAttribute("onclick") || "");
      if (!m || typeof window.openPlannerVendor !== "function") return false;
      try { window.openPlannerVendor(m[1]); } catch (e) { return false; }
      return true;
    }
    if (!vendorModalOpen()) return false;
    try { window.closePlannerVendor(); } catch (e) { return false; }
    return true;
  }
  function setPlannerTabTo(t) {
    if (g("plannerTab") === t || typeof window.setPlannerTab !== "function") return false;
    try { window.setPlannerTab(t); } catch (e) { return false; }
    return true;
  }
  function setPeriod(v) {
    var sel = document.getElementById("containerPeriod");
    if (!sel || sel.value === String(v)) return false;
    sel.value = String(v);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  function predictedShown() { return isVisible(document.getElementById("predictedForecastPanel")); }
  function showPredicted() {
    if (predictedShown() || typeof window.showPredictedForecast !== "function") return false;
    try { window.showPredictedForecast(); } catch (e) { return false; }
    return true;
  }
  function waitForPlannerModal(cb) { waitFor(function () { return plannerModalOpen() && !!document.querySelector("#plannerContent *"); }, null, 12000, cb); }
  function waitForVendorModal(cb) { waitFor(function () { return vendorModalOpen() && !!document.querySelector("#plannerVendorContent table"); }, null, 10000, cb); }
  function waitForPlannerTab(t) { return function (cb) { waitFor(function () { return g("plannerTab") === t && !!document.querySelector("#plannerContent *"); }, null, 10000, cb); }; }
  function waitForPredicted(cb) { waitFor(predictedShown, null, 8000, cb); }
  function inTabView() { return !!(document.body && document.body.classList.contains("ws-mode")); }

  /* ---- vendor, search, container --------------------------- */
  function currentVendor() { var v = g("selectedVendor"); return v || ""; }
  function setVendor(v) {
    var cur = currentVendor();
    if (v === "ANY") { if (cur) return false; v = HERO_VENDOR; }
    if (cur === v || typeof window.selectVendor !== "function") return false;
    try { window.selectVendor(v); } catch (e) { return false; }
    return true;
  }
  function setSearch(q) {
    var input = document.getElementById("searchInput");
    if (!input) return false;
    if ((input.value || "").trim().toUpperCase() === String(q).toUpperCase()) return false;
    input.value = q;
    // the box filters 250 ms after typing; Enter applies the filter straight away
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    var sug = document.getElementById("itemSuggest");
    if (sug) sug.classList.remove("open");
    return true;
  }
  function containerBuilt() {
    var s = document.getElementById("containerSummary"), c = document.getElementById("containerSection");
    return isVisible(c) && !!(s && s.textContent.trim());
  }
  function waitForVendor(cb) { waitFor(containerBuilt, null, 12000, cb); }
  // the visitor picks a vendor in the Vendor box; the tour waits as long as it takes
  function waitForVendorPick(cb) { waitFor(containerBuilt, null, 600000, cb); }
  function optimised() { var o = g("containerOptimized"); return !!o; }
  function optimise() {
    if (optimised() || typeof window.fillContainer !== "function") return false;
    try { window.fillContainer(); } catch (e) { return false; }
    return true;
  }
  function containerResultReady() {
    var content = document.getElementById("containerContent");
    return !!(content && content.querySelector("table")) && optimised();
  }
  function waitForContainerResult(cb) { waitFor(containerResultReady, null, 8000, cb); }
  function topOpen() { return !!(document.body && document.body.classList.contains("top-open")); }
  function setTop(open) {
    if (topOpen() === open || typeof window.wsToggleTop !== "function") return false;
    window.wsToggleTop();
    return true;
  }

  /* ---- put the page into the state a step needs ------------- */
  function reconcile(req) {
    if (!req) return false;
    var m = false;
    if (req.adv === false) m = closeAdv() || m;
    if (req.modal === false) { closeAdv(); m = closeModal() || m; }
    if (req.plannerVendorModal === false) m = setVendorModal(false) || m;
    if (req.plannerOpen === false) m = setPlannerOpen(false) || m;
    if ("search" in req) m = setSearch(req.search) || m;
    if (req.optimised && !optimised()) { if (inTabView()) { m = setVendor("ANY") || m; m = selectTab("container") || m; } m = optimise() || m; }
    if ("vendor" in req) m = setVendor(req.vendor) || m;
    if (req.tab && inTabView()) m = selectTab(req.tab) || m;
    if (req.plannerOpen === true) m = setPlannerOpen(true) || m;
    if ("plannerTab" in req) m = setPlannerTabTo(req.plannerTab) || m;
    if ("plannerVendor" in req) m = (req.plannerVendor ? openPlannerVendor() : closePlannerVendor()) || m;
    if (req.plannerVendorModal === true) m = setVendorModal(true) || m;
    if ("laneOpen" in req) m = (req.laneOpen ? openLane() : closeLanes()) || m;
    if ("period" in req) m = setPeriod(req.period) || m;
    if (req.predicted) m = showPredicted() || m;
    if ("top" in req) m = setTop(req.top) || m;
    if (req.modal === true) m = openModal() || m;
    if (req.modal === true && !document.getElementById("tourFcKpi")) tagModal();
    if (req.adv === true) m = openAdv() || m;
    if (req.adv === true && !document.getElementById("tourAdvMethod1")) tagAdv();
    if (req.laneOpen === true && !document.getElementById("tourLaneItems")) tagLane();
    return m;
  }

  function retag() { try { if (modalOpen()) tagModal(); if (advOpen()) tagAdv(); if (currentTab() === "lanes" || g("plannerTab") === "lanes") tagLane(); } catch (e) {} }

  /* ---- data load (the Login & Load click) ------------------ */
  function isLoaded() {
    var c = document.getElementById("controlsBar");
    return !!(c && c.style.display !== "none" && isVisible(c));
  }
  function waitForLoadComplete(cb) {
    waitFor(function () {
      var btn = document.getElementById("bcConnectBtn");
      return isLoaded() && btn && !btn.disabled && !/connecting|loading/i.test(btn.textContent || "");
    }, null, 120000, cb);
  }

  /* ---- tour driver ----------------------------------------- */
  var currentTour = null;
  function stopCurrentTour() {
    if (currentTour && currentTour.driver) { try { currentTour.driver.destroy(); } catch (e) {} }
    if (currentTour && currentTour.tearDown) currentTour.tearDown();
    currentTour = null;
  }

  function startTour(key, opts) {
    opts = opts || {};
    // the tour follows whichever layout is on: Tab view or the classic single page
    if (!key || key === "auto" || key === "overview" || !TOURS[key]) key = inTabView() ? "tabs" : "classic";
    var spec = TOURS[key];
    if (!spec) return;
    if (!opts.force && hasSeen(spec.seenKey)) return;
    if (!window.driver || !window.driver.js || !window.driver.js.driver) return;
    stopCurrentTour();

    var loaded = isLoaded();
    var stepsIn = spec.steps.filter(function (s) { return !(s.simulateLoad && loaded); });

    var attached = [];
    var pulsing = [];
    function pulseOn(el) { if (!el) return; el.classList.remove("driver-no-interaction"); el.classList.add("fc-tour-pulse"); pulsing.push(el); }
    function pulseOffAll() { for (var p = 0; p < pulsing.length; p++) { try { pulsing[p].classList.remove("fc-tour-pulse"); } catch (e) {} } pulsing.length = 0; }
    function detach() { for (var i = 0; i < attached.length; i++) { try { document.removeEventListener("click", attached[i], true); } catch (e) {} } attached.length = 0; }
    function advance() { go(lastIndex + 1); }

    var stepsOut = stepsIn.map(function (raw) {
      var waiter = raw.waitForAdvPanel ? waitForAdv
                 : raw.waitForVendorPick ? waitForVendorPick
                 : raw.waitForPlannerModal ? waitForPlannerModal
                 : raw.waitForVendorModal ? waitForVendorModal
                 : raw.waitForPlannerTab ? waitForPlannerTab(raw.waitForPlannerTab)
                 : raw.waitForPredicted ? waitForPredicted
                 : raw.waitForContainerResult ? waitForContainerResult
                 : raw.waitForTab ? waitForTab(raw.waitForTab)
                 : raw.waitForVendor ? waitForVendor
                 : raw.waitForPlannerVendor ? waitForPlannerVendor
                 : raw.waitForPlannerBack ? waitForPlannerBack
                 : raw.waitForLane ? waitForLane
                 : raw.waitForModal ? waitForModal
                 : raw.simulateLoad ? waitForLoadComplete
                 : null;
      if (!waiter && !raw.waitForClick) return raw;
      var s = Object.assign({}, raw);
      s.disableActiveInteraction = false;
      s.popover = Object.assign({}, raw.popover, { showButtons: ["previous", "close"] });
      s.onHighlighted = function (targetEl) {
        detach(); pulseOffAll();
        if (raw.waitForVendor && targetEl) {
          targetEl.classList.remove("driver-no-interaction");
          targetEl.querySelectorAll(".demo-vendor-chip").forEach(pulseOn);
        } else if (raw.pulse && targetEl) {
          targetEl.classList.remove("driver-no-interaction");
          pulseOn(targetEl.querySelector(raw.pulse) || targetEl);
        } else pulseOn(targetEl);
        var selector = raw.element;
        if (raw.waitForVendorPick) { waiter(function () { pulseOffAll(); advance(); }); return; }
        var handler = function (ev) {
          var target = ev.target;
          if (!selector || !target || !target.closest || !target.closest(selector)) return;
          if (raw.waitForVendor && !target.closest(".demo-vendor-chip")) return;
          detach(); pulseOffAll();
          if (waiter) waiter(advance); else setTimeout(advance, 300);
        };
        document.addEventListener("click", handler, true);
        attached.push(handler);
      };
      return s;
    });

    var lastIndex = 0;
    var skipMutations = false;
    var d = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      allowKeyboardControl: false,
      disableActiveInteraction: true,
      animate: true,
      scrollIntoViewOptions: { behavior: "smooth", block: "nearest", inline: "nearest" },
      onNextClick: function () { go(lastIndex + 1); },
      onPrevClick: function () { go(lastIndex - 1); },
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
        var idx = (ctx && ctx.state && typeof ctx.state.activeIndex === "number") ? ctx.state.activeIndex : lastIndex;
        lastIndex = idx;
        setResume(key, stepId(stepsOut[idx], idx));
        detach(); pulseOffAll();
      },
      onDestroyed: function () {
        markSeen(spec.seenKey);
        var reachedEnd = lastIndex >= stepsOut.length - 1;
        if (reachedEnd) setResume(key, null);
        cleanup();
        currentTour = null;
      }
    });

    var going = false;
    function go(target, dir) {
      if (going) return;
      if (target >= stepsOut.length) { try { d.destroy(); } catch (e) {} return; }
      if (target < 0) return;
      dir = dir || (target >= lastIndex ? 1 : -1);
      var st = stepsOut[target];
      var mutated = false;
      try { mutated = reconcile(st.req); } catch (e) {}
      if (st.optional && st.element && !document.querySelector(st.element)) { go(target + dir, dir); return; }   // nothing to show: skip it
      if (st.scrollTop) { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); } }
      if (!mutated) { lastIndex = target; try { d.moveTo(target); } catch (e) {} return; }
      // the page was changed for this step: give it one frame to lay out, then show the step
      going = true;
      var t0 = Date.now();
      (function tick() {
        retag();
        var ready = !st.element || document.querySelector(st.element);
        if (ready || Date.now() - t0 > 600) {
          requestAnimationFrame(function () { going = false; lastIndex = target; try { d.moveTo(target); } catch (e) {} });
        } else requestAnimationFrame(tick);
      })();
    }

    function cleanup() {
      document.removeEventListener("keydown", keyGuard, true);
      pulseOffAll();
      detach();
    }
    function keyGuard(ev) {
      if (!currentTour || currentTour.driver !== d) return;
      var step = stepsOut[lastIndex];
      if (ev.key === "Escape") { ev.preventDefault(); try { d.destroy(); } catch (e) {} return; }
      if (ev.key === "ArrowRight" || ev.key === "Enter" || ev.key === " ") {
        if (ev.target && /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName)) return;
        ev.preventDefault(); ev.stopPropagation();
        if (step && step.popover && step.popover.showButtons && step.popover.showButtons.indexOf("next") < 0) return;   // click-to-advance step
        go(lastIndex + 1);
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault(); ev.stopPropagation();
        go(lastIndex - 1);
      }
    }
    document.addEventListener("keydown", keyGuard, true);

    var startAt = 0;
    if (opts.resume) {
      var savedId = getResume(key);
      if (savedId) for (var i = 0; i < stepsOut.length; i++) { if (stepId(stepsOut[i], i) === savedId) { startAt = i; break; } }
    }
    currentTour = { key: key, driver: d, tearDown: cleanup };
    lastIndex = startAt;
    try { reconcile(stepsOut[startAt].req); } catch (e) {}
    requestAnimationFrame(function () { retag(); try { d.drive(startAt); } catch (e) {} });
  }

  window.startForecastTour = startTour;
  window.forecastTours = TOURS;

  /* ---- start-up --------------------------------------------- */
  function whenSignedIn(callback) {
    var startedAt = Date.now();
    (function check() {
      var o = document.getElementById("signinOverlay");
      var gone = !o || o.style.display === "none" || !isVisible(o);
      if (gone || Date.now() - startedAt > 60000) setTimeout(callback, 350); else setTimeout(check, 150);
    })();
  }
  function loadDriverThen(callback) {
    if (window.driver && window.driver.js) { callback(); return; }
    var s = document.createElement("script");
    s.src = DRIVER_JS;
    s.onload = callback;
    document.head.appendChild(s);
  }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn();
  }
  ready(function () {
    injectTourButton();
    loadDriverThen(function () {
      var begin = function (mode) {
        if (mode !== "tour") return;
        whenSignedIn(function () { startTour("auto", { force: true }); });
      };
      if (window.DemoChooser && typeof window.DemoChooser.whenChosen === "function") window.DemoChooser.whenChosen(begin);
      else document.addEventListener("demo:mode", function (e) { begin(e.detail && e.detail.mode); });
    });
  });
})();
