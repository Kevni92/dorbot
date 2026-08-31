# 18 – Graphics Settings

## Ziel

Die automatische VFX-Skalierung bleibt Standard, kann aber auf Wunsch manuell überschrieben werden.

## Optionen

- `AUTO`: AdaptiveQualityController entscheidet anhand geglätteter Frame-Zeit.
- `HIGH`: volle Effekt-Dichte.
- `MEDIUM`: reduzierte Trails/Partikel.
- `LOW`: minimale VFX-Last.

Die Wahl beeinflusst ausschließlich visuelle Effekte. Gameplay, KI, Bewegung, Schaden und Cooldowns bleiben unverändert.

## UI

Ein Zahnrad-Button wird dynamisch in die obere HUD-Leiste eingefügt. Das Einstellungsfenster zeigt:

- vier Quality-Modi
- aktuell gewählten Modus
- tatsächlich aktive Rendering-Stufe
- geschätzte FPS aus der Phaser Registry

Das Panel ist für Smartphone Portrait und Landscape responsiv.

## Persistenz

Die Wahl wird unabhängig vom Spieler-Spielstand unter `dorbot.visual-quality.v1` in LocalStorage gespeichert.

Der AdaptiveQualityController prüft die Präferenz in kurzen Abständen und übernimmt manuelle Änderungen ohne Neustart.

## Architektur

- `VisualQualitySettings.ts`: Typen + persistente Einstellung
- `AdaptiveQualityController.ts`: Auto-Regelung und manuelles Override
- `GraphicsSettingsController.ts`: DOM-UI
- `graphics-settings.css`: responsive Darstellung
- Phaser Registry: `visualQuality` und `estimatedFps` für Live-Anzeige

Dadurch bleibt die Grafik-UI von Combat- und Spieler-HUD-Logik getrennt.
