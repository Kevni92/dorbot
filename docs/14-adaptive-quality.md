# 14 – Adaptive Visual Quality

## Ziel

Der Prototyp soll auf modernen Smartphones möglichst 60 FPS halten, aber bei schwächeren Geräten kontrolliert auf weniger Effektlast zurückfallen, ohne Spielmechanik oder Eingabe zu verändern.

## Regelung

`AdaptiveQualityController` glättet die gemessene Frame-Zeit und bewertet sie nur alle 3,5 Sekunden. Dadurch werden kurze Hänger beim Laden oder beim Öffnen eines Menüs nicht sofort als dauerhafte Leistungsgrenze interpretiert.

Qualitätsstufen:

- `high`
- `medium`
- `low`

Hysterese verhindert schnelles Hin- und Herschalten:

- High -> Medium unter ca. 48 FPS
- Medium -> Low unter ca. 34 FPS
- Medium -> High erst über ca. 56 FPS
- Low -> Medium erst über ca. 44 FPS

## Was skaliert wird

Nur VFX-Kosten werden reduziert:

- Abstand zwischen Thruster-Partikeln
- Dichte der Raketen-/Torpedo-Trails
- Zahl der Impact-Sparks
- Zahl der Explosionspartikel
- zusätzliche innere Schildlinie
- äußerste Beam-Glow-Lage

Nicht reduziert werden:

- Gameplay-Ticks
- NPC-Logik
- Waffen-Cooldowns
- Schaden
- Bewegung
- Kollisions-/Distanzchecks
- Eingabeverarbeitung

Damit bleibt das Spielgefühl unabhängig von der Grafikstufe identisch.

## Registry

Die GameScene schreibt folgende Runtime-Werte in die Phaser Registry:

- `visualQuality`
- `estimatedFps`

Diese Werte können später ohne Umbau für ein Debug-HUD oder ein manuelles Grafikmenü verwendet werden.

## Nächste Performance-Schritte

1. sichtbarkeitsbasiertes Culling dekorativer Objekte
2. Pooling für häufige Sparks/Trails bei deutlich mehr NPCs
3. manuelles Quality-Override in Settings
4. Messung auf mehreren realen Android-/iOS-Geräten
