# 13 – Combat VFX

## Ziel

Phase 7 bekommt eine eigene Effekt-Schicht, damit Treffer, Schilde und Antriebe visuell lesbar werden, ohne die Gameplay-Logik weiter in `GameScene` aufzublähen.

## `EffectsSystem`

`src/game/EffectsSystem.ts` kapselt aktuell:

- additive Laser-/Beam-Glows
- Impact-Flashes und Sparks
- sichtbare Schildtreffer als Energie-Halo
- Spieler- und Piraten-Thruster-Trails
- Raketen-/Torpedo-Trails
- mehrstufige Explosionen mit Flash, Core, Shockwave und Partikeln

## Performance-Regeln

- Thruster-Partikel werden pro Schiff zeitlich gedrosselt.
- Piraten verwenden eine niedrigere Trail-Dichte als das Spielerschiff.
- Alle temporären GameObjects zerstören sich nach kurzen Tweens selbst.
- Es werden keine DOM-Elemente für Welt-VFX erzeugt.
- Blend-Modus `ADD` wird nur für kurzlebige Licht-/Energieeffekte verwendet.

## Combat Feedback

### Schildtreffer

Wenn Schaden von einem Schild absorbiert wird, erscheint ein kurz expandierender Energie-Halo um das getroffene Schiff. Spieler- und Piratenschilde verwenden unterschiedliche Farbstimmungen.

### Hüllentreffer

Der bestehende kurze White-Flash bleibt als unmittelbares Trefferfeedback erhalten. Beam- und Raketenimpact liefern zusätzliche Sparks/Flash-Effekte.

### Schild-Reaktivierung

Nach dem 30-Sekunden-Ausfall wird die Reaktivierung zusätzlich durch einen hellen Schild-Halo sichtbar gemacht.

### Raketen

Raketen und Torpedos bekommen additive Triebwerks-/Abgaspartikel. Torpedos verwenden einen wärmeren, kräftigeren Trail und behalten die längere Flugzeit.

### Antrieb

Spielerschiff und Piraten erzeugen nur während tatsächlicher Bewegung Thruster-Spuren. Der Hauler nutzt einen leicht grünlicheren Antrieb, Piraten rot/orange.

## Weitere Phase-7-Schritte

1. Quality Preset / automatische Effekt-Dichte nach Framerate.
2. dekorative Asteroidenfeld-Layer und Dust-Partikel.
3. zusätzliche Treffer-/Schild-Sounds, sofern Audio freigegeben wird.
4. später Objekt-Pooling für stark erhöhte NPC-Anzahlen.
