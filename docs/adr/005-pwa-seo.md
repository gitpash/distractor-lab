# ADR-005: PWA & SEO

## Status
Accepted

## Context
The app should be installable on mobile devices and discoverable via search engines. The original HTML app had no PWA or SEO support.

## Decision

### PWA
- `static/manifest.json` with app name, icons, theme color, display mode
- `app.html` updated with PWA meta tags:
  - `viewport-fit=cover` for safe area support
  - `theme-color` for browser chrome
  - `apple-mobile-web-app-capable` for iOS home screen
  - `apple-mobile-web-app-status-bar-style` for iOS status bar
  - `manifest.json` link
  - `apple-touch-icon` link

### SEO
- Root layout `+layout.svelte` provides `<svelte:head>` with:
  - Dynamic title from i18n
  - Meta description
  - Open Graph tags
  - Canonical URL
- SvelteKit's built-in SSR ensures search engines can crawl all routes

## Consequences
- App can be "Add to Home Screen" on iOS and Android
- Search engines can index the app content
- Safe area insets handled via `viewport-fit=cover` and `env(safe-area-inset-*)`
