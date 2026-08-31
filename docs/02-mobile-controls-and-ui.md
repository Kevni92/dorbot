# 02 – Mobile Controls und UI

## Bedienungsziel

Die Smartphone-Bedienung soll nicht wie ein Twin-Stick-Shooter funktionieren, sondern die Dark-Orbit-artige direkte Weltinteraktion beibehalten: Objekt antippen = auswählen/interagieren, freien Raum antippen = dorthin fliegen, freien Raum gedrückt halten = kontinuierlich in diese Richtung fliegen.

## Eingabe-Prioritäten

Touch- und Mausereignisse werden nach Zieltyp aufgelöst:

1. HUD-/Menüelemente
2. interaktive Weltobjekte (Gegner, Asteroid, Rohstoff, Cargo, Station)
3. freier Weltraum

Dadurch löst ein Tap auf einen Gegner keine Bewegung zum Tap-Punkt aus.

## Bewegung

### Tap/Klick auf freien Raum

- Weltposition aus Screenposition + Kamera berechnen.
- Diese Position wird zum aktuellen Navigationsziel.
- Schiff richtet sich auf das Ziel aus und fliegt automatisch dorthin.
- Kurz vor Erreichen wird abgebremst/gestoppt, ohne sichtbares Zittern um den Zielpunkt.
- Ein neuer Tap ersetzt das alte Navigationsziel sofort.

### Gedrückt halten auf freien Raum

- Nach einer kurzen Hold-Schwelle wechselt die Eingabe von `MoveTo` auf `ContinuousDirection`.
- Das Schiff fliegt dauerhaft in Richtung des aktuellen Touch-Punktes relativ zum Schiff/Bildschirm.
- Wird der Finger bewegt, verändert sich die Flugrichtung kontinuierlich.
- Beim Loslassen stoppt der Continuous-Modus; das Schiff bremst entsprechend der einfachen Arcade-Bewegung ab.
- Diese Steuerung soll sich wie `Finger zeigt Flugrichtung` anfühlen, ohne sichtbaren virtuellen Joystick.

## Kamera und Zoom

- Kamera folgt dem Spielerschiff weich, aber ohne spürbare Verzögerung bei schnellen Richtungswechseln.
- Pinch-Geste mit zwei Fingern steuert den Spiel-Zoom.
- Desktop: Mausrad zoomt.
- Zoom verändert nur die Spielkamera, nicht Browser-/DOM-Zoom.
- Min-/Max-Zoom wird begrenzt, damit HUD, Targeting und Performance stabil bleiben.
- Pinch hat Vorrang vor Tap/Hold, sobald ein zweiter Finger erkannt wird.
- Beim Wechsel in Pinch werden eventuell laufende Move/Hold-Gesten sauber abgebrochen.

## Fullscreen

- Auf Start-/Pause-Overlay und im HUD gibt es einen gut sichtbaren Fullscreen-Button.
- Fullscreen wird nur nach explizitem Nutzer-Tap angefordert, da Browser hierfür eine User Activation verlangen.
- Falls die Fullscreen API nicht verfügbar ist, bleibt das Spiel vollständig benutzbar und der Button wird deaktiviert/angepasst.
- Safe-Area-Insets für Geräte mit Notch/Dynamic Island werden berücksichtigt.
- Die Spielkamera nutzt immer die tatsächlich verfügbare Viewport-Größe.
- Browser-Pinch-Zoom wird für die Spielfläche verhindert; der eigene Zwei-Finger-Zoom steuert ausschließlich die Kamera.

Hinweis: Die Web-Fullscreen-API ist browserabhängig und laut MDN nicht überall Baseline. Die Implementierung muss deshalb Feature Detection und einen sauberen Fallback besitzen.

## Targeting

### Gegner

- Tap/Klick selektiert den Gegner.
- Target-Ring um das Weltobjekt.
- Kompaktes Target-Panel im HUD mit Schild/HP.
- Erneuter Tap kann optional die Zielauswahl bestätigen, ist aber nicht Voraussetzung zum Feuern.

