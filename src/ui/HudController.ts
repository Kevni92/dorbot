import type { PlayerState } from '../game/models';

export interface HudCallbacks {
  onLaser: () => void;
  onRocket: () => void;
  onLaserAuto: (active: boolean) => void;
  onRocketAuto: (active: boolean) => void;
  onDock: () => void;
  onSellCargo: () => void;
  onBuyShip: (ship: string) => void;
  onBuyUpgrade: (upgrade: string) => void;
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
    document.addEventListener('fullscreenchange', () => this.refreshFullscreenButton());

    document.querySelectorAll<HTMLElement>('[data-ship]').forEach((button) => button.addEventListener('click', () => callbacks.onBuyShip(button.dataset.ship ?? '')));
    document.querySelectorAll<HTMLElement>('[data-upgrade]').forEach((button) => button.addEventListener('click', () => callbacks.onBuyUpgrade(button.dataset.upgrade ?? '')));
    document.querySelectorAll<HTMLElement>('.tab').forEach((button) => button.addEventListener('click', () => this.switchTab(button.dataset.tab ?? 'market')));

    this.refreshAutoButtons();
    this.refreshFullscreenButton();
  }

  updatePlayer(state: PlayerState, now: number): void {
    this.setBar('hpBar', state.hp / state.maxHp);
    this.setBar('shieldBar', state.shield / state.maxShield);
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
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        try { await (screen.orientation as any)?.lock?.('landscape'); } catch { /* browser may disallow orientation lock */ }
      } else {
        try { (screen.orientation as any)?.unlock?.(); } catch { /* optional API */ }
        await document.exitFullscreen();
      }
    } catch {
      this.toast('Fullscreen wird von diesem Browser nicht unterstützt.');
    }
  }

  private refreshFullscreenButton(): void {
    const button = this.el('fullscreenButton');
    const active = Boolean(document.fullscreenElement);
    button.textContent = active ? '⛶' : '⛶';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('title', active ? 'Vollbild beenden' : 'Vollbild');
  }

  private setBar(id: string, ratio: number): void { (this.el(id) as HTMLElement).style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`; }
  private el(id: string): HTMLElement { const element = document.getElementById(id); if (!element) throw new Error(`HUD element missing: ${id}`); return element; }
}
