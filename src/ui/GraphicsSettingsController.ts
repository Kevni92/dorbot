import type Phaser from 'phaser';
import { loadVisualQualityMode, saveVisualQualityMode, type VisualQuality, type VisualQualityMode } from '../game/VisualQualitySettings';

export class GraphicsSettingsController {
  private mode = loadVisualQualityMode();
  private readonly panel: HTMLElement;
  private readonly status: HTMLElement;

  constructor(game: Phaser.Game) {
    const topbar = document.querySelector<HTMLElement>('.topbar');
    const hud = document.getElementById('hud');
    if (!topbar || !hud) throw new Error('Graphics settings host elements missing');

    const button = document.createElement('button');
    button.id = 'graphicsSettingsButton';
    button.className = 'icon-button graphics-settings-button';
    button.type = 'button';
    button.title = 'Grafikeinstellungen';
    button.setAttribute('aria-label', 'Grafikeinstellungen öffnen');
    button.textContent = '⚙';
    topbar.insertBefore(button, topbar.lastElementChild);

    const backdrop = document.createElement('div');
    backdrop.id = 'graphicsSettingsPanel';
    backdrop.className = 'graphics-settings-backdrop hidden';
    backdrop.innerHTML = `
      <section class="graphics-settings-window glass" aria-labelledby="graphicsSettingsTitle">
        <header>
          <div><small>RENDER SYSTEM</small><h2 id="graphicsSettingsTitle">Grafikqualität</h2></div>
          <button class="icon-button" data-settings-close type="button" aria-label="Schließen">×</button>
        </header>
        <p>Auto passt nur die Dichte von Trails, Sparks und Glows an die gemessene Framerate an. Gameplay und Simulation bleiben unverändert.</p>
        <div class="quality-options" role="group" aria-label="Grafikqualität">
          <button data-quality="auto" type="button"><b>AUTO</b><span>Dynamisch nach Framerate</span></button>
          <button data-quality="high" type="button"><b>HIGH</b><span>Volle VFX-Dichte</span></button>
          <button data-quality="medium" type="button"><b>MEDIUM</b><span>Reduzierte Partikel</span></button>
          <button data-quality="low" type="button"><b>LOW</b><span>Minimale VFX-Last</span></button>
        </div>
        <div id="graphicsPerformanceStatus" class="graphics-performance-status">Modus ${this.mode.toUpperCase()} · Messung läuft …</div>
      </section>`;
    hud.appendChild(backdrop);

    this.panel = backdrop;
    this.status = backdrop.querySelector<HTMLElement>('#graphicsPerformanceStatus')!;

    button.addEventListener('click', () => this.show(true));
    backdrop.querySelector<HTMLElement>('[data-settings-close]')?.addEventListener('click', () => this.show(false));
    backdrop.addEventListener('pointerdown', (event) => { if (event.target === backdrop) this.show(false); });
    backdrop.querySelectorAll<HTMLElement>('[data-quality]').forEach((option) => option.addEventListener('click', () => {
      const mode = option.dataset.quality as VisualQualityMode;
      this.setMode(mode);
    }));

    window.setInterval(() => {
      this.mode = loadVisualQualityMode();
      const quality = (game.registry.get('visualQuality') ?? 'high') as VisualQuality;
      const fps = Number(game.registry.get('estimatedFps') ?? 60);
      this.status.textContent = `Modus ${this.mode.toUpperCase()} · aktiv ${quality.toUpperCase()} · ~${Math.round(fps)} FPS`;
      this.refreshButtons(this.mode);
    }, 500);

    this.refreshButtons(this.mode);
  }

  private setMode(mode: VisualQualityMode): void {
    this.mode = mode;
    saveVisualQualityMode(mode);
    this.refreshButtons(mode);
  }

  private refreshButtons(mode: VisualQualityMode): void {
    this.panel.querySelectorAll<HTMLElement>('[data-quality]').forEach((option) => {
      const active = option.dataset.quality === mode;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });
  }

  private show(visible: boolean): void { this.panel.classList.toggle('hidden', !visible); }
}
