# 03 – Technische Architektur und Roadmap

## Vorgeschlagener Stack

- TypeScript
- Phaser 3 als 2D/WebGL-Game-Framework
- Vite als Dev-Server/Bundler
- HTML/CSS für responsive HUD-/Menü-Overlays
- lokale, datengetriebene JSON/TypeScript-Konfiguration für Schiffe, Waffen, Schilde, Rohstoffe und Preise
- GitHub Actions + GitHub Pages für automatisches Deployment

Warum Phaser: Kamera, Pointer-/Touch-Input, Sprites, Partikel, Animationen, Audio, Arcade-Physics und WebGL sind bereits vorhanden. Für diesen Prototyp ist das wesentlich zielgerichteter als eine eigene Canvas-/WebGL-Engine.

## Rendering-Aufteilung

### Phaser/WebGL

- Welt
- Schiffe
- Asteroiden
- Station
- Loot/Cargo
- Projektile
- Laser/Beam-Effekte
- Explosionen
- Partikel
- Parallax-Ebenen
- World-Space Target-/Navigationsmarker

### HTML/CSS Overlay

- Start/Fullscreen
- Spieler-HUD
- Target-Panel
- Action-Bar
- Station/Shop/Hangar/Outfitting
- Tooltips und kontextabhängige Buttons

Vorteil: Spielobjekte bleiben GPU-gerendert, während komplexe Menüs responsiv und auf Smartphone gut skalierbar bleiben.

## Hauptmodule

### Game bootstrap

Verantwortlich für Phaser-Konfiguration, Resize, DPR/Performance-Profil und Start der Hauptszene.

### WorldScene

Verantwortlich für Weltobjekte, Spawn, Kamera und Update-Loop. Gameplayregeln sollen möglichst nicht direkt in der Scene verstreut werden.

### InputController

Normalisiert Maus, Touch, Tap, Hold und Pinch in semantische Commands:

- MoveTo
- MoveDirectionStart/Update/Stop
- SelectTarget
- CollectTarget
- ToggleWeaponAuto
- FireWeapon
- Zoom

### PlayerController

Setzt Navigationscommands um und verbindet das aktive Schiff mit Combat, Cargo und Equipment.

### CombatSystem

- Zielvalidierung
- Reichweite
- Cooldowns
- Schaden
- Schild vor HP
- Schild-Down-Timer
- Zerstörung
- Explosion
- Loot-Spawn

### WeaponSystem

Datengetriebene Waffenfamilien und Fire-Modi. Erste Typen:

- pulse laser
- beam laser
- missile launcher

### ShieldSystem

- Shield capacity
- current shield
- active/down
- 30-Sekunden-Reaktivierungstimer
- Recharge nach Reaktivierung

### CargoSystem

- Kapazität
- Item-Stapel
- Einlagerung
- Teilaufnahme
- Cargo-Container bei Zerstörung

### EconomySystem

- Credits
- Rohstoffpreise
- Kauf/Verkauf
- Schiffe
- Module

### EquipmentSystem

- Slot-Kompatibilität
- Installieren/Entfernen
- abgeleitete Schiffsstats

### NPCSystem

Einfache FSM für Piraten/Streuner:

`Patrol -> Detect -> Chase -> Attack -> Disengage -> Patrol`

Stations-Sicherheitszone wird als harte No-Go-Zone behandelt.

### StationSystem

Erkennt Interaktionsradius, zeigt `Andocken` und verwaltet Docking-State.

### EffectsSystem

Pooling für häufige VFX:

- Laser
- Impact
- Explosion
- Thruster
- Missile trails
- Shield hit

### AssetRegistry

Zentrale Zuordnung semantischer IDs zu konkreten Asset-Dateien. Dadurch können freigegebene Asset-Pakete später ohne Gameplay-Codeänderungen ausgetauscht werden.

## Datenmodell – Kernobjekte

### ShipDefinition

- id
- name
- assetId
- baseHp
- speed
- cargoCapacity
- weaponSlots[]
- shieldSlots[]
- utilitySlots[]
- price

### WeaponDefinition

- id
- family: laser | missile
- subtype
- damage
- range
- cooldownMs
- projectileSpeed bzw. beamDuration
- asset/effect IDs
- price

### ShieldDefinition

- id
- capacity
- rechargeRate
- reactivateDelayMs = 30000
- price

### ResourceDefinition

- id
- name
- icon
- unitValue
- cargoSize

### WorldEntity runtime state

- id
- type
- position
- alive/active
- targetable

Runtime-State und Definitionen werden getrennt gehalten.

## Weltkoordinaten und Kamera

- Welt arbeitet in festen logischen Einheiten, unabhängig von Displayauflösung.
- Kamera transformiert Welt -> Screen.
- HUD zeigt gerundete Weltkoordinaten.
- Interaktionsradien werden in Welteinheiten definiert, nicht Pixeln.
- Kamera-Zoom wird begrenzt und auf Smartphone abhängig vom Viewport initialisiert.

