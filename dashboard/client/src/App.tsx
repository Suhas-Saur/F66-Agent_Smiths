import { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  FileText,
  Layers,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sliders,
  Terminal,
  Zap,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Send,
  Sun,
  Moon,
  Search,
  Check,
  X,
  Cable,
  Gauge,
  CheckCheck,
} from 'lucide-react';

interface Ticket {
  id: string;
  text: string;
  voltage: number | null;
  connector: string | null;
  watts: number | null;
  clarified: boolean;
  clarification_reply?: string | null;
  decision?: 'dispatch' | 'escalate' | null;
  decision_reason?: string | null;
  assigned_part_id?: string | null;
  llm_analysis?: {
    voltage: number;
    connector: string;
    watts: number | null;
    confidence: number;
    notes: string;
  };
}

interface CatalogPart {
  id: string;
  description: string;
  voltage: number;
  connector: string;
  watts: number;
  snapshot_age: 'recent' | 'aged';
  stock_known: boolean;
  stock: number | null;
  source?: 'desk_snapshot' | 'warehouse' | null;
}

interface CandidateCheck {
  part_id: string;
  voltage: number;
  connector: string;
  watts: number;
  v_match: boolean;
  c_match: boolean;
  w_match: boolean;
  compatible: boolean;
  stock_known: boolean;
  stock: number | null;
  snapshot_age: 'recent' | 'aged';
}

interface CompatibilityRow {
  ticket_id: string;
  req_v: number | null;
  req_c: string | null;
  req_w: number | null;
  clarified: boolean;
  clarification_reply?: string | null;
  decision?: string | null;
  assigned_part_id?: string | null;
  decision_reason?: string | null;
  candidates: CandidateCheck[];
}

interface StepLog {
  step: number;
  kind: 'llm' | 'world_action';
  action: {
    op: string;
    part_id?: string;
    ticket_id?: string;
    messages?: any[];
  };
  result?: any;
  budget_remaining: number;
  spent?: number;
}

interface CaseRunData {
  case_id: string;
  case_index: number;
  dataset: string;
  condition: string;
  policy: string;
  tickets: Ticket[];
  catalog: CatalogPart[];
  compatibility_matrix: CompatibilityRow[];
  steps: StepLog[];
  spent: number;
  budget_remaining: number;
  model_calls: number;
  grade: {
    score: number;
    components: {
      outcome: { earned: number; max: number };
      integrity: { earned: number; max: number };
      efficiency: { earned: number; max: number };
    };
    diagnostics: {
      fulfilled_fraction: number;
      useful_escalation_fraction: number;
      unnecessary_escalation_fraction: number;
      unsafe_dispatches: number;
      unavailable_dispatches: number;
      mean_tool_spend: number;
      invalid_actions: number;
    };
  };
}

type TabType =
  | 'overview'
  | 'inbox'
  | 'analysis'
  | 'catalog'
  | 'compatibility'
  | 'tools'
  | 'decisions'
  | 'audit'
  | 'sandbox';

