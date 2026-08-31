# 01 – Produktkonzept

## Ziel

DORBOT ist ein browserbasierter 2D-Top-Down-Space-Game-Prototyp im Stil klassischer Dark-Orbit-Spielmechaniken. Das Spiel soll direkt über GitHub Pages auf Desktop und Smartphone laufen. Schwerpunkt sind eine saubere Point-and-Click-/Touch-Steuerung, ein unmittelbar spielbarer Mining-Combat-Economy-Loop und eine optisch hochwertige Sci-Fi-Präsentation.

## Kern-Loop

1. Spieler startet an bzw. nahe einer Raumstation.
2. Spieler fliegt frei über eine große 2D-Karte mit Weltkoordinaten.
3. Spieler sucht Asteroidenfelder und feindliche Streuner/Piraten.
4. Asteroiden können als Ziel gewählt und mit Waffen zerstört werden.
5. Zerstörte Asteroiden erzeugen einsammelbare Rohstoffobjekte.
6. Klick/Tap auf Rohstoff: Schiff fliegt dorthin und sammelt ihn bei Kontakt ein.
7. Rohstoffe belegen Laderaum.
8. Rückflug zur Raumstation.
9. Innerhalb des Stationsradius erscheint die Aktion `Andocken`.
10. Im Stationsmenü können Rohstoffe verkauft, Schiffe gekauft und Module gekauft/ausgerüstet werden.
11. Bessere Schiffe/Module ermöglichen effizienteren Abbau und stärkeren Kampf.

## Spielwelt

### Karte

- Große kontinuierliche 2D-Welt mit festen Weltkoordinaten.
- Sichtbare Koordinatenanzeige im HUD.
- Kamera folgt standardmäßig dem Spielerschiff.
- Zoombereich mit sinnvoller Minimal- und Maximalstufe.
- Verschiedene Zonen, insbesondere:
  - sichere Stationszone,
  - offener Weltraum,
  - Asteroidenfelder,
  - Piraten-/Streunergebiete.
- Piraten dürfen den definierten Sicherheitsradius der Raumstation nicht betreten.

### Raumstation

- Große visuelle Station, deutlich größer als normale Schiffe.
- Station soll durch Layering/Parallax räumlich gewaltig wirken.
- Definierter Interaktionsradius.
- Wenn das Spielerschiff innerhalb dieses Radius liegt, erscheint ein kontextabhängiger `Andocken`-Button.
- Andocken öffnet ein Overlay und friert das normale Flug-Gameplay für den Spieler ein.

### Asteroiden und Rohstoffe

- Asteroiden besitzen Hitpoints.
- Asteroidenfelder enthalten mehrere Asteroidentypen bzw. Größen.
- Bei Zerstörung wird mindestens ein Rohstoffobjekt erzeugt.
- Rohstoffe liegen physisch als anklick-/antippbare Objekte in der Welt.
- Rohstoff-Tap priorisiert Sammeln vor normalem Bewegungsklick.
- Das Schiff fliegt automatisch zum Rohstoff und nimmt ihn bei Erreichen auf.
- Ist der Laderaum voll, bleibt der Rohstoff liegen und der Spieler erhält Feedback.

## Spieler-Schiff

Jedes Schiff besitzt mindestens:

- maximale Hitpoints,
- aktuelle Hitpoints,
- maximale Schildpunkte,
- aktuelle Schildpunkte,
- Geschwindigkeit,
- Laderaumkapazität,
- Waffen-Slots,
- Schild-/Utility-Slots,
- Kaufpreis,
- visuelles Asset.

Unterschiedliche Schiffsklassen sollen sich primär über Geschwindigkeit, Haltbarkeit, Laderaum und Slotanzahl unterscheiden. Eine physikalisch komplexe Wendigkeit ist für den Prototyp nicht notwendig; das Schiff kann seine Flugrichtung schnell dem Zielvektor anpassen.

## Kampf

### Zielauswahl

- Tap/Klick auf einen Gegner selektiert ihn.
- Selektiertes Ziel erhält einen klaren Target-Ring/Marker.
- HUD zeigt mindestens Name/Typ, Schild und Hitpoints des Ziels.
- Tap auf leeren Raum hebt das Ziel nicht zwingend sofort auf; Bewegung und Zielauswahl sollen parallel möglich bleiben.
- Wird das Ziel zerstört oder verlässt einen definierten Zielbereich, wird die Auswahl aufgehoben.

### Waffen

Mindestens zwei Grundfamilien:

- Laser
  - z. B. Pulslaser,
  - Beam-Laser.
- Raketen
  - verschiedene Launcher-/Raketenstufen.

Waffen unterscheiden sich mindestens nach:

- Schaden,
- Reichweite,
- Feuerrate/Cooldown,
- Preis.

Die Action-Leiste am unteren Bildschirmrand besitzt separate Aktionen für Laser und Rakete.

### Auto-Modus

- Kurzer Tap auf Laser/Rakete: einmalige bzw. normale Aktion entsprechend dem Waffen-Cooldown.
- Langes Drücken auf die jeweilige Waffenaktion toggelt `Auto` für diese Waffenfamilie.
- Auto-Zustand wird am Icon klar visualisiert.
- Ist Auto aktiv und ein gültiges Ziel selektiert und in Reichweite, feuert das System automatisch entsprechend Cooldown.
- Laser und Rakete können unabhängig voneinander auf Auto stehen.

