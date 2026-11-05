import { useState, useEffect } from 'react';
import { Zap, ShieldCheck, Cpu, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface FlashIntroCardProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const FlashIntroCard: React.FC<FlashIntroCardProps> = ({ isOpen, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState<number>(3.0);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(3.0);
      return;
    }

    const interval = 50; // update every 50ms
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.05) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return Math.max(0, Number((prev - 0.05).toFixed(2)));
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.max(0, ((3.0 - timeLeft) / 3.0) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl transition-all duration-300">
      {/* Cinematic Fullscreen Ambient Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />

      {/* Atmospheric Glow Spheres */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none -bottom-20 -right-20" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-teal-500/15 blur-[100px] pointer-events-none -top-20 -left-20" />

      {/* Main Flash Card Container */}
      <div className="relative z-10 w-full max-w-xl bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/20 backdrop-blur-2xl overflow-hidden text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Stunning High-Tech Hardware Workshop Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-35 mix-blend-luminosity scale-105 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />

        {/* Deep Slate Gradient Mask for High Text Contrast */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/90 via-slate-900/85 to-slate-950/95 pointer-events-none" />

        {/* Futuristic Cyber Circuit Grid Overlay */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Card Content (Relative z-10 for Razor-Sharp Legibility) */}
        <div className="relative z-10 space-y-6">
          {/* Top Badges & Countdown */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Autonomous Parts Desk v6
              </span>
            </span>

            <span className="px-3.5 py-1 rounded-full bg-slate-950/90 border border-slate-700/80 text-cyan-300 font-bold tracking-wide shadow-inner">
              Starting in <span className="text-white font-extrabold">{timeLeft.toFixed(1)}s</span>
            </span>
          </div>

          {/* Brand Icon with Radiant Pulse */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/40 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-400 flex items-center justify-center shadow-xl ring-2 ring-cyan-400/40 shadow-blue-500/30">
              <Zap className="w-10 h-10 text-white fill-white drop-shadow-md" />
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              PARTSURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
              Autonomous Technical Specification Intelligence & Verified Inventory Fulfilment
            </p>
          </div>

          {/* 3 Core Pillar Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
            <div className="bg-slate-950/75 p-3 rounded-xl border border-emerald-500/25 flex items-start space-x-2.5 backdrop-blur-md shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-300 font-bold block text-[11px]">0 Incompatible</span>
                <span className="text-slate-400 text-[10px]">Deterministic safety gate</span>
              </div>
            </div>

            <div className="bg-slate-950/75 p-3 rounded-xl border border-purple-500/25 flex items-start space-x-2.5 backdrop-blur-md shadow-sm">
              <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-purple-300 font-bold block text-[11px]">14-Unit Tool Budget</span>
                <span className="text-slate-400 text-[10px]">≤13 units for max efficiency</span>
              </div>
            </div>

            <div className="bg-slate-950/75 p-3 rounded-xl border border-blue-500/25 flex items-start space-x-2.5 backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-cyan-300 font-bold block text-[11px]">Dynamic Lineage</span>
                <span className="text-slate-400 text-[10px]">Approved revision resolution</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Skip Button */}
          <div className="space-y-3 pt-2">
            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-950/90 rounded-full h-2 overflow-hidden border border-slate-700/80 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 transition-all duration-75 ease-linear rounded-full shadow-sm shadow-cyan-400/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <button
              onClick={onDismiss}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 group cursor-pointer active:scale-98"
            >
              <span>Launch Dashboard Immediately</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
