# Mobile launch screen

Normal browser launches now start behind a dedicated game-style overlay instead of dropping the player directly into the HUD.

The launch screen provides two explicit entry paths:

- **Fullscreen starten** — requests browser fullscreen and then attempts landscape orientation lock.
- **Im Browser starten** — dismisses the overlay and keeps the normal browser tab layout.

It also explains the four primary touch gestures before gameplay:

1. tap empty space to move to a point
2. hold to keep flying toward the held direction
3. pinch to zoom the camera
4. select a target and hold weapon buttons to toggle automatic fire

Installed standalone/fullscreen web-app sessions skip the launch overlay because browser chrome is already absent.

The launch screen deliberately does not pause or alter simulation state; it is purely an interaction layer above the running Phaser scene.
