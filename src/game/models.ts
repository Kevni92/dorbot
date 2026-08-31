export type TargetKind = 'pirate' | 'asteroid';
export type ModuleKind = 'laser' | 'rocket' | 'shield';
export type ResourceId = 'ferrolite' | 'crysite' | 'aurite' | 'scrap';
export type ModuleId =
  | 'laser-pulse-1'
  | 'laser-pulse-2'
  | 'laser-beam-1'
  | 'rocket-launcher-1'
  | 'rocket-launcher-2'
  | 'rocket-torpedo-1'
  | 'shield-generator-1'
  | 'shield-generator-2'
  | 'shield-generator-3';

export interface CargoManifest {
  ferrolite: number;
  crysite: number;
  aurite: number;
  scrap: number;
}

export interface CombatTarget {
  id: string;
  kind: TargetKind;
  sprite: any;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  cargo: number;
  resourceId: ResourceId;
  explosionColor?: number;
  destroyed: boolean;
  nextShotAt?: number;
  wanderX?: number;
  wanderY?: number;
}

export interface ModuleSlots {
  laser: number;
  rocket: number;
  shield: number;
}

export interface ModuleInstance {
  uid: string;
  moduleId: ModuleId;
  equipped: boolean;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldOfflineUntil: number;
  credits: number;
  cargo: number;
  cargoManifest: CargoManifest;
  cargoCapacity: number;
  speed: number;
  laserDamage: number;
  laserCooldown: number;
  rocketDamage: number;
  rocketCooldown: number;
  shipClass: 'starter' | 'scout' | 'hunter' | 'hauler';
  moduleSlots: ModuleSlots;
  modules: ModuleInstance[];
}

export interface LootNode {
  id: string;
  sprite: any;
  contents: CargoManifest;
  kind: 'resource' | 'cargo';
  resourceId?: ResourceId;
}
