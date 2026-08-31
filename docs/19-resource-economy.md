# Resource economy

This pass replaces the prototype's single undifferentiated `cargo` resource with a typed cargo manifest while keeping the existing cargo-capacity mechanic.

## Resources

| Resource | Source | Station price | Role |
| --- | --- | ---: | --- |
| Ferrolit | Common asteroids | 8 credits / unit | Basic low-risk mining resource |
| Crysite | Uncommon asteroids | 18 credits / unit | Mid-value crystal resource |
| Aurit | Rare, durable asteroids | 42 credits / unit | High-value mining target |
| Bergungsgut | Destroyed pirates | 14 credits / unit | Combat salvage |

## Asteroid differentiation

Asteroids now have resource-specific names, tint colors, hit points, yield ranges and explosion colors. The twelve existing mineable asteroid positions remain unchanged so this pass does not invalidate the map layout or the atmospheric field decoration.

- Ferrolit: 70 HP, 18-30 units.
- Crysite: 105 HP, 12-22 units.
- Aurit: 155 HP, 7-14 units.

The higher-tier resources therefore take longer to mine but consume less cargo space per credit earned.

## Cargo manifest

`PlayerState` retains the numeric `cargo` field as the cached used-capacity value for HUD and movement code, but the authoritative composition is now `cargoManifest`.

Loot nodes also carry a complete manifest. This matters for player death: the dropped cargo container preserves all resource types, and partial recovery leaves the remaining composition inside the container.

Buying a ship with less cargo capacity than the currently used capacity is rejected instead of silently deleting cargo.

## Market

Station Aegis shows every resource, its amount, unit price and current line value. `Alles verkaufen` sells the complete manifest using the resource catalog prices.

## Save migration

The local player-progress schema is now version 2. The storage key intentionally remains unchanged.

- Version 2 saves persist the full cargo manifest.
- Existing version 1 saves are accepted automatically.
- Legacy generic cargo is migrated to the same number of Ferrolit units.
- Corrupt or over-capacity manifests are sanitized against the active ship's capacity.

No manual reset is required for existing players.
