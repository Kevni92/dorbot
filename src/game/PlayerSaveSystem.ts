import { MODULE_CATALOG } from './equipment';
import { SHIP_CATALOG, type ShipClass } from './ships';
import { RESOURCE_IDS, cargoTotal, createEmptyCargo } from './resources';
import type { CargoManifest, ModuleId, ModuleInstance, PlayerState, ResourceId } from './models';

const SAVE_KEY = 'dorbot.player-progress.v1';

interface PlayerProgressV1 {
  version: 1;
  shipClass: ShipClass;
  credits: number;
  cargo: number;
  modules: ModuleInstance[];
}

export interface PlayerProgressV2 {
  version: 2;
  shipClass: ShipClass;
  credits: number;
  cargoManifest: CargoManifest;
  modules: ModuleInstance[];
}

export class PlayerSaveSystem {
  load(): PlayerProgressV2 | undefined {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return undefined;
      const value = JSON.parse(raw) as Partial<PlayerProgressV1 & PlayerProgressV2>;
      if (!this.isShipClass(value.shipClass)) return undefined;

      const credits = this.safeNumber(value.credits, 0, 1_000_000_000);
      const ship = SHIP_CATALOG[value.shipClass];
      const modules = this.sanitizeModules(value.modules);
      if (!modules.length) return undefined;

      let cargoManifest: CargoManifest;
      if (value.version === 2) {
        cargoManifest = this.sanitizeCargo(value.cargoManifest, ship.cargo);
      } else if (value.version === 1) {
        cargoManifest = createEmptyCargo();
        cargoManifest.ferrolite = this.safeNumber(value.cargo, 0, ship.cargo);
      } else {
        return undefined;
      }

      return { version: 2, shipClass: value.shipClass, credits, cargoManifest, modules };
    } catch {
      return undefined;
    }
  }

  save(state: PlayerState): void {
    const progress: PlayerProgressV2 = {
      version: 2,
      shipClass: state.shipClass,
      credits: Math.max(0, Math.floor(state.credits)),
      cargoManifest: this.sanitizeCargo(state.cargoManifest, state.cargoCapacity),
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

  private sanitizeCargo(value: unknown, capacity: number): CargoManifest {
    const result = createEmptyCargo();
    if (!value || typeof value !== 'object') return result;
    const source = value as Partial<Record<ResourceId, unknown>>;
    let remaining = Math.max(0, Math.floor(capacity));

    for (const id of RESOURCE_IDS) {
      if (remaining <= 0) break;
      const amount = this.safeNumber(source[id], 0, remaining);
      result[id] = amount;
      remaining -= amount;
    }

    if (cargoTotal(result) > capacity) return createEmptyCargo();
    return result;
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
