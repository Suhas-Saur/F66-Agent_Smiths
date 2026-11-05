import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
  Terminal,
} from 'lucide-react';
import { CaseRunData, StepLog } from '../types';

interface SimulationPlayerProps {
  runData: CaseRunData | null;
}

export const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ runData }) => {
  const steps = runData?.steps || [];
  const totalSteps = steps.length;

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(totalSteps > 0 ? totalSteps - 1 : 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 0.5, 1, 2

  const activeStep: StepLog | undefined = steps[currentStepIdx];
  const activeBudgetRemaining = activeStep ? activeStep.budget_remaining : (runData?.budget_remaining ?? 14);
  const activeSpent = 14 - activeBudgetRemaining;

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      const intervalMs = Math.round(1000 / speed);
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, totalSteps, speed]);

  const handlePlayPause = () => {
    if (currentStepIdx >= totalSteps - 1) {
      setCurrentStepIdx(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setCurrentStepIdx(totalSteps - 1);
  };

  if (totalSteps === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        No simulation steps recorded. Please run a case.
      </div>
    );
  }

  const getOpBadgeClass = (op: string) => {
    switch (op) {
      case 'dispatch':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'escalate':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'inspect':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'verify':
        return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
      case 'clarify':
        return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
      case 'llm':
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PLAYBACK CONTROLLER CONSOLE */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Simulation Timeline Player</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Step {currentStepIdx + 1} of {totalSteps}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect agent thinking, tool expenditure, and decisions step-by-step
              </p>
            </div>
          </div>

          {/* Speed Controls & End Jump */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Speed:</span>
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                  speed === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Scrubber Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIdx}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStepIdx(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>Start (Step 1)</span>
            <span>Current: Step {currentStepIdx + 1}</span>
            <span>Completion (Step {totalSteps})</span>
          </div>
        </div>

        {/* Transport Controls Bar */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              title="Reset to Step 1"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleStepBack}
              disabled={currentStepIdx === 0}
              title="Step Backward"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-30 transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayPause}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20 active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{currentStepIdx >= totalSteps - 1 ? 'Replay' : 'Play'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleStepForward}
              disabled={currentStepIdx === totalSteps - 1}
              title="Step Forward"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-30 transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToEnd}
              title="Jump to Final Step"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-medium transition"
            >
              Final
            </button>
          </div>

          {/* Live Budget Gauge at this Step */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Tool Units Spent
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {activeSpent} <span className="text-slate-500 text-xs">/ 14 units</span>
              </span>
            </div>
            <div className="w-24 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  activeSpent <= 13 ? 'bg-purple-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (activeSpent / 14) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE STEP SPOTLIGHT & LIVE TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Step Details (7 Cols) */}
        {activeStep && (
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  Step #{activeStep.step + 1}
                </span>
                <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold uppercase ${getOpBadgeClass(activeStep.action.op)}`}>
                  {activeStep.action.op}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Budget Remaining: <strong className="text-emerald-400">{activeStep.budget_remaining}</strong> / 14
              </span>
            </div>

            {/* Description & Entity */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                Operation Target & Description
              </span>
              <p className="text-sm font-semibold text-white">
                {activeStep.action.op === 'inspect' && `Inspect desk snapshot for part: ${activeStep.action.part_id}`}
                {activeStep.action.op === 'verify' && `Verify authoritative warehouse stock for part: ${activeStep.action.part_id}`}
                {activeStep.action.op === 'clarify' && `Send customer clarification query for ticket: ${activeStep.action.ticket_id}`}
                {activeStep.action.op === 'dispatch' && `Dispatch part ${activeStep.action.part_id} for ticket ${activeStep.action.ticket_id}`}
                {activeStep.action.op === 'escalate' && `Escalate ticket ${activeStep.action.ticket_id} to human desk`}
                {activeStep.action.op === 'llm' && 'Initial LLM analysis & schema extraction'}
              </p>
              {activeStep.action.part_id && (
                <div className="text-xs font-mono text-blue-400">
                  Entity: <span className="underline">{activeStep.action.part_id}</span>
                </div>
              )}
              {activeStep.action.ticket_id && (
                <div className="text-xs font-mono text-purple-400">
                  Ticket: <span className="underline">{activeStep.action.ticket_id}</span>
                </div>
              )}
            </div>

            {/* Step Result Payload */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                Result Received from Environment
              </span>
              {activeStep.result ? (
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  {JSON.stringify(activeStep.result, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Action acknowledged and committed irreversibly.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step History Log up to current step (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>Step Execution Sequence</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {currentStepIdx + 1} / {totalSteps}
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {steps.map((st, idx) => {
              const isCurrent = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(idx);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isCurrent
                      ? 'bg-blue-600/15 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                      : isPast
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950 border-slate-800/40 opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${getOpBadgeClass(st.action.op)}`}>
                      {st.action.op}
                    </span>
                    <span className="text-slate-300 font-sans truncate max-w-[140px]">
                      {st.action.part_id || st.action.ticket_id || 'batch'}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400">
                    rem: {st.budget_remaining}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
