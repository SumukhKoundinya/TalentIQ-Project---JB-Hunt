/* Paste into TIQ.router.navigateTo */

/* When leaving Set Up: */
if (viewName !== "kiosk" && TIQ.views._stopKioskCamera) {
  TIQ.views._stopKioskCamera();
}

/* Route case: */
case "kiosk":
  if (searchWrap) searchWrap.style.display = "none";
  container.innerHTML = TIQ.views.renderKiosk();
  TIQ.views.initKioskForm();
  break;
