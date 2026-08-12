import { describe, expect, it } from 'vitest';
import { calculateDepthMotion } from '@/hooks/useSystemDepth';

const bounds = { left: 100, top: 50, width: 400, height: 200 };

describe('System depth motion', () => {
  it('keeps a centered pointer on the neutral plane', () => {
    expect(calculateDepthMotion(300, 150, bounds, 4)).toEqual({
      normalizedX: 0,
      normalizedY: 0,
      rotateX: -0,
      rotateY: 0,
      lightX: 50,
      lightY: 50,
    });
  });

  it('tilts toward the pointer while moving the surface light', () => {
    expect(calculateDepthMotion(500, 50, bounds, 4)).toEqual({
      normalizedX: 1,
      normalizedY: -1,
      rotateX: 4,
      rotateY: 4,
      lightX: 100,
      lightY: 0,
    });
  });

  it('clamps motion when the pointer leaves the surface bounds', () => {
    const motion = calculateDepthMotion(-500, 900, bounds, 3);
    expect(motion.normalizedX).toBe(-1);
    expect(motion.normalizedY).toBe(1);
    expect(motion.rotateX).toBe(-3);
    expect(motion.rotateY).toBe(-3);
  });
});
