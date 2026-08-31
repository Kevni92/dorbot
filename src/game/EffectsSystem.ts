import Phaser from 'phaser';

export class EffectsSystem {
  private readonly lastThrusterAt = new WeakMap<object, number>();

  constructor(private readonly scene: Phaser.Scene) {}

  updateThruster(source: any, time: number, color = 0x55ddff, intensity = 1): void {
    if (!source?.active || !source?.visible) return;
    const velocity = source.body?.velocity;
    const speed = velocity ? Math.hypot(velocity.x, velocity.y) : 0;
    if (speed < 20) return;

    const previous = this.lastThrusterAt.get(source) ?? 0;
    const delay = intensity >= 0.8 ? 48 : 72;
    if (time - previous < delay) return;
    this.lastThrusterAt.set(source, time);

    const travelAngle = source.rotation - Math.PI / 2;
    const radius = Math.max(14, Math.min(48, (source.displayHeight ?? 70) * 0.38));
    const tailX = source.x - Math.cos(travelAngle) * radius;
    const tailY = source.y - Math.sin(travelAngle) * radius;
    const spread = (Math.random() - 0.5) * 10;
    const sideX = Math.cos(travelAngle + Math.PI / 2) * spread;
    const sideY = Math.sin(travelAngle + Math.PI / 2) * spread;

    const glow = this.scene.add.circle(tailX + sideX, tailY + sideY, 5 + Math.random() * 4, color, 0.24 * intensity)
      .setDepth(18)
      .setBlendMode(Phaser.BlendModes.ADD);
    const core = this.scene.add.circle(tailX + sideX, tailY + sideY, 2 + Math.random() * 2, 0xffffff, 0.78 * intensity)
      .setDepth(19)
      .setBlendMode(Phaser.BlendModes.ADD);

    const drift = 22 + Math.random() * 20;
    const dx = -Math.cos(travelAngle) * drift;
    const dy = -Math.sin(travelAngle) * drift;
    this.scene.tweens.add({ targets: glow, x: glow.x + dx, y: glow.y + dy, alpha: 0, scale: 0.25, duration: 260, ease: 'Cubic.out', onComplete: () => glow.destroy() });
    this.scene.tweens.add({ targets: core, x: core.x + dx * 0.65, y: core.y + dy * 0.65, alpha: 0, scale: 0.1, duration: 170, onComplete: () => core.destroy() });
  }

  beam(x1: number, y1: number, x2: number, y2: number, color: number): void {
    const beam = this.scene.add.graphics().setDepth(30).setBlendMode(Phaser.BlendModes.ADD);
    beam.lineStyle(16, color, 0.08); beam.lineBetween(x1, y1, x2, y2);
    beam.lineStyle(8, color, 0.16); beam.lineBetween(x1, y1, x2, y2);
    beam.lineStyle(3, color, 0.95); beam.lineBetween(x1, y1, x2, y2);
    beam.lineStyle(1, 0xffffff, 1); beam.lineBetween(x1, y1, x2, y2);
    this.scene.tweens.add({ targets: beam, alpha: 0, duration: 145, ease: 'Quad.out', onComplete: () => beam.destroy() });
    this.impact(x2, y2, color, 0.55);
  }

  shieldHit(source: any, color = 0x61e7ff): void {
    if (!source?.active) return;
    const radius = Math.max(30, Math.max(source.displayWidth ?? 60, source.displayHeight ?? 60) * 0.62);
    const halo = this.scene.add.circle(source.x, source.y, radius, color, 0.07)
      .setStrokeStyle(4, color, 0.8)
      .setDepth(29)
      .setBlendMode(Phaser.BlendModes.ADD);
    const inner = this.scene.add.circle(source.x, source.y, radius * 0.82, 0xffffff, 0)
      .setStrokeStyle(1.5, 0xffffff, 0.72)
      .setDepth(30)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({ targets: halo, scale: 1.28, alpha: 0, duration: 230, ease: 'Cubic.out', onComplete: () => halo.destroy() });
    this.scene.tweens.add({ targets: inner, scale: 1.15, alpha: 0, duration: 150, ease: 'Quad.out', onComplete: () => inner.destroy() });
  }

