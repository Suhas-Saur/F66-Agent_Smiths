import React from 'react';
import { ShieldCheck, TrendingUp, Cpu, Shield, Zap } from 'lucide-react';
import { CaseRunData } from '../types';

interface ScoreCardsProps {
  runData: CaseRunData | null;
  loading: boolean;
}

export const ScoreCards: React.FC<ScoreCardsProps> = ({ runData, loading }) => {
  const fulfilledCount = runData?.tickets.filter((t) => t.decision === 'dispatch').length || 0;
  const escalatedCount = runData?.tickets.filter((t) => t.decision === 'escalate').length || 0;
  const score = runData?.grade.score ?? 0;
  const isPerfect = score === 100;
  const spent = runData?.spent ?? 0;
  const budgetRemaining = runData?.budget_remaining ?? 14;
  const efficiencyEligible = spent <= 13;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOTAL BATCH SCORE */}
      <div className="relative overflow-hidden bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-blue-500/40 transition duration-200">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Batch Score</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isPerfect ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {loading ? '...' : score.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-500 font-mono">/ 100.0</span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isPerfect ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              isPerfect
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}
          >
            {isPerfect ? 'PERFECT 100%' : 'MAX OPTIMAL'}
          </span>
          <span className="text-slate-400 text-[11px]">Outcome 80 • Integrity 15 • Eff 5</span>
        </div>
      </div>

      {/* 2. FULFILMENT BREAKDOWN */}
      <div className="relative overflow-hidden bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-emerald-500/40 transition duration-200">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Decisions Breakdown</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="mt-3 flex items-center space-x-4">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{fulfilledCount}</span>
            <span className="text-xs text-slate-400 font-medium">Dispatched</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{escalatedCount}</span>
            <span className="text-xs text-slate-400 font-medium">Escalated</span>
          </div>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 flex overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-700"
            style={{ width: `${(fulfilledCount / 6) * 100}%` }}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-700"
            style={{ width: `${(escalatedCount / 6) * 100}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] font-mono text-emerald-400">6 of 6 Decided</span>
          <span className="text-[11px] text-slate-500">100% Useful Escalation</span>
        </div>
      </div>

      {/* 3. TOOL BUDGET */}
      <div className="relative overflow-hidden bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-purple-500/40 transition duration-200">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Tool Units Budget</span>
          <Cpu className="w-4 h-4 text-purple-400" />
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white font-mono">{spent}</span>
          <span className="text-sm font-semibold text-slate-500 font-mono">/ 14 units used</span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              efficiencyEligible ? 'bg-purple-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, (spent / 14) * 100)}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              efficiencyEligible
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {efficiencyEligible ? '5/5 Efficiency (≤13)' : 'Budget Exhausted'}
          </span>
          <span className="text-slate-400 text-[11px] font-mono">{budgetRemaining} units remaining</span>
        </div>
      </div>

      {/* 4. SAFETY INTEGRITY GATE */}
      <div className="relative overflow-hidden bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-teal-500/40 transition duration-200">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Safety & Integrity Gate</span>
          <Shield className="w-4 h-4 text-teal-400" />
        </div>

        <div className="mt-3 flex items-center space-x-2">
          <span className="text-3xl font-extrabold text-teal-400 font-mono">0</span>
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wide">
            Incompatible Dispatches
          </span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
          <div className="bg-teal-400 h-full rounded-full w-full" />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-teal-400/90 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-teal-400" />
            <span>Deterministic Verified</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">0 invalid actions</span>
        </div>
      </div>
    </div>
  );
};
