import { MODULE_CATALOG } from '../game/equipment';
import type { ModuleId, ModuleKind, PlayerState } from '../game/models';

export interface HudCallbacks {
  onLaser: () => void;
  onRocket: () => void;
  onLaserAuto: (active: boolean) => void;
  onRocketAuto: (active: boolean) => void;
  onDock: () => void;
  onSellCargo: () => void;
  onBuyShip: (ship: string) => void;
  onBuyModule: (moduleId: ModuleId) => void;
  onToggleModule: (uid: string) => void;
}

export class HudController {
  private laserAuto = false;
  private rocketAuto = false;
  private toastTimer?: number;

  constructor(private readonly callbacks: HudCallbacks) {
    this.bindActionButton('laserButton', () => callbacks.onLaser(), (active) => {
      this.laserAuto = active; callbacks.onLaserAuto(active); this.refreshAutoButtons();
    });
    this.bindActionButton('rocketButton', () => callbacks.onRocket(), (active) => {
      this.rocketAuto = active; callbacks.onRocketAuto(active); this.refreshAutoButtons();
    });

    this.el('dockButton').addEventListener('click', callbacks.onDock);
    this.el('sellCargoButton').addEventListener('click', callbacks.onSellCargo);
    this.el('closeStationButton').addEventListener('click', () => this.showStation(false));
    this.el('fullscreenButton').addEventListener('click', () => this.toggleFullscreen());
    this.el('launchFullscreenButton').addEventListener('click', async () => {
      await this.enterFullscreen();
      this.dismissLaunch();
    });
    this.el('launchBrowserButton').addEventListener('click', () => this.dismissLaunch());
    document.addEventListener('fullscreenchange', () => this.refreshFullscreenButton());

    document.querySelectorAll<HTMLElement>('[data-ship]').forEach((button) => button.addEventListener('click', () => callbacks.onBuyShip(button.dataset.ship ?? '')));
    document.querySelectorAll<HTMLElement>('[data-module]').forEach((button) => button.addEventListener('click', () => {
      const moduleId = button.dataset.module as ModuleId | undefined;
      if (moduleId) callbacks.onBuyModule(moduleId);
    }));
    this.el('ownedModules').addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLElement>('[data-module-instance]');
      if (button?.dataset.moduleInstance) callbacks.onToggleModule(button.dataset.moduleInstance);
    });
    document.querySelectorAll<HTMLElement>('.tab').forEach((button) => button.addEventListener('click', () => this.switchTab(button.dataset.tab ?? 'market')));

    if (this.isInstalledDisplayMode()) this.dismissLaunch();
    this.refreshAutoButtons();
    this.refreshFullscreenButton();
  }

  updatePlayer(state: PlayerState, now: number): void {
    this.setBar('hpBar', state.maxHp > 0 ? state.hp / state.maxHp : 0);
    this.setBar('shieldBar', state.maxShield > 0 ? state.shield / state.maxShield : 0);
    this.el('hpText').textContent = `${Math.ceil(state.hp)} / ${state.maxHp}`;
    this.el('shieldText').textContent = `${Math.ceil(state.shield)} / ${state.maxShield}`;
    this.el('credits').textContent = `₡ ${Math.floor(state.credits).toLocaleString('de-DE')}`;
    this.el('cargo').textContent = `Cargo ${state.cargo} / ${state.cargoCapacity}`;
    this.el('marketCargo').textContent = `${state.cargo} Erz`;
    const cooldown = this.el('shieldCooldown');
    if (state.shieldOfflineUntil > now) {
      cooldown.classList.remove('hidden'); cooldown.textContent = `Schild lädt: ${Math.ceil((state.shieldOfflineUntil - now) / 1000)}s`;
    } else cooldown.classList.add('hidden');
  }

  renderEquipment(state: PlayerState): void {
    const kinds: ModuleKind[] = ['laser', 'rocket', 'shield'];
    const labels: Record<ModuleKind, string> = { laser: 'LASER', rocket: 'RAKETE', shield: 'SCHILD' };
    const equippedCount = (kind: ModuleKind) => state.modules.filter((item) => item.equipped && MODULE_CATALOG[item.moduleId].kind === kind).length;

    this.el('slotSummary').innerHTML = kinds.map((kind) => `<span class="slot-chip ${kind}"><b>${labels[kind]}</b>${equippedCount(kind)} / ${state.moduleSlots[kind]}</span>`).join('');
    this.el('equipmentStats').textContent = `LAS ${state.laserDamage} · RKT ${state.rocketDamage} · SHD ${state.maxShield}`;

    this.el('ownedModules').innerHTML = state.modules.map((item) => {
      const module = MODULE_CATALOG[item.moduleId];
      return `<button class="owned-module ${item.equipped ? 'equipped' : ''}" data-module-instance="${item.uid}" type="button"><span><b>${module.name}</b><small>${module.description}</small></span><em>${item.equipped ? 'EINGEBAUT' : 'EINBAUEN'}</em></button>`;
    }).join('');
  }

  updateCoordinates(x: number, y: number): void { this.el('coordinates').textContent = `X ${Math.round(x).toString().padStart(4, '0')} · Y ${Math.round(y).toString().padStart(4, '0')}`; }
  setDockVisible(visible: boolean): void { this.el('dockButton').classList.toggle('hidden', !visible); }

  setTarget(name?: string, hp?: number, maxHp?: number, shield?: number): void {
    const panel = this.el('targetPanel');
    if (!name) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden'); this.el('targetName').textContent = name; this.el('targetStats').textContent = `HP ${Math.max(0, Math.ceil(hp ?? 0))}/${maxHp ?? 0} · SHD ${Math.max(0, Math.ceil(shield ?? 0))}`;
  }

  showStation(visible: boolean): void { this.el('stationPanel').classList.toggle('hidden', !visible); }
  isStationOpen(): boolean { return !this.el('stationPanel').classList.contains('hidden'); }
  setAutoState(laser: boolean, rocket: boolean): void { this.laserAuto = laser; this.rocketAuto = rocket; this.refreshAutoButtons(); }

  toast(message: string): void {
    const toast = this.el('toast'); toast.textContent = message; toast.classList.remove('hidden');
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.add('hidden'), 1900);
  }

  private bindActionButton(id: string, fire: () => void, toggleAuto: (active: boolean) => void): void {
    const button = this.el(id); let timer = 0; let longPressed = false;
    const clear = () => { if (timer) window.clearTimeout(timer); timer = 0; };
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault(); longPressed = false; clear();
      timer = window.setTimeout(() => {
        longPressed = true;
        const next = id === 'laserButton' ? !this.laserAuto : !this.rocketAuto;
        toggleAuto(next);
        navigator.vibrate?.(35);
        this.toast(`${id === 'laserButton' ? 'Laser' : 'Rakete'} Automatik ${next ? 'aktiv' : 'aus'}`);
      }, 480);
    });
    button.addEventListener('pointerup', (event) => { event.preventDefault(); clear(); if (!longPressed) fire(); });
    button.addEventListener('pointercancel', clear); button.addEventListener('pointerleave', clear);
  }

  private refreshAutoButtons(): void {
    const laser = this.el('laserButton');
    const rocket = this.el('rocketButton');
    laser.classList.toggle('auto', this.laserAuto);
    rocket.classList.toggle('auto', this.rocketAuto);
    laser.setAttribute('aria-pressed', String(this.laserAuto));
    rocket.setAttribute('aria-pressed', String(this.rocketAuto));
  }

  private switchTab(tab: string): void {
    document.querySelectorAll('.tab').forEach((el) => el.classList.toggle('active', (el as HTMLElement).dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.toggle('active', el.id === `tab-${tab}`));
  }

  private async toggleFullscreen(): Promise<void> {
    if (!document.fullscreenElement) {
      await this.enterFullscreen();
      return;
    }

    try {
      try { (screen.orientation as any)?.unlock?.(); } catch { /* optional API */ }
      await document.exitFullscreen();
    } catch {
      this.toast('Fullscreen konnte nicht beendet werden.');
    }
  }

  private async enterFullscreen(): Promise<void> {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      try { await (screen.orientation as any)?.lock?.('landscape'); } catch { /* browser may disallow orientation lock */ }
    } catch {
      this.toast('Fullscreen wird von diesem Browser nicht unterstützt.');
    }
  }

  private dismissLaunch(): void {
    this.el('launchOverlay').classList.add('hidden');
  }

  private isInstalledDisplayMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || Boolean((navigator as any).standalone);
  }

  private refreshFullscreenButton(): void {
    const button = this.el('fullscreenButton');
    const active = Boolean(document.fullscreenElement);
    button.textContent = '⛶';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('title', active ? 'Vollbild beenden' : 'Vollbild');
  }

  private setBar(id: string, ratio: number): void { (this.el(id) as HTMLElement).style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`; }
  private el(id: string): HTMLElement { const element = document.getElementById(id); if (!element) throw new Error(`HUD element missing: ${id}`); return element; }
}
