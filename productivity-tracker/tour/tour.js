/* ============================================================
   Guided tour for the productivity-tracker demo.
   Powered by Driver.js (https://driverjs.com) — MIT license.

   Three tabs: Sales/Warehouse/Sheetmetal (form), View Records
   (table), Analytics (charts). One tour per tab; the tour for a
   tab fires the first time the user opens that tab.
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

  function hasSeen(k)  { try { return localStorage.getItem(k) === "1"; } catch (e) { return false; } }
  function markSeen(k) { try { localStorage.setItem(k, "1"); } catch (e) {} }
  function resumeKey(k) { return "prodTour_" + k + "_resumeAt"; }
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

  /* ================================================================
     TOUR REGISTRY — one per tab
     ================================================================ */
  var TOURS = {

    /* ---------------- SALES / WAREHOUSE / SHEETMETAL ---------------- */
    saleswarehouse: {
      seenKey: "prodTour_saleswarehouse_v1",
      steps: [
        {
          popover: {
            title: "Welcome to Productivity Tracker",
            description:
              "Quick tour of the interface. This tool logs and analyses " +
              "day-to-day issues across Sales, Warehouse, and Sheetmetal — " +
              "who caused what, who resolved it, how long it took. " +
              "We'll walk through each tab.",
            side: "over",
            align: "center"
          }
        },
        {
          element: ".nav-tabs",
          popover: {
            title: "Three tabs",
            description:
              "<b>Sales/Warehouse/Sheetmetal</b> — log a new issue (this tab). " +
              "<b>View Records</b> — browse everything that's been logged. " +
              "<b>Analytics</b> — charts + KPIs. Each tab gets its own " +
              "short intro the first time you open it.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#issue-form-saleswarehouse",
          popover: {
            title: "Log a new issue",
            description:
              "The main form. Fill in the fields top-to-bottom: date, " +
              "sales order number, customer, who logged it, what the " +
              "concern is, and whether it's already been resolved.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#issue-form-saleswarehouse [name='concern'], #issue-form-saleswarehouse select.form-concern",
          popover: {
            title: "Concern type",
            description:
              "Grouped by department. Once you pick a concern, the two " +
              "<b>responsible-user</b> fields auto-fill with the people " +
              "who own that type of issue — no need to guess who to assign it to.",
            side: "top",
            align: "center"
          }
        },
        {
          element: ".nav-tab:nth-child(2)",
          popover: {
            title: "Try the Records tab next →",
            description:
              "Click <b>View Records</b> in the nav bar — you'll get a " +
              "short intro to the records table.",
            side: "bottom",
            align: "start"
          }
        }
      ]
    },

    /* ---------------- VIEW RECORDS ---------------- */
    records: {
      seenKey: "prodTour_records_v1",
      steps: [
        {
          popover: {
            title: "View Records",
            description:
              "Every issue that's been logged, in one sortable / filterable " +
              "table.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#filter-branch",
          popover: {
            title: "Filter bar",
            description:
              "Narrow the table by branch, department, user (assigned or " +
              "logged-by), resolution state, or a date window. Filters " +
              "combine — pick as many as you like.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#records-body",
          popover: {
            title: "Records table",
            description:
              "One row per issue. <b>Click any column header</b> to sort. " +
              "Click a row to open the full detail (customer, concern, " +
              "resolution status, comments). Empty state shows if filters " +
              "leave nothing to display.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#admin-lock-btn",
          popover: {
            title: "Admin mode",
            description:
              "Click the lock to enter admin password. Unlocks record " +
              "export (JSON) and a Clear-All-Data button — hidden by " +
              "default so regular users can't wipe history.",
            side: "left",
            align: "start"
          }
        },
        {
          element: ".nav-tab:nth-child(3)",
          popover: {
            title: "Last stop: Analytics →",
            description:
              "Click <b>Analytics</b> in the nav bar for the charts view.",
            side: "bottom",
            align: "start"
          }
        }
      ]
    },

    /* ---------------- ANALYTICS ---------------- */
    analytics: {
      seenKey: "prodTour_analytics_v1",
      steps: [
        {
          popover: {
            title: "Analytics",
            description:
              "Ten charts + five KPI cards derived from every logged " +
              "issue. All respect the filter bar at the top of the page.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#analytics-branch",
          popover: {
            title: "Analytics filters",
            description:
              "Filter every KPI and chart by <b>branch</b>, <b>department</b>, " +
              "<b>period</b> (week / month / quarter / all time), or a " +
              "specific user. Everything below re-renders when you change these.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#total-issues",
          popover: {
            title: "KPI cards",
            description:
              "Total issues, resolved / unresolved counts, resolution " +
              "rate, and unique customers affected. <b>Click any KPI</b> " +
              "(where the cursor changes) to open a filtered detail popup.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#departmentChart",
          popover: {
            title: "Chart grid",
            description:
              "Ten breakdowns: department, responsible users (1st + 2nd), " +
              "who logged it, concern type, time trend, current resolution " +
              "status, initial resolution state, resolved-via-comments, " +
              "and customer distribution. <b>Click any bar / slice</b> to " +
              "drill into the underlying issues.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#timelineChart",
          popover: {
            title: "Time trend",
            description:
              "Issues over time — good for spotting bad weeks / months. " +
              "The bucket size adapts to the selected period.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#prodTourBtn",
          popover: {
            title: "That's the tour!",
            description:
              "You've seen all three tabs. Explore the charts, submit a " +
              "test issue, or filter the records table. Re-run this tour " +
              "any time from this button.",
            side: "left",
            align: "start"
          }
        }
      ]
    }
  };

  /* ---- "Take the tour" button ----------------------------- */
  function injectTourButton() {
    if (document.getElementById("prodTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "prodTourBtn";
    btn.type = "button";
    btn.className = "pt-tour-btn";
    btn.title = "Replay the guided tour";
    btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='pt-tour-btn-icon' aria-hidden='true'>?</span>" +
                    "<span class='pt-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () {
      var activeTab = document.querySelector(".nav-tab.active");
      var key = tabNameFromButton(activeTab) || "saleswarehouse";
      if (!TOURS[key]) key = "saleswarehouse";
      startTour(key, { force: true, resume: true });
    });
    var header = document.querySelector(".header");
    if (header) {
      btn.classList.add("pt-tour-btn-in-header");
      header.appendChild(btn);
    } else {
      btn.classList.add("pt-tour-btn-floating");
      document.body.appendChild(btn);
    }
  }

  // Extract "saleswarehouse" / "records" / "analytics" from onclick="showSection('X')"
  function tabNameFromButton(btn) {
    if (!btn) return null;
    var attr = btn.getAttribute("onclick") || "";
    var m = attr.match(/showSection\(\s*['\"]([^'\"]+)['\"]\s*\)/);
    return m ? m[1] : null;
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

    var stepsIn = spec.steps.filter(function (s) {
      if (!s.element) return true;
      var el = document.querySelector(s.element);
      return el && el.offsetParent !== null;
    });
    if (!stepsIn.length) return;

    var lastIndex = 0;
    var d = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "pt-tour-popover",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish",
      progressText: "Step {{current}} of {{total}}",
      steps: stepsIn,
      onHighlightStarted: function (element, step, ctx) {
        var idx = (ctx && ctx.state && typeof ctx.state.activeIndex === "number")
          ? ctx.state.activeIndex : lastIndex;
        lastIndex = idx;
        setResume(key, stepId(stepsIn[idx], idx));
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

  window.startProdTour = startTour;
  window.prodTours = TOURS;

  /* ---- watch tab changes --------------------------------- */
  function watchTabChanges() {
    var tabs = document.querySelectorAll(".nav-tab");
    if (!tabs.length) return;
    var obs = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.attributeName !== "class") continue;
        var el = r.target;
        if (!el.classList.contains("active")) continue;
        var key = tabNameFromButton(el);
        if (key && TOURS[key]) {
          // Small delay so the section content becomes visible / renders
          // (Analytics runs updateAnalytics on tab-switch) before we start.
          setTimeout(function (k) { return function () { startTour(k); }; }(key), 400);
        }
      }
    });
    tabs.forEach(function (t) {
      obs.observe(t, { attributes: true, attributeFilter: ["class"] });
    });
  }

  /* ---- bootstrap ----------------------------------------- */
  function loadDriverThen(cb) {
    var s = document.createElement("script");
    s.src = DRIVER_JS;
    s.onload = cb;
    s.onerror = function () { console.error("[prod-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  ready(function () {
    injectTourButton();
    watchTabChanges();
    loadDriverThen(function () {
      // No loading overlay in this demo — start on the default tab.
      startTour("saleswarehouse");
    });
  });
})();
