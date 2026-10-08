# Set Up (Kiosk) Feature Pack

Isolated **Set Up** section from TalentIQ so another branch/version can pull just this feature and wire it in.

## What’s included

| File | Purpose |
|------|---------|
| `setup-views.js` | `renderKiosk`, `initKioskForm`, booth camera preview, event/QR editors |
| `setup-styles.css` | Kiosk layout, camera panel, responsive + print poster |
| `INTEGRATE.md` | Step-by-step merge checklist for another version |
| `snippets/` | Copy-paste hooks for nav, router, and config |

## Runtime dependencies (already in the main app)

- `config.js` — `TIQ.CONFIG` event fields + `viewTitles.kiosk`
- `data.js` — `TIQ.eventInfo()`, `TIQ.state.event`, `TIQ.saveState`
- `data.js` / `components.js` — `TIQ.escapeHtml` / `escapeAttr`, `TIQ.showToast`; `TIQ.VideoRecorder` is optional (a setup-only preview adapter is used when absent)
- `qrcode-generator.js` — booth QR canvas
- Optional: `candidate-form.html` as the default QR target URL

## Quick use in this repo

Already wired from `index.html`:

```html
<link rel="stylesheet" href="features/setup/setup-styles.css" />
<script src="features/setup/setup-views.js"></script>
```

Open **Set Up** in the sidebar (`data-nav="kiosk"`).

### Host integration notes

- Loaded after `views.js` (as well as components and QR), before `app.js`; the sidebar uses the existing config-driven `kiosk` step rather than a second static link.
- **Open Capture** targets this app's `capture` route. Camera permission is requested only on **Allow camera**, and navigation stops the preview, including late permission results in the preview adapter. No Capture or recording implementation was imported.
- Event edits preserve other event fields (including event identity) and persist through the host's `saveState`; QR settings are page-session only.
- Camera access requires HTTPS or localhost. Printing invokes the browser's print dialog with only the QR panel visible.

## Pull into another version

```bash
git fetch origin
git checkout <your-other-branch>
git checkout origin/feature/setup-section -- features/setup
# then follow INTEGRATE.md
```

Or copy the `features/setup/` folder into the other tree and follow `INTEGRATE.md`.