## Kollision / Nähe

Für den Prototyp genügt einfache Kreis-/Distanzlogik für:

- Loot-Aufnahme
- Stationsradius
- Waffenreichweite
- NPC-Erkennung
- Asteroid-/Schiff-Nähe

Eine physikalisch exakte Kollisionssimulation ist nicht notwendig.

## Performance-Ziele

Zielgerät: modernes Smartphone im Browser.

- bevorzugt 60 FPS, tolerierbarer Fallback 30 FPS
- Sprite-/Partikel-Pooling
- keine DOM-Elemente pro Weltobjekt
- Culling außerhalb des Viewports
- begrenzte aktive NPC-/Asteroidenanzahl
- WebP/AVIF für große Hintergründe, PNG/WebP für transparente Sprites je nach Qualität
- Asset-Atlanten, wo sinnvoll
- Effekte skalierbar über Quality Preset

## GitHub Pages

Ziel-URL nach Deployment: `https://kevni92.github.io/dorbot/`.

Vite benötigt für ein Project-Page-Repository den Base-Pfad `/dorbot/`.

Geplante Pipeline bei Push auf `main`:

1. Checkout
2. Node LTS
3. Dependency Install
4. Typecheck/Test
5. `vite build`
6. GitHub Pages konfigurieren
7. `dist` als Pages Artifact hochladen
8. Artifact mit `deploy-pages` veröffentlichen

GitHub empfiehlt für Sites mit Build-Prozess einen GitHub-Actions-Workflow. Die Pages-Einstellung muss einmalig auf `Source: GitHub Actions` stehen.

## Teststrategie

### Unit Tests

- Schadensverteilung Schild/HP
- 30-s Schild-Reaktivierung
- Cargo-Kapazität/Teilaufnahme
- Preisberechnung
- Equipment-Kompatibilität
- Weapon cooldown/Auto-Fire
- Stations-Sicherheitszone

### Gameplay-Smoke-Tests

- Welt startet ohne Fehler
- Schiff reagiert auf Tap und Hold
- Pinch/Mausrad zoomt nur Kamera
- Targeting kollidiert nicht mit Bewegung
- Asteroid -> Ressource -> Cargo funktioniert
- Dock -> Sell -> Credits funktioniert

### Responsive Checks

Mindestens:

- Smartphone Landscape ~16:9 bis sehr breite Geräte
- Smartphone Portrait als Fallback
- Tablet
- Desktop 16:9

## Roadmap

### Phase 0 – Konzept und Asset-Freigabe

- Anforderungen dokumentieren
- Mobile UX festlegen
- Lizenzregeln definieren
- Asset-Pakete recherchieren und im Chat vorführen
- keine Game-Assets integrieren, bevor sie freigegeben sind

### Phase 1 – Projektgerüst und Deployment

- Vite + TypeScript + Phaser
- Basis-HTML/CSS
- Build/Typecheck
- GitHub-Actions-Pages-Workflow
- leere bzw. technische Demo live auf GitHub Pages

Abnahmekriterium: Jeder Push auf `main` erzeugt automatisch eine lauffähige Page.

### Phase 2 – Welt, Kamera, Parallax, Bewegung

- WorldScene
- Spieler-Placeholder
- Tap-to-move
- Hold-to-fly
- Pinch-/Wheel-Zoom
- Kamera-Follow
- Koordinaten
- Fullscreen + Fallback
- responsive HUD-Grundrahmen

### Phase 3 – Asset-Integration und Visual Baseline

Nur nach Nutzerfreigabe:

- Schiffe
- Asteroiden
- Station
- Rohstoffe/Cargo
- Hintergrundebenen
- VFX-Basis

### Phase 4 – Mining und Cargo

- Asteroid HP/Targeting
- Laser-Schaden
- Zerstörung
- Rohstoffdrop
- MoveAndCollect
- Cargo-Kapazität

### Phase 5 – Combat

- NPC-Piraten
- Target Panel
- Laser/Raketen
- Long-Press Auto-Fire
- Schild/HP
- 30-s Schild-Reaktivierung
- Explosion
- Cargo-Container

### Phase 6 – Station und Economy

- Sicherheitszone
- Andockradius
- Station UI
- Verkauf
- Credits
- Werft
- mehrere Schiffe
- Modulshop
- Equipment-Slots

### Phase 7 – Polish

- Glow/Blend-Modi
- Partikel
- bessere Parallax-Zonen
- Audio optional
- Smartphone UX Tuning
- Performance-Profiling
- Balancing

## Definition of Done des Prototyps

- GitHub Page automatisch aus `main` deployed
- keine notwendigen DevTools-Schritte zum Spielen
- Desktop und Smartphone spielbar
- Fullscreen, soweit Browser unterstützt
- vollständiger Mining-/Combat-/Sell-/Upgrade-Loop
- keine nicht freigegebenen oder lizenzunklaren Assets
- visuell kohärente Sci-Fi-Darstellung
- Build und Typecheck grün
