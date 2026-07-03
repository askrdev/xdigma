# Xdigma Creative Studio

Static landing page for Xdigma Creative Studio, built with plain HTML, CSS, and JavaScript.

## Overview

This site presents a creative web studio with sections for recent work, services, process, focus areas, certifications, FAQ, availability, contact, and footer links. It includes interactive canvas motion, language switching, modal case studies, service details, a brief form, and newsletter/contact draft actions.

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
├── content.js
├── robots.txt
├── script.js
├── site.webmanifest
└── styles.css
```

## Files

- `index.html` contains the page markup, SEO metadata, structured data, modal shells, and asset links.
- `content.js` is the single source of truth for all Indonesian and English page copy, form options, FAQ entries, and service details.
- `styles.css` contains all desktop, tablet, mobile, animation, and reduced-motion styles.
- `script.js` contains application logic only: rendering, animation, language switching, menus, modals, and form actions.
- `site.webmanifest` defines installable app metadata such as name, icons, display mode, and theme colors.
- `robots.txt` allows search engines to index the site.

## Editing Content

Edit visible page copy in `content.js`. Keep `index.html` focused on structure and SEO metadata.

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

The Recent Work section loads projects from a public Google Sheet CSV or an Apps Script Web App that returns JSON.

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
background image
background position
background fit
title en
type en
the situation en
result en
challenge en
solution en
deliverables en
timeline en
role en
stack en
website
instagram
link label
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
- `background image` can be a public `https://` image URL or a publicly shared Google Drive file link.
- Leave `background image` empty to use the selected `visual` gradient.
- `background position` controls the crop focus, for example `center`, `top`, or `50% 25%`.
- `background fit` accepts `cover` (default) or `contain`.
- English detail fields can be supplied with the `en` suffix, or generated automatically by the Apps Script example in `apps-script/Code.gs`.
- The Apps Script translation cache keeps the Sheet single-language and avoids translating unchanged text on every page load.
- `result` supports clickable Markdown links, for example `[raalmuin.sch.id](https://raalmuin.sch.id/)`.
- Plain domains such as `raalmuin.sch.id` are linked automatically; `result url` is available when the displayed result text is not a domain.
- Add a project URL in `website`, `instagram`, `social`, or `link` to show a link in the case-study detail.
- `link label` is optional, for example `Website`, `Instagram`, or `Visit school site`.
- The bundled Apps Script only exposes rows whose `published` value is `yes`, `true`, `1`, `ya`, `iya`, or `published`. Blank values stay private.
- New form submissions default to `Published = No`; change the value to `Yes` after reviewing the project.
- The Apps Script response contains only the public project fields used by the website; timestamps, draft rows, and unknown columns are omitted.

Publish the sheet to the web as CSV or deploy the Apps Script Web App with access set to "Anyone", then paste the public URL into `script.js`:

```js
const recentWorkSource = {
  url: "PASTE_PUBLIC_CSV_OR_APPS_SCRIPT_URL_HERE",
  limit: 3
};
```

The site will show a retry state if the URL is empty, private, returns an access-denied HTML page, or cannot load. Check the browser console for a `Recent work could not be loaded` warning when debugging.

## Notes

- No package manager or build step is required.
- JavaScript syntax can be checked with:

```bash
node --check script.js
```
