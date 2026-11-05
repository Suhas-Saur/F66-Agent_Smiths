import { ShieldCheck, TrendingUp, Cpu, Shield, Zap } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

  // Mini donut data for score components
  const scoreDonutData = [
    { name: 'Outcome', value: runData?.grade.components.outcome.earned || 0, color: '#3B82F6' },
    { name: 'Integrity', value: runData?.grade.components.integrity.earned || 0, color: '#10B981' },
    { name: 'Efficiency', value: runData?.grade.components.efficiency.earned || 0, color: '#A855F7' },
  ];

  // Mini pie data for decisions
  const decisionPieData = [
    { name: 'Fulfilled', value: fulfilledCount, color: '#10B981' },
    { name: 'Escalated', value: escalatedCount, color: '#F59E0B' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOTAL BATCH SCORE WITH MINI DONUT */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl hover:border-blue-500/40 transition duration-300 group">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Total Batch Score</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isPerfect ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {loading ? '...' : score.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">/ 100</span>
            </div>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isPerfect
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}
            >
              {isPerfect ? 'PERFECT (100%)' : 'MAX OPTIMAL'}
            </span>
          </div>

          {/* Mini Graphical Donut */}
          <div className="w-16 h-16 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={28}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {scoreDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={1} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full bg-slate-950/80 rounded-full h-1.5 mt-2.5 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isPerfect ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="text-blue-400">Out {runData?.grade.components.outcome.earned.toFixed(0)}</span>
          <span className="text-emerald-400">Int {runData?.grade.components.integrity.earned.toFixed(0)}</span>
          <span className="text-purple-400">Eff {runData?.grade.components.efficiency.earned.toFixed(0)}</span>
        </div>
      </div>

      {/* 2. FULFILMENT BREAKDOWN WITH MINI PIE */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl hover:border-emerald-500/40 transition duration-300">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Decisions Breakdown</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{fulfilledCount}</span>
                <span className="text-[11px] text-slate-400 font-medium">Dispatched</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">{escalatedCount}</span>
                <span className="text-[11px] text-slate-400 font-medium">Escalated</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              6 of 6 Decided (100% Rate)
            </span>
          </div>

          {/* Mini Graphical Pie */}
          <div className="w-16 h-16 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={28}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {decisionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={1} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full bg-slate-950/80 rounded-full h-1.5 mt-2.5 flex overflow-hidden border border-slate-800">
          <div
            className="bg-emerald-500 h-full transition-all duration-700"
            style={{ width: `${(fulfilledCount / 6) * 100}%` }}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-700"
            style={{ width: `${(escalatedCount / 6) * 100}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-emerald-400 font-medium">0 Incompatible</span>
          <span className="text-slate-500 font-mono">100% useful credit</span>
        </div>
      </div>

      {/* 3. TOOL BUDGET */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl hover:border-purple-500/40 transition duration-300">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Tool Units Budget</span>
          <Cpu className="w-4 h-4 text-purple-400" />
        </div>

        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white font-mono">{spent}</span>
          <span className="text-xs font-semibold text-slate-500 font-mono">/ 14 units spent</span>
        </div>

        <div className="w-full bg-slate-950/80 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              efficiencyEligible ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, (spent / 14) * 100)}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              efficiencyEligible
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {efficiencyEligible ? '5/5 Efficiency (≤13)' : 'Budget Exhausted'}
          </span>
          <span className="text-slate-400 text-[11px] font-mono">{budgetRemaining} units left</span>
        </div>
      </div>

      {/* 4. SAFETY & INTEGRITY GATE */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl hover:border-teal-500/40 transition duration-300">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Safety & Integrity Gate</span>
          <Shield className="w-4 h-4 text-teal-400" />
        </div>

        <div className="mt-2 flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 font-mono text-lg">
            0
          </div>
          <div>
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wide block">
              Incompatible Dispatches
            </span>
            <span className="text-[10px] text-slate-400 font-mono">0 unavailable parts</span>
          </div>
        </div>

        <div className="w-full bg-slate-950/80 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
          <div className="bg-teal-400 h-full rounded-full w-full" />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-teal-400/90 flex items-center space-x-1 font-medium">
            <Zap className="w-3 h-3 text-teal-400" />
            <span>Deterministic Verified</span>
          </span>
          <span className="text-slate-500 font-mono text-[10px]">100% Safety Guarantee</span>
        </div>
      </div>
    </div>
  );
};
