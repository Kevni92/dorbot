export type TargetKind = 'pirate' | 'asteroid';
export type ModuleKind = 'laser' | 'rocket' | 'shield';
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
  amount: number;
  kind: 'ore' | 'cargo';
}
