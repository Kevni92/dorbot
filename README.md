# Dorbot

Mobile-first HTML5/TypeScript space-action prototype inspired by the interaction model of classic browser space games.

## Prototype features

- Phaser 3 + TypeScript + Vite
- tap-to-move, press-and-hold continuous movement, mouse wheel and pinch zoom
- responsive sci-fi HUD and Fullscreen button
- selectable pirates and asteroids
- laser + rocket weapons; long press toggles auto-fire
- shields, hit points, 30-second shield reboot after depletion
- destructible asteroids, resource drops and click-to-collect cargo
- pirate cargo containers on destruction
- safe-zone station, docking, market, shipyard and equipment upgrades
- parallax starfield, procedural glow, laser and explosion effects
- 6000×4000 coordinate map
- automatic GitHub Pages deployment from `main`

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The GitHub Pages workflow publishes `dist/` and Vite is configured for `/dorbot/`.

See `docs/` for concept, controls, architecture, asset direction and implementation milestones.
