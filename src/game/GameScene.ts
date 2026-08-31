import Phaser from 'phaser';
import { createProceduralAssets } from './ProceduralAssets';
import { AdaptiveQualityController } from './AdaptiveQualityController';
import { EffectsSystem } from './EffectsSystem';
import { PlayerSaveSystem } from './PlayerSaveSystem';
import { SHIP_CATALOG, type ShipClass } from './ships';
import { createWorldDecorations } from './WorldDecorationSystem';
import { WorldIndicatorSystem } from './WorldIndicatorSystem';
import { MODULE_CATALOG } from './equipment';
import {
  ASTEROID_CATALOG,
  RESOURCE_CATALOG,
  RESOURCE_IDS,
  cargoTotal,
  cargoValue,
  cloneCargo,
  createEmptyCargo,
  manifestFor,
} from './resources';
import type { CombatTarget, LootNode, ModuleId, ModuleKind, PlayerState, ResourceId } from './models';
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
  private effects!: EffectsSystem;
  private quality!: AdaptiveQualityController;
  private indicators!: WorldIndicatorSystem;
  private readonly saves = new PlayerSaveSystem();
  private progressRestored = false;
  private state: PlayerState = {
    hp: 100, maxHp: 100, shield: 100, maxShield: 100, shieldOfflineUntil: 0,
    credits: 1500, cargo: 0, cargoManifest: createEmptyCargo(), cargoCapacity: 100, speed: 340,
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
    this.effects = new EffectsSystem(this);
    this.quality = new AdaptiveQualityController();
    this.effects.setQuality(this.quality.current);
    this.registry.set('visualQuality', this.quality.current);
    this.registry.set('estimatedFps', 60);

    this.progressRestored = this.restoreProgress();
    this.enforceSlotLimits();
    this.recalculateEquipment(true);

    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H).setZoom(1);

    this.createBackground();
    this.createGrid();
    createWorldDecorations(this);
    this.station = this.add.image(STATION_X, STATION_Y, 'station').setDepth(4).setScale(1.25);
    this.add.text(STATION_X, STATION_Y + 310, 'STATION AEGIS // SAFE ZONE', { fontFamily: 'monospace', fontSize: '18px', color: '#64eaff' }).setOrigin(0.5).setAlpha(0.8).setDepth(5);

    const activeShip = SHIP_CATALOG[this.state.shipClass];
    this.player = this.physics.add.image(STATION_X, STATION_Y + 520, activeShip.texture).setDepth(20).setCollideWorldBounds(true).setDrag(800).setMaxVelocity(activeShip.speed);
    this.player.setScale(activeShip.scale);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.indicators = new WorldIndicatorSystem(this);

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
    this.hud.toast(this.progressRestored ? `Fortschritt geladen · ${activeShip.name}` : 'Sektor online · Tippe ins All, um zu fliegen');

    window.addEventListener('pagehide', () => this.saveProgress(), { once: true });
  }

  update(time: number, delta: number): void {
    const qualityChange = this.quality.update(time, delta);
    if (qualityChange) {
      this.effects.setQuality(qualityChange);
      this.registry.set('visualQuality', qualityChange);
    }
    this.registry.set('estimatedFps', Math.round(this.quality.estimatedFps));

    this.updateShield(time);
    this.updateMovement();
    this.effects.updateThruster(this.player, time, this.state.shipClass === 'hauler' ? 0x62ffc7 : 0x55ddff, 1);
    this.updatePickup();
    this.updatePirates(time);
    this.updateAutoFire(time);
    this.updateParallax();
    this.indicators.update(this.player, this.selected, this.pickupTarget);

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
    const resources: Array<Exclude<ResourceId, 'scrap'>> = [
      'ferrolite', 'ferrolite', 'crysite',
      'ferrolite', 'crysite', 'aurite',
      'crysite', 'ferrolite', 'aurite',
      'ferrolite', 'crysite', 'aurite',
    ];

    positions.forEach(([x, y], index) => {
      const definition = ASTEROID_CATALOG[resources[index]];
      const scale = Phaser.Math.FloatBetween(definition.scaleMin, definition.scaleMax);
      const sprite = this.add.image(x, y, 'asteroid').setScale(scale).setTint(definition.tint).setDepth(8).setInteractive({ useHandCursor: true });
      const yieldAmount = Phaser.Math.Between(definition.yieldMin, definition.yieldMax);
      const target: CombatTarget = {
        id: `ast-${index}`,
        kind: 'asteroid',
        sprite,
        name: definition.name,
        hp: definition.hp,
        maxHp: definition.hp,
        shield: 0,
        maxShield: 0,
        cargo: yieldAmount,
        resourceId: definition.resourceId,
        explosionColor: definition.explosionColor,
        destroyed: false,
      };
      sprite.on('pointerdown', (_p: any, _x: number, _y: number, event: any) => { event.stopPropagation(); this.selectTarget(target); });
      this.targets.push(target);
    });
  }

  private spawnPirates(): void {
    const positions = [[700,1800],[1700,450],[5200,650],[4700,3500],[1200,3500]];
    positions.forEach(([x, y], index) => {
      const texture = `ship-pirate-${(index % 5) + 1}`;
      const sprite = this.physics.add.image(x, y, texture).setDepth(16).setScale(0.72).setInteractive({ useHandCursor: true });
      const target: CombatTarget = {
        id: `pir-${index}`,
        kind: 'pirate',
        sprite,
        name: `Streuner ${index + 1}`,
        hp: 90,
        maxHp: 90,
        shield: 55,
        maxShield: 55,
        cargo: 10 + Math.floor(Math.random() * 25),
        resourceId: 'scrap',
        explosionColor: 0xff5570,
        destroyed: false,
        nextShotAt: 0,
      };
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
      if (!this.holdActive && !this.hud.isStationOpen()) {
        const world = pointer.positionToCamera(this.cameras.main) as any;
        this.moveTarget = { x: world.x, y: world.y }; this.pickupTarget = undefined;
        this.indicators.showMoveCommand(world.x, world.y);
      }
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
    const duration = torpedo ? 560 : 420;
    const rocket = this.add.image(this.player.x, this.player.y, 'rocket').setDepth(28).setScale(torpedo ? 0.85 : 0.6);
    rocket.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.sprite.x, target.sprite.y) + Math.PI / 2;
    this.effects.startMissileTrail(rocket, torpedo ? 0xff6f4c : 0xffc766, duration);
    this.tweens.add({ targets: rocket, x: target.sprite.x, y: target.sprite.y, duration, ease: 'Sine.in', onComplete: () => { rocket.destroy(); if (!target.destroyed) { this.explosion(target.sprite.x, target.sprite.y, torpedo ? 0xff7050 : 0xffa84f, torpedo ? 0.9 : 0.55); this.applyDamage(target, this.state.rocketDamage); } } });
  }

  private updateAutoFire(time: number): void { if (this.selected && !this.selected.destroyed) { if (this.laserAuto && time >= this.nextLaserAt) this.fireLaser(); if (this.rocketAuto && time >= this.nextRocketAt) this.fireRocket(); } }

  private validSelected(range: number): CombatTarget | undefined {
    if (!this.selected || this.selected.destroyed) return undefined;
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.selected.sprite.x, this.selected.sprite.y) <= range ? this.selected : undefined;
  }

  private applyDamage(target: CombatTarget, amount: number): void {
    let shieldAbsorbed = 0;
    if (target.shield > 0) { shieldAbsorbed = Math.min(target.shield, amount); target.shield -= shieldAbsorbed; amount -= shieldAbsorbed; }
    if (shieldAbsorbed > 0) this.effects.shieldHit(target.sprite, target.kind === 'pirate' ? 0xff7890 : 0x61e7ff);
    if (amount > 0) {
      target.hp -= amount;
      target.sprite.setTintFill?.(0xffffff); this.time.delayedCall(70, () => target.sprite.clearTint?.());
    }
    if (target.hp <= 0) this.destroyTarget(target);
  }

  private destroyTarget(target: CombatTarget): void {
    if (target.destroyed) return; target.destroyed = true;
    const x = target.sprite.x; const y = target.sprite.y; target.sprite.destroy();
    this.explosion(x, y, target.explosionColor ?? (target.kind === 'asteroid' ? 0x84a5c7 : 0xff5570), target.kind === 'asteroid' ? 0.75 : 1);
    this.spawnResourceLoot(x, y, target.resourceId, target.cargo);
    if (this.selected === target) { this.selected = undefined; this.laserAuto = false; this.rocketAuto = false; this.hud.setAutoState(false, false); }
  }

  private spawnResourceLoot(x: number, y: number, resourceId: ResourceId, amount: number): void {
    this.spawnLoot(x, y, manifestFor(resourceId, amount), 'resource', resourceId);
  }

  private spawnCargoContainer(x: number, y: number): void {
    this.spawnLoot(x, y, cloneCargo(this.state.cargoManifest), 'cargo');
  }

  private spawnLoot(x: number, y: number, contents: LootNode['contents'], kind: LootNode['kind'], resourceId?: ResourceId): void {
    const texture = kind === 'cargo' || resourceId === 'scrap' ? 'cargo' : 'ore';
    const sprite = this.add.image(x, y, texture).setDepth(14).setInteractive({ useHandCursor: true });
    if (resourceId) sprite.setTint(RESOURCE_CATALOG[resourceId].color);
    this.tweens.add({ targets: sprite, y: y - 10, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const node: LootNode = { id: `loot-${Date.now()}-${Math.random()}`, sprite, contents, kind, resourceId };
    sprite.on('pointerdown', (_p: any, _x: number, _y: number, event: any) => { event.stopPropagation(); this.pickupTarget = node; this.moveTarget = undefined; this.selected = undefined; });
    this.loot.push(node);
  }

  private updatePickup(): void {
    if (!this.pickupTarget) return;
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pickupTarget.sprite.x, this.pickupTarget.sprite.y) > 52) return;
    let free = this.state.cargoCapacity - this.state.cargo;
    if (free <= 0) { this.hud.toast('Laderaum voll'); this.pickupTarget = undefined; return; }

    let collected = 0;
    const collectedParts: string[] = [];
    for (const id of RESOURCE_IDS) {
      if (free <= 0) break;
      const available = this.pickupTarget.contents[id];
      if (available <= 0) continue;
      const take = Math.min(free, available);
      this.pickupTarget.contents[id] -= take;
      this.state.cargoManifest[id] += take;
      collected += take;
      free -= take;
      collectedParts.push(`${take} ${RESOURCE_CATALOG[id].name}`);
    }

    this.state.cargo = cargoTotal(this.state.cargoManifest);
    if (collectedParts.length === 1) this.hud.toast(`+${collectedParts[0]} geborgen`);
    else this.hud.toast(`+${collected} Einheiten Fracht geborgen`);

    if (cargoTotal(this.pickupTarget.contents) <= 0) {
      this.pickupTarget.sprite.destroy();
      this.loot = this.loot.filter((x) => x !== this.pickupTarget);
    }
    this.pickupTarget = undefined; this.player.setVelocity(0, 0); this.saveProgress();
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
      this.effects.updateThruster(sprite, time, 0xff536d, 0.55);
      if (Phaser.Math.Distance.Between(sprite.x, sprite.y, STATION_X, STATION_Y) < SAFE_RADIUS) this.pickWanderTarget(pirate, true);
    }
  }

  private pickWanderTarget(pirate: CombatTarget, forceAway = false): void {
    let x = 0; let y = 0; let tries = 0;
    do { x = Phaser.Math.Between(300, MAP_W - 300); y = Phaser.Math.Between(300, MAP_H - 300); tries += 1; } while (Phaser.Math.Distance.Between(x, y, STATION_X, STATION_Y) < SAFE_RADIUS + (forceAway ? 500 : 250) && tries < 50);
    pirate.wanderX = x; pirate.wanderY = y;
  }

  private damagePlayer(amount: number, time: number): void {
    let shieldAbsorbed = 0;
    if (this.state.shield > 0 && time >= this.state.shieldOfflineUntil) {
      shieldAbsorbed = Math.min(this.state.shield, amount); this.state.shield -= shieldAbsorbed; amount -= shieldAbsorbed;
      if (this.state.shield <= 0 && this.state.maxShield > 0) this.state.shieldOfflineUntil = time + 30000;
    }
    if (shieldAbsorbed > 0) this.effects.shieldHit(this.player, 0x61e7ff);
    if (amount > 0) {
      this.state.hp -= amount;
      this.player.setTintFill?.(0xffffff); this.time.delayedCall(70, () => this.player.clearTint?.());
    }
    this.cameras.main.shake(shieldAbsorbed > 0 ? 70 : 115, shieldAbsorbed > 0 ? 0.0014 : 0.0028);
    if (this.state.hp <= 0) this.destroyPlayer();
  }

  private updateShield(time: number): void {
    if (this.state.maxShield > 0 && this.state.shield <= 0 && this.state.shieldOfflineUntil > 0 && time >= this.state.shieldOfflineUntil) {
      this.state.shield = this.state.maxShield; this.state.shieldOfflineUntil = 0;
      this.effects.shieldHit(this.player, 0x76f6ff);
      this.hud.toast('Schild wieder online');
    }
  }

  private destroyPlayer(): void {
    const x = this.player.x; const y = this.player.y;
    if (this.state.cargo > 0) this.spawnCargoContainer(x, y);
    this.state.cargoManifest = createEmptyCargo();
    this.state.cargo = 0;
    this.saveProgress();
    this.explosion(x, y, 0x61e7ff, 1.4); this.player.setVisible(false).setVelocity(0, 0); this.state.hp = this.state.maxHp; this.state.shield = this.state.maxShield; this.state.shieldOfflineUntil = 0;
    this.time.delayedCall(1800, () => { this.player.setPosition(STATION_X, STATION_Y + 520).setVisible(true); this.hud.toast('Rettungssystem: Schiff rekonstruiert'); });
  }

  private beamEffect(x1: number, y1: number, x2: number, y2: number, color: number): void { this.effects.beam(x1, y1, x2, y2, color); }

  private explosion(x: number, y: number, color: number, scale: number): void { this.effects.explosion(x, y, color, scale); }

  private tryDock(): void {
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, STATION_X, STATION_Y) > DOCK_RADIUS) { this.hud.toast('Zu weit von der Station entfernt'); return; }
    this.player.setVelocity(0, 0); this.hud.renderEquipment(this.state); this.hud.showStation(true);
  }

  private sellCargo(): void {
    if (!this.state.cargo) { this.hud.toast('Keine Fracht im Laderaum'); return; }
    const value = cargoValue(this.state.cargoManifest);
    this.state.credits += value;
    this.state.cargoManifest = createEmptyCargo();
    this.state.cargo = 0;
    this.saveProgress();
    this.hud.toast(`Fracht verkauft: +₡ ${value.toLocaleString('de-DE')}`);
  }

  private buyShip(ship: string): void {
    const offer = SHIP_CATALOG[ship as ShipClass];
    if (!offer || offer.id === 'starter') return;
    if (this.state.credits < offer.price) { this.hud.toast('Nicht genug Credits'); return; }
    if (this.state.cargo > offer.cargo) { this.hud.toast(`Zu viel Fracht · ${offer.name} fasst ${offer.cargo}`); return; }

    this.state.credits -= offer.price;
    this.applyShipDefinition(offer.id);
    this.player.setMaxVelocity(offer.speed).setTexture(offer.texture).setScale(offer.scale);
    this.enforceSlotLimits(); this.recalculateEquipment(true); this.hud.renderEquipment(this.state); this.saveProgress();
    this.hud.toast(`${offer.name.toUpperCase()} übernommen · Module angepasst`);
  }

  private buyModule(moduleId: ModuleId): void {
    const module = MODULE_CATALOG[moduleId]; if (!module) return;
    if (this.state.credits < module.price) { this.hud.toast('Nicht genug Credits'); return; }
    this.state.credits -= module.price;
    const used = this.equippedCount(module.kind);
    const equipped = used < this.state.moduleSlots[module.kind];
    this.state.modules.push({ uid: `${moduleId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`, moduleId, equipped });
    this.recalculateEquipment(true); this.hud.renderEquipment(this.state); this.saveProgress();
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
    this.hud.setAutoState(this.laserAuto, this.rocketAuto); this.hud.renderEquipment(this.state); this.saveProgress();
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

  private restoreProgress(): boolean {
    const progress = this.saves.load();
    if (!progress) return false;

    this.state.credits = progress.credits;
    this.state.cargoManifest = cloneCargo(progress.cargoManifest);
    this.state.cargo = cargoTotal(this.state.cargoManifest);
    this.state.modules = progress.modules.map((item) => ({ ...item }));
    this.applyShipDefinition(progress.shipClass);
    return true;
  }

  private applyShipDefinition(shipClass: ShipClass): void {
    const ship = SHIP_CATALOG[shipClass];
    this.state.shipClass = ship.id;
    this.state.maxHp = ship.hp;
    this.state.hp = ship.hp;
    this.state.cargoCapacity = ship.cargo;
    this.state.cargo = cargoTotal(this.state.cargoManifest);
    this.state.speed = ship.speed;
    this.state.moduleSlots = { ...ship.slots };
    this.state.shieldOfflineUntil = 0;
  }

  private saveProgress(): void { this.saves.save(this.state); }
}
