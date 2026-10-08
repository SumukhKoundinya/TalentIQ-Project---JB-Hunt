# Integrate Set Up into another TalentIQ version

Do these steps on the target branch after copying `features/setup/`.

## 1. Load assets

In `index.html` (after main `styles.css`, before `</body>` scripts finish):

```html
<link rel="stylesheet" href="features/setup/setup-styles.css" />
```

Near other view scripts (after `components.js` / `qrcode-generator.js`, before `app.js`):

```html
<script src="features/setup/setup-views.js"></script>
```

## 2. Sidebar nav

Add a Set Up step (route id must be `kiosk`):

```html
<a class="nav-link nav-step" href="#" data-nav="kiosk">
  <span class="nav-step__num" aria-hidden="true">1</span>
  <span class="nav-step__copy">
    <span class="nav-step__title">Set Up</span>
    <span class="nav-step__sub">Before the fair</span>
  </span>
</a>
```

See `snippets/nav.html`.

## 3. Router case

In `app.js` `navigateTo` switch:

```js
case "kiosk":
  if (searchWrap) searchWrap.style.display = "none";
  container.innerHTML = TIQ.views.renderKiosk();
  TIQ.views.initKioskForm();
  break;
```

When leaving Set Up, stop the booth camera if present:

```js
if (viewName !== "kiosk" && TIQ.views._stopKioskCamera) {
  TIQ.views._stopKioskCamera();
}
```

See `snippets/router.js`.

## 4. Config labels

In `config.js` `viewTitles`:

```js
"kiosk": "Set Up",
```

Event fields used by the UI:

```js
eventName: "...",
eventDate: "...",
eventLocation: "...",
```

## 5. Data helper

Ensure `data.js` exposes:

```js
TIQ.eventInfo = function() {
  var e = TIQ.state && TIQ.state.event ? TIQ.state.event : {};
  return {
    name: e.name || TIQ.CONFIG.eventName || "",
    date: e.date || TIQ.CONFIG.eventDate || "",
    location: e.location || TIQ.CONFIG.eventLocation || ""
  };
};
```

And that `TIQ.saveState()` persists `TIQ.state.event`.

## 6. Remove duplicates

If the target already has inline kiosk code inside `views.js` / `styles.css`, delete those blocks so this pack is the single source of truth (search for `renderKiosk` / `.kiosk-workspace`).

## 7. Smoke test

1. Serve static files (`python -m http.server 8000`)
2. Open Set Up — event card + QR + camera panel render
3. Edit event / QR via the info buttons
4. Print poster / copy link
5. Navigate away — camera stops

## Optional

- Ship `candidate-form.html` if QR should open the local intake form
- Camera preview needs `TIQ.VideoRecorder` from `components.js`; without it, Allow camera still fails gracefully via toast
