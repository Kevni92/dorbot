# 17 – Player Progress Persistence

## Ziel

Der lokale Prototyp soll einen Browser-/App-Neustart überleben, ohne einen Backend-Account zu benötigen.

## Gespeicherter Fortschritt

Version `v1` speichert in `localStorage`:

- aktive Schiffsklasse
- Credits
- aktuelle Cargo-Menge
- alle gekauften Module
- Einbauzustand jedes Moduls

Schiffswerte werden nicht redundant gespeichert, sondern beim Laden aus `SHIP_CATALOG` neu abgeleitet.

## Bewusst nicht gespeichert

Flüchtiger Welt-/Combat-State wird bei jedem Start zurückgesetzt:

- aktuelle Position
- HP und aktueller Schildwert
- Schild-Offline-Timer
- aktive Ziele
- Auto-Fire-Zustand
- NPC-Positionen und NPC-HP
- zerstörte Asteroiden
- liegende Loot-Container
- aktuelles Flugziel

Ein geladener Spieler startet deshalb an Station Aegis mit vollem HP-/Schildzustand.

## Sicherheit / Validierung

`PlayerSaveSystem` vertraut LocalStorage-Daten nicht blind:

- Save-Version muss bekannt sein
- Schiffsklasse muss in `SHIP_CATALOG` existieren
- Module müssen in `MODULE_CATALOG` existieren
- Zahlen werden auf sichere Bereiche begrenzt
- Cargo wird auf die Kapazität des geladenen Schiffs begrenzt
- Modul-UIDs werden dedupliziert
- maximal 100 Modulinstanzen werden geladen
- ungültiges JSON oder blockierter Storage führt lediglich zu einem normalen Neustart

## Speicherzeitpunkte

Fortschritt wird gespeichert nach:

- erfolgreicher Cargo-Aufnahme
- Cargo-Verkauf
- Schiffskauf
- Modulkauf
- Modul-Ein-/Ausbau
- Spielerzerstörung, nachdem Cargo abgeworfen wurde
- `pagehide` als zusätzlicher Sicherheits-Snapshot

## Zentrale Schiffsdaten

`ships.ts` enthält die gemeinsame Definition für Starter, Scout, Hunter und Hauler:

- Preis
- HP
- Cargo
- Geschwindigkeit
- Modulslots
- semantischer Texture-Key
- Render-Skalierung

Kauf- und Ladepfad benutzen damit exakt dieselben Werte.

## Spätere Migration

Der Save trägt explizit `version: 1`. Spätere Schemaänderungen sollen über Migrationen erfolgen, statt bestehende Spielstände stillschweigend falsch zu interpretieren.
