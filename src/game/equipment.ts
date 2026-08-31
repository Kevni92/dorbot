import type { ModuleId, ModuleKind } from './models';

export interface EquipmentDefinition {
  id: ModuleId;
  kind: ModuleKind;
  name: string;
  description: string;
  price: number;
  damage?: number;
  cooldown?: number;
  shield?: number;
}

export const MODULE_CATALOG: Record<ModuleId, EquipmentDefinition> = {
  'laser-pulse-1': { id: 'laser-pulse-1', kind: 'laser', name: 'Pulslaser I', description: '18 Schaden · 0,38 s', price: 320, damage: 18, cooldown: 380 },
  'laser-pulse-2': { id: 'laser-pulse-2', kind: 'laser', name: 'Pulslaser II', description: '28 Schaden · 0,34 s', price: 650, damage: 28, cooldown: 340 },
  'laser-beam-1': { id: 'laser-beam-1', kind: 'laser', name: 'Beamlaser I', description: '48 Schaden · 0,72 s', price: 1100, damage: 48, cooldown: 720 },
  'rocket-launcher-1': { id: 'rocket-launcher-1', kind: 'rocket', name: 'Raketenwerfer I', description: '42 Schaden · 1,50 s', price: 420, damage: 42, cooldown: 1500 },
  'rocket-launcher-2': { id: 'rocket-launcher-2', kind: 'rocket', name: 'Raketenwerfer II', description: '62 Schaden · 1,35 s', price: 850, damage: 62, cooldown: 1350 },
  'rocket-torpedo-1': { id: 'rocket-torpedo-1', kind: 'rocket', name: 'Torpedowerfer I', description: '110 Schaden · 2,60 s', price: 1450, damage: 110, cooldown: 2600 },
  'shield-generator-1': { id: 'shield-generator-1', kind: 'shield', name: 'Schildgenerator I', description: '+100 Schild', price: 350, shield: 100 },
  'shield-generator-2': { id: 'shield-generator-2', kind: 'shield', name: 'Schildgenerator II', description: '+160 Schild', price: 700, shield: 160 },
  'shield-generator-3': { id: 'shield-generator-3', kind: 'shield', name: 'Schildgenerator III', description: '+260 Schild', price: 1350, shield: 260 },
};

export const MODULE_STORE: ModuleId[] = [
  'laser-pulse-1',
  'laser-pulse-2',
  'laser-beam-1',
  'rocket-launcher-1',
  'rocket-launcher-2',
  'rocket-torpedo-1',
  'shield-generator-1',
  'shield-generator-2',
  'shield-generator-3',
];
