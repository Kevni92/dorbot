export function createProceduralAssets(scene: any): void {
  if (!scene.textures.exists('ship-player')) makeShip(scene, 'ship-player', 0x61e7ff, 0xffffff);
  if (!scene.textures.exists('ship-pirate')) makeShip(scene, 'ship-pirate', 0xff4f70, 0xffb0bd);

  if (!scene.textures.exists('asteroid')) {
    const asteroid = scene.make.graphics({ x: 0, y: 0, add: false });
    asteroid.fillStyle(0x39465a, 1);
    asteroid.lineStyle(3, 0x6e8098, 1);
    asteroid.beginPath();
    asteroid.moveTo(7, 22); asteroid.lineTo(16, 5); asteroid.lineTo(39, 2); asteroid.lineTo(58, 14);
    asteroid.lineTo(61, 38); asteroid.lineTo(48, 57); asteroid.lineTo(24, 61); asteroid.lineTo(5, 47); asteroid.closePath();
    asteroid.fillPath(); asteroid.strokePath();
    asteroid.fillStyle(0x242e40, 0.8); asteroid.fillCircle(22, 24, 7); asteroid.fillCircle(45, 40, 9); asteroid.fillCircle(40, 14, 4);
    asteroid.generateTexture('asteroid', 66, 66); asteroid.destroy();
  }

  if (!scene.textures.exists('ore')) {
    const ore = scene.make.graphics({ x: 0, y: 0, add: false });
    ore.fillStyle(0x3cf4c5, 0.18); ore.fillCircle(18, 18, 17);
    ore.fillStyle(0x60ffd9, 1); ore.fillTriangle(18, 3, 31, 23, 10, 32);
    ore.lineStyle(2, 0xc8fff0, 1); ore.strokeTriangle(18, 3, 31, 23, 10, 32);
    ore.generateTexture('ore', 36, 36); ore.destroy();
  }

  if (!scene.textures.exists('cargo')) {
    const cargo = scene.make.graphics({ x: 0, y: 0, add: false });
    cargo.fillStyle(0xffb84f, 0.16); cargo.fillCircle(22, 22, 21);
    cargo.fillStyle(0x283346, 1); cargo.lineStyle(3, 0xffc665, 1); cargo.fillRoundedRect(7, 9, 30, 27, 5); cargo.strokeRoundedRect(7, 9, 30, 27, 5);
    cargo.lineBetween(12, 20, 32, 20);
    cargo.generateTexture('cargo', 44, 44); cargo.destroy();
  }

  if (!scene.textures.exists('rocket')) {
    const rocket = scene.make.graphics({ x: 0, y: 0, add: false });
    rocket.fillStyle(0xffd46a, 1); rocket.fillTriangle(12, 0, 20, 22, 4, 22); rocket.fillStyle(0xff5d4a, 1); rocket.fillTriangle(12, 30, 18, 20, 6, 20);
    rocket.generateTexture('rocket', 24, 32); rocket.destroy();
  }

  if (!scene.textures.exists('station')) makeStation(scene);
  if (!scene.textures.exists('stars-far')) makeStars(scene, 'stars-far', 0x566f9a, 55, 0.35);
  if (!scene.textures.exists('stars-near')) makeStars(scene, 'stars-near', 0xe1f3ff, 28, 0.9);
}

function makeShip(scene: any, key: string, primary: number, accent: number): void {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(primary, 0.12); g.fillCircle(40, 44, 34);
  g.fillStyle(primary, 1); g.lineStyle(2, accent, 0.9);
  g.beginPath(); g.moveTo(40, 3); g.lineTo(69, 64); g.lineTo(48, 55); g.lineTo(40, 74); g.lineTo(32, 55); g.lineTo(11, 64); g.closePath();
  g.fillPath(); g.strokePath();
  g.fillStyle(0x08121f, 1); g.fillTriangle(40, 18, 51, 46, 29, 46);
  g.fillStyle(0xffffff, 0.9); g.fillCircle(40, 34, 4);
  g.generateTexture(key, 80, 80); g.destroy();
}

function makeStation(scene: any): void {
  const size = 460; const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x2eddf5, 0.05); g.fillCircle(c, c, 220);
  g.lineStyle(16, 0x28384f, 1); g.strokeCircle(c, c, 178);
  g.lineStyle(4, 0x60e9ff, 0.8); g.strokeCircle(c, c, 178);
  g.lineStyle(24, 0x1a2537, 1); g.strokeCircle(c, c, 108);
  g.lineStyle(3, 0x8cf3ff, 0.7); g.strokeCircle(c, c, 108);
  g.fillStyle(0x202d42, 1); g.fillCircle(c, c, 64);
  g.lineStyle(3, 0x80edff, 1); g.strokeCircle(c, c, 64);
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * 2 * i) / 8;
    const x1 = c + Math.cos(a) * 72; const y1 = c + Math.sin(a) * 72;
    const x2 = c + Math.cos(a) * 160; const y2 = c + Math.sin(a) * 160;
    g.lineStyle(22, 0x26354b, 1); g.lineBetween(x1, y1, x2, y2);
    g.lineStyle(2, 0x54dff2, 0.65); g.lineBetween(x1, y1, x2, y2);
  }
  for (let i = 0; i < 24; i += 1) {
    const a = (Math.PI * 2 * i) / 24; const r = 178;
    g.fillStyle(i % 3 === 0 ? 0xffcf5a : 0x5aeaff, 0.95); g.fillCircle(c + Math.cos(a) * r, c + Math.sin(a) * r, 3);
  }
  g.generateTexture('station', size, size); g.destroy();
}

function makeStars(scene: any, key: string, color: number, count: number, alpha: number): void {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * 512; const y = Math.random() * 512; const r = Math.random() > 0.88 ? 1.8 : 0.8;
    g.fillStyle(color, alpha * (0.45 + Math.random() * 0.55)); g.fillCircle(x, y, r);
  }
  g.generateTexture(key, 512, 512); g.destroy();
}
