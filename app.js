/* ============================================
   TalentIQ — Router & Application Shell
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.router = {
  currentView: TIQ.CONFIG.defaultView,
  routes: TIQ.CONFIG.workflow.concat(TIQ.CONFIG.study),

  navigateTo: function(viewName) {
    var route = this.routes.find(function(r) { return r.key === viewName; });
    if (!route) return;
    if (viewName !== 'kiosk' && TIQ.views._stopKioskCamera) TIQ.views._stopKioskCamera();
    if (this.currentView === 'review' && TIQ.views.snapshotReview) TIQ.views.snapshotReview();
    this.currentView = viewName;

    document.querySelectorAll(".nav-link").forEach(function(link) {
      link.classList.toggle("active", link.dataset.nav === viewName);
    });

    var recruiterSelect = document.getElementById("recruiterSelect");
    var container = document.getElementById("viewContainer");
    if (!container) return;

    // Remove old capture keydown listener
    document.removeEventListener("keydown", TIQ.views._captureKeyHandler);

    switch (viewName) {
      case "kiosk":
        container.innerHTML = TIQ.views.renderKiosk();
        TIQ.views.initKioskForm();
        break;
      case "capture":
        container.innerHTML = TIQ.views.renderCapture();
        TIQ.views.initCaptureEvents();
        break;
      case "review":
        container.innerHTML = TIQ.views.renderReview();
        TIQ.views.initReviewEvents();
        break;
    }

    TIQ.saveState();
  }
};

TIQ.app = {
  init: async function() {
    if (TIQ.clearSampleDataOnce) await TIQ.clearSampleDataOnce();
    TIQ.initWorkflow();
    // Update sidebar event info
    var sidebarEvent = document.getElementById("sidebarEventName");
    var sidebarDate = document.getElementById("sidebarEventDate");
    var sidebarLoc = document.getElementById("sidebarEventLocation");
    var ev = TIQ.eventInfo();
    if (sidebarEvent) sidebarEvent.textContent = ev.name;
    if (sidebarDate) sidebarDate.textContent = ev.date;
    if (sidebarLoc) sidebarLoc.textContent = ev.location;

    // Update fonts link from config
    var fontsLink = document.getElementById("fontsLink");
    if (fontsLink) fontsLink.href = TIQ.CONFIG.fontsUrl;

    // Update logo from config
    var logoImg = document.querySelector(".brand-logo-img");
    if (logoImg) logoImg.src = TIQ.CONFIG.logoPath;

    // Populate recruiter dropdown
    var sel = document.getElementById("recruiterSelect");
    if (sel) {
      sel.innerHTML = '<option value="">Select recruiter</option>' +
        TIQ.RECRUITERS.map(function(r) { return '<option value="' + r.id + '">' + TIQ.escapeHtml(r.name) + '</option>'; }).join("");
      sel.value = TIQ.state.activeRecruiterId;
      sel.addEventListener("change", function() {
        TIQ.state.activeRecruiterId = sel.value;
        TIQ.saveState();
        TIQ.showToast(sel.value ? "Active recruiter: " + TIQ.recruiterName(sel.value) : "Active recruiter not set");
      });
    }

    // Sidebar navigation
    document.querySelectorAll("[data-nav]").forEach(function(link) {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        TIQ.router.navigateTo(link.dataset.nav);
      });
    });

    // Compare modal close
    var modal = document.getElementById("compareModal");
    if (modal) {
      modal.addEventListener("click", function(e) {
        if (e.target.closest("[data-compare-close]")) modal.hidden = true;
      });
    }

    // Escape key closes modal
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && modal && !modal.hidden) modal.hidden = true;
      if (document.getElementById("demoLogin")) return;

      // Native controls and editable content own their keyboard interaction.
      if (TIQ.captureWorkflow.shortcutsBlocked(e.target)) return;

      // Number keys follow the currently available workflow steps
      var viewMap = {};
      TIQ.CONFIG.workflow.forEach(function(s) { viewMap[String(s.step)] = s.key; });
      if (viewMap[e.key]) { e.preventDefault(); TIQ.router.navigateTo(viewMap[e.key]); return; }

      // ? to show keyboard shortcuts
      if (e.key === "?") {
        TIQ.showToast("1 Set Up · 2 Capture · 3 Review · Esc Close");
      }
    });

    // New Record button navigates to intake
    var newBtn = document.querySelector(".create-button");
    if (newBtn) newBtn.addEventListener("click", function() { TIQ.router.navigateTo("capture"); });

    // Start with a local, demo-only recruiter chooser. This is not authentication.
    var candidateId = new URLSearchParams(window.location.search).get('candidate');
    var found = candidateId && TIQ.views.selectCaptureCandidate(candidateId);
    var loginRoot = document.getElementById("demoLoginRoot");
    var appShell = document.querySelector(".app-shell");
    var skipLink = document.querySelector(".skip-link");
    if (loginRoot) {
      loginRoot.innerHTML = TIQ.views.renderDemoLogin();
      if (appShell) appShell.hidden = true;
      if (skipLink) skipLink.hidden = true;
      TIQ.views.initDemoLoginEvents(function(recruiterId) {
        TIQ.state.activeRecruiterId = recruiterId;
        if (sel) sel.value = recruiterId;
        TIQ.saveState();
        loginRoot.innerHTML = "";
        if (appShell) appShell.hidden = false;
        if (skipLink) skipLink.hidden = false;
        TIQ.router.navigateTo(found ? 'capture' : 'kiosk');
        if (candidateId && !found) TIQ.showToast('This profile is not saved in this browser at this address. Import its submission JSON or submit here first.');
      });
    }
  }
};

document.addEventListener("DOMContentLoaded", function() {
  TIQ.app.init().catch(function(error) {
    console.error('[TalentIQ] Previous data cleanup failed:',error);
    document.getElementById('viewContainer').textContent='Previous data cleanup could not finish. Close other TalentIQ tabs and reload to retry.';
  });
});