  impact(x: number, y: number, color: number, scale = 1): void {
    const flash = this.scene.add.circle(x, y, 9 * scale, 0xffffff, 0.9)
      .setDepth(31)
      .setBlendMode(Phaser.BlendModes.ADD);
    const ring = this.scene.add.circle(x, y, 10 * scale, color, 0.16)
      .setStrokeStyle(3, color, 0.9)
      .setDepth(30)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({ targets: flash, alpha: 0, scale: 2.2, duration: 110, onComplete: () => flash.destroy() });
    this.scene.tweens.add({ targets: ring, radius: 28 * scale, alpha: 0, duration: 210, ease: 'Cubic.out', onComplete: () => ring.destroy() });

    for (let i = 0; i < 5; i += 1) {
      const spark = this.scene.add.circle(x, y, 1.4 + Math.random() * 1.8, i % 2 ? color : 0xffffff, 0.9)
        .setDepth(32)
        .setBlendMode(Phaser.BlendModes.ADD);
      const angle = Math.random() * Math.PI * 2;
      const distance = (18 + Math.random() * 30) * scale;
      this.scene.tweens.add({ targets: spark, x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance, alpha: 0, duration: 150 + Math.random() * 140, onComplete: () => spark.destroy() });
    }
  }

  startMissileTrail(projectile: any, color: number, lifetime: number): void {
    const repeats = Math.max(2, Math.ceil(lifetime / 38));
    this.scene.time.addEvent({
      delay: 38,
      repeat: repeats,
      callback: () => {
        if (!projectile?.active) return;
        const travelAngle = projectile.rotation - Math.PI / 2;
        const tailX = projectile.x - Math.cos(travelAngle) * 14;
        const tailY = projectile.y - Math.sin(travelAngle) * 14;
        const puff = this.scene.add.circle(tailX, tailY, 4 + Math.random() * 3, color, 0.35)
          .setDepth(27)
          .setBlendMode(Phaser.BlendModes.ADD);
        const flame = this.scene.add.circle(tailX, tailY, 1.8 + Math.random(), 0xffffff, 0.78)
          .setDepth(28)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({ targets: puff, alpha: 0, scale: 0.25, duration: 240, onComplete: () => puff.destroy() });
        this.scene.tweens.add({ targets: flame, alpha: 0, scale: 0.1, duration: 120, onComplete: () => flame.destroy() });
      },
    });
  }

  explosion(x: number, y: number, color: number, scale = 1): void {
    const flash = this.scene.add.circle(x, y, 28 * scale, 0xffffff, 0.88)
      .setDepth(34)
      .setBlendMode(Phaser.BlendModes.ADD);
    const core = this.scene.add.circle(x, y, 38 * scale, color, 0.45)
      .setDepth(33)
      .setBlendMode(Phaser.BlendModes.ADD);
    const shockwave = this.scene.add.circle(x, y, 18 * scale, color, 0.08)
      .setStrokeStyle(5, color, 0.92)
      .setDepth(32)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({ targets: flash, scale: 2.5, alpha: 0, duration: 180, ease: 'Cubic.out', onComplete: () => flash.destroy() });
    this.scene.tweens.add({ targets: core, scale: 2.2, alpha: 0, duration: 360, ease: 'Quad.out', onComplete: () => core.destroy() });
    this.scene.tweens.add({ targets: shockwave, radius: 130 * scale, alpha: 0, duration: 520, ease: 'Cubic.out', onComplete: () => shockwave.destroy() });

    const particleCount = Math.max(12, Math.round(18 * scale));
    for (let i = 0; i < particleCount; i += 1) {
      const hot = i % 3 !== 0;
      const particle = this.scene.add.circle(x, y, 2 + Math.random() * 5, hot ? color : 0xffffff, 0.92)
        .setDepth(35)
        .setBlendMode(Phaser.BlendModes.ADD);
      const angle = Math.random() * Math.PI * 2;
      const distance = (55 + Math.random() * 145) * scale;
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.15,
        duration: 300 + Math.random() * 420,
        ease: 'Cubic.out',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