### Asteroiden

- Tap selektiert Asteroid als Ressourcenziel.
- Waffen dürfen ihn wie ein Combat-Target beschädigen.
- Visuelle Kennzeichnung unterscheidet Asteroid von feindlichem Ziel.

### Loot/Rohstoffe

- Tap startet `MoveAndCollect`.
- Wird ein anderes Lootobjekt getappt, wird das Sammelziel ersetzt.
- Bei Erreichen wird automatisch eingesammelt.

## Action-Leiste

Position: unterer Bildschirmrand, zentral, oberhalb der Safe Area.

Minimaler Inhalt:

- Laser
- Rakete
- später optional weitere aktive Module/Slots

### Tap

- Kurzer Tap führt die Aktion aus, sofern Ziel, Reichweite und Cooldown stimmen.
- Nicht mögliche Aktion erzeugt kurzes visuelles Feedback statt eines modalen Fehlers.

### Long Press = Auto

- Langes Drücken toggelt Auto-Fire für genau diese Waffenfamilie.
- Auto aktiv: Icon erhält klaren persistenten Status (Glow/Rahmen/`AUTO`).
- Auto deaktivieren: erneut lang drücken.
- Laser und Rakete können gleichzeitig auf Auto stehen.

## Kontextaktionen

Kontextbuttons erscheinen nur, wenn sie relevant sind:

- `Andocken`, wenn im Stationsradius.
- eventuell `Abdocken`, solange Stationsmenü aktiv.
- Cargo-voll-Hinweis beim fehlgeschlagenen Einsammeln.

Der Andock-Button sollte auf Smartphone groß genug für sichere Einhandbedienung sein und nicht mit der Waffenleiste kollidieren.

## HUD-Aufteilung – Smartphone Landscape als Primärmodus

Empfohlene primäre Ausrichtung: Landscape.

- oben links: Spieler HP/Schild + Credits
- oben Mitte/rechts: Koordinaten, Fullscreen/Pause
- oben rechts: Target-Panel, wenn Ziel selektiert
- unten Mitte: Waffen-/Action-Leiste
- kontextabhängig nahe unterer/rechter Mitte: Andocken
- minimierte Cargo-Anzeige als kleiner Zähler/Progressbar

Portrait bleibt technisch nutzbar, kann aber eine kompaktere HUD-Anordnung verwenden. Der Prototyp soll Landscape empfehlen, nicht hart erzwingen.

## Desktop

Die Bedienlogik bleibt identisch:

- Linksklick freier Raum: MoveTo
- linke Maustaste halten: ContinuousDirection
- Klick Objekt: Select/Interact
- Mausrad: Zoom
- Action-Bar mit Maus nutzbar
- Fullscreen per UI-Button

## Gesten-Konflikte

Die Eingabelogik wird als klarer Gesture-State-Machine umgesetzt:

- Idle
- TapCandidate
- HoldMove
- PinchZoom
- UIInteraction

Wesentliche Regel: Ein Gesture-State darf nicht gleichzeitig Weltbewegung und UI-Aktion auslösen. Pointer Capture bzw. äquivalente Phaser-Input-Verwaltung verhindert verlorene Touch-Sequenzen.

## Visuelles Feedback

Jede Interaktion braucht unmittelbares Feedback:

- Tap-Zielpunkt: kurzer Navigationsmarker.
- selektiertes Ziel: Ring/Bracket.
- Hold-Bewegung: dezenter Richtungsindikator.
- Pinch: optional kleine Zoom-Prozentanzeige während der Geste.
- Waffen-Cooldown: radialer oder vertikaler Cooldown-Overlay.
- Auto-Fire: permanenter Zustand am Button.
- nicht in Reichweite: Target-/Waffenindikator wechselt in `out of range`-Darstellung.
