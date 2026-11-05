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
      {/* Background radial glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none -bottom-20 -right-20" />

      {/* Main Flash Card Container */}
      <div className="relative w-full max-w-xl bg-slate-900/80 border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/10 backdrop-blur-xl overflow-hidden text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Top Badges & Countdown */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Live Procurement Engine
            </span>
          </span>

          <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-bold">
            Launching in {timeLeft.toFixed(1)}s
          </span>
        </div>

        {/* Brand Icon with Radiant Pulse */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-blue-600/40 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-xl ring-2 ring-blue-400/40">
            <Zap className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            PARTSURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
            Autonomous Procurement & Deterministic Fulfilment Intelligence for Safe Workshop Operations
          </p>
        </div>

        {/* 3 Core Pillar Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-emerald-400 font-bold block text-[11px]">0 Unsafe Dispatches</span>
              <span className="text-slate-400 text-[10px]">Deterministic safety gate</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-purple-400 font-bold block text-[11px]">14-Unit Budget</span>
              <span className="text-slate-400 text-[10px]">Optimal tool allocation</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-blue-400 font-bold block text-[11px]">Dual Role Portals</span>
              <span className="text-slate-400 text-[10px]">Customer & Admin desks</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Skip Button */}
        <div className="space-y-3 pt-2">
          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <button
            onClick={onDismiss}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 group cursor-pointer active:scale-98"
          >
            <span>Enter Dashboard Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
