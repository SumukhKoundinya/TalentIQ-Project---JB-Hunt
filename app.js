/* ============================================
   TalentIQ — Router & Application Shell
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.router = {
  currentView: TIQ.CONFIG.defaultView,
  viewTitles: TIQ.CONFIG.viewTitles,

  navigateTo: function(viewName) {
    if (!this.viewTitles[viewName]) return;

    // Guard: confirm before leaving an active recording session
    if (viewName !== this.currentView && TIQ.views._recordingNavigationGuard) {
      if (!TIQ.views._recordingNavigationGuard()) return;
      TIQ.views._recordingNavigationGuard = null;
    }

    this.currentView = viewName;

    // Mobile Capture uses a full-screen Tinder deck; body class drives that layout.
    var isCaptureDeck = viewName === "capture" || viewName === "recruiter-capture";
    document.body.classList.toggle("tiq-capture-deck", isCaptureDeck);

    // Workflow sidebar: treat related views as the Capture step
    var activeNav = viewName;
    if (viewName === "capture" || viewName === "booth-record") activeNav = "recruiter-capture";

    document.querySelectorAll(".nav-link, .bottom-nav__link").forEach(function(link) {
      link.classList.toggle("active", link.dataset.nav === activeNav);
    });

    var title = document.getElementById("pageTitle");
    if (title) title.textContent = this.viewTitles[viewName];

    if (TIQ.app && TIQ.app.updateSidebarCounts) TIQ.app.updateSidebarCounts();

    var container = document.getElementById("viewContainer");
    var searchWrap = document.getElementById("globalSearchWrap");
    if (!container) return;

    // Remove old capture / recording keydown listeners
    document.removeEventListener("keydown", TIQ.views._captureKeyHandler);
    document.removeEventListener("keydown", TIQ.views._recCaptureKeyHandler);

    // Tear down Set Up camera when leaving kiosk
    if (viewName !== "kiosk" && TIQ.views._stopKioskCamera) {
      TIQ.views._stopKioskCamera();
    }

    // Tear down recording camera/mic when leaving booth record
    if (viewName !== "booth-record" && TIQ.views._recordingCleanup) {
      TIQ.views._recordingCleanup();
      TIQ.views._recordingCleanup = null;
    }
    if (viewName !== "booth-record" && TIQ.views._videoRecorder &&
        TIQ.views._videoRecorder.getState && TIQ.views._videoRecorder.getState() !== "idle") {
      try { TIQ.views._videoRecorder.cancel(); } catch (e) {}
    }

    switch (viewName) {
      case "analytics":
        if (searchWrap) searchWrap.style.display = "none";
        container.innerHTML = TIQ.skeleton.overlay("overview");
        requestAnimationFrame(function() {
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
      case "recruiter-capture":
        if (searchWrap) searchWrap.style.display = "none";
        container.innerHTML = TIQ.views.renderCapture();
        TIQ.views.initCaptureEvents();
        break;
      case "booth-record":
        if (searchWrap) searchWrap.style.display = "none";
        container.innerHTML = TIQ.views.renderRecordingCapture();
        TIQ.views.initRecordingCapture();
        break;
      case "review":
        if (searchWrap) searchWrap.style.display = "";
        container.innerHTML = TIQ.skeleton.overlay("list");
        requestAnimationFrame(function() {
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
  updateSidebarCounts: function() {
    var cands = (TIQ.state && TIQ.state.candidates) || [];
    var captureEl = document.getElementById("sidebarCaptureCount");
    if (captureEl) {
      var n = cands.length;
      captureEl.textContent = n + " local record" + (n === 1 ? "" : "s");
    }
    var pendingEl = document.getElementById("sidebarPendingCount");
    if (pendingEl) {
      var pending = cands.filter(function(c) {
        if (!c) return false;
        if (c.approvalStatus && c.approvalStatus !== "Approved") return true;
        return c.recordStatus === "New" || c.recordStatus === "Follow-Up" || c.recordStatus === "Interview Requested";
      }).length;
      pendingEl.textContent = pending + " pending approval";
    }
  },

  init: function() {
    // Update sidebar event info
    var sidebarEvent = document.getElementById("sidebarEventName");
    var sidebarDate = document.getElementById("sidebarEventDate");
    var sidebarLoc = document.getElementById("sidebarEventLocation");
    var ev = TIQ.eventInfo();
    if (sidebarEvent) sidebarEvent.textContent = ev.name;
    if (sidebarDate) sidebarDate.textContent = ev.date;
    if (sidebarLoc) sidebarLoc.textContent = ev.location;
    TIQ.app.updateSidebarCounts();

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

      // Number keys for recruiter workflow
      var viewMap = {
        "1": "kiosk",
        "2": "recruiter-capture",
        "3": "review",
        "4": "analytics",
        "5": "metrics"
      };
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
        TIQ.showToast("Keys: 1 Set Up, 2 Capture, 3 Review, 4 Event Results, 5 Metrics, / = search");
      }
    });

    // New Record button navigates to Set Up / intake
    var newBtn = document.querySelector(".create-button");
    if (newBtn) newBtn.addEventListener("click", function() { TIQ.router.navigateTo("kiosk"); });

    // Navigate to initial view
    TIQ.router.navigateTo(TIQ.CONFIG.defaultView);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  TIQ.app.init();
});
