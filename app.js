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
    this.currentView = viewName;

    document.querySelectorAll(".nav-link").forEach(function(link) {
      link.classList.toggle("active", link.dataset.nav === viewName);
    });

    var title = document.getElementById("pageTitle");
    if (title) title.textContent = route.title;
    var container = document.getElementById("viewContainer");
    var searchWrap = document.getElementById("globalSearchWrap");
    if (!container) return;

    // Remove old capture keydown listener
    document.removeEventListener("keydown", TIQ.views._captureKeyHandler);

    switch (viewName) {
      case "analytics":
        if (searchWrap) searchWrap.style.display = "none";
        container.innerHTML = TIQ.skeleton.overlay("overview");
        requestAnimationFrame(function() {
          if (TIQ.router.currentView !== 'analytics') return;
          container.innerHTML = TIQ.views.renderAnalytics();
          TIQ.views.initAnalyticsEvents();
        });
        break;
      case "kiosk":
        if (searchWrap) searchWrap.style.display = "none";
        container.innerHTML = TIQ.views.renderKiosk();
        TIQ.views.initKioskForm();
        break;
      case "capture":
        if (searchWrap) searchWrap.style.display = "none";
        container.innerHTML = TIQ.views.renderCapture();
        TIQ.views.initCaptureEvents();
        break;
      case "review":
        if (searchWrap) searchWrap.style.display = "";
        container.innerHTML = TIQ.skeleton.overlay("list");
        requestAnimationFrame(function() {
          if (TIQ.router.currentView !== 'review') return;
          container.innerHTML = TIQ.views.renderReview();
          TIQ.views.initReviewEvents();
        });
        break;
      case "metrics":
        if (searchWrap) searchWrap.style.display = "none";
        container.innerHTML = TIQ.views.renderMetrics();
        TIQ.views.initMetricsEvents();
        break;
    }

    TIQ.saveState();
  }
};

TIQ.app = {
  init: function() {
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

      // Global keyboard shortcuts (ignore if inside input/textarea/select)
      var tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Number keys 1-4 for view navigation
      var viewMap = {};
      TIQ.CONFIG.workflow.forEach(function(s) { viewMap[String(s.step)] = s.key; });
      if (viewMap[e.key]) { e.preventDefault(); TIQ.router.navigateTo(viewMap[e.key]); return; }

      // / to focus search
      if (e.key === "/") {
        e.preventDefault();
        var searchInput = document.getElementById("aiSearch") || document.getElementById("reviewSearch") || document.getElementById("globalSearch");
        if (searchInput) searchInput.focus();
        return;
      }

      // ? to show keyboard shortcuts
      if (e.key === "?") {
        TIQ.showToast("1 Set Up · 2 Capture · 3 Review · 4 Event Results · / Search · Esc Close");
      }
    });

    // New Record button navigates to intake
    var newBtn = document.querySelector(".create-button");
    if (newBtn) newBtn.addEventListener("click", function() { TIQ.router.navigateTo("capture"); });

    // Navigate to initial view
    TIQ.router.navigateTo(TIQ.CONFIG.defaultView);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  TIQ.app.init();
});
