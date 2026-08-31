import Phaser from 'phaser';

interface AsteroidFieldDefinition {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  seed: number;
  label: string;
}

const FIELDS: AsteroidFieldDefinition[] = [
  { x: 1500, y: 900, radiusX: 1050, radiusY: 620, seed: 1107, label: 'MINERAL FIELD A-01' },
  { x: 1550, y: 3020, radiusX: 1100, radiusY: 620, seed: 2209, label: 'MINERAL FIELD A-02' },
  { x: 4750, y: 1000, radiusX: 1050, radiusY: 650, seed: 3313, label: 'MINERAL FIELD B-01' },
  { x: 4750, y: 3050, radiusX: 1100, radiusY: 650, seed: 4421, label: 'MINERAL FIELD B-02' },
];

export function createWorldDecorations(scene: Phaser.Scene): void {
  FIELDS.forEach((field, fieldIndex) => createAsteroidField(scene, field, fieldIndex));
}

function createAsteroidField(scene: Phaser.Scene, field: AsteroidFieldDefinition, fieldIndex: number): void {
  const random = mulberry32(field.seed);

  scene.add.ellipse(field.x, field.y, field.radiusX * 1.65, field.radiusY * 1.55, fieldIndex % 2 ? 0x3f245d : 0x173b55, 0.035)
    .setDepth(-14)
    .setBlendMode(Phaser.BlendModes.ADD);

  const dust = scene.add.graphics().setDepth(-9);
  for (let i = 0; i < 42; i += 1) {
    const position = ellipsePoint(field, random);
    const bright = random() > 0.8;
    dust.fillStyle(bright ? 0x7899a8 : 0x455c6d, bright ? 0.16 : 0.08);
    dust.fillCircle(position.x, position.y, 0.8 + random() * (bright ? 2.2 : 1.2));
  }

  for (let i = 0; i < 16; i += 1) {
    const position = ellipsePoint(field, random);
    const far = i < 8;
    const scale = far ? 0.12 + random() * 0.22 : 0.28 + random() * 0.35;
    const asteroid = scene.add.image(position.x, position.y, 'asteroid')
      .setDepth(far ? -11 : -6)
      .setScale(scale)
      .setAlpha(far ? 0.18 + random() * 0.12 : 0.25 + random() * 0.18)
      .setRotation(random() * Math.PI * 2);
    if (fieldIndex % 2) asteroid.setTint(0xa8b5c4);
    else asteroid.setTint(0xb7a99b);
  }

  scene.add.text(field.x, field.y - field.radiusY * 0.72, field.label, {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#567487',
    letterSpacing: 2,
  }).setOrigin(0.5).setDepth(-5).setAlpha(0.5);
}

function ellipsePoint(field: AsteroidFieldDefinition, random: () => number): { x: number; y: number } {
  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(random());
  return {
    x: field.x + Math.cos(angle) * field.radiusX * radius,
    y: field.y + Math.sin(angle) * field.radiusY * radius,
  };
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
