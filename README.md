# Xdigma Creative Studio

Static landing page for Xdigma Creative Studio, built with plain HTML, CSS, and JavaScript.

## Overview

This site presents a creative web studio with sections for recent work, services, process, metrics, testimonials, availability, contact, and footer links. It includes interactive canvas motion, language switching, modal case studies, service details, a brief form, and newsletter/contact draft actions.

## Project Structure

```text
.
├── assets/
│   ├── favicon.webp
│   ├── logo.svg
│   ├── logo_xdigma.webp
│   ├── og-preview.png
│   └── og-preview.svg
├── index.html
├── robots.txt
├── script.js
├── site.webmanifest
└── styles.css
```

## Files

- `index.html` contains the page markup, SEO metadata, structured data, modal shells, and asset links.
- `styles.css` contains all desktop, tablet, mobile, animation, and reduced-motion styles.
- `script.js` controls canvas animation, language switching, menus, modals, counters, testimonials, and form actions.
- `site.webmanifest` defines installable app metadata such as name, icons, display mode, and theme colors.
- `robots.txt` allows search engines to index the site.

## Running Locally

Because this is a static site, you can open `index.html` directly in a browser.

For a local server, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Features

- Responsive layout for desktop, tablet, and mobile.
- English and Indonesian language toggle.
- Canvas-powered hero background.
- Custom cursor and magnetic cards on fine-pointer devices.
- Recent work can be loaded from a published Google Sheet CSV, including sheets fed by Google Form responses.
- Case study and service detail modals.
- Scroll progress indicator and back-to-top control.
- Reduced-motion support.
- WhatsApp brief/contact links.
- Mail draft newsletter signup.
- Open Graph and Twitter preview metadata.
- Web app manifest for mobile/installable browser behavior.

## Deployment

This project can be deployed to any static hosting provider, such as Netlify, Vercel, GitHub Pages, Cloudflare Pages, or a regular web server.

For production social previews, update Open Graph and Twitter image URLs in `index.html` to absolute public URLs after the final domain is known.

## Updating Recent Work From Google Form

The Recent Work section has fallback projects in `index.html`, but it can also load projects from a Google Sheet CSV.

1. Create a Google Form for project updates.
2. Connect the form responses to Google Sheets.
3. In the response sheet, use these column names:

```text
title
type
copy
result
challenge
solution
deliverables
visual
timeline
role
stack
mock label
published
```

Useful notes:

- `title`, `type`, `copy`, and `result` are the most important fields.
- `deliverables` can be separated with `|`, `;`, or new lines.
- `visual` should be one of `visual-one`, `visual-two`, or `visual-three`.
- `published` can be left blank or set to `yes`; use `no`, `false`, or `0` to hide a row.

Publish the sheet to the web as CSV, then paste the CSV URL into `script.js`:

```js
const recentWorkSource = {
  csvUrl: "PASTE_GOOGLE_SHEET_CSV_URL_HERE",
  limit: 3
};
```

The site will keep showing the fallback projects if the CSV URL is empty or the sheet cannot load.

## Notes

- No package manager or build step is required.
- JavaScript syntax can be checked with:

```bash
node --check script.js
```
