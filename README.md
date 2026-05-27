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

## Notes

- No package manager or build step is required.
- JavaScript syntax can be checked with:

```bash
node --check script.js
```
