import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Package,
  Layers,
  BarChart3,
  Sliders,
  Play,
  Boxes,
  FileText,
  UserCheck,
  Send,
  Sparkles,
  Cpu,
  Database,
} from 'lucide-react';
import { CaseRunData, UserProfile, TabType } from '../types';

interface HomePortalProps {
  runData: CaseRunData | null;
  currentUser: UserProfile;
  onNavigateTab: (tab: TabType) => void;
  onOpenAuth: () => void;
  onReplayIntro: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({
  runData,
  currentUser,
  onNavigateTab,
  onOpenAuth,
  onReplayIntro,
}) => {
  const fulfilledCount = runData?.tickets.filter((t) => t.decision === 'dispatch').length || 0;
  const escalatedCount = runData?.tickets.filter((t) => t.decision === 'escalate').length || 0;
  const score = runData?.grade.score ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Unique Home Page Workshop Laboratory Ambient Backdrop */}
      <div
        className="absolute inset-0 -top-8 -bottom-8 -left-8 -right-8 z-0 bg-cover bg-center opacity-15 pointer-events-none rounded-3xl"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      {/* 1. HERO BANNER WITH VIBRANT HIGH-TECH WORKSHOP VISUAL */}
      <div className="relative z-10 overflow-hidden bg-slate-900/85 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-500/10">
        {/* Stunning High-Tech Hardware Visual Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=85')`,
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/90 pointer-events-none" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-semibold flex items-center space-x-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Autonomous Procurement Engine v6.2</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-semibold shadow-sm">
                Deterministic 0% Incompatibility
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              Workshop Procurement & Safe Fulfilment Hub
            </h1>

            <p className="text-slate-200 text-sm leading-relaxed font-normal max-w-xl">
              PartSure AI bridges workshop technicians and warehouse operations by converting technical prose into inventory-verified, technically compatible, and budget-optimized fulfillment decisions.
            </p>
          </div>

          {/* Current User Card with Instant Switch Pill */}
          <div className="bg-slate-950/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-3 shrink-0 min-w-[260px] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Profile
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  currentUser.role === 'admin'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                }`}
              >
                {currentUser.badge}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl font-mono font-bold flex items-center justify-center text-xs shadow-md ${
                  currentUser.role === 'admin'
                    ? 'bg-blue-600/30 text-blue-200 border border-blue-400/40'
                    : 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/40'
                }`}
              >
                {currentUser.avatar}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{currentUser.name}</h4>
                <p className="text-[10px] text-slate-300 truncate max-w-[160px]">{currentUser.title}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={onOpenAuth}
                className="w-full text-xs font-semibold py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch Role</span>
              </button>
              <button
                onClick={onReplayIntro}
                title="Replay 3s Flash Card Intro"
                className="text-xs py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white border border-slate-700 transition shrink-0 font-bold"
              >
                Intro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DUAL ROLE HUBS: CUSTOMER VS ADMIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* A. CUSTOMER DESK HUB */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-7 shadow-2xl relative overflow-hidden space-y-6 hover:border-emerald-400/50 transition-all duration-300 flex flex-col justify-between">
          {/* Subtle PCB Circuit Visual Overlay for Customer Card */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-right opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80')`,
            }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/95 via-slate-900/85 to-slate-950/75 pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Customer Portal</h2>
                  <p className="text-xs text-slate-300">For Workshop Technicians & Field Engineers</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-400/30 shadow-sm">
                {fulfilledCount} / 6 Dispatched
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Submit everyday technical power requests in natural language. PartSure AI automatically extracts required electrical parameters and issues safe inventory allocations.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Fulfilled</span>
                <span className="text-base font-bold text-emerald-400">{fulfilledCount}</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Escalated</span>
                <span className="text-base font-bold text-amber-400">{escalatedCount}</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Safety Rate</span>
                <span className="text-base font-bold text-teal-300">100%</span>
              </div>
            </div>

            {/* Assigned Role Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Customer Action Desk
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onNavigateTab('customer')}
                  className="p-3 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 group shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Natural language submission</p>
                </button>

                <button
                  onClick={() => onNavigateTab('customer')}
                  className="p-3 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 group shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                    <Package className="w-3.5 h-3.5" />
                    <span>Track Orders</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Real-time status & receipts</p>
                </button>

                <button
                  onClick={() => onNavigateTab('sandbox')}
                  className="p-3 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 group shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>What-If Sandbox</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Test specs before order</p>
                </button>

                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="p-3 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 group shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-teal-400 font-semibold">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>View Parts</span>
                  </div>
                  <p className="text-[10px] text-slate-400">12 catalog specifications</p>
                </button>
              </div>
            </div>
          </div>

          {/* Launch Customer View Button */}
          <button
            onClick={() => onNavigateTab('customer')}
            className="relative z-10 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 group cursor-pointer mt-4"
          >
            <span>Open Customer Portal View</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* B. ADMIN & DISPATCHER MISSION CONTROL HUB */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-7 shadow-2xl relative overflow-hidden space-y-6 hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between">
          {/* Subtle Robotics Hardware Visual Overlay for Admin Card */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-right opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80')`,
            }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/95 via-slate-900/85 to-slate-950/75 pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Mission Control</h2>
                  <p className="text-xs text-slate-300">For Desk Dispatchers & Safety Officers</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-400/30 shadow-sm">
                Score: {score.toFixed(1)} / 100
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Full autonomous decision pipeline. Oversee the deterministic 4-stage safety filter, 14-unit tool expenditure, warehouse verification, and immutable cryptographical audit ledger.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Tool Spend</span>
                <span className="text-base font-bold text-white">{runData?.spent ?? 0} / 14</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Integrity</span>
                <span className="text-base font-bold text-emerald-400">15.0 pts</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Efficiency</span>
                <span className="text-base font-bold text-purple-400">5.0 pts</span>
              </div>
            </div>

            {/* Assigned Role Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Admin Command Center
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => onNavigateTab('workbench')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-blue-400 font-semibold text-[11px]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Workbench</span>
                  </div>
                  <p className="text-[9px] text-slate-400">4-Stage Safety Gate</p>
                </button>

                <button
                  onClick={() => onNavigateTab('charts')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-purple-400 font-semibold text-[11px]">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analytics</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Pies & Burn-down</p>
                </button>

                <button
                  onClick={() => onNavigateTab('database')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-teal-400 font-semibold text-[11px]">
                    <Database className="w-3.5 h-3.5" />
                    <span>Database Intel</span>
                  </div>
                  <p className="text-[9px] text-slate-400">54 Worlds & Specs</p>
                </button>

                <button
                  onClick={() => onNavigateTab('matrix')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-[11px]">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>6×12 Matrix</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Pairwise Checks</p>
                </button>

                <button
                  onClick={() => onNavigateTab('player')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-[11px]">
                    <Play className="w-3.5 h-3.5" />
                    <span>Player</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Step Scrubber</p>
                </button>

                <button
                  onClick={() => onNavigateTab('overview')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Policy & Rubric</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Component Scoring</p>
                </button>

                <button
                  onClick={() => onNavigateTab('audit')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-left transition space-y-1 shadow-sm"
                >
                  <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Audit Trail</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Immutable Ledger</p>
                </button>
              </div>
            </div>
          </div>

          {/* Launch Admin View Button */}
          <button
            onClick={() => onNavigateTab('workbench')}
            className="relative z-10 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 group cursor-pointer mt-4"
          >
            <span>Open Admin Mission Control</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
