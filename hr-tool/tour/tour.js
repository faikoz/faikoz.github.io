/* ============================================================
   Guided tour for the YOUR COMPANY HR Tool.
   Powered by Driver.js (https://driverjs.com) — MIT licensed.

   Single script covers every page. On load it detects the current
   page from the URL (e.g. `admin/index`, `app/timesheets`), looks
   up the matching tour in the registry, and auto-fires it on the
   user's first visit to that page.

   Two entry roles:
     - admin  → `admin/*` pages (dashboard, users, timesheets, leave,
                analytics, audit)
     - contractor (aka "app") → `app/*` pages (dashboard, timesheets,
                leave, profile)

   The pattern is: **admin tours first, contractor tours second**,
   walking the reader through the split management model.
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
  function resumeKey(k) { return "hrTour_" + k + "_resumeAt"; }
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
     TOUR REGISTRY — keyed by "<section>/<page>" derived from URL.
     Ordering: admin tours first (dashboard → users → timesheets →
     leave → analytics → audit), then contractor tours (dashboard →
     timesheets → leave → profile).
     ================================================================ */
  var TOURS = {

    /* =========================== ADMIN =========================== */

    "admin/index": {
      seenKey: "hrTour_admin_index_v2",
      steps: [
        {
          popover: {
            title: "Welcome, Admin",
            description:
              "Quick tour of the <b>admin dashboard</b>. This is the live " +
              "control room — every stat updates in real time as contractors " +
              "clock in, take breaks, and clock off. Press Esc to skip.",
            side: "over",
            align: "center"
          }
        },
        {
          element: ".sidebar",
          popover: {
            title: "Workspace navigation",
            description:
              "The left rail is your <b>workspace</b>. Six pages: " +
              "<b>Dashboard</b> (this one), <b>Team</b>, <b>Timesheets</b>, " +
              "<b>Leave</b>, <b>Analytics</b>, <b>Audit</b>. Red badges show " +
              "pending items — <b>Team</b> flags new users still to sign in, " +
              "<b>Timesheets</b> highlights pending time-fix requests, and " +
              "<b>Leave</b> shows unreviewed leave requests. Your avatar " +
              "and <b>Sign out</b> live at the bottom.",
            side: "right",
            align: "start"
          }
        },
        {
          element: "#statActive",
          popover: {
            title: "KPI · Active contractors",
            description:
              "Total contractors currently marked <b>active</b> on the team " +
              "(inactive / deactivated accounts don't count). Hover the tile " +
              "for the full name list.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#statOnShift",
          popover: {
            title: "KPI · On shift now",
            description:
              "How many contractors are <b>currently clocked in</b> (not on " +
              "break). Hover for names + how long each has been on since.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#statOnBreak",
          popover: {
            title: "KPI · On break now",
            description:
              "Contractors who've clocked in but are taking a break. Hover " +
              "for names + break start times.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#statWeekHours",
          popover: {
            title: "KPI · Team hours this week",
            description:
              "Sum of hours worked since Monday (Melbourne time). Hover for " +
              "the per-contractor breakdown.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#leaveSoonList",
          popover: {
            title: "Leave · today + next 7 days",
            description:
              "Anyone approved / pending / on leave right now, plus the next " +
              "seven days. Click <b>Manage leave →</b> in the toolbar to go " +
              "to the full leave page.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#liveList",
          popover: {
            title: "Who's clocked in",
            description:
              "Live board of every contractor currently on shift. Rows update " +
              "automatically as people clock in / take breaks / clock off — " +
              "no refresh needed.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#annForm",
          popover: {
            title: "Announcements",
            description:
              "Post a one-line message every contractor sees on their " +
              "dashboard. Pick a severity (info / warning / alert), an " +
              "optional expiry date, and hit Post. Live messages appear " +
              "below and can be paused or deleted.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#autoCloseCard",
          popover: {
            title: "Auto-closed shifts",
            description:
              "If a contractor forgot to clock off and the system auto-closed " +
              "their shift, it shows up here. <b>Verify</b> the numbers and " +
              "edit if they're wrong — you'll usually want to talk to them first.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#teamActivityTimeline",
          popover: {
            title: "Today's activity timeline",
            description:
              "One column per contractor, showing their shift + break blocks " +
              "across the day. Great for spotting late starts, long breaks, " +
              "or forgotten clock-offs at a glance.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#weekChart",
          popover: {
            title: "Hours this week · chart",
            description:
              "Bar chart of hours per contractor since Monday. Use the toggle " +
              "in the top-right to switch between bar and other views.",
            side: "top",
            align: "center"
          }
        },
        {
          popover: {
            title: "That's the dashboard!",
            description:
              "Use the top navigation to move into <b>Users</b>, <b>Timesheets</b>, " +
              "<b>Leave</b>, <b>Analytics</b>, or the <b>Audit log</b>. Each " +
              "page runs its own short tour the first time you open it.",
            side: "over",
            align: "center"
          }
        }
      ]
    },

    "admin/users": {
      seenKey: "hrTour_admin_users_v1",
      steps: [
        {
          popover: {
            title: "Users — team management",
            description:
              "Everywhere you add, edit, deactivate, or remove contractors. " +
              "Also where you set their opening leave balance and accrual start date.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#addBtn",
          popover: {
            title: "Add a contractor",
            description:
              "Opens a form to create a new account: name, email, role. " +
              "The tool auto-generates a temporary password and shows it to " +
              "you — the contractor changes it on first sign-in.",
            side: "left",
            align: "start"
          }
        },
        {
          element: "#listContainer",
          popover: {
            title: "Contractor list",
            description:
              "One row per user. The <b>Actions</b> column carries the " +
              "controls: <b>Edit</b>, <b>Force password</b>, <b>Reset email</b>, " +
              "<b>Deactivate</b> / <b>Reactivate</b>, and (with care) <b>Remove</b>.",
            side: "top",
            align: "center"
          }
        },
        {
          popover: {
            title: "Safety net",
            description:
              "Removing a user is destructive — a confirmation modal asks you " +
              "to type <b>DELETE</b> and previews how many time entries, leave " +
              "requests, and edit requests will vanish. Prefer <b>Deactivate</b> " +
              "for people who've left but whose history you want to keep.",
            side: "over",
            align: "center"
          }
        }
      ]
    },

    "admin/timesheets": {
      seenKey: "hrTour_admin_timesheets_v1",
      steps: [
        {
          popover: {
            title: "Timesheets — admin view",
            description:
              "One-stop for everyone's time entries: pending edit requests, " +
              "daily activity, period summaries, and per-contractor history.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#editRequestsCard",
          popover: {
            title: "Pending edit requests",
            description:
              "When a contractor spots a wrong entry, they submit a fix " +
              "request from their own timesheet page — it lands here. " +
              "Review, edit if needed, and resolve.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#dayLabel",
          popover: {
            title: "Daily view",
            description:
              "Everyone's activity for a specific day. Use the arrows or the " +
              "date picker to move around. The <b>Today</b> button jumps back " +
              "to now.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#dayList",
          popover: {
            title: "Session chips",
            description:
              "Each contractor's shift is shown as coloured session chips " +
              "(green = worked, orange = break). <b>Click a chip</b> to edit " +
              "the start/end time or delete the entry, or use the <b>+ Add</b> " +
              "button to insert a missing session.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#periodChart",
          popover: {
            title: "Period summary",
            description:
              "Bar chart aggregating hours across a range — day, week, month, " +
              "quarter, or custom. Use the dropdown above to switch buckets.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#historyList",
          popover: {
            title: "Per-contractor history",
            description:
              "Pick a contractor and range for a scrollable, session-level " +
              "history. Useful when you're investigating a specific week or " +
              "preparing an invoice.",
            side: "top",
            align: "center"
          }
        }
      ]
    },

    "admin/leave": {
      seenKey: "hrTour_admin_leave_v1",
      steps: [
        {
          popover: {
            title: "Leave — approvals + balances",
            description:
              "Every leave request across the team, plus live balance " +
              "tracking and a colour-coded calendar view.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#teamCalendar",
          popover: {
            title: "Team calendar",
            description:
              "Colour code: <b>green</b> approved, <b>amber</b> pending, " +
              "<b>red</b> denied, <b>grey</b> cancelled, plus public holidays. " +
              "Click any date to open the review pane.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#pendingList",
          popover: {
            title: "Pending requests",
            description:
              "New leave requests waiting on you. Each row has approve/deny " +
              "buttons and a chat icon that opens a threaded conversation " +
              "with the contractor.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#balancesList",
          popover: {
            title: "Balances",
            description:
              "For each contractor: available hours, total accrued (lifetime), " +
              "and total taken. If someone's asking for more leave than they " +
              "have, you'll see it here first.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#ledgerList",
          popover: {
            title: "Accrual ledger",
            description:
              "Line-by-line history for the selected contractor: opening " +
              "balance, weekly accrual, and every approved leave — with the " +
              "running balance carried forward. Great for auditing balances.",
            side: "top",
            align: "center"
          }
        }
      ]
    },

    "admin/analytics": {
      seenKey: "hrTour_admin_analytics_v1",
      steps: [
        {
          popover: {
            title: "Analytics",
            description:
              "Per-contractor and team-wide performance charts — hours, " +
              "patterns, day-of-week trends, and comparison across the team.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#userPick",
          popover: {
            title: "Scope selector",
            description:
              "<b>All contractors</b> gives you team-wide charts. Pick a " +
              "specific contractor to zoom into their patterns alone.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#rangePick",
          popover: {
            title: "Date range",
            description:
              "Last 14 / 30 / 60 / 90 days, or a custom range. Every KPI " +
              "and chart below re-renders when you change this.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#kpiHours",
          popover: {
            title: "KPI row",
            description:
              "Total hours, days worked, average hours per day, and break " +
              "time — all within the selected range and scope.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#dailyChart",
          popover: {
            title: "Daily hours",
            description:
              "Bar chart of hours worked (and break time) per day. Look for " +
              "streaks of short days, or unusually long ones.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#clockInChart",
          popover: {
            title: "Clock-in distribution",
            description:
              "What time of day does this contractor (or the team) actually " +
              "start? Bucketed by hour from 5 AM to 8 PM.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#dowChart",
          popover: {
            title: "Day-of-week averages",
            description:
              "Mon → Sun average hours. Useful for spotting weak days " +
              "(everyone drops off on Friday afternoons, say).",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#teamChart",
          popover: {
            title: "Team comparison",
            description:
              "Every contractor's hours side-by-side for the range. Toggle " +
              "between bar and pie via the switcher above the chart.",
            side: "top",
            align: "center"
          }
        }
      ]
    },

    "admin/audit": {
      seenKey: "hrTour_admin_audit_v1",
      steps: [
        {
          popover: {
            title: "Audit log",
            description:
              "<b>Append-only</b> record of every write anyone makes — admins " +
              "editing entries, contractors submitting requests, the system " +
              "auto-closing shifts. Nothing here can be edited or deleted.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#whoFilter",
          popover: {
            title: "Filter · Actor",
            description:
              "Filter to what one person did — pick an admin or contractor. " +
              "Combine with the other filters to narrow further.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#targetFilter",
          popover: {
            title: "Filter · Affected user",
            description:
              "Filter by the user the change was <i>made to</i> — useful when " +
              "you're investigating a specific contractor's history.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#actionFilter",
          popover: {
            title: "Filter · Action type",
            description:
              "Filter by action: <b>create</b>, <b>update</b>, <b>delete</b>, " +
              "leave events, timesheet edits, and so on. The list is populated " +
              "from what's actually in the log.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#auditList",
          popover: {
            title: "The log",
            description:
              "Each row shows <b>when</b>, <b>who did it</b>, <b>what action</b>, " +
              "<b>affected user</b>, and a note or diff. Expand any row to see " +
              "the full JSON of before/after values.",
            side: "top",
            align: "center"
          }
        }
      ]
    },

    /* ======================== CONTRACTOR ========================= */

    "app/index": {
      seenKey: "hrTour_app_index_v2",
      steps: [
        {
          popover: {
            title: "Welcome to your HR portal",
            description:
              "Quick tour of your dashboard. You clock in and out from here, " +
              "check today's hours, take breaks, and see your leave balance " +
              "at a glance. Press Esc to skip.",
            side: "over",
            align: "center"
          }
        },
        {
          element: ".simple-header",
          popover: {
            title: "Top bar",
            description:
              "Everything you need at the top: the <b>company brand</b> on " +
              "the left, the four <b>page tabs</b> in the middle — " +
              "<b>Dashboard</b>, <b>Timesheets</b>, <b>Leave</b>, <b>Profile</b> — " +
              "with red badges showing anything that needs your attention " +
              "(a pending leave request, a submitted time-fix, etc.), and " +
              "your <b>avatar + Sign out</b> button on the right.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#primaryBtn",
          popover: {
            title: "Clock in / out",
            description:
              "The main action button. It shows <b>Clock in</b> when you're " +
              "off, <b>Clock out</b> when you're on. If you're on break it " +
              "flips to <b>Resume shift</b>. Always the biggest button on " +
              "the page — use it.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#secondaryBtn",
          popover: {
            title: "Take a break",
            description:
              "Once you're clocked in, this button becomes available: " +
              "<b>Start break</b> pauses your shift, <b>End break</b> resumes it. " +
              "Break time is tracked separately and shown on your KPI tile.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#shiftStatus",
          popover: {
            title: "Current status",
            description:
              "Live status pill — <b>Working since 08:12</b>, <b>On break " +
              "since 12:30</b>, etc. Hidden when you're clocked out.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#statToday",
          popover: {
            title: "Today's hours",
            description:
              "Elapsed working time today (breaks excluded). The progress bar " +
              "tracks against a <b>7h 36m target</b> — a full day.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#statBreak",
          popover: {
            title: "Break time today",
            description:
              "Total minutes you've taken as breaks so far today.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#statLeave",
          popover: {
            title: "Leave balance",
            description:
              "How many leave hours you currently have available. Sub-text " +
              "shows total accrued vs total taken so you can see the trend.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#bannerArea",
          popover: {
            title: "Alerts",
            description:
              "Where important notices show up: <b>forgot to clock off</b> " +
              "yesterday, <b>still working past 5:30</b>, admin announcements, " +
              "and so on. Empty most of the time.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#activityTimeline",
          popover: {
            title: "Today's timeline",
            description:
              "Visual timeline of your work sessions and breaks today. " +
              "Handy for a quick sanity-check before you clock off.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#upcomingLeave",
          popover: {
            title: "Upcoming leave",
            description:
              "Your next few approved or pending leave entries. Click through " +
              "to <b>Leave</b> in the nav to request more.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#logoutBtn",
          popover: {
            title: "Sign out",
            description:
              "Signs you out and returns to the login page. Your data is " +
              "safe — everything's saved live.",
            side: "left",
            align: "start"
          }
        }
      ]
    },

    "app/timesheets": {
      seenKey: "hrTour_app_timesheets_v1",
      steps: [
        {
          popover: {
            title: "Your timesheets",
            description:
              "Your work history — every session, break, and total, plus a " +
              "way to request fixes if something's wrong.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#rangePick",
          popover: {
            title: "Range",
            description:
              "Last 7 / 30 / 365 days. The KPIs, chart, and day-by-day list " +
              "below all use whatever's selected.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#kpiHours",
          popover: {
            title: "KPI row",
            description:
              "For the selected range: total hours worked, days you actually " +
              "worked, average hours per worked day, and total break time.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#dailyChart",
          popover: {
            title: "Daily chart",
            description:
              "Hours worked plus break time, per day. Toggle between bar and " +
              "pie in the top-right if you prefer a different view.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#daysList",
          popover: {
            title: "Day-by-day",
            description:
              "One row per worked day. Each row shows your session chips " +
              "(work + break) and the day's total.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#requestFixBtn",
          popover: {
            title: "Request a fix",
            description:
              "Spot a wrong start/end time or a missing session? Click here, " +
              "describe what's wrong, and an admin will review it. Submitted " +
              "requests appear in the list below with their status.",
            side: "left",
            align: "start"
          }
        }
      ]
    },

    "app/leave": {
      seenKey: "hrTour_app_leave_v1",
      steps: [
        {
          popover: {
            title: "Leave",
            description:
              "Request leave, watch your balance, and see the status of " +
              "everything you've asked for — with a chat thread per request " +
              "so you and the admin stay in sync.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#kpiBalance",
          popover: {
            title: "Balance KPIs",
            description:
              "<b>Available</b> = hours you can still take. <b>Accrued</b> = " +
              "everything you've earned since day one. <b>Taken</b> = leave " +
              "already used. <b>Pending</b> = requests waiting on approval.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#requestLeaveBtn",
          popover: {
            title: "Request leave",
            description:
              "Opens a form: start + end date, optional half-day options, " +
              "and a reason. A live preview shows how many hours will be " +
              "deducted from your balance before you submit.",
            side: "left",
            align: "start"
          }
        },
        {
          element: "#leaveCalendar",
          popover: {
            title: "Your calendar",
            description:
              "Colour-coded: green approved, amber pending, red denied, grey " +
              "cancelled, plus public holidays overlaid. Handy for spotting " +
              "clashes with a long weekend.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#leaveRequestsList",
          popover: {
            title: "All requests",
            description:
              "Every leave request you've made, with dates, hours, and " +
              "status. Click the <b>💬</b> icon on any row to open the " +
              "conversation with the admin. You can also <b>cancel</b> a " +
              "pending or approved request from here.",
            side: "top",
            align: "center"
          }
        }
      ]
    },

    "app/profile": {
      seenKey: "hrTour_app_profile_v1",
      steps: [
        {
          popover: {
            title: "Profile",
            description:
              "Your account details and password. Contact your admin if any " +
              "of your read-only fields (name, email, start date) are wrong.",
            side: "over",
            align: "center"
          }
        },
        {
          element: "#profileName",
          popover: {
            title: "Read-only details",
            description:
              "Name, email, and start date come from your account setup. " +
              "They can't be changed here — the admin does that from the " +
              "Users page.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#pwForm",
          popover: {
            title: "Change password",
            description:
              "Enter your <b>current</b> password, then a <b>new</b> one " +
              "(minimum 8 characters), and confirm. Your session stays " +
              "signed in.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#myHistoryList",
          popover: {
            title: "Audit history",
            description:
              "A live-updating log of every change to your account: when it " +
              "happened, what changed, and who made the change. Nothing here " +
              "can be deleted — it's for your own transparency.",
            side: "top",
            align: "center"
          }
        }
      ]
    }
  };

  /* ---- current page detection ---------------------------- */
  // Match "/admin/foo.html" or "/admin/" or "/app/foo.html" or "/app/"
  function currentPageKey() {
    var path = location.pathname;
    var m = path.match(/\/(admin|app)\/([^/]*)$/);
    if (!m) return null;
    var section = m[1];
    var file = m[2].replace(/\.html$/i, "");
    if (!file || file.toLowerCase() === "index") file = "index";
    return section + "/" + file;
  }

  /* ---- iframe / demo-mode detection ---------------------- */
  // The demo entry `demo.html` embeds admin/ and app/ side-by-side in
  // iframes. In that mode we defer auto-fire so the parent can
  // orchestrate "admin tour first, contractor tour second". Standalone
  // page loads (not inside demo.html) auto-fire as normal.
  function isInDemoIframe() {
    try {
      if (window.parent === window) return false;
      return /demo\.html?$/i.test(window.parent.location.pathname) ||
             /\/hr-tool\/?$/i.test(window.parent.location.pathname); // /hr-tool/ redirects → demo.html
    } catch (e) {
      return false; // cross-origin — treat as standalone
    }
  }

  /* ---- "Take the tour" button ---------------------------- */
  function injectTourButton() {
    if (document.getElementById("hrtTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "hrtTourBtn";
    btn.type = "button";
    btn.className = "hrt-tour-btn";
    btn.title = "Replay the guided tour for this page";
    btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='hrt-tour-btn-icon' aria-hidden='true'>?</span>" +
                    "<span class='hrt-tour-btn-label'>Take the tour</span>";
    btn.addEventListener("click", function () {
      var k = currentPageKey();
      if (k && TOURS[k]) startTour(k, { force: true, resume: true });
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

    // Filter out steps whose target isn't on-screen (e.g. autoClose card
    // is hidden when there are no forgotten shifts).
    var stepsIn = spec.steps.filter(function (s) {
      if (!s.element) return true;
      var el = document.querySelector(s.element);
      return el && el.offsetParent !== null;
    });
    if (!stepsIn.length) return;

    var lastIndex = 0;
    // In the demo split-view iframe we dim the tour pane much less so
    // the reader can still scan the pane visually and freely poke at
    // controls in the OTHER pane at the same time. In standalone mode
    // we keep the normal 0.55 dim so the highlighted element pops.
    var overlayDim = isInDemoIframe() ? 0.15 : 0.55;
    var d = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: overlayDim,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: "hrt-tour-popover",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish",
      progressText: "Step {{current}} of {{total}}",
      disableActiveInteraction: false, // let the reader click highlighted controls
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
        // Notify the demo-mode coordinator (parent frame) that this
        // tour is done, so it can start the next one in sequence.
        try {
          if (typeof window.hrTourOnComplete === "function") {
            var cb = window.hrTourOnComplete;
            window.hrTourOnComplete = null;
            cb(key);
          }
        } catch (e) {}
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

  window.startHrTour = startTour;
  window.hrTours = TOURS;
  window.hrTourPageKey = currentPageKey;

  /* ---- wait for the page's data to arrive ---------------- */
  // Every page starts with placeholder "Loading…" text and only fills in
  // once Firestore data arrives. Give it a bit of time so the tour
  // doesn't highlight empty rows. If it's slow, we still fire eventually.
  function whenPageReady(callback) {
    var MAX_MS = 12000;
    var startedAt = Date.now();
    (function check() {
      // Heuristic: any placeholder ".empty" element still showing
      // "Loading…" means we're not ready yet.
      var loadingEls = document.querySelectorAll(".empty");
      var stillLoading = false;
      for (var i = 0; i < loadingEls.length; i++) {
        var txt = (loadingEls[i].textContent || "").trim();
        if (/^loading/i.test(txt)) { stillLoading = true; break; }
      }
      if (!stillLoading || Date.now() - startedAt > MAX_MS) {
        // Small settle delay for late layouts (chart canvases etc.)
        setTimeout(callback, 300);
      } else {
        setTimeout(check, 250);
      }
    })();
  }

  /* ---- bootstrap ----------------------------------------- */
  function loadDriverThen(cb) {
    var s = document.createElement("script");
    s.src = DRIVER_JS;
    s.onload = cb;
    s.onerror = function () { console.error("[hr-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  ready(function () {
    var key = currentPageKey();
    if (!key || !TOURS[key]) return; // e.g. login page — no tour needed
    var demoIframe = isInDemoIframe();
    // In demo iframes, no floating FAB (parent shows a shared control)
    // and no auto-fire — the parent calls startHrTour() when ready.
    if (!demoIframe) injectTourButton();
    loadDriverThen(function () {
      whenPageReady(function () {
        if (demoIframe) {
          // Signal parent that this iframe is armed and ready.
          try {
            if (typeof window.parent.__hrTourFrameReady === "function") {
              window.parent.__hrTourFrameReady(key, window);
            }
          } catch (e) {}
          return;
        }
        startTour(key);
      });
    });
  });
})();
