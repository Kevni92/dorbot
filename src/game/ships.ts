import type { ModuleSlots, PlayerState } from './models';

export type ShipClass = PlayerState['shipClass'];

export interface ShipDefinition {
  id: ShipClass;
  name: string;
  price: number;
  hp: number;
  cargo: number;
  speed: number;
  slots: ModuleSlots;
  texture: string;
  scale: number;
}

export const SHIP_CATALOG: Record<ShipClass, ShipDefinition> = {
  starter: {
    id: 'starter', name: 'Starter', price: 0, hp: 100, cargo: 100, speed: 340,
    slots: { laser: 1, rocket: 1, shield: 1 }, texture: 'ship-player', scale: 0.8,
  },
  scout: {
    id: 'scout', name: 'Scout', price: 900, hp: 90, cargo: 70, speed: 420,
    slots: { laser: 1, rocket: 1, shield: 1 }, texture: 'ship-scout', scale: 0.72,
  },
  hunter: {
    id: 'hunter', name: 'Hunter', price: 1800, hp: 140, cargo: 95, speed: 345,
    slots: { laser: 2, rocket: 2, shield: 2 }, texture: 'ship-hunter', scale: 0.88,
  },
  hauler: {
    id: 'hauler', name: 'Hauler', price: 2400, hp: 170, cargo: 180, speed: 285,
    slots: { laser: 1, rocket: 1, shield: 3 }, texture: 'ship-hauler', scale: 1.0,
  },
};
