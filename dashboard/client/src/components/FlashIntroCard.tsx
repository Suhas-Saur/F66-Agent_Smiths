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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      {/* Fullscreen Atmospheric Ambient Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none scale-105 transition-opacity"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80 pointer-events-none" />

      {/* Atmospheric Neon Glow Orbs */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-cyan-500/25 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[550px] h-[550px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none -bottom-10 -right-10" />

      {/* Main Flash Card Container with Visible High-Definition Workshop Visual */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/30 overflow-hidden text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* === VIVID & CLEARLY VISIBLE HIGH-TECH HARDWARE BACKGROUND IMAGE === */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-70 pointer-events-none scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=90')`,
          }}
        />

        {/* Subtle Dark Vignette & Cyber Blue Gradient Mask (keeps image vivid while text pops) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/75 via-slate-900/60 to-slate-950/85 pointer-events-none" />

        {/* Cyber Holographic Grid Pattern */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

        {/* Card Content (Elevated with Glassmorphism) */}
        <div className="relative z-10 p-7 sm:p-9 space-y-6">
          
          {/* Top Badges & Countdown */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/85 text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Autonomous Parts Desk v6
              </span>
            </span>

            <span className="px-3.5 py-1 rounded-full bg-slate-950/90 border border-cyan-500/40 text-cyan-200 font-mono font-bold tracking-wide shadow-lg backdrop-blur-md">
              Starting in <span className="text-white font-extrabold text-sm">{timeLeft.toFixed(1)}s</span>
            </span>
          </div>

          {/* Glowing Brand Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-cyan-400/50 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-cyan-600 to-teal-400 flex items-center justify-center shadow-2xl ring-2 ring-white/60 shadow-cyan-500/50">
              <Zap className="w-10 h-10 text-white fill-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]" />
            </div>
          </div>

          {/* Title & Tagline with High-Contrast Text Shadows */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              PARTSURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300">AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 font-semibold max-w-md mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-slate-950/50 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              Autonomous Technical Specification Intelligence & Verified Inventory Fulfilment
            </p>
          </div>

          {/* 3 Core Pillar Badges (Frosted Glass with Clear Contrast) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
            <div className="bg-slate-950/85 p-3 rounded-xl border border-emerald-400/40 flex items-start space-x-2.5 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-300 font-bold block text-[11px]">0 Incompatible</span>
                <span className="text-slate-300 text-[10px]">Deterministic safety gate</span>
              </div>
            </div>

            <div className="bg-slate-950/85 p-3 rounded-xl border border-purple-400/40 flex items-start space-x-2.5 backdrop-blur-md shadow-lg">
              <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-purple-300 font-bold block text-[11px]">14-Unit Budget</span>
                <span className="text-slate-300 text-[10px]">≤13 units for max efficiency</span>
              </div>
            </div>

            <div className="bg-slate-950/85 p-3 rounded-xl border border-cyan-400/40 flex items-start space-x-2.5 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-cyan-300 font-bold block text-[11px]">Dynamic Lineage</span>
                <span className="text-slate-300 text-[10px]">Approved revision resolution</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Launch Button */}
          <div className="space-y-3 pt-1">
            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-950/90 rounded-full h-2.5 overflow-hidden border border-cyan-500/40 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 transition-all duration-75 ease-linear rounded-full shadow-md shadow-cyan-400/70"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <button
              onClick={onDismiss}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-xl shadow-cyan-500/40 flex items-center justify-center space-x-2 group cursor-pointer active:scale-98 border border-white/20"
            >
              <span>Launch Dashboard Immediately</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
