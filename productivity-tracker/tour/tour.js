/* ============================================================
   Guided tour for the Productivity Tracker demo (Demo Apps 5, Nov 2026).
   Powered by Driver.js (https://driverjs.com), MIT licence.

   One continuous tour across the three tabs, built like the sales and
   forecast tours:
     - every step says which state the page must be in (`req`: tab, sample
       form, open window, admin mode, open resolution form) and the tour
       puts the page in that state before the step shows, so Back and Next
       work in both directions;
     - "click" steps wait for the visitor's own click (red pulse on the
       thing to click, no Next button, keys cannot skip them);
     - red X closes the tour, "Take the tour" resumes where it stopped.

   The Demo Apps 3 version (three short per-tab tours) is kept next to
   this file as _tour_demo3_backup.js.
   ============================================================ */
(function () {
  var DRIVER_JS  = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js";
  var DRIVER_CSS = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css";

  function addStylesheet(href) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l);
  }
  addStylesheet(DRIVER_CSS);

  var S = window.__DEMO_STORY__ || {};
  var HERO_CUST = S.hero_customer || { no: "", name: "" };
  var HERO_PERSON = S.hero_person || "";
  var CHECKER = S.checker || "";
  var LOGGER = S.logger || "";
  var HERO_DAY = S.hero_day || "2026-08-11";
  var HERO_CONCERN = S.hero_concern || "";
  var DEPTS = S.departments || [];
  function listDepts() { return DEPTS.length > 1 ? "<b>" + DEPTS.slice(0, -1).join("</b>, <b>") + "</b> and <b>" + DEPTS[DEPTS.length - 1] + "</b>" : ""; }
  var UNRES_ID = S.tour_unresolved_id || "";
  var UNKNOWN_ID = S.tour_unknown_id || "";
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function longDay(iso) { var p = iso.split("-"); return parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1]; }
  function monthName(ym) { return MONTHS[parseInt(String(ym).split("-")[1], 10) - 1]; }

  /* ---- helpers -------------------------------------------- */
  var SEEN = "prodTour_ironbark_v1", RESUME = "prodTour_ironbark_resumeAt";
  function markSeen() { try { localStorage.setItem(SEEN, "1"); } catch (e) {} }
  function getResume() { try { return sessionStorage.getItem(RESUME); } catch (e) { return null; } }
  function setResume(id) { try { if (id == null) sessionStorage.removeItem(RESUME); else sessionStorage.setItem(RESUME, id); } catch (e) {} }
  function stepId(step, i) { return (step.popover && step.popover.title) ? "t:" + step.popover.title : "i:" + i; }
  function g(name) { try { return (0, eval)("typeof " + name + " === 'undefined' ? undefined : " + name); } catch (e) { return undefined; } }
  function $(s) { return document.querySelector(s); }
  function shown(id) { var m = document.getElementById(id); return !!(m && m.classList.contains("show")); }

  /* ---- page state ----------------------------------------- */
  var TAB_N = { logissue: 1, records: 2, analytics: 3 };
  function currentTab() {
    var s = $(".section.active"); return s ? s.id.replace(/-section$/, "") : "";
  }
  function setTab(key) {
    if (currentTab() === key) return false;
    var b = $(".nav-tab:nth-child(" + TAB_N[key] + ")"); if (b) b.click();
    return true;
  }

  // the Log Issue form: 0 empty, 1 order + customer + logged by, 2 concern picked (the "who is responsible" window is open), 3 confirmed
  var formLevel = 0;
  function setForm(level) {
    if (level === formLevel) return false;
    var form = document.getElementById("issue-form-logissue"); if (!form) return false;
    var modal = document.getElementById("responsible-user-modal");
    if (modal) modal.classList.remove("show");
    try { resetForm("logissue"); } catch (e) {}
    if (level >= 1) {
      form.querySelector(".form-order-no").value = "ORD-117264";
      form.querySelector(".customer-search").value = HERO_CUST.no + " - " + HERO_CUST.name;
      form.querySelector(".customer-value").value = HERO_CUST.no + "|" + HERO_CUST.name;
      form.querySelector(".form-logged-by").value = LOGGER;
    }
    if (level >= 2) {
      var c = form.querySelector(".form-concern");
      c.value = HERO_CONCERN;
      try { onConcernSelected(c); } catch (e) {}
      document.getElementById("responsible-user-select").value = S.sample_resp || HERO_PERSON;
      document.getElementById("responsible-user-select-2").value = CHECKER;
    }
    if (level >= 3) {
      try { confirmResponsibleUser(); } catch (e) {}
      form.querySelector(".form-resolved").value = "No";
    }
    formLevel = level;
    return true;
  }

  function isAdmin() { return !!window.isAdminMode; }      // always false in the demo: the padlock is locked
  function setAdmin() { return false; }

  function openRow() { var id = g("currentExpandedIssueId"); return id == null ? "" : String(id); }
  function rowEl(id) { return document.getElementById("resolution-row-" + id); }
  function setRes(id) {
    var cur = openRow();
    var curShown = cur && rowEl(cur) && rowEl(cur).style.display !== "none";
    if (!id) {
      if (!curShown) return false;
      try { toggleResolutionForm(cur); } catch (e) {}
      return true;
    }
    if (curShown && cur === String(id)) return false;
    if (!rowEl(id)) { clearRecordFilters(); }
    if (!rowEl(id)) return false;
    try { toggleResolutionForm(String(id)); } catch (e) {}
    return true;
  }
  function clearRecordFilters() {
    ["filter-branch", "filter-department", "filter-user", "filter-resolved", "filter-date-from", "filter-date-to"].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.value = "";
    });
    try { filterRecords(); } catch (e) {}
  }

  // windows: null | "password" | "edit" | "issues:<type>" | "calendar" | "day"  (the "who is responsible" window follows the form level)
  function currentModal() {
    if (shown("issues-modal") && shown("calendar-modal")) return "day";
    if (shown("calendar-modal")) return "calendar";
    if (shown("issues-modal")) return "issues";
    if (shown("password-modal-overlay")) return "password";
    if (shown("edit-modal-overlay")) return "edit";
    return null;
  }
  function calendarTo(iso) {
    try {
      var p = iso.split("-");
      (0, eval)("calendarDate = new Date(" + parseInt(p[0], 10) + ", " + (parseInt(p[1], 10) - 1) + ", 1)");
      var v = document.getElementById("calendar-view"); if (v) v.value = "monthly";
    } catch (e) {}
  }
  var lastIssuesType = "";
  function calendarOnHero() {
    var d = g("calendarDate"), v = document.getElementById("calendar-view");
    if (!d || !v || v.value !== "monthly") return false;
    var p = HERO_DAY.split("-");
    return d.getFullYear() === parseInt(p[0], 10) && d.getMonth() === parseInt(p[1], 10) - 1;
  }
  function setModal(want) {
    var cur = currentModal();
    var wantKey = want && want.indexOf("issues:") === 0 ? "issues" : want;
    if ((cur || null) === (wantKey || null) && wantKey !== "issues" && !((wantKey === "calendar" || wantKey === "day") && !calendarOnHero())) return false;
    var changed = false;
    if ((cur === "day" || cur === "issues") && wantKey !== cur) { try { closeModal(); } catch (e) {} changed = true; }
    if ((cur === "day" || cur === "calendar") && wantKey !== "calendar" && wantKey !== "day") { try { closeCalendarModal(); } catch (e) {} changed = true; }
    if (cur === "password" && wantKey !== "password") { try { closePasswordModal(); } catch (e) {} changed = true; }
    if (cur === "edit" && wantKey !== "edit") { try { closeEditModal(); } catch (e) {} changed = true; }
    if (!want) return changed;
    if (wantKey === "issues") {
      var type = want.split(":")[1];
      if (cur === "issues" && lastIssuesType === type) return changed;
      try { showIssuesPopup(type); } catch (e) {}
      lastIssuesType = type;
      return true;
    }
    if (cur !== "calendar" && cur !== "day") {
      calendarTo(HERO_DAY);
      try { openCalendarModal(); } catch (e) {}
      changed = true;
    } else if (!calendarOnHero()) {            // the visitor opened it themselves: it is on the current month
      calendarTo(HERO_DAY);
      try { renderCalendar(); } catch (e) {}
      changed = true;
    }
    if (wantKey === "day") { try { showCalendarDayIssues(HERO_DAY); } catch (e) {} changed = true; }
    return changed;
  }
  function firstRecordId() {
    var b = $("#records-body .btn-edit"); if (!b) return "";
    var m = (b.getAttribute("onclick") || "").match(/openEditModal\('([^']+)'\)/); return m ? m[1] : "";
  }

  /* ---- put the page into the state a step needs ------------- */
  function reconcile(req) {
    if (!req) return false;
    var m = false;
    var wantModal = req.modal || null;
    var cur = currentModal();
    var curKey = cur, wantKey = wantModal && wantModal.indexOf("issues:") === 0 ? "issues" : wantModal;
    // a window that is not wanted (or that belongs to another tab) is closed first
    if (curKey && curKey !== wantKey && !(curKey === "calendar" && wantKey === "day") && !(curKey === "day" && wantKey === "calendar")) m = setModal(null) || m;
    if (req.tab) m = setTab(req.tab) || m;
    m = setForm(req.tab === "logissue" ? (req.form || 0) : 0) || m;
    if (req.tab === "records") {
      m = setRes(req.res === "unknown" ? UNKNOWN_ID : req.res === "unresolved" ? UNRES_ID : "") || m;
    } else if (isAdmin()) m = setAdmin(false) || m;
    if (wantModal) m = setModal(wantModal) || m;
    retag();
    return m;
  }

  // ids for the things the steps point at (the tool's own markup has no ids for them)
  // Only elements WITHOUT an id of their own are tagged: the tool finds its own elements by id.
  function tag(el, id) {
    var old = document.getElementById(id);
    if (old && old !== el) old.removeAttribute("id");
    if (el && !el.id) el.id = id;
  }
  function resForm(id) { var r = rowEl(id); return r ? r.querySelector(".resolution-form") : null; }
  function retag() {
    try {
      var form = document.getElementById("issue-form-logissue");
      if (form) {
        var groups = form.querySelectorAll(".form-grid > .form-group");
        tag(groups[1], "tourFOrder"); tag(groups[2], "tourFCustomer"); tag(groups[3], "tourFLogged");
        tag(groups[4], "tourFConcern"); tag(groups[5], "tourFResp1"); tag(groups[7], "tourFResolved");
        tag(form.querySelector("button[type=submit]").parentElement, "tourFButtons");
      }
      tag($("#responsible-user-modal .modal"), "tourRespModal");
      tag($("#records-section .filter-section"), "tourRecFilters");
      tag($("#records-section thead"), "tourRecHead");
      tag($("#records-section .card-header > div"), "tourRecButtons");
      tag($("#records-body tr"), "tourRecTable");      // the first line: the whole table is taller than the window
      var row = UNRES_ID ? $("tr[data-issue-id='" + UNRES_ID + "']") : null;
      tag(row ? row.querySelector(".status-no") : null, "tourRecBadge");
      tag(UNRES_ID ? resForm(UNRES_ID) : null, "tourRecResolve");
      tag(UNKNOWN_ID ? resForm(UNKNOWN_ID) : null, "tourRecUnknown");
      var act = $("#records-body tr td:last-child .btn-edit");
      tag(act ? act.parentElement : null, "tourRecActions");
      tag($(".password-modal"), "tourPassword");
      tag($("#analytics-section .stats-grid"), "tourKpis");
      tag($("#analytics-section > .card"), "tourAnFilters");
      tag($("#analytics-section .stats-grid .stat-card:last-child"), "tourCalCard");
      [["departmentChart", "tourChDept"], ["responsibleUserChart", "tourChResp"], ["loggedByChart", "tourChLogged"],
       ["concernChart", "tourChConcern"], ["timelineChart", "tourChTime"], ["resolutionChart", "tourChRes"], ["customerChart", "tourChCust"]].forEach(function (p) {
        var c = document.getElementById(p[0]); tag(c ? c.closest(".chart-container") : null, p[1]);
      });
      tag($("#issues-modal .modal"), "tourIssues");
      tag($("#calendar-modal .modal"), "tourCalendar");
      tag($("#calendar-modal .calendar-controls"), "tourCalControls");
    } catch (e) {}
  }

  /* ================================================================
     THE TOUR
     ================================================================ */
  var LOG = { tab: "logissue", form: 0, modal: null };
  var REC = { tab: "records", admin: false, res: null, modal: null };
  var AN = { tab: "analytics", modal: null };
  function at(base, extra) { var o = {}; var k; for (k in base) o[k] = base[k]; for (k in extra) o[k] = extra[k]; return o; }

  var STEPS = [
    {
      req: LOG,
      popover: {
        title: "Welcome to the Productivity Tracker",
        description:
          "Every business that picks, packs and delivers makes mistakes. This tool is where they get written down: " +
          "which order, which customer, what went wrong and who was responsible, and then whether it was fixed. " +
          "After a few months the charts show where the mistakes really come from. " +
          "The company, the people and every record here are invented for the demo.",
        side: "over", align: "center"
      }
    },
    {
      element: ".nav-tabs", req: LOG,
      popover: {
        title: "Three tabs",
        description:
          "<b>Log an Issue</b> is the form. <b>View Records</b> is the list of everything logged, where open issues get resolved. " +
          "<b>Analytics</b> turns the list into charts, with a calendar of good and bad days. We'll go through them in that order.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#issue-form-logissue", req: LOG,
      popover: {
        title: "Logging an issue takes under a minute",
        description:
          "One short form, the same for every department. Anyone on the roster can log an issue, usually the person who took the customer's call. " +
          "The tour will fill it in with an example so you can see how it works.",
        side: "top", align: "center"
      }
    },
    {
      element: "#tourFOrder", req: at(LOG, { form: 1 }),
      popover: {
        title: "Date and order number",
        description:
          "The date defaults to today. The order number ties the issue to the order in the ERP, so anyone can look up what was actually ordered and sent.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourFCustomer", req: at(LOG, { form: 1 }),
      popover: {
        title: "Customer",
        description:
          "Start typing a customer number or part of a name and the list narrows as you type. The whole customer file is in there. " +
          "The example uses <b>" + HERO_CUST.name + "</b>, a customer you will meet again in the charts.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourFLogged", req: at(LOG, { form: 1 }),
      popover: {
        title: "Logged by",
        description:
          "Who is writing this down. It is kept separate from who caused the issue, so the charts can show both: the people making mistakes and the people catching them.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourFConcern", req: at(LOG, { form: 1 }),
      popover: {
        title: "Concern",
        description:
          "What went wrong, picked from a fixed list grouped by department: " + listDepts() + ". " +
          "A fixed list is what makes the charts possible, and the department is worked out from the concern, so nobody has to choose it. " +
          "As soon as a concern is picked the tool asks who was responsible.",
        side: "top", align: "start"
      }
    },
    {
      element: "#tourRespModal", req: at(LOG, { form: 2 }),
      popover: {
        title: "Who was responsible",
        description:
          "A first responsible person is required. A second one is optional, for example the packer and the person who checked the carton. " +
          "If nobody knows yet, choose <b>Staff Member Unknown At This Stage</b>: the issue is then kept unresolved until a name is put against it.",
        side: "right", align: "center"
      }
    },
    {
      element: "#tourFResp1", req: at(LOG, { form: 3 }),
      popover: {
        title: "Back on the form",
        description:
          "The names are now shown on the form and cannot be typed over. To change them, pick the concern again.",
        side: "top", align: "start"
      }
    },
    {
      element: "#tourFResolved", req: at(LOG, { form: 3 }),
      popover: {
        title: "Resolved, yes or no",
        description:
          "<b>Yes</b> if it was fixed on the spot. <b>No</b> puts it on the open list in View Records, where it waits for a resolution comment. " +
          "The tool remembers how each issue was first logged, so the charts can tell fixed on the day from fixed later.",
        side: "top", align: "start"
      }
    },
    {
      element: "#tourFButtons", req: at(LOG, { form: 3 }),
      popover: {
        title: "Log Issue",
        description:
          "<b>Log Issue</b> saves the record and clears the form for the next one. In this demo a new record is kept in your browser tab only and is gone when you refresh, " +
          "so log as many as you like once the tour is finished. The tour will not save this example.",
        side: "top", align: "start"
      }
    },
    {
      element: ".nav-tab:nth-child(2)", req: LOG, waitForClick: "records",
      popover: {
        title: "Click View Records",
        description: "Now the list of everything that has been logged. Click the <b>View Records</b> tab.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourRecTable", req: REC,
      popover: {
        title: "Every issue, newest first",
        description:
          "One line per issue: date, department, order number, customer, who logged it, who was responsible, the concern and whether it is resolved. " +
          "There are " + (S.records || 300) + " here, a year of them.",
        side: "top", align: "center"
      }
    },
    {
      element: "#tourRecFilters", req: REC,
      popover: {
        title: "Filters",
        description:
          "Narrow the list by <b>branch</b>, <b>department</b>, <b>user</b>, <b>status</b> or a date range, in any combination. " +
          "Branch follows the responsible person's branch. User finds a person whether they logged the issue or were responsible for it.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourRecHead", req: REC,
      popover: {
        title: "Sort by any column",
        description: "Click a column heading to sort by it, and click again to turn the order around.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourRecBadge", req: REC, waitForClick: "res",
      popover: {
        title: "Click the red No",
        description:
          "Open issues carry a red <b>No</b>. Clicking it opens the resolution form for that issue. Click this one.",
        side: "left", align: "start"
      }
    },
    {
      element: "#tourRecResolve", req: at(REC, { res: "unresolved" }),
      popover: {
        title: "Resolving an issue",
        description:
          "Write what was done about it. The green tick only becomes available once there is a comment, and clicking it marks the issue resolved " +
          "and keeps the comment and the time with the record. Nothing gets closed without saying how.",
        side: "top", align: "center"
      }
    },
    {
      element: "#tourRecUnknown", req: at(REC, { res: "unknown" }), optional: true,
      popover: {
        title: "When the person was not known",
        description:
          "This one was logged with an unknown staff member. Before it can be resolved, the tool asks for the name as well as the comment.",
        side: "top", align: "center"
      }
    },
    {
      element: "#tourRecButtons", req: REC,
      popover: {
        title: "Refresh and export",
        description:
          "<b>Refresh</b> reloads the list, to pick up what others logged in the meantime. <b>Export CSV</b> downloads the records for Excel. " +
          "In the demo the export shows a short note instead of a file.",
        side: "bottom", align: "end"
      }
    },
    {
      element: "#admin-lock-btn", req: REC,
      popover: {
        title: "Admin mode",
        description:
          "The small padlock is the way into admin mode. In the live tool it asks for a password, and then a manager can correct or delete a record, " +
          "take a full backup and restore it, or clear the list. In this demo it stays locked: clicking it only shows a short note.",
        side: "left", align: "start"
      }
    },
    {
      element: ".nav-tab:nth-child(3)", req: REC, waitForClick: "analytics",
      popover: {
        title: "Click Analytics",
        description: "The list is the record. The next tab is what you learn from it. Click <b>Analytics</b>.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourKpis", req: AN,
      popover: {
        title: "The numbers at the top",
        description:
          "Total issues, resolved, unresolved, the resolution rate and how many customers were affected. " +
          "Each card opens the list behind its number when you click it. The last card opens the issue calendar, which comes at the end of the tour.",
        side: "bottom", align: "center"
      }
    },
    {
      element: "#tourAnFilters", req: AN,
      popover: {
        title: "Analytics filters",
        description:
          "Branch, department, time period and user. Everything on this tab follows them: the cards, the ten charts and the calendar. " +
          "<b>Custom Range</b> in the time period gives you two date boxes.",
        side: "bottom", align: "start"
      }
    },
    {
      element: "#tourChDept", req: AN,
      popover: {
        title: "Issues by department",
        description:
          "Where the mistakes happen, one bar per department. In this company Despatch has the most, which is normal: it is where orders are physically handled.",
        side: "right", align: "start"
      }
    },
    {
      element: "#tourChResp", req: AN,
      popover: {
        title: "Issues by responsible person",
        description:
          "The fifteen people with the most issues against their name. <b>" + HERO_PERSON + "</b> is well ahead of everyone else, " +
          "which usually means one person needs training or a process has a gap in it. " +
          "The next chart does the same for the second responsible person.",
        side: "left", align: "start"
      }
    },
    {
      element: "#tourChLogged", req: AN,
      popover: {
        title: "Issues by who logged them",
        description: "The people who catch the mistakes and take the time to write them down. Worth knowing, because without them there is nothing to look at.",
        side: "left", align: "start"
      }
    },
    {
      element: "#tourChConcern", req: AN,
      popover: {
        title: "Issues by concern",
        description:
          "The ten most common concerns. <b>" + HERO_CONCERN + "</b> is the biggest slice by a distance, so that is where a change to the process pays back first.",
        side: "right", align: "start"
      }
    },
    {
      element: "#tourChTime", req: AN,
      popover: {
        title: "Issues over time",
        description:
          "Month by month. You can see the count climbing through winter to a peak in <b>" + monthName(S.peak_month || "2026-08") + "</b>, " +
          "and then falling away after a second check was added to packing in September. This is the chart that tells you whether a fix worked.",
        side: "left", align: "start"
      }
    },
    {
      element: "#tourChRes", req: AN,
      popover: {
        title: "Resolution charts",
        description:
          "Three views of the same question. <b>Current status</b> is resolved against unresolved today. <b>Initial status</b> is how issues were first logged. " +
          "<b>Resolved via comments</b> shows how many started open and were closed later with a resolution comment, and how many are still waiting.",
        side: "right", align: "start"
      }
    },
    {
      element: "#tourChCust", req: AN,
      popover: {
        title: "Issues by customer",
        description:
          "Every affected customer, most issues first. <b>" + HERO_CUST.name + "</b> is at the top with " + (HERO_CUST.issues || "ten") +
          " issues in four months. A customer on top of this chart is a customer at risk.",
        side: "top", align: "center"
      }
    },
    {
      element: "#tourIssues", req: at(AN, { modal: "issues:concern" }),
      popover: {
        title: "Click any chart for the detail",
        description:
          "Every chart and card opens a window like this one: a few key insights worked out from the records in view, then the records themselves, " +
          "with their resolution comments. This is the one behind the concern chart.",
        side: "left", align: "start"
      }
    },
    {
      element: "#tourCalCard", req: AN, waitForClick: "calendar",
      popover: {
        title: "Click the Issue Calendar",
        description: "Last stop. Click the calendar card.",
        side: "bottom", align: "end"
      }
    },
    {
      element: "#tourCalendar", req: at(AN, { modal: "calendar" }),
      popover: {
        title: "The issue calendar",
        description:
          "One square per day. Green had no issues, yellow had one, orange two or three, red four or more. " +
          "The tour has opened " + monthName(HERO_DAY) + ", the worst month. The line at the bottom counts the current run of weekdays without an issue.",
        side: "left", align: "center"
      }
    },
    {
      element: "#tourCalControls", req: at(AN, { modal: "calendar" }),
      popover: {
        title: "Month, week or year",
        description: "The arrows step back and forward. The box switches between a month, a single week and the whole year on one page.",
        side: "bottom", align: "end"
      }
    },
    {
      element: "#tourIssues", req: at(AN, { modal: "day" }),
      popover: {
        title: "Click a day",
        description: "Any day opens its issues. This is " + longDay(HERO_DAY) + ", the worst day of the year, with " + (S.hero_day_issues || "five") + " issues.",
        side: "left", align: "start"
      }
    },
    {
      element: "#prodTourBtn", req: at(AN, { modal: null }),
      popover: {
        title: "That's the tour",
        description:
          "Have a go yourself: log an issue, resolve one of the open ones, or filter the charts by branch and department. " +
          "Nothing you do here is saved, and this button starts the tour again.",
        side: "left", align: "start"
      }
    }
  ];

  /* ---- "Take the tour" button ----------------------------- */
  function injectTourButton() {
    if (document.getElementById("prodTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "prodTourBtn"; btn.type = "button"; btn.className = "pt-tour-btn";
    btn.title = "Replay the guided tour"; btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='pt-tour-btn-icon' aria-hidden='true'>?</span><span class='pt-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () { startTour({ resume: true }); });
    var header = document.querySelector(".header");
    if (header) { header.style.position = "relative"; btn.classList.add("pt-tour-btn-in-header"); header.appendChild(btn); }
    else { btn.classList.add("pt-tour-btn-floating"); document.body.appendChild(btn); }
  }

  function waitFor(test, maxMs, cb) {
    var t0 = Date.now();
    (function check() {
      var ok = false; try { ok = !!test(); } catch (e) {}
      if (ok) setTimeout(cb, 220); else if (Date.now() - t0 > maxMs) cb(); else setTimeout(check, 120);
    })();
  }
  var WAITERS = {
    records: function () { return currentTab() === "records"; },
    analytics: function () { return currentTab() === "analytics"; },
    res: function () { var r = rowEl(UNRES_ID); return !!(r && r.style.display !== "none"); },
    calendar: function () { return shown("calendar-modal"); }
  };

  /* ---- tour driver ----------------------------------------- */
  var current = null;
  function startTour(opts) {
    opts = opts || {};
    if (!window.driver || !window.driver.js || !window.driver.js.driver) return;
    if (current) { try { current.destroy(); } catch (e) {} current = null; }

    var attached = [], pulsing = [];
    function pulseOn(el) { if (!el) return; el.classList.remove("driver-no-interaction"); el.classList.add("pt-tour-pulse"); pulsing.push(el); }
    function pulseOff() { pulsing.forEach(function (el) { try { el.classList.remove("pt-tour-pulse"); } catch (e) {} }); pulsing.length = 0; }
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
      overlayOpacity: 0.55, stagePadding: 6, stageRadius: 8, popoverClass: "pt-tour-popover",
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
        // leave the page tidy: no sample form, no open tour windows, admin locked
        try { setForm(0); setModal(null); if (isAdmin()) setAdmin(false); } catch (e) {}
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
      if (st.optional && st.element && !document.querySelector(st.element)) { go(target + dir, dir); return; }
      if (!mutated) { lastIndex = target; try { d.moveTo(target); } catch (e) {} return; }
      going = true;
      var t0 = Date.now();
      (function tick() {
        retag();
        var ready = !st.element || document.querySelector(st.element);
        if (ready || Date.now() - t0 > 700) {
          requestAnimationFrame(function () { going = false; lastIndex = target; try { d.moveTo(target); } catch (e) {} });
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
        if (step && step.popover && step.popover.showButtons && step.popover.showButtons.indexOf("next") < 0) return;   // a click step
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
    requestAnimationFrame(function () { retag(); try { d.drive(startAt); } catch (e) {} });
  }

  window.startProdTour = startTour;
  window.prodTourSteps = STEPS;

  /* ---- start-up --------------------------------------------- */
  function whenData(cb) {
    waitFor(function () { var i = g("issues"); return i && i.length > 0 && !!$("#records-body tr"); }, 20000, cb);
  }
  function loadDriverThen(cb) {
    if (window.driver && window.driver.js) { cb(); return; }
    var s = document.createElement("script"); s.src = DRIVER_JS; s.onload = cb;
    s.onerror = function () { console.error("[prod-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  ready(function () {
    injectTourButton();
    loadDriverThen(function () {
      var begin = function (mode) { if (mode === "tour") whenData(function () { startTour({}); }); };
      if (window.DemoChooser && typeof window.DemoChooser.whenChosen === "function") window.DemoChooser.whenChosen(begin);
      else document.addEventListener("demo:mode", function (e) { begin(e.detail && e.detail.mode); });
    });
  });
})();
