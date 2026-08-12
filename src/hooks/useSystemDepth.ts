import { useEffect, type RefObject } from 'react';

export interface DepthBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DepthMotion {
  normalizedX: number;
  normalizedY: number;
  rotateX: number;
  rotateY: number;
  lightX: number;
  lightY: number;
}

const DEPTH_TARGET = '[data-depth-surface], a.panel, button.panel, .realm-portal';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateDepthMotion(
  pointerX: number,
  pointerY: number,
  bounds: DepthBounds,
  maxTilt: number,
): DepthMotion {
  const normalizedX = clamp(((pointerX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1, -1, 1);
  const normalizedY = clamp(((pointerY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1, -1, 1);
  return {
    normalizedX,
    normalizedY,
    rotateX: normalizedY * -maxTilt,
    rotateY: normalizedX * maxTilt,
    lightX: (normalizedX + 1) * 50,
    lightY: (normalizedY + 1) * 50,
  };
}

function clearSurface(surface?: HTMLElement) {
  if (!surface) return;
  delete surface.dataset.depthActive;
  for (const property of [
    '--depth-rotate-x',
    '--depth-rotate-y',
    '--depth-offset-x',
    '--depth-offset-y',
    '--depth-light-x',
    '--depth-light-y',
  ]) {
    surface.style.removeProperty(property);
  }
}

export function useSystemDepth(
  rootRef: RefObject<HTMLElement>,
  options: { enabled: boolean; intensity: 'subtle' | 'standard' | 'intense' },
) {
  useEffect(() => {
    const root = rootRef.current;
    const supportsDepth = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!root || !options.enabled || !supportsDepth) return;

    let activeSurface: HTMLElement | undefined;
    let latestEvent: PointerEvent | undefined;
    let animationFrame: number | undefined;
    const baseTilt =
      options.intensity === 'intense' ? 4.2 : options.intensity === 'subtle' ? 1.1 : 2.6;

    const renderDepth = () => {
      animationFrame = undefined;
      const event = latestEvent;
      if (!event) return;
      const sceneX = clamp((event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1, -1, 1);
      const sceneY = clamp((event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1, -1, 1);
      root.style.setProperty('--depth-scene-x', `${(sceneX * 6).toFixed(2)}px`);
      root.style.setProperty('--depth-scene-y', `${(sceneY * 4).toFixed(2)}px`);

      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>(DEPTH_TARGET) : null;
      const surface = target && root.contains(target) ? target : undefined;
      if (surface !== activeSurface) {
        clearSurface(activeSurface);
        activeSurface = surface;
      }
      if (!surface) return;

      const bounds = surface.getBoundingClientRect();
      const surfaceKind = surface.dataset.depthSurface;
      const strength = surfaceKind === 'hero' ? 0.42 : surfaceKind === 'panel' ? 0.72 : 1;
      const motion = calculateDepthMotion(
        event.clientX,
        event.clientY,
        bounds,
        baseTilt * strength,
      );
      surface.dataset.depthActive = 'true';
      surface.style.setProperty('--depth-rotate-x', `${motion.rotateX.toFixed(2)}deg`);
      surface.style.setProperty('--depth-rotate-y', `${motion.rotateY.toFixed(2)}deg`);
      surface.style.setProperty('--depth-offset-x', `${(motion.normalizedX * 5).toFixed(2)}px`);
      surface.style.setProperty('--depth-offset-y', `${(motion.normalizedY * 3).toFixed(2)}px`);
      surface.style.setProperty('--depth-light-x', `${motion.lightX.toFixed(1)}%`);
      surface.style.setProperty('--depth-light-y', `${motion.lightY.toFixed(1)}%`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      latestEvent = event;
      if (animationFrame === undefined) animationFrame = window.requestAnimationFrame(renderDepth);
    };
    const resetDepth = () => {
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      latestEvent = undefined;
      clearSurface(activeSurface);
      activeSurface = undefined;
      root.style.setProperty('--depth-scene-x', '0px');
      root.style.setProperty('--depth-scene-y', '0px');
    };

    root.addEventListener('pointermove', handlePointerMove, { passive: true });
    root.addEventListener('pointerleave', resetDepth);
    return () => {
      root.removeEventListener('pointermove', handlePointerMove);
      root.removeEventListener('pointerleave', resetDepth);
      resetDepth();
    };
  }, [options.enabled, options.intensity, rootRef]);
}
