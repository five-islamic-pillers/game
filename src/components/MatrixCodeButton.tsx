import React, { useEffect, useRef } from 'react';
import { ExternalLink, Terminal } from 'lucide-react';
import { SoundManager } from '../utils/sound';

interface MatrixCodeButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const MatrixCodeButton: React.FC<MatrixCodeButtonProps> = ({
  href = 'https://five-islamic-pillers.github.io/me/',
  onClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 76);

    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ<>{}/*+=~';
    const fontSize = 11;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -30));

    let lastDraw = 0;
    const fps = 28;
    const interval = 1000 / fps;

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (time - lastDraw < interval) return;
      lastDraw = time;

      // Semi-transparent black wash creates the trailing fading effect
      ctx.fillStyle = 'rgba(2, 8, 4, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is bright lime-white
        if (Math.random() > 0.85) {
          ctx.fillStyle = '#a7f3d0'; // bright mint
        } else {
          ctx.fillStyle = '#10b981'; // matrix emerald
        }

        ctx.fillText(char, x, y);

        // Reset drop to top with randomized delay when it passes the bottom
        if (y > height && Math.random() > 0.97) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        SoundManager.click();
        onClick?.();
      }}
      className={`relative w-full p-4 rounded-2xl bg-black border-2 border-emerald-500/50 hover:border-emerald-400 dark:border-emerald-500/40 dark:hover:border-emerald-400 flex items-center justify-between transition-all cursor-pointer group text-right shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/50 hover:ring-2 hover:ring-emerald-500/30 active:scale-98 overflow-hidden ${className}`}
    >
      {/* Matrix falling code canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Dark overlay with scanline tint to keep typography 100% legible */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/75 to-black/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30 group-hover:scale-105 group-hover:border-emerald-400 group-hover:shadow-emerald-400/50 transition-all text-emerald-400">
          <Terminal className="w-6 h-6 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-emerald-400 group-hover:text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] block tracking-wide">
              دروستکەر
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold rounded-full tracking-wider">
              CREATOR
            </span>
          </div>
          <span className="text-xs text-emerald-100/90 group-hover:text-emerald-100 font-bold block mt-0.5 truncate">
            پۆرتفۆلیۆی میر صڵاح (Meer Salah)
          </span>
        </div>
      </div>

      <div className="relative z-10 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-300 group-hover:-translate-x-1 transition-all shrink-0">
        <ExternalLink className="w-4 h-4" />
      </div>
    </a>
  );
};
