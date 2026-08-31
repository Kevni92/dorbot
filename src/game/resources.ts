import type { CargoManifest, ResourceId } from './models';

export interface ResourceDefinition {
  id: ResourceId;
  name: string;
  shortName: string;
  price: number;
  color: number;
  colorCss: string;
  description: string;
}

export interface AsteroidDefinition {
  resourceId: Exclude<ResourceId, 'scrap'>;
  name: string;
  hp: number;
  yieldMin: number;
  yieldMax: number;
  tint: number;
  explosionColor: number;
  scaleMin: number;
  scaleMax: number;
}

export const RESOURCE_IDS: ResourceId[] = ['ferrolite', 'crysite', 'aurite', 'scrap'];

export const RESOURCE_CATALOG: Record<ResourceId, ResourceDefinition> = {
  ferrolite: {
    id: 'ferrolite',
    name: 'Ferrolit',
    shortName: 'FER',
    price: 8,
    color: 0x9fb8c9,
    colorCss: '#9fb8c9',
    description: 'Häufiges Metall-Erz für Basiskonstruktionen.',
  },
  crysite: {
    id: 'crysite',
    name: 'Crysite',
    shortName: 'CRY',
    price: 18,
    color: 0x5de4ff,
    colorCss: '#5de4ff',
    description: 'Kristallines Material für Energie- und Schildtechnik.',
  },
  aurite: {
    id: 'aurite',
    name: 'Aurit',
    shortName: 'AUR',
    price: 42,
    color: 0xffc85a,
    colorCss: '#ffc85a',
    description: 'Seltenes Hochwert-Erz mit hoher Stationsnachfrage.',
  },
  scrap: {
    id: 'scrap',
    name: 'Bergungsgut',
    shortName: 'BRG',
    price: 14,
    color: 0xff7d91,
    colorCss: '#ff7d91',
    description: 'Verwertbare Komponenten aus zerstörten Piratenschiffen.',
  },
};

export const ASTEROID_CATALOG: Record<Exclude<ResourceId, 'scrap'>, AsteroidDefinition> = {
  ferrolite: {
    resourceId: 'ferrolite',
    name: 'Ferrolit-Asteroid',
    hp: 70,
    yieldMin: 18,
    yieldMax: 30,
    tint: 0xa9bbc7,
    explosionColor: 0x91a9ba,
    scaleMin: 1.0,
    scaleMax: 1.45,
  },
  crysite: {
    resourceId: 'crysite',
    name: 'Crysite-Asteroid',
    hp: 105,
    yieldMin: 12,
    yieldMax: 22,
    tint: 0x62dff6,
    explosionColor: 0x55dff7,
    scaleMin: 1.08,
    scaleMax: 1.55,
  },
  aurite: {
    resourceId: 'aurite',
    name: 'Aurit-Asteroid',
    hp: 155,
    yieldMin: 7,
    yieldMax: 14,
    tint: 0xffc56b,
    explosionColor: 0xffb84f,
    scaleMin: 1.18,
    scaleMax: 1.65,
  },
};

export function createEmptyCargo(): CargoManifest {
  return { ferrolite: 0, crysite: 0, aurite: 0, scrap: 0 };
}

export function cloneCargo(cargo: CargoManifest): CargoManifest {
  return { ferrolite: cargo.ferrolite, crysite: cargo.crysite, aurite: cargo.aurite, scrap: cargo.scrap };
}

export function cargoTotal(cargo: CargoManifest): number {
  return RESOURCE_IDS.reduce((sum, id) => sum + Math.max(0, Math.floor(cargo[id] ?? 0)), 0);
}

export function cargoValue(cargo: CargoManifest): number {
  return RESOURCE_IDS.reduce((sum, id) => sum + Math.max(0, Math.floor(cargo[id] ?? 0)) * RESOURCE_CATALOG[id].price, 0);
}

export function manifestFor(resourceId: ResourceId, amount: number): CargoManifest {
  const cargo = createEmptyCargo();
  cargo[resourceId] = Math.max(0, Math.floor(amount));
  return cargo;
}

export function firstCargoResource(cargo: CargoManifest): ResourceId | undefined {
  return RESOURCE_IDS.find((id) => cargo[id] > 0);
}
