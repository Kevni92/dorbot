# Asset provenance and runtime imports

## Current real-asset integration

The current real-art pass uses **Kenney Space Shooter Redux** assets through a version-pinned public spritesheet mirror.

### Original asset

- Creator: Kenney
- Pack: Space Shooter Redux
- Original publication/source: OpenGameArt / Kenney
- License: Creative Commons Zero (CC0 1.0 Universal)
- Attribution: not required; Kenney credit is retained here for provenance

The OpenGameArt entry explicitly lists the pack as CC0 and contains 295+ sprites including ships, enemies, projectiles, meteors, UI elements and backgrounds.

### Version-pinned delivery source

- Mirror repository: `EyeOfMidas/kenney-spritesheet-parser`
- Mirror repository license: CC0-1.0
- Pinned source commit: `be747541cd547f1b0d4196f23dcfe1d68ac6452b`
- Runtime delivery: jsDelivr GitHub CDN pinned to that immutable commit
- Files used: `assets/sprites.png`, `assets/sprites.xml`

Pinning the commit prevents upstream changes from silently changing the prototype art.

## Semantic mapping

| Dorbot semantic key | Kenney atlas frame | Purpose |
| --- | --- | --- |
| `ship-player` | `playerShip1_blue.png` | Player ship |
| `ship-pirate` | `enemyRed2.png` | Pirate / hostile ship |
| `asteroid` | `meteorBrown_big1.png` | Mineable asteroid |
| `ore` | `meteorGrey_small1.png` | Broken-off resource chunk |
| `cargo` | `powerupYellow.png` | Recoverable cargo pickup |

The remaining semantic textures (`station`, `rocket`, star layers) remain procedurally generated in this pass and can be replaced independently later.

## Fallback behavior

`AssetPreloadScene` attempts to load the real CC0 atlas before the game scene starts. Successfully imported frames are copied into Dorbot's stable semantic texture keys. `createProceduralAssets` only generates a texture when that semantic key does not already exist.

Therefore gameplay code remains independent of art pack names and the game remains playable if the remote asset source cannot be loaded.

## Vendoring note

An attempt was made to reference the public mirror's existing Git blob directly from the Dorbot repository tree. GitHub correctly rejects cross-repository blob references, so the prototype remains on a version-pinned CDN import for now. Final production-critical binary assets should be explicitly downloaded, optimized and committed locally rather than relying on object-store shortcuts.

## Next asset passes

1. Replace the station placeholder with a prerendered/composed Kenney Space Station/Space Kit asset.
2. Add a local CC0 deep-space background and decorative parallax layer.
3. Replace the rocket placeholder with approved projectile art.
4. Add multiple hostile ship frames for pirate visual variety.
5. Vendor final production-critical assets into the repository after the selected source files are individually catalogued and size-optimized.
