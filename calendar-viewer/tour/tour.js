/* ============================================================
   Guided tour for the calendar-viewer demo.
   Powered by Driver.js (https://driverjs.com) — MIT license.

   Read-only calendar built on FullCalendar. The tour walks
   through the calendar grid, view switcher, team-source toggles,
   navigation controls, and the upcoming-events sidebar.
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
  function resumeKey(k) { return "calTour_" + k + "_resumeAt"; }
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
     Single tour — the whole app is one view.
     ================================================================ */
  var TOURS = {
    overview: {
      seenKey: "calTour_overview_v2",
      steps: [
        {
          popover: {
            title: "Welcome to Team Appointments",
            description:
              "Quick tour of the calendar. This is a read-only view of the " +
              "team's Outlook appointments — updates flow in automatically " +
              "from the source calendar. Nothing you click here changes the " +
              "underlying data.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#page-title",
          popover: {
            title: "Header",
            description:
              "The page title and a live status line (below it) showing " +
              "how many events are currently loaded.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: ".fc-header-toolbar",
          popover: {
            title: "Calendar toolbar",
            description:
              "Everything you need to navigate: previous / next / <b>today</b> " +
              "arrows on the left, view switcher on the right, and (in the " +
              "middle) team-source toggles.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: ".fc-prev-button, .fc-next-button",
          popover: {
            title: "Navigate weeks / months",
            description:
              "<b>←</b> and <b>→</b> move by the current view's unit " +
              "(month if you're on Month, week if you're on Week, etc). " +
              "The <b>today</b> button between them jumps back to the current date.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: ".fc-dayGridMonth-button, .fc-timeGridWeek-button, .fc-timeGridDay-button, .fc-listWeek-button",
          popover: {
            title: "View switcher",
            description:
              "Switch between <b>Month</b> grid, <b>Week</b> timeline, " +
              "<b>Day</b> timeline, and <b>List / Agenda</b> view. Each is " +
              "better for a different question — Month for planning, Week " +
              "for daily flow, List for skimming what's coming up.",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: ".fc-toggleCommercial-button",
          popover: {
            title: "Team 1 filter",
            description:
              "Toggle Team 1 (Commercial) appointments on/off. Their events " +
              "appear in <b>green</b>. Turn off to see only the other team.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: ".fc-toggleResidential-button",
          popover: {
            title: "Team 2 filter",
            description:
              "Toggle Team 2 (Residential) appointments on/off. Their events " +
              "appear in <b>orange</b>. Combine the two toggles to focus on " +
              "one team at a time.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#calendar",
          popover: {
            title: "Calendar grid",
            description:
              "Every appointment shows up here. <b>Hover</b> for a quick " +
              "preview tooltip (time, location). <b>Click</b> to open the " +
              "full detail modal with customer info and any linked stats. " +
              "Public holidays are amber and mixed into the same view.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#sidebar",
          popover: {
            title: "Upcoming preview",
            description:
              "The next ten appointments across both teams, ordered by " +
              "start time. Handy for a quick 'what's next' glance without " +
              "flipping through the calendar.",
            side: "left",
            align: "start"
          }
        },

        /* ---- Interactive: click Customer 134's event → open detail modal ----
           preferredEventText tries to find the specific event containing
           "Customer 134" and tag it as the highlight target. If it's not in
           the current calendar view, we silently fall back to any .fc-event. */
        {
          element: ".fc-event",
          waitForModal: true,
          preferredEventText: "Customer 134",
          postModal: true,
          popover: {
            title: "Try it: click Customer 134",
            description:
              "The event for <b>Customer 134</b> is highlighted as a " +
              "walk-through example. Click it to open the case view — the " +
              "tour continues inside the popup.",
            side: "top",
            align: "center"
          }
        },

        /* ---- Event-detail modal walkthrough ----
           postModal:true keeps these steps in the tour even though their
           targets are hidden / non-existent until the modal opens. */
        {
          element: ".modal-title",
          postModal: true,
          popover: {
            title: "Event title",
            description:
              "The subject line as it appears in Outlook (e.g. <i>“Customer 134 " +
              "– Site survey – new build”</i>). Whatever's in the calendar " +
              "invite lands here — the tool doesn't rename anything.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: ".modal-meta",
          postModal: true,
          popover: {
            title: "When + which calendar",
            description:
              "<b>Start</b> and <b>End</b> in your local timezone, plus which " +
              "shared calendar the event lives on (Team 1 / Team 2). If a " +
              "location was set on the invite, it shows here too.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: ".modal-customer-name, .modal-customer",
          postModal: true,
          popover: {
            title: "Customer banner",
            description:
              "The tool extracts <b>Customer 134</b> from the event title, " +
              "looks it up in the linked quote databases, and pulls in every " +
              "quote / project that customer has ever had — split by team. " +
              "If the event title doesn't contain a matchable customer number, " +
              "the panels below stay empty.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: ".modal-col-title.comm",
          postModal: true,
          popover: {
            title: "Team 1 Project stats",
            description:
              "Every <b>Team 1</b> quote for this customer, grouped into four " +
              "buckets:<br>" +
              "• <b>WON</b> — signed, in the pipeline as revenue<br>" +
              "• <b>LOST</b> — bid but didn't get<br>" +
              "• <b>FOLLOW-UP</b> — currently open, needs a next step<br>" +
              "• <b>OTHER</b> — anything not in the three above (on-hold, cancelled, etc.)<br>" +
              "Each row reads <i>Category · number of quotes · total value</i>. " +
              "The header <b>Total</b> line summarises everything.",
            side: "right",
            align: "start"
          }
        },
        {
          element: ".modal-col-title.res",
          postModal: true,
          popover: {
            title: "Team 2 Project stats",
            description:
              "Same WON / LOST / FOLLOW-UP / OTHER breakdown for <b>Team 2</b>. " +
              "Having both teams side-by-side is the whole point of this " +
              "screen — before a Team 1 site visit you can see at a glance " +
              "whether Team 2 has already quoted this customer, what they " +
              "won, and what's still in follow-up.",
            side: "left",
            align: "start"
          }
        },
        {
          element: ".source-toggles",
          postModal: true,
          popover: {
            title: "Database 1 / Database 2 toggles",
            description:
              "The quotes above can come from <b>two separate quote systems</b> " +
              "(current + legacy). The pills switch which source you're " +
              "looking at, and clicking one instantly re-totals the WON / " +
              "LOST / FOLLOW-UP / OTHER rows above. Turn both on to see the " +
              "combined history, turn one off to compare.",
            side: "top",
            align: "center"
          }
        },
        {
          closeModalFirst: true,
          popover: {
            title: "That's the tour!",
            description:
              "You've seen the whole tool: navigate the calendar, filter by " +
              "team, and dive into any event for its full customer context. " +
              "Re-run this tour any time from the <b>? Take the tour</b> " +
              "button in the bottom-right.",
            side: "over",
            align: "center"
          }
        }
      ]
    }
  };

  /* ---- "Take the tour" button ----------------------------- */
  function injectTourButton() {
    if (document.getElementById("calTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "calTourBtn";
    btn.type = "button";
    btn.className = "cv-tour-btn cv-tour-btn-floating";
    btn.title = "Replay the guided tour";
    btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='cv-tour-btn-icon' aria-hidden='true'>?</span>" +
                    "<span class='cv-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () {
      startTour("overview", { force: true, resume: true });
    });
    // No obvious header container — float it bottom-right so it's out of the way.
    document.body.appendChild(btn);
  }

  /* ---- Locate the walk-through target event --------------- */
  // Look for an .fc-event whose text contains the given customer name
  // (case-insensitive). Tag it with a stable id so the tour can target it.
  // Returns the tagged element, or null if nothing matched (the calendar
  // may be on a different month/view than the target event).
  function findAndTagPreferredEvent(text) {
    if (!text) return null;
    var events = document.querySelectorAll(".fc-event");
    var needle = text.toLowerCase();
    for (var i = 0; i < events.length; i++) {
      var t = (events[i].textContent || "").toLowerCase();
      if (t.indexOf(needle) !== -1) {
        if (!events[i].id) events[i].id = "tourCalTargetEvent";
        return events[i];
      }
    }
    return null;
  }

  /* ---- Event-detail modal helpers ------------------------- */
  function isEventModalOpen() {
    var m = document.getElementById("modal-overlay");
    return !!(m && m.classList.contains("show"));
  }
  function waitForEventModal(callback) {
    var MAX_MS = 15000;
    var startedAt = Date.now();
    (function check() {
      if (isEventModalOpen()) {
        // Give the modal-body innerHTML a moment to render.
        setTimeout(callback, 200);
      } else if (Date.now() - startedAt > MAX_MS) {
        callback();
      } else {
        setTimeout(check, 150);
      }
    })();
  }
  function closeEventModal() {
    var m = document.getElementById("modal-overlay");
    if (m) m.classList.remove("show");
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
      // Modal-content steps: keep them regardless — their targets only
      // exist / become visible after the interactive "click an event"
      // step opens the detail modal.
      if (s.postModal) return true;
      var el = document.querySelector(s.element);
      return el && el.offsetParent !== null;
    });
    if (!stepsIn.length) return;

    // Wrap steps that need special behaviour.
    var attached = [];
    var stepsOut = stepsIn.map(function (raw) {
      if (!raw.waitForModal) return raw;
      var s = Object.assign({}, raw);
      // If the step names a preferred event (e.g. Customer 134), try to
      // find and tag it now — before Driver.js queries the element.
      if (raw.preferredEventText) {
        var tagged = findAndTagPreferredEvent(raw.preferredEventText);
        if (tagged) s.element = "#tourCalTargetEvent";
      }
      s.disableActiveInteraction = false;
      s.popover = Object.assign({}, raw.popover, {
        showButtons: ["previous", "close"]  // no Next — user clicks the event
      });
      s.onHighlighted = function (targetEl) {
        if (!targetEl) return;
        try { targetEl.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
        var handler = function () {
          targetEl.removeEventListener("click", handler, true);
          waitForEventModal(function () {
            if (currentTour && currentTour.driver) {
              try { currentTour.driver.moveNext(); } catch (e) {}
            }
          });
        };
        targetEl.addEventListener("click", handler, true);
        attached.push({ el: targetEl, handler: handler });
      };
      return s;
    });

    var lastIndex = 0;
    var d = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "cv-tour-popover",
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
        if (stepsOut[idx] && stepsOut[idx].closeModalFirst) closeEventModal();
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

  window.startCalendarTour = startTour;
  window.calendarTours = TOURS;

  /* ---- wait for FullCalendar + data to be ready ---------- */
  // The demo fetches calendar-data.json and calls FullCalendar's render.
  // Status flips from "Loading…" to something like "47 events loaded · live"
  // once the calendar has rendered. Poll for that + for the toolbar's
  // presence in the DOM before starting the tour.
  function whenReady(callback) {
    var MAX_MS = 30000;
    var startedAt = Date.now();
    (function check() {
      var toolbar = document.querySelector(".fc-header-toolbar");
      var status  = document.getElementById("status");
      var loading = status && /loading/i.test(status.textContent || "");
      if ((toolbar && !loading) || Date.now() - startedAt > MAX_MS) {
        callback();
      } else {
        setTimeout(check, 200);
      }
    })();
  }

  /* ---- bootstrap ----------------------------------------- */
  function loadDriverThen(cb) {
    var s = document.createElement("script");
    s.src = DRIVER_JS;
    s.onload = cb;
    s.onerror = function () { console.error("[cal-tour] Driver.js failed to load"); };
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
