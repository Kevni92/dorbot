import Phaser from 'phaser';
import { createProceduralAssets } from './ProceduralAssets';
import { MODULE_CATALOG } from './equipment';
import type { CombatTarget, LootNode, ModuleId, ModuleKind, ModuleSlots, PlayerState } from './models';
import { HudController } from '../ui/HudController';

const MAP_W = 6000;
const MAP_H = 4000;
const STATION_X = 3000;
const STATION_Y = 2000;
const SAFE_RADIUS = 950;
const DOCK_RADIUS = 285;

export class GameScene extends Phaser.Scene {
  private player!: any;
  private station!: any;
  private hud!: HudController;
  private state: PlayerState = {
    hp: 100, maxHp: 100, shield: 100, maxShield: 100, shieldOfflineUntil: 0,
    credits: 1500, cargo: 0, cargoCapacity: 100, speed: 340,
    laserDamage: 18, laserCooldown: 380, rocketDamage: 42, rocketCooldown: 1500,
    shipClass: 'starter', moduleSlots: { laser: 1, rocket: 1, shield: 1 },
    modules: [
      { uid: 'starter-laser', moduleId: 'laser-pulse-1', equipped: true },
      { uid: 'starter-rocket', moduleId: 'rocket-launcher-1', equipped: true },
      { uid: 'starter-shield', moduleId: 'shield-generator-1', equipped: true },
    ],
  };
  private targets: CombatTarget[] = [];
  private loot: LootNode[] = [];
  private selected?: CombatTarget;
  private moveTarget?: { x: number; y: number };
  private pickupTarget?: LootNode;
  private holdActive = false;
  private holdPointer?: any;
  private holdTimer?: any;
  private pinchStartDistance = 0;
  private pinchStartZoom = 1;
  private laserAuto = false;
  private rocketAuto = false;
  private nextLaserAt = 0;
  private nextRocketAt = 0;

  constructor() { super('game'); }

  create(): void {
    createProceduralAssets(this);
    this.recalculateEquipment(true);
    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H).setZoom(1);

    this.createBackground();
    this.createGrid();
    this.station = this.add.image(STATION_X, STATION_Y, 'station').setDepth(4).setScale(1.25);
    this.add.text(STATION_X, STATION_Y + 310, 'STATION AEGIS // SAFE ZONE', { fontFamily: 'monospace', fontSize: '18px', color: '#64eaff' }).setOrigin(0.5).setAlpha(0.8).setDepth(5);

    this.player = this.physics.add.image(STATION_X, STATION_Y + 520, 'ship-player').setDepth(20).setCollideWorldBounds(true).setDrag(800).setMaxVelocity(this.state.speed);
    this.player.setScale(0.8);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.spawnAsteroids();
    this.spawnPirates();
    this.setupInput();

