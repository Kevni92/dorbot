export function createProceduralAssets(scene: any): void {
  if (!scene.textures.exists('ship-player')) makeShip(scene, 'ship-player', 0x61e7ff, 0xffffff);
  if (!scene.textures.exists('ship-scout')) makeShip(scene, 'ship-scout', 0x76f4ff, 0xffffff);
  if (!scene.textures.exists('ship-hunter')) makeShip(scene, 'ship-hunter', 0x4f9cff, 0xddeaff);
  if (!scene.textures.exists('ship-hauler')) makeShip(scene, 'ship-hauler', 0x63ffc2, 0xe8fff6);
  if (!scene.textures.exists('ship-pirate')) makeShip(scene, 'ship-pirate', 0xff4f70, 0xffb0bd);
  const pirateColors = [0xff5d70, 0xf44464, 0xff8065, 0xc44d70, 0xff365f];
  pirateColors.forEach((color, index) => {
    const key = `ship-pirate-${index + 1}`;
    if (!scene.textures.exists(key)) makeShip(scene, key, color, 0xffc0ca);
  });

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
  if (!scene.textures.exists('stars-far')) makeSpaceLayer(scene, 'stars-far', true);
  if (!scene.textures.exists('stars-near')) makeSpaceLayer(scene, 'stars-near', false);
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
  const size = 640;
  const c = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // Wide translucent halo and offset shadow establish depth before the hard geometry.
  g.fillStyle(0x2eddf5, 0.025); g.fillCircle(c, c, 302);
  g.fillStyle(0x00030a, 0.62); g.fillEllipse(c + 18, c + 26, 460, 390);
  g.fillStyle(0x07111d, 0.95); g.fillEllipse(c, c, 448, 382);

  // Outer orbital ring with a lower shadow edge and bright upper rim.
  g.lineStyle(38, 0x101d2d, 1); g.strokeEllipse(c, c + 7, 452, 330);
  g.lineStyle(25, 0x253b50, 1); g.strokeEllipse(c, c, 452, 330);
  g.lineStyle(3, 0x67eaff, 0.78); g.strokeEllipse(c, c - 5, 448, 324);
  g.lineStyle(2, 0xffffff, 0.15); g.strokeEllipse(c, c - 9, 430, 304);

  // Four large industrial arms and end pods.
  for (let i = 0; i < 4; i += 1) {
    const a = (Math.PI * 2 * i) / 4;
    const ax = Math.cos(a); const ay = Math.sin(a);
    const x1 = c + ax * 92; const y1 = c + ay * 72;
    const x2 = c + ax * 208; const y2 = c + ay * 150;
    g.lineStyle(44, 0x0b1625, 1); g.lineBetween(x1 + 6, y1 + 8, x2 + 6, y2 + 8);
    g.lineStyle(32, 0x30465b, 1); g.lineBetween(x1, y1, x2, y2);
    g.lineStyle(3, 0x7defff, 0.55); g.lineBetween(x1 - ay * 7, y1 + ax * 7, x2 - ay * 7, y2 + ax * 7);
    g.fillStyle(0x0b1725, 1); g.fillCircle(x2 + 6, y2 + 8, 34);
    g.fillStyle(0x263b50, 1); g.fillCircle(x2, y2, 32);
    g.lineStyle(3, 0x59dff5, 0.68); g.strokeCircle(x2, y2, 29);
    g.fillStyle(0xffc75a, 0.95); g.fillCircle(x2 - ay * 20, y2 + ax * 20, 3);
    g.fillStyle(0x65efff, 0.95); g.fillCircle(x2 + ay * 20, y2 - ax * 20, 3);
  }

  // Inner habitation torus.
  g.lineStyle(45, 0x0a1421, 1); g.strokeEllipse(c + 8, c + 12, 250, 190);
  g.lineStyle(34, 0x26394c, 1); g.strokeEllipse(c, c, 250, 190);
  g.lineStyle(3, 0x92f4ff, 0.65); g.strokeEllipse(c, c - 5, 245, 184);

  // Central reactor / command core with asymmetric highlight.
  g.fillStyle(0x020811, 0.95); g.fillCircle(c + 9, c + 12, 79);
  g.fillStyle(0x182a3e, 1); g.fillCircle(c, c, 76);
  g.fillStyle(0x28455d, 1); g.fillCircle(c - 9, c - 12, 58);
  g.lineStyle(4, 0x75efff, 0.85); g.strokeCircle(c, c, 75);
  g.lineStyle(2, 0xd7fbff, 0.36); g.strokeCircle(c - 4, c - 6, 56);
  g.fillStyle(0x5feaff, 0.12); g.fillCircle(c, c, 42);
  g.fillStyle(0xcdfbff, 0.88); g.fillCircle(c - 12, c - 15, 7);

  // Docking bay projects toward the bottom of the sprite, giving players a clear approach point.
  g.fillStyle(0x02070d, 0.95); g.fillRoundedRect(c - 46, c + 166, 92, 92, 14);
  g.fillStyle(0x17283a, 1); g.fillRoundedRect(c - 40, c + 158, 80, 88, 12);
  g.lineStyle(3, 0x63eaff, 0.72); g.strokeRoundedRect(c - 40, c + 158, 80, 88, 12);
  g.fillStyle(0x02050a, 1); g.fillRoundedRect(c - 26, c + 178, 52, 56, 8);
  g.lineStyle(2, 0xffd067, 0.85); g.strokeRoundedRect(c - 24, c + 181, 48, 50, 7);
  for (let i = 0; i < 5; i += 1) {
    g.fillStyle(i % 2 ? 0x5eeaff : 0xffc95b, 0.95);
    g.fillCircle(c - 30 + i * 15, c + 250, 3);
  }

  // Dense running lights sell the apparent scale of the structure.
  for (let i = 0; i < 40; i += 1) {
    const a = (Math.PI * 2 * i) / 40;
    const rx = 226; const ry = 165;
    const x = c + Math.cos(a) * rx; const y = c + Math.sin(a) * ry;
    g.fillStyle(i % 5 === 0 ? 0xffcf62 : 0x5eeaff, i % 3 === 0 ? 1 : 0.72);
    g.fillCircle(x, y, i % 5 === 0 ? 3.2 : 2.1);
  }

  g.generateTexture('station', size, size); g.destroy();
}