## Schild- und HP-System

- Eingehender Schaden wird zuerst vom aktiven Schild abgezogen.
- Solange Schildpunkte > 0 sind, gehen Treffer nicht auf die Hülle.
- Wird das Schild auf 0 reduziert, geht es in einen deaktivierten Zustand.
- Schild-Reaktivierung erfolgt nach 30 Sekunden ohne erfolgreiche Wiederherstellung; der genaue Countdown wird sichtbar gemacht.
- Während der deaktivierten Zeit trifft sämtlicher Schaden die Hitpoints.
- Nach Reaktivierung wird das Schild wieder aufgeladen; die genaue Aufladerate bleibt als Balancing-Parameter konfigurierbar.
- Bei 0 Hitpoints wird das Schiff zerstört.

## Zerstörung und Beute

- Zerstörtes Schiff erzeugt eine sichtbare Explosion.
- An der Zerstörungsposition entsteht ein Cargo-Container.
- Dieser Container enthält den kompletten transportierten Laderauminhalt des zerstörten Schiffes.
- Container ist wie Rohstoff anklick-/antippbar.
- Spieler fliegt automatisch hin und übernimmt den Inhalt, soweit Laderaumkapazität vorhanden ist.
- Verhalten bei Teilaufnahme wird technisch unterstützt; überschüssige Fracht bleibt im Container.

## Gegner – Streuner/Piraten

- NPC-Schiffe patrouillieren in der offenen Welt.
- Sie meiden die Stations-Sicherheitszone vollständig.
- Sie können den Spieler als Ziel erfassen und angreifen.
- Für den ersten Prototyp genügt ein einfacher Zustandsautomat:
  - Patrol,
  - Detect,
  - Chase,
  - Attack,
  - Disengage/Return.
- NPCs verwenden dieselben Schild-/HP-/Waffen-Grundregeln wie der Spieler.

## Station: Wirtschaft und Ausrüstung

### Markt

- Anzeige des Laderauminhalts.
- Rohstoffmenge und Verkaufspreis pro Einheit.
- Einzelverkauf und `Alles verkaufen`.
- Credits werden sofort gutgeschrieben.

### Schiffswerft

- Liste mehrerer Schiffe mit Vorschau und Stats.
- Kauf nur bei ausreichenden Credits.
- Gekaufte Schiffe werden im Hangar verfügbar.
- Aktives Schiff kann gewechselt werden.

### Ausrüstung

- Module können gekauft und in kompatible Slots eingesetzt werden.
- Module liegen getrennt vom Cargo-Inventar in einem Ausrüstungs-/Hangar-Inventar.
- Waffen-Slots akzeptieren Waffenmodule.
- Schild-/Utility-Slots akzeptieren entsprechende Module.
- Stats des aktiven Schiffes werden aus Basiswerten + Modulen berechnet.

## Präsentation

### Hintergrund / Parallax

Mehrschichtiger Space-Hintergrund:

1. sehr weit entfernte Sterne/Nebel, minimale Bewegung,
2. mittlere Sterne/Nebel, geringe Parallax-Bewegung,
3. lokale Staub-/Partikelebene,
4. zonenspezifische Hintergrundobjekte, z. B. weit entfernte Asteroiden im Asteroidenfeld.

Die Parallax-Bewegung richtet sich relativ zur Kamerabewegung und bleibt bewusst subtil.

### Effekte

- Engine-Glow/Thruster-Partikel.
- Laser mit emissivem Glow/Bloom-Eindruck.
- Raketen mit Trail.
- Treffer-Funken/Impact-Flash.
- Schild-Treffer-Effekt.
- Explosion aus Sprite-/Partikeleffekt.
- Cargo/Rohstoffe mit leichter Glow-/Pulse-Hervorhebung.
- Sci-Fi-HUD mit transparenten Panels, feinen Linien, Neon-/Glow-Akzenten und klarer Lesbarkeit.

## Scope des ersten spielbaren Prototyps

Der erste vertikale Slice gilt als erreicht, wenn folgende Kette vollständig funktioniert:

`Start -> Fullscreen optional -> Fliegen -> Asteroid selektieren -> zerstören -> Rohstoff einsammeln -> Piraten bekämpfen -> Loot aufnehmen -> zur Station -> andocken -> Rohstoffe verkaufen -> Modul oder Schiff kaufen/ausrüsten -> wieder abdocken`.

Multiplayer, Accounts, Backend-Persistenz und große Content-Mengen gehören ausdrücklich nicht zum ersten Prototyp.

## Offene Balancing-Werte

Folgende Werte werden zunächst datengetrieben angelegt und später feinjustiert:

- Kartengröße,
- Spawn-Dichte,
- Rohstoffwerte,
- Cargo-Größen,
- Schiffspreise,
- Waffenreichweiten,
- Schaden und Cooldowns,
- Schild-Aufladeraten,
- NPC-Erkennungsradius,
- Loot-Lebensdauer,
- Stations-Sicherheitsradius.
