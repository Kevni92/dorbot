export type TargetKind = 'pirate' | 'asteroid';

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
  rocketDamage: number;
  shipClass: 'starter' | 'scout' | 'hunter' | 'hauler';
}

export interface LootNode {
  id: string;
  sprite: any;
  amount: number;
  kind: 'ore' | 'cargo';
}
