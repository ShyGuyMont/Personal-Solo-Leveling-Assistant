import { describe, expect, it } from 'vitest';
import { getAtmosphereProfile } from '@/game/systemAtmosphere';
import { CORE_ATTUNEMENTS } from '@/config/coreAttunements';
import { getDocumentTheme } from '@/utils/theme';

describe('color protocols', () => {
  it('lets Winter Crown inherit the complete light-surface family', () => {
    expect(getDocumentTheme('winter-crown')).toBe('daybreak');
    expect(getDocumentTheme('bloodmoon')).toBe('bloodmoon');
  });

  it('gives every protocol a distinct atmosphere profile', () => {
    expect(getAtmosphereProfile('abyss').kind).toBe('mote');
    expect(getAtmosphereProfile('daybreak').kind).toBe('mote');
    expect(getAtmosphereProfile('bloodmoon').kind).toBe('ember');
    expect(getAtmosphereProfile('frostbound').kind).toBe('crystal');
    expect(getAtmosphereProfile('winter-crown').kind).toBe('snow');
    expect(getAtmosphereProfile('verdant-nexus').kind).toBe('mote');
    expect(getAtmosphereProfile('solar-warden').kind).toBe('ember');
    expect(getAtmosphereProfile('neon-revenant').kind).toBe('crystal');
    expect(getAtmosphereProfile('phantom-steel').kind).toBe('crystal');

    const profiles = [
      'abyss',
      'daybreak',
      'bloodmoon',
      'frostbound',
      'winter-crown',
      'verdant-nexus',
      'solar-warden',
      'neon-revenant',
      'phantom-steel',
    ] as const;
    expect(new Set(profiles.map((theme) => JSON.stringify(getAtmosphereProfile(theme)))).size).toBe(
      profiles.length,
    );
  });

  it('ships every Core Attunement as a unique saved choice', () => {
    expect(CORE_ATTUNEMENTS).toHaveLength(9);
    expect(new Set(CORE_ATTUNEMENTS.map((attunement) => attunement.id)).size).toBe(
      CORE_ATTUNEMENTS.length,
    );
    expect(CORE_ATTUNEMENTS[0]?.id).toBe('protocol-linked');
    expect(CORE_ATTUNEMENTS.at(-1)?.id).toBe('prismatic');
  });
});
