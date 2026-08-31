# Equipment and module system

## Goal

Ships no longer receive permanent abstract `+damage` or `+shield` upgrades. Equipment is represented as owned module instances that can be installed into type-specific ship slots while docked at Station Aegis.

## Slot types

- **Laser**: energy weapons used by the laser action.
- **Rocket**: missile/torpedo launchers used by the rocket action.
- **Shield**: generators contributing to total shield capacity.

## Ship slot layouts

| Ship | Laser | Rocket | Shield | Character |
| --- | ---: | ---: | ---: | --- |
| Starter | 1 | 1 | 1 | balanced baseline |
| Scout | 1 | 1 | 1 | fast, low cargo |
| Hunter | 2 | 2 | 2 | combat-oriented multi-module platform |
| Hauler | 1 | 1 | 3 | cargo and defensive specialization |

Changing to a ship with fewer slots does not destroy modules. Excess equipped modules are automatically moved back into inventory.

## Module catalogue

### Lasers

- Pulslaser I: 18 damage / 0.38 s
- Pulslaser II: 28 damage / 0.34 s
- Beamlaser I: 48 damage / 0.72 s

### Rocket weapons

- Raketenwerfer I: 42 damage / 1.50 s
- Raketenwerfer II: 62 damage / 1.35 s
- Torpedowerfer I: 110 damage / 2.60 s

### Shields

- Schildgenerator I: 100 capacity
- Schildgenerator II: 160 capacity
- Schildgenerator III: 260 capacity

## Multiple equipped modules

All equipped modules of a weapon category participate in one salvo:

- Damage is summed across the installed modules.
- Salvo cooldown is determined by the slowest module in that category.
- Beamlaser presence changes the laser effect hue to make the loadout visible in combat.
- A torpedo module produces a larger/slower projectile effect.

Shield generator capacities are summed directly.

## Shield failure

When installed shield capacity is depleted, shields remain offline for 30 seconds. During that time incoming damage goes to hull HP. Once the timer expires the installed shield array returns at full capacity. A ship with no shield generator has zero shield capacity and takes hull damage immediately.

## Station workflow

1. Dock at Station Aegis.
2. Open **Ausrüstung**.
3. Buy a module from station inventory.
4. If a matching slot is free, the new module is installed automatically; otherwise it stays in inventory.
5. Tap/click an owned module to install or remove it.
6. Slot occupancy and resulting laser, rocket and shield values update immediately.

Equipment changes refill the shield array because they currently happen only while docked. This is prototype behavior and can later be replaced by installation time/repair rules.
