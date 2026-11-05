import React from 'react';
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
} from 'lucide-react';
import { TabType, CaseMetaItem } from '../types';

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
  caseId?: string;
  condition?: string;
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
  caseId,
  condition,
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
    { id: 'workbench', label: 'Ticket Workbench', icon: Layers, badge: 'Live Story', hotkey: '1' },
    { id: 'overview', label: 'Performance & Policy', icon: Activity, hotkey: '2' },
    { id: 'player', label: 'Simulation Player', icon: Play, hotkey: '3' },
    { id: 'matrix', label: 'Compatibility Matrix', icon: Sliders, badge: '6×12', hotkey: '4' },
    { id: 'catalog', label: 'Parts Catalogue', icon: Boxes, badge: '12', hotkey: '5' },
    { id: 'sandbox', label: 'What-If Sandbox', icon: FlaskConical, badge: 'Interactive', hotkey: '6' },
    { id: 'audit', label: 'Audit Trail', icon: FileText, hotkey: '7' },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Controls Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('workbench')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">PARTSURE AI</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v6.2 Autonomous
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Safe Parts Procurement Intelligence & Deterministic Verification
            </p>
          </div>
        </div>

        {/* Case & Dataset Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Dataset Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs shadow-inner">
            <span className="text-slate-400 font-medium mr-2">Dataset:</span>
            <select
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                setSelectedCaseIdx(0);
              }}
              className="bg-slate-800 text-slate-200 border-none rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer outline-none"
            >
              <option value="practice.json">Practice (12 Cases)</option>
              <option value="smoke.json">Smoke (2 Cases)</option>
              <option value="training.json">Training (40 Cases)</option>
            </select>
          </div>

          {/* Case Navigation with Prev/Next buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs shadow-inner">
            <button
              onClick={handlePrevCase}
              disabled={selectedCaseIdx <= 0}
              title="Previous Case (Left Arrow)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedCaseIdx}
              onChange={(e) => setSelectedCaseIdx(Number(e.target.value))}
              className="bg-transparent text-slate-200 border-none px-2 py-1 text-xs font-mono font-medium focus:ring-0 cursor-pointer outline-none max-w-[170px]"
            >
              {currentCases.map((c) => (
                <option key={c.index} value={c.index} className="bg-slate-900 text-slate-200">
                  Case #{c.index + 1} ({c.condition})
                </option>
              ))}
            </select>

            <button
              onClick={handleNextCase}
              disabled={selectedCaseIdx >= maxIdx}
              title="Next Case (Right Arrow)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Badges */}
          {caseId && (
            <div className="hidden xl:flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[11px] font-mono">
              <span className="text-slate-500">ID:</span>
              <span className="text-blue-400 font-bold">{caseId.slice(0, 8)}</span>
              {condition && (
                <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-sans text-[10px]">
                  {condition}
                </span>
              )}
            </div>
          )}

          {/* Run Case Button */}
          <button
            onClick={onRunSimulation}
            disabled={loading}
            title="Re-run Simulation (Spacebar)"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs transition shadow-md shadow-blue-600/20 disabled:opacity-50 active:scale-95"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating...' : 'Run Simulation'}</span>
          </button>

          {/* Export & Shortcuts Actions */}
          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
            <button
              onClick={onOpenExport}
              title="Export Case Report"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <HelpCircle className="w-4 h-4" />
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
              className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-medium transition whitespace-nowrap text-xs ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              <span className="hidden md:inline-block text-[10px] text-slate-600 font-mono ml-1">
                [{tab.hotkey}]
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
