# Mobile web-app mode

Dorbot is intended to feel like a game rather than a conventional mobile webpage. The prototype therefore ships with a lightweight web-app shell in addition to the in-game Fullscreen API button.

## Manifest

`public/manifest.webmanifest` declares:

- `display: fullscreen`
- preferred `orientation: landscape`
- repository-relative `start_url` and `scope`
- dark background/theme colors
- a scalable maskable Dorbot app icon

This allows compatible browsers to expose an Add-to-Home-Screen / Install flow and launch the game without normal browser chrome.

## Service worker

`public/sw.js` provides a small network-first runtime cache for same-origin GET requests. It is intentionally conservative:

- gameplay always prefers the newest deployed resource when online
- successfully fetched same-origin resources are cached
- cached resources are used if a later request fails
- old Dorbot runtime caches are removed on activation
- third-party/CDN requests are not intercepted

The game remains usable when service workers are unavailable.

## Fullscreen and orientation

The existing in-game fullscreen button still calls the Fullscreen API directly. On supported mobile browsers it additionally attempts an orientation lock to landscape.

Installed web-app mode and explicit Fullscreen API mode complement each other: the first improves repeated phone usage, while the second remains available when opening Dorbot from a normal browser tab.
