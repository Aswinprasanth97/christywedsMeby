# Meby &amp; Christy — Wedding Invitation 💍

A beautiful, responsive **single-page static wedding invitation** inspired by a traditional Kerala Jacobite Syrian Christian wedding card. Built with **HTML5, Tailwind CSS (Play CDN), and vanilla JavaScript** — no backend, no build tools, no framework.

> _"So they are no longer two but one flesh. Therefore what God has joined together, let no one separate."_ — Matthew 19:6

**Monday, 16 November 2026 · 11:00 AM · St. John the Baptist Jacobite Syrian Church, Kumarakom, Kerala**

---

## ✨ Features

- Elegant, premium invitation-card design — navy typography, gold accents, soft blue watercolor florals, plenty of whitespace
- Google Fonts: **Great Vibes** (names), **Cormorant Garamond** (headings), **Lato** (body)
- **Live countdown** to the wedding day (updates every second)
- **RSVP form** — no backend; responses saved to the browser's `localStorage`, with a graceful "Thank you ❤️" state
- **Add to Calendar** — generates and downloads a real `.ics` file
- **Open Location** (Google Maps) + **Copy Address** + **QR code** to the venue
- **WhatsApp share** + native Web Share
- **Back-to-top** and **jump-to-RSVP** floating buttons
- Optional **background music** toggle (mute/unmute)
- Elegant **loading animation**, smooth scrolling, subtle AOS fade/zoom/slide animations
- Fully **responsive** (desktop / tablet / mobile), accessible focus states, reduced-motion support
- **SEO** meta tags, **Open Graph** / Twitter cards, JSON-LD Event schema, **favicon**, lazy-loaded decorative images

---

## 📁 Folder structure

```
wedding-invitation/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── images/
│   ├── flowers/
│   │   ├── bouquet.svg
│   │   └── sprig.svg
│   ├── church-icon.svg
│   ├── qr.svg
│   ├── favicon.svg
│   └── og-image.svg
├── audio/            (optional background music — see audio/README.md)
├── fonts/            (fonts load via Google Fonts CDN; see fonts/README.md to self-host)
└── README.md
```

---

## 🚀 Run locally

It's a static site — just open `index.html`. For clipboard, share and font features to behave exactly as in production, serve it over `http://` rather than `file://`:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

or use the VS Code **Live Server** extension.

---

## 🌐 Deploy (free static hosting)

**GitHub Pages**
1. Push these files to a GitHub repo.
2. Settings → Pages → Source: `main` branch, `/root`.
3. Your site goes live at `https://<user>.github.io/<repo>/`.

**Netlify** — drag-and-drop this folder onto the Netlify dashboard, or connect the repo (no build command, publish directory = project root).

**Vercel** — `vercel` in the project folder, or import the repo (Framework preset: *Other*).

---

## 🛠️ Customising

All the wedding details live in **one place** — the `WEDDING` object at the top of [`js/script.js`](js/script.js): couple names, date/time, venue, address, and Google Maps link. Update those, then update the matching visible text in [`index.html`](index.html).

| To change… | Where |
|---|---|
| Names, verse, parents, addresses | `index.html` |
| Date & time, `.ics` times, maps URL | `WEDDING` object in `js/script.js` (+ visible date in `index.html`) |
| Colours & fonts | CSS variables in `css/styles.css` and the `tailwind.config` in `index.html` |
| Real QR code | Replace `images/qr.svg` (generate one pointing at your maps link) |
| Share/OG image | Replace `images/og-image.svg` (a PNG/JPG is best for social previews) |
| Background music | Add `audio/instrumental.mp3` (see `audio/README.md`) |

### Notes
- **Tailwind** is loaded via the Play CDN so there's no build step. For a production build with the smallest CSS, you can optionally switch to the Tailwind CLI later.
- The **QR** and **OG** images are SVG placeholders. For best social-media previews, export `og-image` as a `1200×630` PNG. For the QR, generate a real code (e.g. from your Google Maps link) and drop it in as `images/qr.svg`/`.png`.
- RSVP data is saved to the guest's device (localStorage) as a backup, and — if you set `sheetEndpoint` in `js/script.js` — is also posted to a **Google Sheet** you own. Setup takes ~5 minutes: see [`google-apps-script/README.md`](google-apps-script/README.md). Leave `sheetEndpoint: ""` to keep responses device-only.

---

## ⚡ Performance & accessibility

- Decorative images are inline SVG or `loading="lazy"`, sized to avoid layout shift.
- Fonts use `display=swap`; only the weights in use are requested.
- Honors `prefers-reduced-motion`; buttons have visible focus rings; live regions announce toasts.
- Targets **Lighthouse 95+** on a served (`http://`) deployment.

Made with ❤️ for Meby &amp; Christy.
