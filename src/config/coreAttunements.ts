import type { CoreAttunement } from '@/types/game';

export interface CoreAttunementDefinition {
  id: CoreAttunement;
  name: string;
  detail: string;
}

export const CORE_ATTUNEMENTS: CoreAttunementDefinition[] = [
  {
    id: 'protocol-linked',
    name: 'Protocol Linked',
    detail: 'Follows the active System state and color protocol',
  },
  {
    id: 'sovereign-mint',
    name: 'Sovereign Mint',
    detail: 'Living mint with a violet dimensional edge',
  },
  {
    id: 'void-violet',
    name: 'Void Violet',
    detail: 'Deep amethyst with a blue-violet inner current',
  },
  {
    id: 'solar-gold',
    name: 'Solar Gold',
    detail: 'White-hot gold with a molten orange corona',
  },
  {
    id: 'bloodfire',
    name: 'Bloodfire',
    detail: 'Crimson plasma with an ember-orange heartbeat',
  },
  {
    id: 'frost-crystal',
    name: 'Frost Crystal',
    detail: 'Glacial blue with a silver-violet resonance',
  },
  {
    id: 'verdant-life',
    name: 'Verdant Life',
    detail: 'Living jade with ion-lime neural currents',
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    detail: 'Shock pink and ion cyan in open conflict',
  },
  {
    id: 'prismatic',
    name: 'Prismatic',
    detail: 'A dual spectrum that evolves with daily charge',
  },
];