function makeSpaceLayer(scene: any, key: string, far: boolean): void {
  const size = 768;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  if (far) {
    // Soft overlapping translucent clouds create a repeating but unobtrusive nebula texture.
    const clouds = [
      [150, 180, 250, 160, 0x163c65, 0.08],
      [610, 540, 330, 180, 0x532458, 0.065],
      [420, 80, 240, 130, 0x183b59, 0.055],
      [70, 650, 260, 145, 0x19375c, 0.05],
    ];
    clouds.forEach(([x, y, w, h, color, alpha]) => {
      g.fillStyle(color as number, alpha as number); g.fillEllipse(x as number, y as number, w as number, h as number);
    });
  }

  const count = far ? 145 : 66;
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * size; const y = Math.random() * size;
    const bright = Math.random() > (far ? 0.93 : 0.83);
    const r = bright ? (far ? 1.6 : 2.2) : (far ? 0.65 : 0.9);
    const color = bright ? 0xe8f7ff : (Math.random() > 0.84 ? 0x96c5ff : 0x6e829b);
    const alpha = far ? (0.22 + Math.random() * 0.42) : (0.35 + Math.random() * 0.55);
    if (bright) { g.fillStyle(color, alpha * 0.12); g.fillCircle(x, y, r * 4.2); }
    g.fillStyle(color, alpha); g.fillCircle(x, y, r);
  }

  if (!far) {
    for (let i = 0; i < 18; i += 1) {
      const x = Math.random() * size; const y = Math.random() * size;
      g.lineStyle(1, 0x9bc8e6, 0.13 + Math.random() * 0.14);
      g.lineBetween(x - 4, y, x + 4, y); g.lineBetween(x, y - 4, x, y + 4);
    }
  }

  g.generateTexture(key, size, size); g.destroy();
}
