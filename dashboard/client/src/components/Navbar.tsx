import {
  Zap,
  RotateCcw,
  Layers,
  Activity,
  Play,
  Sliders,
  Boxes,
  FlaskConical,
  FileText,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Download,
  BarChart3,
  Home,
  Package,
  Sparkles,
  Database,
} from 'lucide-react';
import { TabType, CaseMetaItem, UserProfile } from '../types';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedDataset: string;
  setSelectedDataset: (ds: string) => void;
  selectedCaseIdx: number;
  setSelectedCaseIdx: (idx: number) => void;
  casesList: Record<string, CaseMetaItem[]>;
  loading: boolean;
  onRunSimulation: () => void;
  onOpenShortcuts: () => void;
  onOpenExport: () => void;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onReplayIntro: () => void;
  caseId?: string;
  condition?: string;
  pendingAlertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedDataset,
  setSelectedDataset,
  selectedCaseIdx,
  setSelectedCaseIdx,
  casesList,
  loading,
  onRunSimulation,
  onOpenShortcuts,
  onOpenExport,
  currentUser,
  onOpenAuth,
  onReplayIntro,
  caseId,
  condition,
  pendingAlertCount = 0,
}) => {
  const currentCases = casesList[selectedDataset] || [];
  const maxIdx = currentCases.length > 0 ? currentCases.length - 1 : 0;

  const handlePrevCase = () => {
    if (selectedCaseIdx > 0) {
      setSelectedCaseIdx(selectedCaseIdx - 1);
    }
  };

  const handleNextCase = () => {
    if (selectedCaseIdx < maxIdx) {
      setSelectedCaseIdx(selectedCaseIdx + 1);
    }
  };

  const navTabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; hotkey: string }[] = [
    { id: 'home', label: 'Home Portal', icon: Home, badge: 'Hub', hotkey: '1' },
    { id: 'customer', label: 'Customer Desk', icon: Package, badge: 'Orders', hotkey: '2' },
    { id: 'workbench', label: 'Admin Workbench', icon: Layers, badge: 'Safety Gate', hotkey: '3' },
    { id: 'charts', label: 'Visual Analytics', icon: BarChart3, badge: 'Pies & Graphs', hotkey: '4' },
    { id: 'database', label: 'Database Intel', icon: Database, badge: '54 Worlds', hotkey: '5' },
    { id: 'overview', label: 'Rubric & Policy', icon: Activity, hotkey: '6' },
    { id: 'player', label: 'Timeline Player', icon: Play, hotkey: '7' },
    { id: 'matrix', label: '6×12 Matrix', icon: Sliders, badge: '6×12', hotkey: '8' },
    { id: 'catalog', label: 'Parts Catalogue', icon: Boxes, badge: '12', hotkey: '9' },
    { id: 'sandbox', label: 'What-If Sandbox', icon: FlaskConical, badge: 'Sandbox', hotkey: '0' },
    { id: 'audit', label: 'Audit Trail', icon: FileText, hotkey: 'A' },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40">
      {/* Top Controls Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white">PARTSURE AI</span>
              <span className="px-2 py-0.2 text-[9px] font-bold uppercase rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                v6.2
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Safe Parts Procurement & Autonomous Fulfilment
            </p>
          </div>
        </div>

        {/* User Identity & Auth Button */}
        <div className="flex items-center space-x-2">
          <div
            onClick={onOpenAuth}
            className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1.5 cursor-pointer transition shadow-sm"
            title="Click to instant switch login profile / role"
          >
            <div
              className={`w-6 h-6 rounded-lg font-mono font-bold text-[10px] flex items-center justify-center ${
                currentUser.role === 'admin'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {currentUser.avatar}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-white block leading-tight">{currentUser.name}</span>
              <span className="text-[9px] text-slate-400 block font-mono capitalize">
                {currentUser.role === 'admin' ? 'Admin Officer' : 'Customer Tech'}
              </span>
            </div>
            <span
              className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                currentUser.role === 'admin'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={onReplayIntro}
            title="Replay 3-Second Flash Intro Screen"
            className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium">Intro (3s)</span>
          </button>
        </div>

        {/* Case & Dataset Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Dataset Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium mr-1.5 text-[11px]">Dataset:</span>
            <select
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                setSelectedCaseIdx(0);
              }}
              className="bg-slate-800 text-slate-200 border-none rounded-lg px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer outline-none"
            >
              <option value="practice.json">Practice (12)</option>
              <option value="smoke.json">Smoke (2)</option>
              <option value="training.json">Training (40)</option>
            </select>
          </div>

          {/* Case Navigation with Prev/Next buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              onClick={handlePrevCase}
              disabled={selectedCaseIdx <= 0}
              title="Previous Case (Left Arrow)"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <select
              value={selectedCaseIdx}
              onChange={(e) => setSelectedCaseIdx(Number(e.target.value))}
              className="bg-transparent text-slate-200 border-none px-1.5 py-0.5 text-xs font-mono font-medium focus:ring-0 cursor-pointer outline-none max-w-[140px]"
            >
              {currentCases.map((c) => (
                <option key={c.index} value={c.index} className="bg-slate-900 text-slate-200">
                  #{c.index + 1} ({c.condition})
                </option>
              ))}
            </select>

            <button
              onClick={handleNextCase}
              disabled={selectedCaseIdx >= maxIdx}
              title="Next Case (Right Arrow)"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Case ID Badge */}
          {caseId && (
            <div className="hidden xl:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-mono">
              <span className="text-slate-500 text-[10px]">ID:</span>
              <span className="text-blue-400 font-bold">{caseId.slice(0, 8)}</span>
              {condition && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-sans">
                  {condition}
                </span>
              )}
            </div>
          )}

          {/* Live Red Alert Notification Pill on Admin Desk */}
          {pendingAlertCount > 0 && (
            <button
              onClick={() => setActiveTab('workbench')}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-3 py-1.5 rounded-xl text-xs transition shadow-lg shadow-red-600/40 border border-red-400/50 animate-pulse cursor-pointer active:scale-95"
              title="Click to view inbound queries on Admin Workbench"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>🚨 {pendingAlertCount} LIVE ALERT</span>
            </button>
          )}

          {/* Run Case Button */}
          <button
            onClick={onRunSimulation}
            disabled={loading}
            title="Re-run Simulation (Spacebar)"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition shadow-md shadow-blue-600/20 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating...' : 'Run Simulation'}</span>
          </button>

          {/* Export & Shortcuts Actions */}
          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
            <button
              onClick={onOpenExport}
              title="Export Case Report"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/80 overflow-x-auto text-xs scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-medium transition whitespace-nowrap text-xs ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'workbench' && pendingAlertCount > 0 ? (
                <span className="text-[8px] px-2 py-0.5 rounded-full font-mono font-black uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/70 shadow-md shadow-red-500/40 animate-pulse flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span>{pendingAlertCount} ALERT</span>
                </span>
              ) : tab.badge ? (
                <span
                  className={`text-[8px] px-1.5 py-0.2 rounded-full uppercase font-bold tracking-wider ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </header>
  );
};
