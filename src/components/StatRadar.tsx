import { useEffect, useRef } from 'react';
import type { StatProgress } from '@/types/game';

export function StatRadar({ stats }: { stats: StatProgress[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const size = 280;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, size, size);
    const center = size / 2;
    const radius = 104;
    const count = stats.length;
    const maxLevel = Math.max(10, ...stats.map((stat) => stat.level));
    const point = (index: number, scale: number) => {
      const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
      return {
        x: center + Math.cos(angle) * radius * scale,
        y: center + Math.sin(angle) * radius * scale,
      };
    };
    context.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring += 1) {
      context.beginPath();
      for (let i = 0; i < count; i += 1) {
        const p = point(i, ring / 4);
        if (i === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      }
      context.closePath();
      context.strokeStyle = ring === 4 ? 'rgba(67,230,194,.28)' : 'rgba(142,154,167,.12)';
      context.stroke();
    }
    context.beginPath();
    stats.forEach((stat, index) => {
      const scale = 0.12 + (stat.level / maxLevel) * 0.78;
      const p = point(index, scale);
      if (index === 0) context.moveTo(p.x, p.y);
      else context.lineTo(p.x, p.y);
    });
    context.closePath();
    const gradient = context.createRadialGradient(center, center, 10, center, center, radius);
    gradient.addColorStop(0, 'rgba(139,92,246,.22)');
    gradient.addColorStop(1, 'rgba(67,230,194,.16)');
    context.fillStyle = gradient;
    context.fill();
    context.strokeStyle = '#43e6c2';
    context.lineWidth = 2;
    context.shadowColor = 'rgba(67,230,194,.55)';
    context.shadowBlur = 10;
    context.stroke();
    context.shadowBlur = 0;
    stats.forEach((stat, index) => {
      const p = point(index, 1.1);
      context.fillStyle = '#8e9aa7';
      context.font = '10px Inter, system-ui, sans-serif';
      context.textAlign = p.x < center - 10 ? 'right' : p.x > center + 10 ? 'left' : 'center';
      context.textBaseline = p.y < center ? 'bottom' : 'top';
      context.fillText(stat.name.slice(0, 3).toUpperCase(), p.x, p.y);
    });
  }, [stats]);

  return (
    <canvas
      ref={canvasRef}
      className="stat-radar"
      width={280}
      height={280}
      aria-label="Radar chart of all stat levels. Exact values are listed below."
      role="img"
    />
  );
}
