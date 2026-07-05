# StackUp Nest — Marketing Site

A single-file, production-ready landing page for **StackUp Nest** (legally registered), Ghana's savings, loans and trading circle. Built as one self-contained HTML document — no build step, no bundler, no dependencies to install.

![Status](https://img.shields.io/badge/status-production-16b877) ![Type](https://img.shields.io/badge/type-static%20HTML-0b1a13) ![Region](https://img.shields.io/badge/market-Ghana-e7c98a)

---

## ✨ What this is

This page is the public-facing marketing site that introduces StackUp Nest's three divisions — **Savings**, **Loans**, and **Trading & Commerce** — and funnels visitors into a full membership application flow that posts directly to the StackUp Nest Apps Script backend (the same backend powering the Admin and Member Portals).

It's an editorial-style, dark↔light alternating design (Fraunces serif display type + Inter UI + DM Mono labels) with a realistic mocked-up "Member Portal" preview built in pure HTML/CSS/SVG.

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Markup | Single static `.html` file |
| Styling | Vanilla CSS (custom properties / design tokens), no framework |
| Type | [Fraunces](https://fonts.google.com/specimen/Fraunces) (display), [Inter](https://fonts.google.com/specimen/Inter) (UI), [DM Mono](https://fonts.google.com/specimen/DM+Mono) (labels), [Material Symbols Rounded](https://fonts.google.com/icons) (icons) |
| Interactivity | Vanilla JS (no React/Vue, no build tooling) |
| Charts | Hand-rolled SVG (contribution curve in the hero mock-up) |
| Backend | Google Apps Script Web App (`doPost`) — shared with the Admin & Member Portals |
| Data store | Google Sheets (via the same Apps Script project) |

No `npm install`, no compiler — open the file in a browser and it works.

## 📁 File structure

```
.
└── index.html      # everything: <head>, styles, markup, and scripts in one file
```

Because this ships as a single file, there's nothing else to wire up. All assets are loaded from CDNs (Google Fonts, a hosted logo on ibb.co) or are inlined as SVG/CSS.

## 🚀 Quick start

**Just open it.**

```bash
git clone <this-repo>
cd <this-repo>
open index.html        # macOS
# or just double-click index.html / drag it into a browser
```

For local development with live reload, any static server works:

```bash
npx serve .
# or
python3 -m http.server 8080
```

### Deploying

This is a static file — host it anywhere:
- **GitHub Pages** — push to `main`, enable Pages, point at `/` or `/docs`
- **Netlify / Vercel** — drag-and-drop deploy, zero config
- **Cloudflare Pages**
- Any plain web server / S3 bucket / cPanel `public_html`

The canonical URL is configured in `<head>` as `https://stackupnest.com/` — update the `<link rel="canonical">`, Open Graph, and Twitter Card tags if deploying to a different domain.

## 🔌 Backend integration

The "Apply for Membership" modal submits to a Google Apps Script Web App endpoint:

```js
var APPLY_ENDPOINT_URL = 'https://script.google.com/macros/s/.../exec';
```

It performs **two sequential POST requests** against this endpoint:

1. `action: 'submitMemberApplication'` — submits all applicant fields (identity, contact, background, savings preferences, loan interest, agreement acknowledgements) and returns an `appId`.
2. `action: 'uploadApplicationFiles'` — uploads the (optional) profile photo and Ghana Card image as base64, keyed to that `appId`.

> Requests use `Content-Type: text/plain;charset=utf-8` rather than `application/json` to avoid CORS preflight issues with Apps Script Web Apps — **do not change this**, it will break submissions silently.

To point this site at your own backend, replace `APPLY_ENDPOINT_URL` with your deployed Apps Script exec URL. The payload shape and the two-step (text → files) submission pattern must be matched on the receiving end.

A hidden honeypot field (`#apply-website`) plus a `formLoadedAt` timestamp are sent along for basic spam mitigation — handle/validate these server-side if you want them to do anything.

## 🧩 Key sections

| Section | Purpose |
|---|---|
| **Hero** | Headline, CTA, and a fully mocked Member Portal dashboard (savings/loans/trading sidebar, contribution chart, recent activity, year-end progress) |
| **Trust strip** | Operating-since date, key stats |
| **Value prop** | Save / Borrow / Trade three-column pitch |
| **Bento features** | Real-time tracking, automated receipts, reminders, security, loan terms |
| **Product showcase** | Tabbed deep dive into each division with its own mocked portal screen + a "Full breakdown" modal |
| **How it works** | 4-step process rail (Join → Save → Borrow & Trade → Cash out) |
| **Voices** | Member testimonials |
| **FAQ** | Accordion-style Q&A |
| **Apply modal** | 2-step onboarding wizard (About You → Membership Setup) with photo/Ghana Card upload, drag-and-drop, client-side image compression, and agreement checkbox |
| **Legal modal** | Inline Privacy Policy & Terms of Service (no page navigation) |

## 🎨 Design system

All colors, spacing, radii, and shadows are defined as CSS custom properties at the top of the stylesheet:

```css
--em: #16b877;     /* emerald — brand primary */
--gold: #e7c98a;    /* warm accent, used sparingly */
--ink: #05110c;     /* dark section background */
--paper: #f3f1ea;   /* light section background */
```

Sections alternate between `.sec-dark` (ink) and `.sec-light` (paper) for the Huly-style editorial rhythm. Update the token values in `:root` to re-theme the whole site without touching component CSS.

## 📱 Responsiveness

Mobile breakpoints are layered in (not retrofitted) at `1024px`, `860px`, `680px`, `540px`, and `400px`, plus a dedicated **mobile optimisation pass** near the end of the stylesheet that:
- tightens vertical rhythm and serif line-height,
- hides the dashboard search bar that was clipping on small screens,
- enforces ≥44px touch targets,
- stacks primary CTA buttons full-width,
- sets form inputs to `16px` to prevent iOS auto-zoom-on-focus in the apply modal.

## ♿ Accessibility

- Focus trap + `Escape`-to-close on all modals (Apply, Division detail, Legal, mobile menu)
- `aria-modal`, `aria-checked`, `aria-invalid`, and `role` attributes on interactive widgets
- Respects `prefers-reduced-motion`
- Visible focus rings (`:focus-visible`)

## ⚠️ Known constraints

- Hosting this `.exec` Apps Script endpoint directly means it **cannot be used as an AdSense domain** (Google blocks domain ownership verification on `script.google.com`); use an owned domain if monetization is planned.
- All images are pulled from external hosts (ibb.co for the logo). For production resilience, consider self-hosting brand assets.
- No server-side validation lives in this file — all validation here is client-side UX only; the Apps Script backend must independently validate and sanitize everything it receives.

## 📄 License

Proprietary — © StackUp Nest. Not licensed for reuse outside the StackUp Nest / FutureFund Group project.
