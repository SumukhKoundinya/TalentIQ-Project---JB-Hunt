/* ============================================
   TalentIQ — Router & Application Shell
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.router = {
  currentView: TIQ.CONFIG.defaultView,
  viewTitles: TIQ.CONFIG.viewTitles,

  navigateTo: function(viewName) {
    if (!this.viewTitles[viewName]) return;
    this.currentView = viewName;

    document.querySelectorAll(".nav-link").forEach(function(link) {
      link.classList.toggle("active", link.dataset.nav === viewName);
    });

    var title = document.getElementById("pageTitle");
    if (title) title.textContent = this.viewTitles[viewName];

    var container = document.getElementById("viewContainer");
    var searchWrap = document.getElementById("globalSearchWrap");
    if (!container) return;

    // Remove old capture keydown listener
    document.removeEventListener("keydown", TIQ.views._captureKeyHandler);
    document.removeEventListener("keydown", TIQ.views._infoKeyHandler);
    if (TIQ.face && TIQ.face.enrollment) TIQ.face.enrollment.stopCamera();
    if (TIQ.views._videoRecorder && TIQ.views._videoRecorder.getState && TIQ.views._videoRecorder.getState() !== "idle") {
      try { TIQ.views._videoRecorder.cancel(); } catch (e) {}
    }

    switch (viewName) {
      case "overview":
        container.innerHTML = TIQ.views.renderOverview();
        if (searchWrap) searchWrap.style.display = "none";
        break;
      case "candidate-intake":
        container.innerHTML = TIQ.views.renderCandidateIntake();
        if (searchWrap) searchWrap.style.display = "none";
        TIQ.views.initIntakeForm();
        break;
      case "recruiter-capture":
        container.innerHTML = TIQ.views.renderRecruiterCapture();
        if (searchWrap) searchWrap.style.display = "none";
        TIQ.views.initCaptureEvents();
        break;
      case "info-review":
        container.innerHTML = TIQ.views.renderInfoReview();
        if (searchWrap) searchWrap.style.display = "none";
        TIQ.views.initInfoReview();
        break;
      case "ai-review":
        container.innerHTML = TIQ.views.renderAIReview();
        if (searchWrap) searchWrap.style.display = "";
        TIQ.views.initAIReviewEvents();
        break;
      case "candidate-review":
        container.innerHTML = TIQ.views.renderCandidateReview();
        if (searchWrap) searchWrap.style.display = "";
        TIQ.views.initCandidateReview();
        break;
    }

    TIQ.saveState();
  }
};

TIQ.app = {
  init: function() {
    // Update sidebar event info from config
    var sidebarEvent = document.getElementById("sidebarEventName");
    var sidebarDate = document.getElementById("sidebarEventDate");
    var sidebarLoc = document.getElementById("sidebarEventLocation");
    if (sidebarEvent) sidebarEvent.textContent = TIQ.CONFIG.eventName;
    if (sidebarDate) sidebarDate.textContent = TIQ.CONFIG.eventDate;
    if (sidebarLoc) sidebarLoc.textContent = TIQ.CONFIG.eventLocation;

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
    });

    // New Record button navigates to intake
    var newBtn = document.querySelector(".create-button");
    if (newBtn) newBtn.addEventListener("click", function() { TIQ.router.navigateTo("candidate-intake"); });

    // Navigate to initial view
    TIQ.router.navigateTo(TIQ.CONFIG.defaultView);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  TIQ.app.init();
});
