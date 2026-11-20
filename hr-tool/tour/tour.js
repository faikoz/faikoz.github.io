/* ============================================================
   Guided tour for the Ironbark HR Portal demo (Demo Apps 5, Nov 2026).
   Powered by Driver.js (https://driverjs.com), MIT licence.

   The tool is eleven separate pages on two sides, so this tour travels: every step names
   its page and its side, the position is kept in the browser tab (sessionStorage), and
   Next / Back move to another page (and switch side) when the next step lives there.
   Contractor side first, then the switch, then the Admin side.
   Red X closes; "Take the tour" picks it up where it stopped.

   The Demo Apps 3 version is kept next to this file as _tour_demo3_backup.js.
   ============================================================ */
(function () {
  var DRIVER_JS  = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js";
  var DRIVER_CSS = "https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css";
  function addStylesheet(href) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
  addStylesheet(DRIVER_CSS);

  var S = window.__DEMO_STORY__ || {};
  var ME = (S.me || {}).name || "the contractor", BOSS = (S.admin || {}).name || "the admin";
  var REQ = (S.pending_leave || {}).name || "one of the team";
  var ROOT = window.__DEMO_ROOT__ || "./";
  var KEY = "tkTour.idx", DONE = "tkTour.done", LAST = "tkTour.last";
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, String(v)); } catch (e) {} return null; }
  function $(s) { return document.querySelector(s); }
  function card(sel) { return function () { var el = $(sel); return el ? (el.closest(".card") || el) : null; }; }
  function here() { var m = location.pathname.match(/(app|admin)\/([^/]*)$/); return m ? m[1] + "/" + (m[2] || "index.html") : "index.html"; }

  var F = "contractor", M = "admin";
  var STEPS = [
    /* ---------------- Contractor side ---------------- */
    { role: F, page: "app/index.html", title: "Welcome to Ironbark HR Portal",
      text: "A small company with a remote team needs to know three things: who is working, how many hours they did, and who is off when. This portal answers all three. " +
            "It has two sides, one for the people doing the work and one for whoever manages them, and this demo shows both. Every person and record is invented." },
    { role: F, page: "app/index.html", el: "#demo-role-switch", side: "bottom",
      title: "This switch exists only in the demo",
      text: "These two buttons are here so you can see both sides of the tool. <b>They are not part of the real tool.</b> " +
            "In real use everyone signs in with their own account and sees one side only: a contractor sees the contractor pages and nothing else, " +
            "and the admin pages open only for an admin. A contractor never sees other people's hours, the activity page or the history log. " +
            "The tour starts on the contractor's side, signed in as <b>" + ME + "</b>, and switches to the admin later." },
    { role: F, page: "app/index.html", el: ".stat-grid", side: "bottom",
      title: "The day at a glance",
      text: "Hours worked today against the daily target, break time, the time-off balance and any request still waiting for an answer. Hover over a tile for the detail behind it." },
    { role: F, page: "app/index.html", el: ".clock-hero", side: "bottom",
      title: "Start, pause, finish",
      text: "This is the whole job for a contractor. One button starts the shift, one takes a break and comes back, one finishes the shift. " +
            "The two clocks show head office time and the contractor's own local time, which matters when the team is spread across time zones. Try the buttons after the tour: nothing is saved." },
    { role: F, page: "app/index.html", el: card("#activityTimeline"), side: "top",
      title: "Today's timeline",
      text: "Every start, break and finish, in order, with how long each stretch lasted. It fills in by itself as the buttons are used." },
    { role: F, page: "app/index.html", el: card("#upcomingLeave"), side: "top",
      title: "Time off coming up",
      text: "The next approved or waiting time-off requests, so nobody has to go looking for them." },
    { role: F, page: "app/timesheets.html", el: card("#dailyChart"), side: "top",
      title: "Hours, day by day",
      text: "The <b>Hours</b> page is the contractor's own record: totals for the last week, month or year, and a chart of worked time and breaks for each day." },
    { role: F, page: "app/timesheets.html", el: card("#daysList"), side: "top",
      title: "Each day in detail",
      text: "One line per day with its sessions shown as small blocks. Hover over a block for the exact times. A grey block is a break, an amber one was closed automatically because the shift was left open." },
    { role: F, page: "app/timesheets.html", el: "#requestFixBtn", side: "left",
      title: "When a shift is wrong",
      text: "A contractor cannot change their own hours. If something is wrong they describe it here, and the admin corrects the shift. The answer comes back in the table at the bottom of this page." },
    { role: F, page: "app/leave.html", el: ".stat-grid", side: "bottom",
      title: "Time-off balance",
      text: "The balance builds up a little for every week worked, and goes down when approved time off is taken. Hover over the tiles to see how the number is made up." },
    { role: F, page: "app/leave.html", el: card("#leaveCalendar"), side: "top",
      title: "Ask from the calendar",
      text: "Click a day to ask for it off. Requests show in colour by status, public holidays are marked, and weekends and holidays are never taken out of the balance." },
    { role: F, page: "app/leave.html", el: card("#leaveRequestsList"), side: "top",
      title: "Requests and the conversation",
      text: "Each request with its status and the admin's note. The speech bubble opens a conversation on that request, so questions do not get lost in email." },
    { role: F, page: "app/profile.html", el: card("#myHistoryList"), side: "top",
      title: "Nothing changes quietly",
      text: "Every change made to this person's record is listed here with who made it and when: a corrected shift, a decision on time off, a balance adjustment." },
    { role: F, page: "app/profile.html", el: "#demo-role-switch", side: "bottom",
      title: "Now the admin's side",
      text: "That is everything a contractor sees, and all a contractor can ever open in the real tool. Press Next and the demo switches to the <b>Admin view</b>, signed in as <b>" + BOSS + "</b>. " +
            "In real use this side needs an admin's own sign-in." },
    /* ---------------- Admin side ---------------- */
    { role: M, page: "admin/index.html", el: ".stat-grid", side: "bottom",
      title: "The team right now",
      text: "How many people are on the team, how many are working this minute, how many are on a break, and the team's hours so far this week." },
    { role: M, page: "admin/index.html", el: card("#liveList"), side: "top",
      title: "Who is on shift",
      text: "A live list with a running timer for each person. When someone starts, pauses or finishes on their side, this updates by itself." },
    { role: M, page: "admin/index.html", el: card("#annForm"), side: "top",
      title: "Notices",
      text: "A one-line message that appears at the top of every contractor's pages, with a level and an expiry date. Notices can be paused and brought back." },
    { role: M, page: "admin/index.html", el: "#autoCloseCard", side: "top",
      title: "Shifts left open",
      text: "If someone forgets to finish their shift, it is closed automatically at the end of the working day and listed here to be checked." },
    { role: M, page: "admin/index.html", el: card("#teamActivityTimeline"), side: "top",
      title: "Everyone's day side by side",
      text: "The same timeline each contractor sees, one column per person." },
    { role: M, page: "admin/index.html", el: card("#weekChart"), side: "top",
      title: "This week's hours",
      text: "Hours per person since Monday." },
    { role: M, page: "admin/timesheets.html", el: "#editRequestsCard", side: "bottom",
      title: "Correction requests",
      text: "What the contractors have asked to be corrected. <b>Open day</b> jumps to that day below; <b>Resolve</b> sends an answer back." },
    { role: M, page: "admin/timesheets.html", el: card("#dayList"), side: "top",
      title: "One day, everyone",
      text: "Every person's sessions for a chosen day. Click a block to correct its times, or add a missing shift. Every correction is written to the history log." },
    { role: M, page: "admin/timesheets.html", el: card("#periodChart"), side: "top",
      title: "Totals for a period",
      text: "Worked time and breaks per person for today, this week, this month, the last 90 days or any range. Further down, one person's shifts can be listed day by day." },
    { role: M, page: "admin/leave.html", el: card("#teamCalendar"), side: "top",
      title: "Everyone's time off",
      text: "All requests on one calendar, so a clash is obvious before a request is approved." },
    { role: M, page: "admin/leave.html", el: card("#pendingList"), side: "top",
      title: "Requests to decide",
      text: "Approve or decline, with a note. <b>" + REQ + "</b>'s request has a conversation on it already: open it to read both sides before deciding." },
    { role: M, page: "admin/leave.html", el: card("#balancesList"), side: "top",
      title: "Balances",
      text: "Each person's balance and how it is made up. <b>Adjust</b> adds or removes hours with a reason, and the reason stays on the record." },
    { role: M, page: "admin/users.html", el: card("#listContainer"), side: "top",
      title: "People",
      text: "The team list. Add a person, edit their details and starting balance, deactivate someone who has left. An <b>Observer</b> can look at the admin's pages without being able to change anything." },
    { role: M, page: "admin/analytics.html", el: ".stat-grid", side: "bottom",
      title: "Trends",
      text: "The same hours, looked at over weeks and months, for the whole team or one person." },
    { role: M, page: "admin/analytics.html", el: card("#clockInChart"), side: "top",
      title: "Habits show up here",
      text: "When shifts usually start, how hours spread across the week, and the team side by side. This is where a late starter or someone working long days becomes visible." },
    { role: M, page: "admin/security.html", el: card("#liveBoard"), side: "top",
      title: "Activity while on shift",
      text: "For each person on shift: active, on a break, or away from the keyboard and for how long. In the live tool this comes from the contractor's own browser. In the demo it is generated data." },
    { role: M, page: "admin/security.html", el: card("#reportArea"), side: "top",
      title: "Away time by day",
      text: "Each away period for a chosen day with its length and reason. Declared breaks are never counted as away." },
    { role: M, page: "admin/audit.html", el: card("#auditList"), side: "top",
      title: "The history log",
      text: "Every change by anyone, with who, when and what. It can be filtered, and nothing in it can be edited or removed." },
    { role: M, page: "admin/audit.html", el: "#tkTourBtn", side: "left",
      title: "That's the tour",
      text: "Have a go on both sides. As a contractor: take a break, finish the shift, ask for a day off. Then switch to the admin and approve it. Nothing you do is saved. This button starts the tour again." }
  ];

  function injectTourButton() {
    if (document.getElementById("tkTourBtn")) return;
    var btn = document.createElement("button");
    btn.id = "tkTourBtn"; btn.type = "button"; btn.className = "hrt-tour-btn hrt-tour-btn-floating";
    btn.title = "Take the guided tour"; btn.setAttribute("aria-label", "Take the guided tour");
    btn.innerHTML = "<span class='hrt-tour-btn-icon' aria-hidden='true'>?</span><span>Take the tour</span>";
    btn.addEventListener("click", function () {
      var last = parseInt(ss(LAST) || "", 10);
      travel(isNaN(last) || last >= STEPS.length - 1 ? 0 : last);
    });
    document.body.appendChild(btn);
  }

  function travel(idx) {
    var st = STEPS[idx];
    ss(KEY, idx);
    if (st.page === here() && window.demoRole && window.demoRole() === st.role) { run(idx); return; }
    window.demoGo(st.role, st.page);
  }
  function finish(idx, completed) {
    ss(KEY, null); ss(DONE, "1"); ss(LAST, completed ? null : idx);
  }

  function waitFor(test, maxMs, cb) {
    var t0 = Date.now();
    (function check() {
      var ok = false; try { ok = !!test(); } catch (e) {}
      if (ok) setTimeout(cb, 250); else if (Date.now() - t0 > maxMs) cb(); else setTimeout(check, 150);
    })();
  }
  function target(st) { return !st.el ? null : (typeof st.el === "function" ? st.el() : $(st.el)); }
  function settled() {
    // the page's own lists have finished loading
    var busy = [].slice.call(document.querySelectorAll(".empty")).some(function (e) { return /Loading/.test(e.textContent) && e.offsetParent; });
    return !busy;
  }

  var current = null;
  function run(idx) {
    if (!window.driver || !window.driver.js || !window.driver.js.driver) return;
    if (current) { try { current.destroy(); } catch (e) {} current = null; }
    var page = STEPS[idx].page, role = STEPS[idx].role;
    var first = idx, last = idx;
    while (first > 0 && STEPS[first - 1].page === page && STEPS[first - 1].role === role) first--;
    while (last < STEPS.length - 1 && STEPS[last + 1].page === page && STEPS[last + 1].role === role) last++;
    var local = [];
    for (var i = first; i <= last; i++) {
      (function (g) {
        var st = STEPS[g];
        var step = {
          popover: { title: st.title, description: st.text, side: st.el ? (st.side || "bottom") : "over", align: st.el ? "start" : "center",
                     progressText: "Step " + (g + 1) + " of " + STEPS.length, showProgress: true,
                     disableButtons: g === 0 ? ["previous"] : [] }
        };
        step._st = st; step._g = g;
        local.push(step);
      })(i);
    }
    var pos = idx - first, closedByNav = false;
    var d = window.driver.js.driver({
      showProgress: true, allowClose: true, allowKeyboardControl: false, disableActiveInteraction: true,
      animate: true, scrollIntoViewOptions: { behavior: "smooth", block: "center", inline: "nearest" },
      overlayOpacity: 0.55, stagePadding: 6, stageRadius: 10, popoverClass: "hrt-tour-popover",
      nextBtnText: "Next →", prevBtnText: "← Back", doneBtnText: last === STEPS.length - 1 ? "Finish" : "Next →",
      steps: local,
      onNextClick: function () { go(first + pos + 1); },
      onPrevClick: function () { go(first + pos - 1); },
      onHighlightStarted: function (el, step, ctx) {
        if (ctx && ctx.state && typeof ctx.state.activeIndex === "number") pos = ctx.state.activeIndex;
        ss(KEY, first + pos); ss(LAST, first + pos);
      },
      onDestroyed: function () {
        document.removeEventListener("keydown", keys, true);
        if (!closedByNav) finish(first + pos, false);
        current = null;
      }
    });
    function go(g) {
      if (g < 0) return;
      if (g >= STEPS.length) { closedByNav = true; finish(g, true); try { d.destroy(); } catch (e) {} return; }
      if (g >= first && g <= last) { pos = g - first; try { d.moveTo(pos); } catch (e) {} return; }
      closedByNav = true;
      ss(KEY, g);
      try { d.destroy(); } catch (e) {}
      window.demoGo(STEPS[g].role, STEPS[g].page);
    }
    function keys(ev) {
      if (current !== d) return;
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); try { d.destroy(); } catch (e) {} return; }
      if (ev.target && /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName)) return;
      if (ev.key === "ArrowRight" || ev.key === "Enter") { ev.preventDefault(); ev.stopPropagation(); go(first + pos + 1); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); ev.stopPropagation(); go(first + pos - 1); }
    }
    document.addEventListener("keydown", keys, true);
    current = d;
    waitFor(function () { return settled() && (!STEPS[idx].el || target(STEPS[idx])); }, 8000, function () {
      // point each step at its element by id (this Driver version takes a selector, not a function)
      local.forEach(function (step) {
        if (!step._st.el) return;
        var el = target(step._st);
        if (!el) return;
        if (!el.id) el.id = "tkTourT" + step._g;
        step.element = "#" + el.id;
      });
      try { d.setSteps(local); d.drive(pos); } catch (e) { console.error(e); }
    });
  }

  window.startTkTour = function () { travel(0); };
  window.tkTourSteps = STEPS;

  function loadDriverThen(cb) {
    if (window.driver && window.driver.js) { cb(); return; }
    var s = document.createElement("script"); s.src = DRIVER_JS; s.onload = cb;
    s.onerror = function () { console.error("[tk-tour] Driver.js failed to load"); };
    document.head.appendChild(s);
  }
  function ready(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  ready(function () {
    if (!/(app|admin)\/[^/]*$/.test(location.pathname)) return;      // the root, sign-in and set-password pages have no tour
    injectTourButton();
    loadDriverThen(function () {
      var saved = parseInt(ss(KEY) || "", 10);
      if (!isNaN(saved) && STEPS[saved]) {                 // a tour is travelling: carry on here
        if (STEPS[saved].page === here() && window.demoRole() === STEPS[saved].role) run(saved);
        return;
      }
      var begin = function (mode) { if (mode === "tour" && !ss(DONE)) travel(0); };
      if (window.DemoChooser && typeof window.DemoChooser.whenChosen === "function") window.DemoChooser.whenChosen(begin);
      else document.addEventListener("demo:mode", function (e) { begin(e.detail && e.detail.mode); });
    });
  });
})();
