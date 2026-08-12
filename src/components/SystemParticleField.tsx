import { useEffect, useRef, useState } from 'react';
import { getAtmosphereProfile } from '@/game/systemAtmosphere';
import type { ColorTheme, Settings } from '@/types/game';

interface SystemParticleFieldProps {
  theme: ColorTheme;
  intensity: Settings['themeIntensity'];
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  color: string;
}

function createParticle(
  width: number,
  height: number,
  kind: ReturnType<typeof getAtmosphereProfile>['kind'],
  color: string,
): Particle {
  const direction = kind === 'ember' ? -1 : 1;
  const baseSpeed = kind === 'snow' ? 10 : kind === 'ember' ? 17 : kind === 'crystal' ? 7 : 4;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.7 + Math.random() * (kind === 'snow' ? 2.2 : 1.6),
    vx: (Math.random() - 0.5) * (kind === 'snow' ? 9 : 5),
    vy: direction * (baseSpeed + Math.random() * baseSpeed),
    alpha: 0.22 + Math.random() * 0.55,
    phase: Math.random() * Math.PI * 2,
    color,
  };
}

export function SystemParticleField({ theme, intensity, enabled }: SystemParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [deviceReducedMotion, setDeviceReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setDeviceReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || deviceReducedMotion || intensity === 'subtle') return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const profile = getAtmosphereProfile(theme);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let animationFrame = 0;
    let previousTime = performance.now();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const mobile = width <= 720;
      const count = intensity === 'intense' ? (mobile ? 34 : 66) : mobile ? 20 : 40;
      particles = Array.from({ length: count }, (_, index) =>
        createParticle(
          width,
          height,
          profile.kind,
          index % 3 === 0 ? profile.secondary : profile.primary,
        ),
      );
    };

    const drawCrystal = (particle: Particle, time: number) => {
      const rotation = particle.phase + time * 0.00008;
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(rotation);
      context.beginPath();
      context.moveTo(0, -particle.radius * 2.4);
      context.lineTo(particle.radius, 0);
      context.lineTo(0, particle.radius * 2.4);
      context.lineTo(-particle.radius, 0);
      context.closePath();
      context.fill();
      context.restore();
    };

    const drawSnow = (particle: Particle) => {
      if (particle.radius < 1.65) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
        return;
      }
      context.save();
      context.translate(particle.x, particle.y);
      context.lineWidth = 0.65;
      context.strokeStyle = particle.color;
      for (let arm = 0; arm < 3; arm += 1) {
        context.rotate(Math.PI / 3);
        context.beginPath();
        context.moveTo(-particle.radius * 1.8, 0);
        context.lineTo(particle.radius * 1.8, 0);
        context.stroke();
      }
      context.restore();
    };

    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.phase += delta;
        particle.x += particle.vx * delta + Math.sin(particle.phase) * 0.06;
        particle.y += particle.vy * delta;

        if (particle.y > height + 12) particle.y = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.x < -12) particle.x = width + 12;

        context.globalAlpha = particle.alpha * (0.78 + Math.sin(particle.phase * 1.4) * 0.22);
        context.fillStyle = particle.color;
        context.shadowColor = profile.glow;
        context.shadowBlur = intensity === 'intense' ? 9 : 5;

        if (profile.kind === 'snow') drawSnow(particle);
        else if (profile.kind === 'crystal') drawCrystal(particle, time);
        else {
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fill();
        }
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      animationFrame = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      cancelAnimationFrame(animationFrame);
      if (document.visibilityState === 'visible') {
        previousTime = performance.now();
        animationFrame = requestAnimationFrame(animate);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      context.clearRect(0, 0, width, height);
    };
  }, [deviceReducedMotion, enabled, intensity, theme]);

  return <canvas ref={canvasRef} className="system-particle-field" aria-hidden="true" />;
}
