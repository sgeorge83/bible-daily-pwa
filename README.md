# Verse of the Day — WordOnAir Labs

A fullscreen daily Scripture display. Open the page in a browser, put it on a TV, kiosk, tablet, or phone, and the verse fills the screen. It follows the WordOnAir brand: navy, gold, and teal, with the gold cross heading used across WordOnAir Labs apps.

Live verse, reference, and a short insight come from the existing morning API. The date and clock update on the display. The verse refreshes every 10 minutes and again whenever the tab becomes visible.

## What you see

- **WordOnAir Labs** wordmark and logo
- Gold cross, **Verse of the Day**, and today’s date
- ESV verse text that scales with the screen
- Optional verse insight
- Soft motion (ambient glow, gold motes, on-air equalizer) so a static display still feels alive

## Run locally

This is a static PWA. Serve the project root over HTTP (opening `index.html` as a file will not work for fetch or PWA features):

```bash
python3 -m http.server 43123 --bind 127.0.0.1
```

Then open http://127.0.0.1:43123/

If the API is unreachable, the last saved verse is shown from `localStorage`.

## How the verse is built

1. Daily verse reference from Bible.org
2. Scripture text from the ESV API
3. A short 2–3 line clarity summary (not theological commentary)

Scripture text is never modified. The insight is additive only.

## Disclaimer

Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © Crossway.

The short explanation is for readability only. It is not doctrinal guidance. Refer to the original Scripture for full understanding.

## Stack

HTML, CSS, and JavaScript as an installable PWA. Branding matches [wordonair.com](https://wordonair.com). Hosted as static files (GitHub Pages or any static host).

A project of **WordOnAir Labs**.
