/* ============================================
   TalentIQ — Router & Application Shell
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.router = {
  currentView: TIQ.CONFIG.defaultView,
  viewTitles: TIQ.CONFIG.viewTitles,

  navigateTo: function(viewName) {
    if (!this.viewTitles[viewName]) return;
    if (!TIQ.auth.isLoggedIn() && viewName !== "login") {
      TIQ.app.showLogin();
      return;
    }
    if (viewName !== this.currentView && TIQ.views._recordingNavigationGuard) {
      if (!TIQ.views._recordingNavigationGuard()) return;
      TIQ.views._recordingNavigationGuard = null;
    }
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
    if (viewName !== "recruiter-capture" && TIQ.views._recordingCleanup) {
      TIQ.views._recordingCleanup();
      TIQ.views._recordingCleanup = null;
    }
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
  showLogin: function() {
    if (TIQ.CONFIG && TIQ.CONFIG.skipLogin) {
      this.hideLogin();
      return;
    }
    document.documentElement.classList.remove("tiq-skip-login");
    var screen = document.getElementById("loginScreen");
    var shell = document.getElementById("appShell");
    document.body.classList.add("login-open");
    if (screen) {
      screen.hidden = false;
      screen.style.display = "";
    }
    if (shell) shell.hidden = true;
  },

  hideLogin: function() {
    if (TIQ.CONFIG && TIQ.CONFIG.skipLogin) {
      document.documentElement.classList.add("tiq-skip-login");
    }
    var screen = document.getElementById("loginScreen");
    var shell = document.getElementById("appShell");
    document.body.classList.remove("login-open");
    if (screen) {
      screen.hidden = true;
      screen.style.display = "none";
    }
    if (shell) shell.hidden = false;
  },

  refreshRecruiterSelect: function() {
    var sel = document.getElementById("recruiterSelect");
    if (!sel) return;
    var list = TIQ.RECRUITERS || TIQ.CONFIG.recruiters || [];
    sel.innerHTML = '<option value="">Select recruiter</option>' +
      list.map(function(r) {
        return '<option value="' + TIQ.escapeAttr(r.id) + '">' + TIQ.escapeHtml(r.name) + '</option>';
      }).join("");
    sel.value = TIQ.state.activeRecruiterId || "";
  },

  enterApp: function() {
    this.hideLogin();
    this.refreshRecruiterSelect();
    var session = TIQ.auth.current();
    if (session && session.name) {
      TIQ.showToast("Welcome, " + session.name);
    }
    TIQ.router.navigateTo(TIQ.CONFIG.defaultView);
  },

  setLoginMode: function(mode) {
    var isRegister = mode === "register";
    var loginForm = document.getElementById("loginForm");
    var registerForm = document.getElementById("registerForm");
    var title = document.getElementById("loginTitle");
    var footer = document.getElementById("loginFooter");
    var toggle = document.getElementById("loginRegisterToggle");
    if (loginForm) loginForm.hidden = isRegister;
    if (registerForm) registerForm.hidden = !isRegister;
    if (title) title.textContent = isRegister ? "Register" : "Login";
    if (footer) {
      footer.innerHTML = isRegister
        ? 'Already have an account? <button type="button" class="login-link login-link--strong" id="loginRegisterToggle">Login</button>'
        : 'Don\'t have an account? <button type="button" class="login-link login-link--strong" id="loginRegisterToggle">Register</button>';
      var nextToggle = document.getElementById("loginRegisterToggle");
      if (nextToggle) {
        nextToggle.addEventListener("click", function() {
          TIQ.app.setLoginMode(isRegister ? "login" : "register");
        });
      }
    }
    var loginErr = document.getElementById("loginError");
    var regErr = document.getElementById("registerError");
    if (loginErr) loginErr.textContent = "";
    if (regErr) regErr.textContent = "";
  },

  initLogin: function() {
    var loginForm = document.getElementById("loginForm");
    var registerForm = document.getElementById("registerForm");
    var forgotBtn = document.getElementById("loginForgotBtn");
    var toggle = document.getElementById("loginRegisterToggle");

    if (toggle) {
      toggle.addEventListener("click", function() {
        TIQ.app.setLoginMode("register");
      });
    }

    if (forgotBtn) {
      forgotBtn.addEventListener("click", function() {
        TIQ.showToast("Demo password for seed recruiters: talentiq");
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var username = (document.getElementById("loginUsername") || {}).value || "";
        var password = (document.getElementById("loginPassword") || {}).value || "";
        var remember = !!(document.getElementById("loginRemember") || {}).checked;
        var errEl = document.getElementById("loginError");
        var result = TIQ.auth.login(username, password, remember);
        if (!result.ok) {
          if (errEl) errEl.textContent = result.error || "Login failed.";
          return;
        }
        if (errEl) errEl.textContent = "";
        TIQ.app.enterApp();
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var name = (document.getElementById("registerName") || {}).value || "";
        var username = (document.getElementById("registerUsername") || {}).value || "";
        var password = (document.getElementById("registerPassword") || {}).value || "";
        var errEl = document.getElementById("registerError");
        var result = TIQ.auth.register(name, username, password);
        if (!result.ok) {
          if (errEl) errEl.textContent = result.error || "Could not register.";
          return;
        }
        if (errEl) errEl.textContent = "";
        TIQ.showToast("Account created. Logging you in…");
        var loginResult = TIQ.auth.login(username, password, true);
        if (loginResult.ok) TIQ.app.enterApp();
        else TIQ.app.setLoginMode("login");
      });
    }
  },

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

    // Merge any locally registered recruiters into the picker list
    try {
      var extras = JSON.parse(localStorage.getItem("talentiq_registered_v1") || "[]");
      if (!TIQ.RECRUITERS) TIQ.RECRUITERS = (TIQ.CONFIG.recruiters || []).slice();
      extras.forEach(function(acc) {
        if (!TIQ.RECRUITERS.some(function(r) { return r.id === acc.id; })) {
          TIQ.RECRUITERS.push({ id: acc.id, name: acc.name });
        }
      });
    } catch (e) {}

    // Populate recruiter dropdown
    this.refreshRecruiterSelect();
    var sel = document.getElementById("recruiterSelect");
    if (sel) {
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

    this.initLogin();

    if (TIQ.CONFIG.skipLogin) {
      var recruiters = TIQ.RECRUITERS || TIQ.CONFIG.recruiters || [];
      var demo = recruiters[0] || { id: "R1", name: "Taylor Morgan" };
      TIQ.auth.save({
        recruiterId: demo.id,
        name: demo.name,
        username: demo.name,
        loggedInAt: TIQ.nowISO(),
        skipped: true
      }, false);
      TIQ.state.activeRecruiterId = demo.id;
      TIQ.saveState();
      this.enterApp();
      return;
    }

    if (TIQ.auth.isLoggedIn()) {
      var session = TIQ.auth.current();
      if (session && session.recruiterId) {
        TIQ.state.activeRecruiterId = session.recruiterId;
        TIQ.saveState();
      }
      this.enterApp();
    } else {
      this.showLogin();
      this.setLoginMode("login");
    }
  }
};

document.addEventListener("DOMContentLoaded", function() {
  TIQ.app.init();
});