    this.hud = new HudController({
      onLaser: () => this.fireLaser(), onRocket: () => this.fireRocket(),
      onLaserAuto: (active) => { this.laserAuto = active; }, onRocketAuto: (active) => { this.rocketAuto = active; },
      onDock: () => this.tryDock(), onSellCargo: () => this.sellCargo(),
      onBuyShip: (ship) => this.buyShip(ship), onBuyModule: (moduleId) => this.buyModule(moduleId), onToggleModule: (uid) => this.toggleModule(uid),
    });
    this.hud.renderEquipment(this.state);
    this.hud.toast('Sektor online · Tippe ins All, um zu fliegen');
  }

  update(time: number): void {
    this.updateShield(time);
    this.updateMovement();
    this.updatePickup();
    this.updatePirates(time);
    this.updateAutoFire(time);
    this.updateParallax();

    const distToStation = Phaser.Math.Distance.Between(this.player.x, this.player.y, STATION_X, STATION_Y);
    this.hud.setDockVisible(distToStation <= DOCK_RADIUS && !this.hud.isStationOpen());
    this.hud.updatePlayer(this.state, time);
    this.hud.updateCoordinates(this.player.x, this.player.y);
    if (this.selected && !this.selected.destroyed) this.hud.setTarget(this.selected.name, this.selected.hp, this.selected.maxHp, this.selected.shield);
    else this.hud.setTarget();
  }

  private createBackground(): void {
    const nebula = this.add.graphics().setDepth(-40);
    nebula.fillGradientStyle(0x06162d, 0x140929, 0x020711, 0x07182a, 1, 1, 1, 1); nebula.fillRect(0, 0, MAP_W, MAP_H);
    const far = this.add.tileSprite(0, 0, window.innerWidth * 1.4, window.innerHeight * 1.4, 'stars-far').setOrigin(0).setScrollFactor(0).setDepth(-30).setAlpha(0.65);
    const near = this.add.tileSprite(0, 0, window.innerWidth * 1.4, window.innerHeight * 1.4, 'stars-near').setOrigin(0).setScrollFactor(0).setDepth(-20).setAlpha(0.78);
    far.setName('farStars'); near.setName('nearStars');
  }

  private updateParallax(): void {
    const far = this.children.getByName('farStars') as any; const near = this.children.getByName('nearStars') as any;
    if (far) { far.tilePositionX = this.cameras.main.scrollX * 0.035; far.tilePositionY = this.cameras.main.scrollY * 0.035; }
    if (near) { near.tilePositionX = this.cameras.main.scrollX * 0.09; near.tilePositionY = this.cameras.main.scrollY * 0.09; }
  }

  private createGrid(): void {
    const grid = this.add.graphics().setDepth(-5); grid.lineStyle(1, 0x4e7ba5, 0.11);
    for (let x = 0; x <= MAP_W; x += 500) grid.lineBetween(x, 0, x, MAP_H);
    for (let y = 0; y <= MAP_H; y += 500) grid.lineBetween(0, y, MAP_W, y);
    for (let x = 0; x <= MAP_W; x += 1000) for (let y = 0; y <= MAP_H; y += 1000) this.add.text(x + 12, y + 10, `${x}:${y}`, { fontFamily: 'monospace', fontSize: '12px', color: '#45647f' }).setDepth(-4).setAlpha(0.55);
    grid.lineStyle(2, 0x4be7ff, 0.1); grid.strokeCircle(STATION_X, STATION_Y, SAFE_RADIUS);
  }

  private spawnAsteroids(): void {
    const positions = [[900,700],[1450,1050],[2050,720],[900,2800],[1550,3200],[2350,3000],[3900,650],[4650,950],[5300,1500],[4050,3200],[4800,2850],[5450,3400]];
    positions.forEach(([x, y], index) => {
      const sprite = this.add.image(x, y, 'asteroid').setScale(1.05 + Math.random() * 0.65).setDepth(8).setInteractive({ useHandCursor: true });
      const target: CombatTarget = { id: `ast-${index}`, kind: 'asteroid', sprite, name: `Asteroid ${index + 1}`, hp: 80, maxHp: 80, shield: 0, maxShield: 0, cargo: 12 + Math.floor(Math.random() * 15), destroyed: false };
      sprite.on('pointerdown', (_p: any, _x: number, _y: number, event: any) => { event.stopPropagation(); this.selectTarget(target); });
      this.targets.push(target);
    });
  }

  private spawnPirates(): void {
    const positions = [[700,1800],[1700,450],[5200,650],[4700,3500],[1200,3500]];
    positions.forEach(([x, y], index) => {
      const texture = `ship-pirate-${(index % 5) + 1}`;
      const sprite = this.physics.add.image(x, y, texture).setDepth(16).setScale(0.72).setInteractive({ useHandCursor: true });
      const target: CombatTarget = { id: `pir-${index}`, kind: 'pirate', sprite, name: `Streuner ${index + 1}`, hp: 90, maxHp: 90, shield: 55, maxShield: 55, cargo: 10 + Math.floor(Math.random() * 25), destroyed: false, nextShotAt: 0 };
      sprite.on('pointerdown', (_p: any, _x: number, _y: number, event: any) => { event.stopPropagation(); this.selectTarget(target); });
      this.targets.push(target); this.pickWanderTarget(target);
    });
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: any, objects: any[]) => {
      if (objects?.length || this.hud.isStationOpen()) return;
      this.holdPointer = pointer; this.holdActive = false;
      if (this.holdTimer) this.holdTimer.remove(false);
      this.holdTimer = this.time.delayedCall(260, () => { if (pointer.isDown) { this.holdActive = true; this.moveTarget = undefined; this.pickupTarget = undefined; } });
    });
    this.input.on('pointerup', (pointer: any) => {
      if (this.holdTimer) this.holdTimer.remove(false);
      if (!this.holdActive && !this.hud.isStationOpen()) { const world = pointer.positionToCamera(this.cameras.main) as any; this.moveTarget = { x: world.x, y: world.y }; this.pickupTarget = undefined; }
      this.holdActive = false; this.holdPointer = undefined;
    });
    this.input.on('wheel', (_p: any, _go: any, _dx: number, dy: number) => this.setZoom(this.cameras.main.zoom - dy * 0.001));
  }

  private updateMovement(): void {
    if (this.hud.isStationOpen()) { this.player.setVelocity(0, 0); return; }
    const down = this.input.manager.pointers.filter((p: any) => p.isDown);
    if (down.length >= 2) {
      const d = Phaser.Math.Distance.Between(down[0].x, down[0].y, down[1].x, down[1].y);
      if (!this.pinchStartDistance) { this.pinchStartDistance = d; this.pinchStartZoom = this.cameras.main.zoom; }
      else this.setZoom(this.pinchStartZoom * (d / this.pinchStartDistance));
      this.player.setVelocity(0, 0); return;
    }
    this.pinchStartDistance = 0;

    let target: { x: number; y: number } | undefined;
    if (this.holdActive && this.holdPointer?.isDown) { const world = this.holdPointer.positionToCamera(this.cameras.main) as any; target = { x: world.x, y: world.y }; }
    else if (this.pickupTarget) target = { x: this.pickupTarget.sprite.x, y: this.pickupTarget.sprite.y };
    else target = this.moveTarget;

    if (!target) { this.player.setVelocity(0, 0); return; }
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
    if (dist < 12 && !this.holdActive) { this.player.setVelocity(0, 0); this.moveTarget = undefined; return; }
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    this.player.setVelocity(Math.cos(angle) * this.state.speed, Math.sin(angle) * this.state.speed); this.player.rotation = angle + Math.PI / 2;
  }

  private setZoom(zoom: number): void { this.cameras.main.setZoom(Phaser.Math.Clamp(zoom, 0.62, 1.55)); }

  private selectTarget(target: CombatTarget): void {
    if (target.destroyed) return;
    this.selected = target; this.pickupTarget = undefined;
    this.hud.toast(`${target.name} ausgewählt`);
  }

  private fireLaser(): void {
    const now = this.time.now; if (now < this.nextLaserAt) return;
    if (this.state.laserDamage <= 0) { this.nextLaserAt = now + 800; this.hud.toast('Keine Laserwaffe ausgerüstet'); return; }
    const target = this.validSelected(860); if (!target) { this.nextLaserAt = now + 450; this.hud.toast('Kein Ziel in Laserreichweite'); return; }
    this.nextLaserAt = now + Math.max(180, this.state.laserCooldown);
    const beamColor = this.state.modules.some((item) => item.equipped && item.moduleId === 'laser-beam-1') ? 0xb58cff : 0x63e9ff;
    this.beamEffect(this.player.x, this.player.y, target.sprite.x, target.sprite.y, beamColor); this.applyDamage(target, this.state.laserDamage);
  }

  private fireRocket(): void {
    const now = this.time.now; if (now < this.nextRocketAt) return;
    if (this.state.rocketDamage <= 0) { this.nextRocketAt = now + 1000; this.hud.toast('Kein Raketenmodul ausgerüstet'); return; }
    const target = this.validSelected(1250); if (!target) { this.nextRocketAt = now + 700; this.hud.toast('Kein Ziel in Raketenreichweite'); return; }
    this.nextRocketAt = now + Math.max(600, this.state.rocketCooldown);
    const torpedo = this.state.modules.some((item) => item.equipped && item.moduleId === 'rocket-torpedo-1');
    const rocket = this.add.image(this.player.x, this.player.y, 'rocket').setDepth(28).setScale(torpedo ? 0.85 : 0.6);
    rocket.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.sprite.x, target.sprite.y) + Math.PI / 2;
    this.tweens.add({ targets: rocket, x: target.sprite.x, y: target.sprite.y, duration: torpedo ? 560 : 420, ease: 'Sine.in', onComplete: () => { rocket.destroy(); if (!target.destroyed) { this.explosion(target.sprite.x, target.sprite.y, torpedo ? 0xff7050 : 0xffa84f, torpedo ? 0.9 : 0.55); this.applyDamage(target, this.state.rocketDamage); } } });
  }

  private updateAutoFire(time: number): void { if (this.selected && !this.selected.destroyed) { if (this.laserAuto && time >= this.nextLaserAt) this.fireLaser(); if (this.rocketAuto && time >= this.nextRocketAt) this.fireRocket(); } }

  private validSelected(range: number): CombatTarget | undefined {
    if (!this.selected || this.selected.destroyed) return undefined;
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.selected.sprite.x, this.selected.sprite.y) <= range ? this.selected : undefined;
  }

  private applyDamage(target: CombatTarget, amount: number): void {
    if (target.shield > 0) { const absorbed = Math.min(target.shield, amount); target.shield -= absorbed; amount -= absorbed; }
    if (amount > 0) target.hp -= amount;
    target.sprite.setTintFill?.(0xffffff); this.time.delayedCall(70, () => target.sprite.clearTint?.());
    if (target.hp <= 0) this.destroyTarget(target);
  }

  private destroyTarget(target: CombatTarget): void {
    if (target.destroyed) return; target.destroyed = true;
    const x = target.sprite.x; const y = target.sprite.y; target.sprite.destroy();
    this.explosion(x, y, target.kind === 'asteroid' ? 0x84a5c7 : 0xff5570, target.kind === 'asteroid' ? 0.75 : 1);
    this.spawnLoot(x, y, target.cargo, target.kind === 'asteroid' ? 'ore' : 'cargo');
    if (this.selected === target) { this.selected = undefined; this.laserAuto = false; this.rocketAuto = false; this.hud.setAutoState(false, false); }
  }

  private spawnLoot(x: number, y: number, amount: number, kind: 'ore' | 'cargo'): void {
    const sprite = this.add.image(x, y, kind === 'ore' ? 'ore' : 'cargo').setDepth(14).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: sprite, y: y - 10, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const node: LootNode = { id: `loot-${Date.now()}-${Math.random()}`, sprite, amount, kind };
    sprite.on('pointerdown', (_p: any, _x: number, _y: number, event: any) => { event.stopPropagation(); this.pickupTarget = node; this.moveTarget = undefined; this.selected = undefined; });
    this.loot.push(node);
  }

  private updatePickup(): void {
    if (!this.pickupTarget) return;
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pickupTarget.sprite.x, this.pickupTarget.sprite.y) > 52) return;
    const free = this.state.cargoCapacity - this.state.cargo;
    if (free <= 0) { this.hud.toast('Laderaum voll'); this.pickupTarget = undefined; return; }
    const collected = Math.min(free, this.pickupTarget.amount); this.state.cargo += collected; this.pickupTarget.amount -= collected;
    this.hud.toast(`+${collected} Erz geborgen`);
    if (this.pickupTarget.amount <= 0) { this.pickupTarget.sprite.destroy(); this.loot = this.loot.filter((x) => x !== this.pickupTarget); }
    this.pickupTarget = undefined; this.player.setVelocity(0, 0);
  }

  private updatePirates(time: number): void {
    for (const pirate of this.targets.filter((t) => t.kind === 'pirate' && !t.destroyed)) {
      const sprite = pirate.sprite; const playerDistance = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.player.x, this.player.y);
      const playerSafe = Phaser.Math.Distance.Between(this.player.x, this.player.y, STATION_X, STATION_Y) < SAFE_RADIUS;
      if (!playerSafe && playerDistance < 680) {
        const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, this.player.x, this.player.y); sprite.setVelocity(Math.cos(angle) * 125, Math.sin(angle) * 125); sprite.rotation = angle + Math.PI / 2;
        if (time >= (pirate.nextShotAt ?? 0) && playerDistance < 560) { pirate.nextShotAt = time + 1450; this.beamEffect(sprite.x, sprite.y, this.player.x, this.player.y, 0xff4e72); this.damagePlayer(13, time); }
      } else {
        if (!pirate.wanderX || Phaser.Math.Distance.Between(sprite.x, sprite.y, pirate.wanderX, pirate.wanderY ?? 0) < 60) this.pickWanderTarget(pirate);
        const wanderX = pirate.wanderX ?? sprite.x; const wanderY = pirate.wanderY ?? sprite.y;
        const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, wanderX, wanderY); sprite.setVelocity(Math.cos(angle) * 72, Math.sin(angle) * 72); sprite.rotation = angle + Math.PI / 2;
      }
      if (Phaser.Math.Distance.Between(sprite.x, sprite.y, STATION_X, STATION_Y) < SAFE_RADIUS) this.pickWanderTarget(pirate, true);
    }
  }

  private pickWanderTarget(pirate: CombatTarget, forceAway = false): void {
    let x = 0; let y = 0; let tries = 0;
    do { x = Phaser.Math.Between(300, MAP_W - 300); y = Phaser.Math.Between(300, MAP_H - 300); tries += 1; } while (Phaser.Math.Distance.Between(x, y, STATION_X, STATION_Y) < SAFE_RADIUS + (forceAway ? 500 : 250) && tries < 50);
    pirate.wanderX = x; pirate.wanderY = y;
  }

  private damagePlayer(amount: number, time: number): void {
    if (this.state.shield > 0 && time >= this.state.shieldOfflineUntil) {
      const absorbed = Math.min(this.state.shield, amount); this.state.shield -= absorbed; amount -= absorbed;
      if (this.state.shield <= 0 && this.state.maxShield > 0) this.state.shieldOfflineUntil = time + 30000;
    }
    if (amount > 0) this.state.hp -= amount;
    this.cameras.main.shake(110, 0.0025); this.player.setTintFill?.(0xffffff); this.time.delayedCall(70, () => this.player.clearTint?.());
    if (this.state.hp <= 0) this.destroyPlayer();
  }

  private updateShield(time: number): void {
    if (this.state.maxShield > 0 && this.state.shield <= 0 && this.state.shieldOfflineUntil > 0 && time >= this.state.shieldOfflineUntil) { this.state.shield = this.state.maxShield; this.state.shieldOfflineUntil = 0; this.hud.toast('Schild wieder online'); }
  }

  private destroyPlayer(): void {
    const x = this.player.x; const y = this.player.y; if (this.state.cargo > 0) this.spawnLoot(x, y, this.state.cargo, 'cargo'); this.state.cargo = 0;
    this.explosion(x, y, 0x61e7ff, 1.4); this.player.setVisible(false).setVelocity(0, 0); this.state.hp = this.state.maxHp; this.state.shield = this.state.maxShield; this.state.shieldOfflineUntil = 0;
    this.time.delayedCall(1800, () => { this.player.setPosition(STATION_X, STATION_Y + 520).setVisible(true); this.hud.toast('Rettungssystem: Schiff rekonstruiert'); });
  }

  private beamEffect(x1: number, y1: number, x2: number, y2: number, color: number): void {
    const beam = this.add.graphics().setDepth(30); beam.lineStyle(10, color, 0.16); beam.lineBetween(x1, y1, x2, y2); beam.lineStyle(3, color, 0.95); beam.lineBetween(x1, y1, x2, y2); beam.lineStyle(1, 0xffffff, 1); beam.lineBetween(x1, y1, x2, y2);
    this.tweens.add({ targets: beam, alpha: 0, duration: 150, onComplete: () => beam.destroy() });
  }

  private explosion(x: number, y: number, color: number, scale: number): void {
    const ring = this.add.circle(x, y, 18, color, 0.28).setStrokeStyle(4, color, 0.9).setDepth(31);
    this.tweens.add({ targets: ring, radius: 105 * scale, alpha: 0, duration: 430, ease: 'Cubic.out', onComplete: () => ring.destroy() });
    for (let i = 0; i < 14; i += 1) {
      const p = this.add.circle(x, y, Phaser.Math.Between(2, 6), i % 2 ? color : 0xffffff, 0.9).setDepth(32); const a = Math.random() * Math.PI * 2; const d = Phaser.Math.Between(45, 150) * scale;
      this.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, scale: 0.2, duration: Phaser.Math.Between(260, 620), onComplete: () => p.destroy() });
    }
  }

  private tryDock(): void {
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, STATION_X, STATION_Y) > DOCK_RADIUS) { this.hud.toast('Zu weit von der Station entfernt'); return; }
    this.player.setVelocity(0, 0); this.hud.renderEquipment(this.state); this.hud.showStation(true);
  }

  private sellCargo(): void {
    if (!this.state.cargo) { this.hud.toast('Kein Erz im Laderaum'); return; }
    const value = this.state.cargo * 12; this.state.credits += value; this.state.cargo = 0; this.hud.toast(`Erz verkauft: +₡ ${value}`);
  }

  private buyShip(ship: string): void {
    const offers: Record<string, { price: number; hp: number; cargo: number; speed: number; label: PlayerState['shipClass']; slots: ModuleSlots; texture: string; scale: number }> = {
      scout: { price: 900, hp: 90, cargo: 70, speed: 420, label: 'scout', slots: { laser: 1, rocket: 1, shield: 1 }, texture: 'ship-scout', scale: 0.72 },
      hunter: { price: 1800, hp: 140, cargo: 95, speed: 345, label: 'hunter', slots: { laser: 2, rocket: 2, shield: 2 }, texture: 'ship-hunter', scale: 0.88 },
      hauler: { price: 2400, hp: 170, cargo: 180, speed: 285, label: 'hauler', slots: { laser: 1, rocket: 1, shield: 3 }, texture: 'ship-hauler', scale: 1.0 },
    };
    const offer = offers[ship]; if (!offer) return; if (this.state.credits < offer.price) { this.hud.toast('Nicht genug Credits'); return; }
    this.state.credits -= offer.price;
    this.state.maxHp = offer.hp; this.state.hp = offer.hp; this.state.cargoCapacity = offer.cargo; this.state.cargo = Math.min(this.state.cargo, offer.cargo);
    this.state.speed = offer.speed; this.state.shipClass = offer.label; this.state.moduleSlots = { ...offer.slots };
    this.player.setMaxVelocity(offer.speed).setTexture(offer.texture).setScale(offer.scale);
    this.enforceSlotLimits(); this.recalculateEquipment(true); this.hud.renderEquipment(this.state);
    this.hud.toast(`${ship.toUpperCase()} übernommen · Module angepasst`);
  }

  private buyModule(moduleId: ModuleId): void {
    const module = MODULE_CATALOG[moduleId]; if (!module) return;
    if (this.state.credits < module.price) { this.hud.toast('Nicht genug Credits'); return; }
    this.state.credits -= module.price;
    const used = this.equippedCount(module.kind);
    const equipped = used < this.state.moduleSlots[module.kind];
    this.state.modules.push({ uid: `${moduleId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`, moduleId, equipped });
    this.recalculateEquipment(true); this.hud.renderEquipment(this.state);
    this.hud.toast(`${module.name} gekauft${equipped ? ' und eingebaut' : ' · Inventar'}`);
  }

  private toggleModule(uid: string): void {
    const instance = this.state.modules.find((item) => item.uid === uid); if (!instance) return;
    const module = MODULE_CATALOG[instance.moduleId];
    if (instance.equipped) instance.equipped = false;
    else {
      if (this.equippedCount(module.kind) >= this.state.moduleSlots[module.kind]) { this.hud.toast(`Kein freier ${module.kind === 'laser' ? 'Laser' : module.kind === 'rocket' ? 'Raketen' : 'Schild'}-Slot`); return; }
      instance.equipped = true;
    }
    this.recalculateEquipment(true);
    if (this.state.laserDamage <= 0) this.laserAuto = false;
    if (this.state.rocketDamage <= 0) this.rocketAuto = false;
    this.hud.setAutoState(this.laserAuto, this.rocketAuto); this.hud.renderEquipment(this.state);
    this.hud.toast(`${module.name} ${instance.equipped ? 'eingebaut' : 'ausgebaut'}`);
  }

  private equippedCount(kind: ModuleKind): number {
    return this.state.modules.filter((item) => item.equipped && MODULE_CATALOG[item.moduleId].kind === kind).length;
  }

  private enforceSlotLimits(): void {
    const kinds: ModuleKind[] = ['laser', 'rocket', 'shield'];
    for (const kind of kinds) {
      const equipped = this.state.modules.filter((item) => item.equipped && MODULE_CATALOG[item.moduleId].kind === kind);
      equipped.slice(this.state.moduleSlots[kind]).forEach((item) => { item.equipped = false; });
    }
  }

  private recalculateEquipment(refillShield: boolean): void {
    const equipped = this.state.modules.filter((item) => item.equipped).map((item) => MODULE_CATALOG[item.moduleId]);
    const lasers = equipped.filter((module) => module.kind === 'laser');
    const rockets = equipped.filter((module) => module.kind === 'rocket');
    const shields = equipped.filter((module) => module.kind === 'shield');

    this.state.laserDamage = lasers.reduce((sum, module) => sum + (module.damage ?? 0), 0);
    this.state.laserCooldown = lasers.length ? Math.max(...lasers.map((module) => module.cooldown ?? 380)) : 0;
    this.state.rocketDamage = rockets.reduce((sum, module) => sum + (module.damage ?? 0), 0);
    this.state.rocketCooldown = rockets.length ? Math.max(...rockets.map((module) => module.cooldown ?? 1500)) : 0;
    this.state.maxShield = shields.reduce((sum, module) => sum + (module.shield ?? 0), 0);
    this.state.shield = refillShield ? this.state.maxShield : Math.min(this.state.shield, this.state.maxShield);
    if (this.state.maxShield <= 0) this.state.shieldOfflineUntil = 0;
  }
}
