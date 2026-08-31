# World art polish pass

This pass targets the largest visual weaknesses of the current prototype while keeping the asset abstraction intact.

## Station Aegis

The fallback station texture is rebuilt as a much larger pseudo-3D composition. It now contains:

- offset structural shadow for perceived depth
- large elliptical orbital ring with separate dark lower edge and illuminated upper rim
- four industrial arms with terminal pods
- inner habitation torus
- layered reactor / command core
- a dedicated lower docking bay with illuminated approach markers
- approximately forty running lights around the outer structure
- cyan navigation lights and amber docking / hazard lights

The station remains under the stable semantic texture key `station`, so a later approved prerendered CC0 station asset can replace it without touching docking or economy code.

## Deep-space layers

The existing two parallax layers remain, but both textures are richer:

### Far layer

- denser dim star field
- large translucent blue / violet nebula clouds
- occasional haloed bright stars
- low contrast so the gameplay silhouettes stay readable

### Near layer

- brighter and larger stars
- sparse cross-shaped stellar glints
- higher contrast than the far layer

The existing camera parallax factors continue to move these layers independently.

## Design constraints

- Background effects must not compete with target readability.
- Cyan remains reserved primarily for player / station navigation language.
- Amber identifies docking and industrial hazard details.
- Red remains the hostile combat accent.
- All critical gameplay continues to work if external CDN art fails and procedural fallbacks are used.
