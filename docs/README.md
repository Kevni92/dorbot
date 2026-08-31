# DORBOT – Projektkonzept

Dieses Verzeichnis beschreibt das Zielbild und die schrittweise Umsetzung des HTML5/TypeScript-Prototyps. Das Repository war zu Projektbeginn leer. Vor dem ersten Spielcode werden Anforderungen, Bedienung, Architektur, Deployment und Asset-Auswahl dokumentiert.

## Dokumente

- `01-product-concept.md` – Spielidee, Kern-Gameplay und Funktionsumfang
- `02-mobile-controls-and-ui.md` – Smartphone-Steuerung, Fullscreen und HUD
- `03-technical-architecture-and-roadmap.md` – technische Architektur, Datenmodell, GitHub Pages und Umsetzungsphasen
- `04-assets.md` – Asset-Anforderungen, Lizenzregeln und Kandidaten; Assets werden erst nach Freigabe eingebaut

## Leitlinien

1. Mobile-first, aber auch mit Maus auf Desktop spielbar.
2. Sofort verständliche Dark-Orbit-artige Point-and-Click-Steuerung statt virtueller Flugphysik.
3. Visuell hochwertiger 2D/WebGL-Prototyp mit Glow, Partikeln, Parallax und klarer Sci-Fi-HUD-Sprache.
4. Keine fremden Dark-Orbit-Assets oder Markenbestandteile; nur eigene bzw. eindeutig nutzbare Assets.
5. Bevorzugt CC0-Assets. Bei anderen Lizenzen muss die konkrete Lizenz vor Aufnahme geprüft und dokumentiert werden.
6. Jeder Push auf `main` soll nach Einrichtung der Build-Pipeline die GitHub-Page neu bauen und veröffentlichen.
