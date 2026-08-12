import { describe, expect, it } from 'vitest';
import { getAtmosphereProfile } from '@/game/systemAtmosphere';
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
  });
});
