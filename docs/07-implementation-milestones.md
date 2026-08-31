# Implementation milestones

## Milestone 1 — Deployable shell

Status: implemented in the initial vertical slice.

- Vite + TypeScript + Phaser
- responsive full-screen canvas
- GitHub Pages workflow on pushes to `main`
- `/dorbot/` production base path
- responsive HTML HUD
- fullscreen control

## Milestone 2 — Navigation and world

Status: implemented in the initial vertical slice.

- 6000×4000 coordinate map
- tap-to-move
- press-and-hold continuous movement toward pointer/finger
- pinch zoom and mouse-wheel zoom
- camera follow
- procedural two-layer parallax starfield
- station safe zone

## Milestone 3 — Combat and destruction

Status: implemented in the initial vertical slice.

- target selection
- laser and rockets
- long-press auto-fire toggles
- range and cooldown handling
- HP + shield damage model
- shield reboot 30 seconds after depletion
- hostile pirate AI outside the station safe zone
- explosions and laser glow
- destroyed pirate cargo containers

## Milestone 4 — Mining and economy

Status: implemented in the initial vertical slice.

- destructible asteroids
- ore drops
- click/tap loot to fly to it and collect
- cargo capacity
- station docking radius/button
- market: sell all ore
- three ship classes with distinct stats
- equipment upgrades for shield, laser and rocket damage

## Milestone 5 — Asset pass and polish

Next.

- download and archive approved CC0 source packs
- add an `assets/LICENSES.md` inventory with source URL, author and license per pack
- replace procedural gameplay textures with selected sprites/renders
- create a custom top-down station composition from the Kenney Station Kit
- add engine trails, shield hit surface effect and higher-quality explosion animation
- add distant asteroid-field decorative parallax layer
- tune mobile UI for portrait and landscape devices
- add basic audio and mute/settings controls

## Milestone 6 — Prototype hardening

- persist player state to local storage
- respawn/insurance rules
- richer pirate behavior and spawning
- asteroid respawn loop
- economy balancing
- minimap
- target lead/range visualization
- performance budget for mid-range phones
- automated tests for economy/combat state transitions
