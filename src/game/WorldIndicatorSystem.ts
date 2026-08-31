import Phaser from 'phaser';
import type { CombatTarget, LootNode } from './models';

export class WorldIndicatorSystem {
  private readonly targetRing: any;
  private readonly targetLabel: Phaser.GameObjects.Text;
  private readonly lootRing: any;
  private readonly lootLabel: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    this.targetRing = scene.add.circle(0, 0, 50, 0xffffff, 0)
      .setStrokeStyle(2, 0x67ecff, 0.92)
      .setDepth(25)
      .setVisible(false);
    this.targetLabel = scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#67ecff',
      backgroundColor: '#04101bc8',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5).setDepth(26).setVisible(false);

    this.lootRing = scene.add.circle(0, 0, 34, 0x63ffc9, 0.025)
      .setStrokeStyle(2, 0x63ffc9, 0.85)
      .setDepth(24)
      .setVisible(false);
    this.lootLabel = scene.add.text(0, 0, 'BERGEN', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#74ffd1',
      backgroundColor: '#041510c0',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(25).setVisible(false);

    scene.tweens.add({ targets: this.targetRing, scale: 1.08, alpha: 0.72, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    scene.tweens.add({ targets: this.lootRing, scale: 1.18, alpha: 0.65, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  update(player: any, target?: CombatTarget, pickup?: LootNode): void {
    this.updateTarget(player, target);
    this.updateLoot(pickup);
  }

  showMoveCommand(x: number, y: number): void {
    const ring = this.scene.add.circle(x, y, 10, 0x63eaff, 0.08)
      .setStrokeStyle(2, 0x63eaff, 0.82)
      .setDepth(23)
      .setBlendMode(Phaser.BlendModes.ADD);
    const core = this.scene.add.circle(x, y, 2.5, 0xffffff, 0.9)
      .setDepth(24)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.scene.tweens.add({ targets: ring, radius: 42, alpha: 0, duration: 430, ease: 'Cubic.out', onComplete: () => ring.destroy() });
    this.scene.tweens.add({ targets: core, alpha: 0, scale: 0.2, duration: 300, onComplete: () => core.destroy() });
  }

  private updateTarget(player: any, target?: CombatTarget): void {
    if (!target || target.destroyed || !target.sprite?.active) {
      this.targetRing.setVisible(false);
      this.targetLabel.setVisible(false);
      return;
    }

    const x = target.sprite.x;
    const y = target.sprite.y;
    const radius = Math.max(35, Math.max(target.sprite.displayWidth ?? 60, target.sprite.displayHeight ?? 60) * 0.66 + 12);
    const distance = Phaser.Math.Distance.Between(player.x, player.y, x, y);

    let color = 0xff5d76;
    let status = 'AUSSER REICHWEITE';
    if (distance <= 860) { color = 0x62edff; status = 'LASER'; }
    else if (distance <= 1250) { color = 0xffc563; status = 'RAKETE'; }

    this.targetRing.setPosition(x, y).setRadius(radius).setStrokeStyle(2.5, color, 0.92).setVisible(true);
    this.targetLabel
      .setPosition(x, y + radius + 16)
      .setText(`${status} · ${Math.round(distance)}`)
      .setColor(`#${color.toString(16).padStart(6, '0')}`)
      .setVisible(true);
  }

  private updateLoot(pickup?: LootNode): void {
    if (!pickup || !pickup.sprite?.active) {
      this.lootRing.setVisible(false);
      this.lootLabel.setVisible(false);
      return;
    }

    const radius = Math.max(26, Math.max(pickup.sprite.displayWidth ?? 32, pickup.sprite.displayHeight ?? 32) * 0.72 + 10);
    this.lootRing.setPosition(pickup.sprite.x, pickup.sprite.y).setRadius(radius).setVisible(true);
    this.lootLabel.setPosition(pickup.sprite.x, pickup.sprite.y + radius + 13).setVisible(true);
  }
}
