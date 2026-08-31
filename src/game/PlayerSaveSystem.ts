import { MODULE_CATALOG } from './equipment';
import { SHIP_CATALOG, type ShipClass } from './ships';
import type { ModuleId, ModuleInstance, PlayerState } from './models';

const SAVE_KEY = 'dorbot.player-progress.v1';

export interface PlayerProgressV1 {
  version: 1;
  shipClass: ShipClass;
  credits: number;
  cargo: number;
  modules: ModuleInstance[];
}

export class PlayerSaveSystem {
  load(): PlayerProgressV1 | undefined {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return undefined;
      const value = JSON.parse(raw) as Partial<PlayerProgressV1>;
      if (value.version !== 1) return undefined;
      if (!this.isShipClass(value.shipClass)) return undefined;

      const credits = this.safeNumber(value.credits, 0, 1_000_000_000);
      const ship = SHIP_CATALOG[value.shipClass];
      const cargo = Math.min(ship.cargo, this.safeNumber(value.cargo, 0, ship.cargo));
      const modules = this.sanitizeModules(value.modules);
      if (!modules.length) return undefined;

      return { version: 1, shipClass: value.shipClass, credits, cargo, modules };
    } catch {
      return undefined;
    }
  }

  save(state: PlayerState): void {
    const progress: PlayerProgressV1 = {
      version: 1,
      shipClass: state.shipClass,
      credits: Math.max(0, Math.floor(state.credits)),
      cargo: Math.max(0, Math.min(state.cargoCapacity, Math.floor(state.cargo))),
      modules: state.modules.map((item) => ({ ...item })),
    };

    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
    } catch {
      // Storage may be unavailable in privacy modes. Gameplay must continue regardless.
    }
  }

  clear(): void {
    try { window.localStorage.removeItem(SAVE_KEY); } catch { /* optional storage */ }
  }

  private sanitizeModules(value: unknown): ModuleInstance[] {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const result: ModuleInstance[] = [];

    for (const item of value.slice(0, 100)) {
      if (!item || typeof item !== 'object') continue;
      const candidate = item as Partial<ModuleInstance>;
      if (!this.isModuleId(candidate.moduleId)) continue;
      const baseUid = typeof candidate.uid === 'string' && candidate.uid.length <= 120 ? candidate.uid : `${candidate.moduleId}-${result.length}`;
      let uid = baseUid;
      let suffix = 1;
      while (seen.has(uid)) uid = `${baseUid}-${suffix++}`;
      seen.add(uid);
      result.push({ uid, moduleId: candidate.moduleId, equipped: candidate.equipped === true });
    }
    return result;
  }

  private isModuleId(value: unknown): value is ModuleId {
    return typeof value === 'string' && value in MODULE_CATALOG;
  }

  private isShipClass(value: unknown): value is ShipClass {
    return typeof value === 'string' && value in SHIP_CATALOG;
  }

  private safeNumber(value: unknown, min: number, max: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, Math.floor(value)));
  }
}
