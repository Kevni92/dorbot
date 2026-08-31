# 16 – World-Space Targeting Feedback

## Ziel

Targeting, Loot und Tap-to-Move sollen auf dem Smartphone direkt in der Spielwelt verständlich sein, ohne dass der Blick ständig zwischen Welt und HUD wechseln muss.

## Ziel-Reticle

Ein ausgewähltes Ziel erhält einen pulsierenden Ring direkt um das Sprite. Der Ring passt seinen Radius an die tatsächliche Spritegröße an.

Die Farbe zeigt gleichzeitig die aktuelle Waffenreichweite:

- Cyan: Ziel innerhalb Laserreichweite
- Orange: außerhalb Laser-, aber innerhalb Raketenreichweite
- Rot: außerhalb beider Waffenreichweiten

Unter dem Ziel wird zusätzlich die Distanz in Weltkoordinateneinheiten angezeigt.

## Loot-Marker

Wenn ein Loot-/Rohstoffobjekt zum Bergen ausgewählt wurde, erhält es einen grün pulsierenden Ring und die Kennzeichnung `BERGEN`.

Der Marker folgt dem Loot auch während dessen bestehender Schwebeanimation.

## Move Command

Ein Tap auf leeren Raum erzeugt am Zielpunkt einen kurzen expandierenden Navigations-Ping. Dadurch ist sofort sichtbar, dass der Tap als Flugkommando interpretiert wurde.

## Technische Trennung

`WorldIndicatorSystem` besitzt ausschließlich visuelles Feedback:

- keine Änderung an Navigation
- keine Änderung an Waffenreichweiten
- keine Target-Auswahl
- keine Loot-Aufnahme

Es liest nur vorhandenen Runtime-State und visualisiert ihn. Damit bleiben Input-/Combat-/Cargo-Systeme unabhängig.
