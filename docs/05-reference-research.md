# 05 – Referenzrecherche

## Mobile Top-Down-Space-Steuerung

### SKYSOM – Sky Hero

HTML5-Spiel, das auf Desktop und Smartphone läuft. Auf dem Smartphone wird Bewegung über Drag/Hold gelöst und geschossen wird automatisch. Relevant für DORBOT ist vor allem die Erkenntnis, dass ein `Finger zeigt Bewegung / halten = weiterbewegen`-Muster ohne permanenten virtuellen Joystick auf Touchscreens gut funktionieren kann.

Quelle: https://leesomi.itch.io/skysom

### GraveTation

Top-Down-Space-Shooter mit expliziten Mobile Controls. Verwendet einen linken virtuellen Joystick für Bewegung/Rotation und Touch auf der rechten Seite für Aktionen. Das ist ein brauchbares Gegenbeispiel: Für DORBOT wird bewusst kein Twin-Stick-Modell übernommen, weil die gewünschte Dark-Orbit-Interaktion stärker auf Weltobjekten und Point-and-Click/Touch basiert.

Quelle: https://monochromewavegames.itch.io/gravetation

### Kinetic Scan / Phaser-Referenz

Öffentliches Phaser-3-/TypeScript-Space-Shooter-Projekt mit responsive Viewport und Mobile-Input. Relevant als technische Bestätigung, dass Phaser 3 + TypeScript für einen mobilen Browser-Space-Shooter ein sinnvoller Stack ist.

Quelle: https://github.com/meuse24/kinetic_scan

## Abgeleitete UX-Entscheidung für DORBOT

DORBOT kombiniert keine klassischen Dual-Sticks, sondern:

- Tap auf freien Raum -> dorthin fliegen
- Finger auf freiem Raum halten -> kontinuierlich in diese Richtung fliegen
- Finger während Hold bewegen -> Flugrichtung anpassen
- Tap auf Weltobjekt -> Objekt selektieren/interagieren
- Pinch -> Spielkamera zoomen
- Waffen unten als große Touch-Actions
- Long Press auf Waffenaction -> Auto-Fire toggeln

Das entspricht dem gewünschten Dark-Orbit-artigen Bedienmodell und hält gleichzeitig den Bildschirm frei von großen virtuellen Joysticks.

## Fullscreen

Die Web Fullscreen API ist browserabhängig und laut MDN nicht vollständig Baseline. `requestFullscreen()` muss deshalb nach einer expliziten Benutzeraktion ausgelöst und per Feature Detection abgesichert werden. Die Spieloberfläche muss auch ohne echtes Browser-Fullscreen vollständig funktionieren.

Quelle: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API

## GitHub Pages / Vite

Für ein Vite-Projekt auf einer Repository-Page muss der Base-Pfad auf `/dorbot/` gesetzt werden. GitHub und Vite empfehlen bei einem Build-Prozess den Deployment-Weg über GitHub Actions; der Workflow soll bei Push auf `main` bauen und das erzeugte `dist`-Artifact über GitHub Pages veröffentlichen.

Quellen:

- https://vite.dev/guide/static-deploy
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
