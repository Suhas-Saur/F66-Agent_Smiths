import {
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { CaseRunData } from '../types';

interface OverviewViewProps {
  runData: CaseRunData | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ runData }) => {
  const grade = runData?.grade;
  const outcomeEarned = grade?.components.outcome.earned ?? 0;
  const integrityEarned = grade?.components.integrity.earned ?? 0;
  const efficiencyEarned = grade?.components.efficiency.earned ?? 0;

  return (
    <div className="space-y-6">
      {/* 1. OFFICIAL SCORING CARD */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Official Scoring Component Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated against competition rubric: Outcome (80) + Integrity (15) + Efficiency (5)
            </p>
          </div>

          <div className="flex items-baseline space-x-1.5 font-mono">
            <span className="text-2xl font-extrabold text-white">
              {grade?.score.toFixed(1) ?? '---'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">/ 100.0 pts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Outcome Credit */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">1. Outcome Credit</span>
              <span className="font-mono font-bold text-blue-400">
                {outcomeEarned.toFixed(1)} / 80.0 pts
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(outcomeEarned / 80) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Awards 1.0 per compatible available dispatch, plus 1.0 credit for safe human escalations when no compatible part exists.
            </p>
          </div>

          {/* Integrity Credit */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">2. Integrity Credit</span>
              <span className="font-mono font-bold text-emerald-400">
                {integrityEarned.toFixed(1)} / 15.0 pts
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(integrityEarned / 15) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              15.0 × (decided tickets / 6). Guaranteed 15.0 pts when all 6 natural-language requests receive an irreversible terminal decision.
            </p>
          </div>

          {/* Tool Efficiency Credit */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">3. Tool Efficiency Credit</span>
              <span className="font-mono font-bold text-purple-400">
                {efficiencyEarned.toFixed(1)} / 5.0 pts
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(efficiencyEarned / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Awards full 5.0 pts when total tool expenditure is ≤ 13 units. PartSure AI deliberately targets 10–13 units!
            </p>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL BATCH CONTEXT & POLICY */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Active Batch Policy & Workshop Contract</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Case ID: {runData?.case_id}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-mono">
          <span className="text-blue-400 font-bold">Policy Directive: </span>
          {runData?.policy}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-semibold block mb-1">
              Zero Incompatible Dispatches
            </span>
            <p className="text-slate-300 text-[11px]">
              Any single incompatible dispatch drops the entire batch score to 0. A strict deterministic 4-stage filter ensures 100% technical compatibility.
            </p>
          </div>

          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
            <span className="text-blue-400 font-semibold block mb-1">
              Safe 20W Rating Policy
            </span>
            <p className="text-slate-300 text-[11px]">
              A 20W component safely satisfies either a 10W or 20W requirement. If a customer's label is unreadable, assigning a 20W part avoids wasting clarification units!
            </p>
          </div>

          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
            <span className="text-purple-400 font-semibold block mb-1">
              Warehouse Verification Strategy
            </span>
            <p className="text-slate-300 text-[11px]">
              Recent desk snapshots are reliable. For aged parts (which hold 2 warehouse discrepancies), the agent verifies authoritative warehouse truth before dispatching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