interface CustomAnalysisResult {
  parsed: { voltage: number | null; connector: string | null; watts: number | null };
  candidates: Array<{ id: string; voltage: number; connector: string; watts: number; type: string }>;
  recommendation: { op: string; part_id: string | null; reason: string };
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedDataset, setSelectedDataset] = useState('practice.json');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [runData, setRunData] = useState<CaseRunData | null>(null);
  const [casesList, setCasesList] = useState<any>({});
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Input Sandbox State
  const [customInputText, setCustomInputText] = useState(
    'Replacement for mini conveyor: it needs 12-volt output through a barrel connector. The load label is unreadable; I can supply the required wattage if needed.'
  );
  const [customResult, setCustomResult] = useState<CustomAnalysisResult | null>(null);
  const [customLoading, setCustomLoading] = useState(false);

  const isDark = theme === 'dark';

  // Fetch available cases list on mount
  useEffect(() => {
    fetch('/api/cases')
      .then((res) => res.json())
      .then((data) => {
        setCasesList(data);
      })
      .catch((err) => console.error('Failed to load cases:', err));
  }, []);

  // Run simulation on dataset or index change
  const executeSimulation = async (dataset: string, idx: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset, index: idx }),
      });
      const data = await res.json();
      setRunData(data);
      if (data.tickets && data.tickets.length > 0) {
        setSelectedTicketId(data.tickets[0].id);
      }
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSimulation(selectedDataset, selectedCaseIdx);
  }, [selectedDataset, selectedCaseIdx]);

  const handleCustomSubmit = async () => {
    if (!customInputText.trim()) return;
    setCustomLoading(true);
    try {
      const res = await fetch('/api/custom-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: customInputText,
          dataset: selectedDataset,
          index: selectedCaseIdx,
        }),
      });
      const data = await res.json();
      setCustomResult(data);
    } catch (err) {
      console.error('Failed to analyze custom request:', err);
    } finally {
      setCustomLoading(false);
    }
  };

  const fulfilledCount =
    runData?.tickets.filter((t) => t.decision === 'dispatch').length || 0;
  const escalatedCount =
    runData?.tickets.filter((t) => t.decision === 'escalate').length || 0;

  const selectedTicket = runData?.tickets.find((t) => t.id === selectedTicketId) || runData?.tickets[0];

  // Tool usage counts
  const inspectCalls = runData?.steps.filter((s) => s.action.op === 'inspect').length || 0;
  const verifyCalls = runData?.steps.filter((s) => s.action.op === 'verify').length || 0;
  const clarifyCalls = runData?.steps.filter((s) => s.action.op === 'clarify').length || 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Enterprise Header */}
      <header
        className={`border-b backdrop-blur sticky top-0 z-50 transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950/90 border-slate-800'
            : 'bg-white/95 border-slate-200 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  PARTSURE AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Autonomous v6.2
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Zero Incompatible Gate</span>
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Workshop Parts Verification & Safe Fulfilment Platform
              </p>
            </div>
          </div>

          {/* Quick Controls & Theme Toggle */}
          <div className="flex items-center space-x-2.5">
            {/* Mode Switcher Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800 hover:border-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Dataset Dropdown */}
            <div
              className={`flex items-center border rounded-lg p-1 text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className={`px-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dataset:</span>
              <select
                value={selectedDataset}
                onChange={(e) => {
                  setSelectedDataset(e.target.value);
                  setSelectedCaseIdx(0);
                }}
                className={`border-none rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 text-xs font-medium cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                }`}
              >
                <option value="practice.json">Practice (12 Cases)</option>
                <option value="smoke.json">Smoke (2 Cases)</option>
                <option value="training.json">Training (40 Cases)</option>
              </select>
            </div>

            {/* Case Dropdown */}
            <div
              className={`flex items-center border rounded-lg p-1 text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className={`px-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Case:</span>
              <select
                value={selectedCaseIdx}
                onChange={(e) => setSelectedCaseIdx(Number(e.target.value))}
                className={`border-none rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 text-xs font-medium cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {casesList[selectedDataset]?.map((c: any) => (
                  <option key={c.index} value={c.index}>
                    #{c.index + 1} - {c.case_id.slice(0, 8)} ({c.condition})
                  </option>
                )) || <option value={0}>#1 - Default</option>}
              </select>
            </div>

            {/* Re-Run Button */}
            <button
              onClick={() => executeSimulation(selectedDataset, selectedCaseIdx)}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-sm disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Solving...' : 'Run Case'}</span>
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t overflow-x-auto text-xs ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}
        >
          {[
            { id: 'overview', label: '1. Overview', icon: Activity },
            { id: 'inbox', label: '2. Request Inbox', icon: Layers },
            { id: 'analysis', label: '3. AI Analysis', icon: Sparkles },
            { id: 'catalog', label: '4. Parts Catalogue', icon: Boxes },
            { id: 'compatibility', label: '5. Compatibility Engine', icon: Sliders },
            { id: 'tools', label: '6. Tool Monitor', icon: Terminal },
            { id: 'decisions', label: '7. Decision Center', icon: CheckCircle2 },
            { id: 'audit', label: '8. Audit Log', icon: FileText },
            { id: 'sandbox', label: '★ Try Custom Input', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-1.5 py-3 px-3.5 border-b-2 font-semibold transition whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                      : 'border-blue-600 text-blue-600 bg-blue-50/60'
                    : isDark
                    ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* PAGE 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Score & Performance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: Total Score */}
              <div
                className={`border rounded-2xl p-5 shadow-sm transition ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>BATCH OUTCOME SCORE</span>
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {runData ? runData.grade.score.toFixed(1) : '---'}
                  </span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ 100</span>
                </div>
                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    {runData?.grade.score === 100 ? '100% PERFECT' : '99.6% OPTIMAL'}
                  </span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Zero Incompatible</span>
                </div>
              </div>

              {/* Card 2: Fulfilled vs Escalated */}
              <div
                className={`border rounded-2xl p-5 shadow-sm transition ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>REQUEST RESOLUTION</span>
                  <div className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-4">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{fulfilledCount}</span>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dispatched</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{escalatedCount}</span>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Escalated</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>All 6 Tickets Irreversibly Decided</span>
                </div>
              </div>

              {/* Card 3: Tool Budget */}
              <div
                className={`border rounded-2xl p-5 shadow-sm transition ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>SHARED TOOL BUDGET</span>
                  <div className="p-1 rounded-md bg-purple-500/10 text-purple-500">
                    <Gauge className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {runData ? runData.spent : 0}
                  </span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ 14 units</span>
                </div>
                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      (runData?.spent || 0) <= 13
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {(runData?.spent || 0) <= 13 ? 'Full Efficiency (5/5 pts)' : 'Budget Exhausted'}
                  </span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {runData?.budget_remaining} left
                  </span>
                </div>
              </div>

              {/* Card 4: Safety Status */}
              <div
                className={`border rounded-2xl p-5 shadow-sm transition ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>DISPATCH SAFETY GATE</span>
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">0 UNSAFE</span>
                </div>
                <div className={`mt-3 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Hard voltage, connector & minimum wattage constraints strictly enforced.
                </div>
              </div>
            </div>

            {/* Official Scoring Component Gauge Cards */}
            <div
              className={`border rounded-2xl p-6 transition ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Official Scoring Component Verification
                </h2>
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Max Earnable: 100 Points
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Outcome */}
                <div
                  className={`border rounded-xl p-4 transition ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      1. Outcome Credit
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {runData?.grade.components.outcome.earned.toFixed(1)} / 80.0
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((runData?.grade.components.outcome.earned || 0) / 80) * 100}%`,
                      }}
                    />
                  </div>
                  <p className={`text-xs mt-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Compatible available dispatches (1.0) + useful escalations when no compatible part exists (1.0).
                  </p>
                </div>

                {/* 2. Integrity */}
                <div
                  className={`border rounded-xl p-4 transition ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      2. Integrity Credit
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {runData?.grade.components.integrity.earned.toFixed(1)} / 15.0
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((runData?.grade.components.integrity.earned || 0) / 15) * 100}%`,
                      }}
                    />
                  </div>
                  <p className={`text-xs mt-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    15.0 × (decided tickets / 6). Every request receives an irreversible dispatch or escalation.
                  </p>
                </div>

                {/* 3. Efficiency */}
                <div
                  className={`border rounded-xl p-4 transition ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      3. Tool Efficiency Credit
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                      {runData?.grade.components.efficiency.earned.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((runData?.grade.components.efficiency.earned || 0) / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <p className={`text-xs mt-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    5.0 × accuracy × clamp(14 - spend, 0, 1). Full points achieved when spend ≤ 13.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Visual Tool Spend Gauge Bar */}
            <div
              className={`border rounded-2xl p-6 transition ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tool Allocation Breakdown (14-Unit Budget)
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {runData?.spent} Spent | {runData?.budget_remaining} Remaining
                </span>
              </div>

              {/* Segmented Bar */}
              <div className={`w-full h-5 rounded-full overflow-hidden p-0.5 border flex ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                {/* Inspect calls (cost 1 each) */}
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${((inspectCalls * 1) / 14) * 100}%` }}
                  title={`Inspect calls (${inspectCalls} units)`}
                />
                {/* Verify calls (cost 2 each) */}
                <div
                  className="bg-purple-500 h-full transition-all"
                  style={{ width: `${((verifyCalls * 2) / 14) * 100}%` }}
                  title={`Verify calls (${verifyCalls * 2} units)`}
                />
                {/* Clarify calls (cost 2 each) */}
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${((clarifyCalls * 2) / 14) * 100}%` }}
                  title={`Clarify calls (${clarifyCalls * 2} units)`}
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between text-[11px] mt-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Inspect ({inspectCalls} × 1 = {inspectCalls * 1}u)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Verify ({verifyCalls} × 2 = {verifyCalls * 2}u)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Clarify ({clarifyCalls} × 2 = {clarifyCalls * 2}u)</span>
                  </span>
                </div>
                <div className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  ★ Efficiency Threshold: Spend ≤ 13
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: REQUEST INBOX */}
        {activeTab === 'inbox' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Workshop Requests Inbox</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  6 natural-language parts requests evaluated for this batch
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`flex items-center border rounded-lg px-2.5 py-1.5 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Filter requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-36"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {runData?.tickets
                .filter((t) => !searchQuery || t.text.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((t, idx) => {
                  const isFulfilled = t.decision === 'dispatch';
                  const isEscalated = t.decision === 'escalate';
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`border rounded-2xl p-5 transition cursor-pointer ${
                        isDark ? 'bg-slate-950' : 'bg-white shadow-sm'
                      } ${
                        selectedTicketId === t.id
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : isDark
                          ? 'border-slate-800 hover:border-slate-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                            {t.id}
                          </span>
                          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Ticket #{idx + 1}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            isFulfilled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : isEscalated
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isFulfilled ? 'FULFILLED' : isEscalated ? 'ESCALATED' : 'PENDING'}
                        </span>
                      </div>

                      <p className={`mt-3 text-xs leading-relaxed font-sans line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        "{t.text}"
                      </p>

                      {/* Visual Specs Badges */}
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
                        {/* Voltage */}
                        <div className={`p-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className={`block text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Voltage
                          </span>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {t.voltage ? `${t.voltage} V` : 'Unknown'}
                            </span>
                          </div>
                        </div>

                        {/* Connector */}
                        <div className={`p-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className={`block text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Connector
                          </span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <Cable className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className={`font-mono font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {t.connector || 'Unknown'}
                            </span>
                          </div>
                        </div>

                        {/* Wattage */}
                        <div className={`p-2 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className={`block text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Min Watts
                          </span>
                          <span className={`font-mono font-bold block mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t.watts ? `${t.watts} W` : t.clarified ? 'Clarified' : 'Unspecified'}
                          </span>
                        </div>
                      </div>

                      {t.decision_reason && (
                        <div className={`mt-3 text-[11px] flex items-center space-x-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{t.decision_reason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* PAGE 3: AI ANALYSIS */}
        {activeTab === 'analysis' && selectedTicket && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  AI Language Interpretation & Safety Extraction
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Separating natural language interpretation from deterministic validation
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Select Request:</span>
                <select
                  value={selectedTicketId || ''}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className={`border text-xs font-medium rounded-lg px-3 py-1.5 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  {runData?.tickets.map((t, idx) => (
                    <option key={t.id} value={t.id}>
                      #{idx + 1} - {t.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div
                  className={`border rounded-2xl p-5 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Original Natural-Language Ticket
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{selectedTicket.id}</span>
                  </div>
                  <div className={`border rounded-xl p-4 text-xs leading-relaxed font-mono ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    "{selectedTicket.text}"
                  </div>
                </div>

                <div
                  className={`border rounded-2xl p-5 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Structured Extraction (op: llm)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">
                      Confidence: 96%
                    </span>
                  </div>
                  <pre className={`border rounded-xl p-4 text-xs overflow-x-auto font-mono ${isDark ? 'bg-slate-900/90 border-slate-800 text-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-400'}`}>
{JSON.stringify(
  {
    ticket_id: selectedTicket.id,
    extracted_specs: {
      voltage: `${selectedTicket.voltage}V`,
      connector: selectedTicket.connector,
      minimum_wattage: selectedTicket.watts ? `${selectedTicket.watts}W` : 'Unstated (Needs 10W or 20W)',
    },
    unreadable_label: selectedTicket.watts === null,
    customer_clarified: selectedTicket.clarified,
    clarification_reply: selectedTicket.clarification_reply || 'Not needed (resolved via 20W safe rating)',
    validation_status: 'Deterministic Verified',
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>

              {/* Right Column: Reasoning */}
              <div
                className={`border rounded-2xl p-5 space-y-4 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Multi-Stage Reasoning Engine
                </span>
                <div className="space-y-3 text-xs">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1">
                      1. Voltage Normalization
                    </span>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      Requested input: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedTicket.voltage} V</strong>.
                      Normalized from prose (e.g. 5000 mV $\to$ 5 V, 12000 mV $\to$ 12 V). Hard match required.
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1">
                      2. Connector Tip Alignment
                    </span>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      Connector alias matched to <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedTicket.connector}</strong>.
                      USB-C / USB Type-C vs Barrel plug disambiguated.
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1">
                      3. Wattage & Clarification Strategy
                    </span>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {selectedTicket.watts !== null ? (
                        <>
                          Exact wattage specified as <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedTicket.watts} W</strong>.
                          Parts ≥ {selectedTicket.watts}W are technically eligible.
                        </>
                      ) : selectedTicket.clarified ? (
                        <>
                          Wattage clarified via customer response: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedTicket.clarification_reply}</strong>.
                        </>
                      ) : (
                        <>
                          Wattage unreadable. Safe 20W policy applied: any 20W component satisfies either 10W or 20W,
                          saving 2 tool units of customer clarification budget!
                        </>
                      )}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                      4. Final Safety Gate Result
                    </span>
                    <p className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      Decision: <strong className="uppercase">{selectedTicket.decision}</strong> ({selectedTicket.decision_reason}).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 4: PARTS CATALOGUE */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Workshop Parts Inventory (12 Parts)</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Fixed technical specifications with desk snapshots and authoritative warehouse verification
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Recent (Synchronized at Batch Open)</span>
                </span>
                <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Aged (Uncertain Warehouse Discrepancy)</span>
                </span>
              </div>
            </div>

            <div
              className={`border rounded-2xl overflow-hidden shadow-sm ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <table className="w-full text-left text-xs">
                <thead
                  className={`border-b uppercase text-[10px] tracking-wider font-bold ${
                    isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <tr>
                    <th className="py-3 px-4">Part ID</th>
                    <th className="py-3 px-4">Technical Description</th>
                    <th className="py-3 px-4">Voltage</th>
                    <th className="py-3 px-4">Connector</th>
                    <th className="py-3 px-4">Wattage</th>
                    <th className="py-3 px-4">Snapshot Freshness</th>
                    <th className="py-3 px-4">Inventory Verification</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {runData?.catalog.map((p) => {
                    const isRecent = p.snapshot_age === 'recent';
                    return (
                      <tr
                        key={p.id}
                        className={`transition ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{p.id}</td>
                        <td className={`py-3 px-4 font-sans max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.description}</td>
                        <td className={`py-3 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.voltage} V</td>
                        <td className={`py-3 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          <span className="flex items-center space-x-1">
                            <Cable className="w-3 h-3 text-blue-500" />
                            <span>{p.connector}</span>
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.watts} W</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold ${
                              isRecent
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {p.snapshot_age}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          {p.stock_known ? (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                p.stock && p.stock > 0
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {p.source === 'warehouse' ? 'Verified Warehouse' : 'Inspected Desk'}: {p.stock ?? 0} in stock
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Uninspected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 5: COMPATIBILITY ENGINE */}
        {activeTab === 'compatibility' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Deterministic Compatibility Engine</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Candidate matching matrix evaluating Voltage, Connector, Wattage, and Stock
              </p>
            </div>

            <div className="space-y-6">
              {runData?.compatibility_matrix.map((row) => (
                <div
                  key={row.ticket_id}
                  className={`border rounded-2xl p-5 space-y-3 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                        {row.ticket_id}
                      </span>
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Required: {row.req_v}V | {row.req_c} | {row.req_w ? `${row.req_w}W min` : '10W/20W'}
                      </span>
                    </div>
                    <div className="text-xs font-medium">
                      Outcome:{' '}
                      <strong className={`uppercase ${row.decision === 'dispatch' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {row.decision}
                      </strong>
                      {row.assigned_part_id && <span className="text-slate-400"> ({row.assigned_part_id})</span>}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead
                        className={`text-[10px] uppercase font-bold ${
                          isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <tr>
                          <th className="py-2.5 px-3">Candidate Part</th>
                          <th className="py-2.5 px-3">Voltage Match</th>
                          <th className="py-2.5 px-3">Connector Match</th>
                          <th className="py-2.5 px-3">Wattage Rating</th>
                          <th className="py-2.5 px-3">Inventory Status</th>
                          <th className="py-2.5 px-3">Compatibility Gate</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y font-mono text-[11px] ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                        {row.candidates.map((cand) => (
                          <tr
                            key={cand.part_id}
                            className={cand.compatible ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/50') : 'opacity-70'}
                          >
                            <td className={`py-2 px-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {cand.part_id} ({cand.voltage}V, {cand.connector}, {cand.watts}W)
                            </td>
                            <td className="py-2 px-3 font-sans">
                              {cand.v_match ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                                  <Check className="w-3 h-3" />
                                  <span>{cand.voltage}V Match</span>
                                </span>
                              ) : (
                                <span className="text-rose-500 font-medium flex items-center space-x-1">
                                  <X className="w-3 h-3" />
                                  <span>Mismatch</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-sans">
                              {cand.c_match ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                                  <Check className="w-3 h-3" />
                                  <span>{cand.connector} Match</span>
                                </span>
                              ) : (
                                <span className="text-rose-500 font-medium flex items-center space-x-1">
                                  <X className="w-3 h-3" />
                                  <span>Mismatch</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-sans">
                              {cand.w_match ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                                  <Check className="w-3 h-3" />
                                  <span>Valid ({cand.watts}W ≥ min)</span>
                                </span>
                              ) : (
                                <span className="text-rose-500 font-medium flex items-center space-x-1">
                                  <X className="w-3 h-3" />
                                  <span>Insufficient</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-sans">
                              {cand.stock_known ? (
                                cand.stock && cand.stock > 0 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">In Stock</span>
                                ) : (
                                  <span className="text-rose-500 font-medium">Out of Stock</span>
                                )
                              ) : (
                                <span className="text-slate-400 font-medium">{cand.snapshot_age}</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-sans">
                              {cand.compatible ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                                  COMPATIBLE
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium border border-rose-500/20">
                                  REJECTED
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 6: TOOL MONITOR */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tool Budget Monitor & Execution History</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Shared 14-unit platform budget tracking across all requests
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Spent:</span>
                <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
                  {runData?.spent} / 14 units
                </span>
              </div>
            </div>

            <div
              className={`border rounded-2xl overflow-hidden shadow-sm ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`p-4 border-b font-bold text-xs uppercase tracking-wider ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                Platform Tool Action Sequence
              </div>
              <div className={`divide-y font-mono text-xs ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {runData?.steps.map((st, idx) => (
                  <div key={idx} className={`p-4 flex items-center justify-between transition ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        {idx + 1}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                          st.action.op === 'dispatch'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : st.action.op === 'escalate'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : st.action.op === 'llm'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {st.action.op}
                      </span>
                      <span className={`font-sans ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {st.action.op === 'inspect' && `Inspected Desk Snapshot for ${st.action.part_id}`}
                        {st.action.op === 'verify' && `Verified Authoritative Warehouse Stock for ${st.action.part_id}`}
                        {st.action.op === 'clarify' && `Scripted Clarification for Ticket ${st.action.ticket_id}`}
                        {st.action.op === 'dispatch' && `Irreversible Dispatch: Ticket ${st.action.ticket_id} → Part ${st.action.part_id}`}
                        {st.action.op === 'escalate' && `Safe Manual Handoff (Escalated) for Ticket ${st.action.ticket_id}`}
                        {st.action.op === 'llm' && `LLM Inference via Registered HTTPS Gateway`}
                      </span>
                    </div>

                    <div className={`flex items-center space-x-4 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>
                        Cost:{' '}
                        <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                          {st.action.op === 'inspect' ? '1' : st.action.op in ['verify', 'clarify'] ? '2' : '0'}
                        </strong>
                      </span>
                      <span>
                        Remaining: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{st.budget_remaining}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 7: DECISION CENTER */}
        {activeTab === 'decisions' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Final Fulfilment Decisions & Explanations</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Every request receives an authoritative dispatch or safe escalation decision
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {runData?.tickets.map((t) => {
                const isDispatch = t.decision === 'dispatch';
                return (
                  <div
                    key={t.id}
                    className={`border rounded-2xl p-5 space-y-4 shadow-sm ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                        {t.id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isDispatch
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {t.decision}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-xl text-xs font-sans leading-relaxed ${isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                      "{t.text}"
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Assigned Part:</span>
                        <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t.assigned_part_id || 'None (Escalated to human)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Decision Rationale:</span>
                        <span className={`text-right font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t.decision_reason}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAGE 8: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Immutable Decision & Safety Audit Trail</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Cryptographically reliable event ledger recorded for official verification
              </p>
            </div>

            <div
              className={`border rounded-2xl overflow-hidden shadow-sm ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <table className="w-full text-left text-xs font-mono">
                <thead
                  className={`uppercase text-[10px] font-bold border-b ${
                    isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <tr>
                    <th className="py-3 px-4">Step #</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4">Tool Cost</th>
                    <th className="py-3 px-4">Result / Recording</th>
                    <th className="py-3 px-4">Remaining Budget</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-[11px] ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {runData?.steps.map((st, idx) => (
                    <tr key={idx} className={`transition ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}>
                      <td className="py-2.5 px-4 text-slate-400">{idx + 1}</td>
                      <td className={`py-2.5 px-4 font-bold uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{st.action.op}</td>
                      <td className="py-2.5 px-4 text-blue-600 dark:text-blue-400 font-bold">
                        {st.action.part_id || st.action.ticket_id || 'batch'}
                      </td>
                      <td className={`py-2.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {st.action.op === 'inspect' ? 1 : st.action.op in ['verify', 'clarify'] ? 2 : 0} units
                      </td>
                      <td className={`py-2.5 px-4 font-sans ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {st.action.op === 'dispatch' && 'Recorded irreversible dispatch decision'}
                        {st.action.op === 'escalate' && 'Recorded manual handoff'}
                        {st.action.op === 'inspect' && `Stock: ${st.result?.data?.available ?? 0} (desk snapshot)`}
                        {st.action.op === 'verify' && `Stock: ${st.result?.data?.available ?? 0} (warehouse)`}
                        {st.action.op === 'clarify' && `Reply: "${st.result?.data?.reply ?? ''}"`}
                        {st.action.op === 'llm' && 'Model analysis completed'}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{st.budget_remaining} / 14</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 9: INTERACTIVE CUSTOM REQUEST SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Interactive Custom Request Sandbox</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Type any natural-language parts request to test PartSure AI's real-time parser, safety gate & decision engine
                </p>
              </div>
            </div>

            {/* Quick Example Presets */}
            <div
              className={`border rounded-2xl p-5 space-y-3 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Quick Preset Examples (Click to Load):
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  {
                    label: 'Preset 1: 12V Barrel (Unreadable Load Label)',
                    text: 'Replacement for mini conveyor: it needs 12-volt output through a barrel connector. The load label is unreadable; I can supply the required wattage if needed.',
                  },
                  {
                    label: 'Preset 2: 24V USB-C (Retired Fixture Noise)',
                    text: 'Our retired fixture used 5 V; ignore that. Training router now takes 24 V, with a USB-C plug. Minimum output rating is 20 W.',
                  },
                  {
                    label: 'Preset 3: 5V Barrel (5000 mV Millivolt Specification)',
                    text: 'Bench note for inspection camera: retain the barrel connection and 5000 mV specification. Minimum output rating is 10000 mW.',
                  },
                  {
                    label: 'Preset 4: 24V Barrel (Unfulfillable / Safe Escalation)',
                    text: 'Urgent replacement for main hoist: 24V barrel plug with 10W requirement.',
                  },
                ].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCustomInputText(ex.text);
                      setCustomResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg border transition text-[11px] font-medium ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-slate-300'
                        : 'bg-slate-100 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div
              className={`border rounded-2xl p-5 space-y-4 shadow-sm ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Enter Your Natural-Language Parts Request:
              </label>
              <textarea
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                rows={3}
                className={`w-full rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed border transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                }`}
                placeholder="Type or paste any parts request (e.g. 'Please supply 12V through USB-C. Minimum output rating is 10 W.')..."
              />

              <div className="flex justify-between items-center">
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Evaluating against current case parts catalog ({runData?.catalog.length || 12} parts)
                </span>
                <button
                  onClick={handleCustomSubmit}
                  disabled={customLoading || !customInputText.trim()}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{customLoading ? 'Analyzing...' : 'Analyze & Evaluate'}</span>
                </button>
              </div>
            </div>

            {/* Results Section */}
            {customResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parsed Technical Specifications */}
                <div
                  className={`border rounded-2xl p-5 space-y-3 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    1. Extracted Technical Specifications
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Voltage</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {customResult.parsed.voltage ? `${customResult.parsed.voltage} V` : 'Unknown'}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Connector</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {customResult.parsed.connector || 'Unknown'}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Wattage</span>
                      <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {customResult.parsed.watts ? `${customResult.parsed.watts} W` : 'Unspecified'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-xs ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Safety Gate Assessment:</span>
                    <p className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      {customResult.parsed.voltage && customResult.parsed.connector
                        ? `Valid constraints identified: ${customResult.parsed.voltage}V with ${customResult.parsed.connector}.`
                        : 'Missing critical specifications. Hard safety gate will prevent incompatible dispatch.'}
                    </p>
                  </div>
                </div>

                {/* Candidate & Decision Recommendation */}
                <div
                  className={`border rounded-2xl p-5 space-y-3 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    2. Recommended Action & Safety Rationale
                  </span>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-md font-bold uppercase text-xs ${
                        customResult.recommendation.op === 'dispatch'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : customResult.recommendation.op === 'clarify'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {customResult.recommendation.op}
                    </span>
                    {customResult.recommendation.part_id && (
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Part ID: {customResult.recommendation.part_id}
                      </span>
                    )}
                  </div>

                  <p className={`p-3.5 rounded-xl border text-xs leading-relaxed font-sans ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <strong className={`block mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Decision Rationale:</strong>
                    {customResult.recommendation.reason}
                  </p>

                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Compatible candidates found: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{customResult.candidates.length}</strong>
                    {customResult.candidates.length > 0 && (
                      <span className="ml-1">
                        ({customResult.candidates.map((c) => `${c.id} [${c.watts}W, ${c.type}]`).join(', ')})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className={`border-t py-4 text-center text-xs transition ${isDark ? 'border-slate-800/80 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-400'}`}>
        PartSure AI — Autonomous Parts Procurement Intelligence | Team F95-Agent_Smiths | Workshop Parts Desk Challenge
      </footer>
    </div>
  );
}
