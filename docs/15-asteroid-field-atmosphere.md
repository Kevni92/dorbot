# 15 – Asteroid Field Atmosphere

## Ziel

Die bisher einzeln verteilten Mine-Targets sollen visuell als zusammenhängende Asteroidenfelder lesbar sein, ohne zusätzliche Gameplay- oder Physics-Last zu erzeugen.

## Umsetzung

`WorldDecorationSystem` erzeugt vier feste Mineralfelder:

- A-01 im Nordwesten
- A-02 im Südwesten
- B-01 im Nordosten
- B-02 im Südosten

Jedes Feld besitzt:

- einen sehr schwachen farbigen Haze
- eine zusammengefasste Dust-Grafik
- 16 kleine Hintergrund-/Mittelgrund-Asteroiden
- ein dezentes Feldlabel

## Trennung von Gameplay und Dekoration

Dekorative Brocken:

- sind nicht interaktiv
- haben keinen Physics Body
- besitzen keine HP
- können nicht ausgewählt oder beschossen werden
- erzeugen keinen Loot
- laufen nicht durch NPC-/Target-Updates

Nur die bestehenden großen Asteroiden in `spawnAsteroids()` bleiben echte Mining-Targets.

## Determinismus

Jedes Feld verwendet einen eigenen Seed und eine kleine deterministische PRNG. Dadurch bleiben Positionen und Größen über Reloads reproduzierbar. Das hilft später bei Screenshots, Map-Balancing und Bugreports.

## Rendering

- Farbhaze: tiefer Hintergrund
- kleine/farne Asteroiden: stark reduziert in Alpha und Größe
- mittlere Dekoration: weiterhin hinter Grid/Gameplay
- Mine-Targets: unverändert deutlich weiter vorne

Damit entsteht Tiefe, ohne dass die Dekoration mit tatsächlichen Ressourcen verwechselt wird.
