# Art Direction — Variant B

## Target look

The prototype should feel like a modernized browser-space-action game rather than pixel art: dark deep-space palette, cyan/teal HUD glow, red hostile accents, bright weapon cores, layered star fields and readable silhouettes at phone scale.

## Approved source direction

1. **Lazer Zero (CC0)** — primary 2D source for ships, asteroids, projectiles and explosion reference/material.
2. **Wisedawn 200+ Spaceships (public domain/CC0)** — secondary ship pool for pirate/NPC diversity.
3. **Kenney Space Station Kit (CC0)** — source for a custom large station render/composition.
4. **Kenney UI Pack — Sci-Fi (CC0)** — safe UI basis; may be supplemented by Wenrexa Holo UI after per-file license verification.
5. **Screaming Brain Studios Seamless Space Backgrounds (CC0)** — deep-space/nebula base layer.
6. **Foozle Void Environment Pack (CC0)** — reference/source for layered parallax concepts and animated asteroid/planet material where stylistically compatible.

## Integration rule

Gameplay code must never depend on a particular art pack. Assets are addressed through stable semantic keys (`ship-player`, `ship-pirate`, `station`, `asteroid`, `ore`, `cargo`, etc.). The current vertical slice generates these textures procedurally so gameplay is testable before binary third-party assets are committed.

When downloaded assets are added, they replace semantic textures without changing movement, combat, economy or UI logic.

## Rendering stack

Back to front:

1. nebula/deep-space base
2. far stars (very low parallax)
3. near stars (low parallax)
4. optional far asteroid/planet decor
5. coordinate grid and world markers
6. station / asteroids / loot
7. ships
8. weapons, impacts and explosions
9. HTML/CSS HUD

## Mobile readability

- player and hostile ship silhouettes remain distinct at minimum zoom
- hostile targeting uses red accents, player/UI uses cyan
- no critical interaction relies on hover
- minimum primary action target is roughly 48 CSS pixels high
- effects may glow but must not obscure target silhouettes
