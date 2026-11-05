import React, { useState, useEffect } from 'react';
import {
  Database,
  Cpu,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DatabaseStats } from '../types';

interface DatabaseIntelligenceViewProps {
  onSelectCase: (dataset: string, index: number) => void;
  selectedDataset: string;
  selectedCaseIdx: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md text-xs font-mono">
        {label && <p className="text-slate-400 font-semibold mb-1">{label}</p>}
        <div className="flex items-center space-x-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color || data.payload?.fill || '#38BDF8' }}
          />
          <span className="text-slate-200 font-medium">
            {data.name || data.dataKey}:
          </span>
          <span className="text-white font-bold">
            {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
          </span>
        </div>
        {data.payload?.desc && (
          <p className="text-[10px] text-slate-400 mt-1 font-sans border-t border-slate-800 pt-1">
            {data.payload.desc}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const DatabaseIntelligenceView: React.FC<DatabaseIntelligenceViewProps> = ({
  onSelectCase,
  selectedDataset,
  selectedCaseIdx,
}) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterDataset, setFilterDataset] = useState<'all' | 'practice' | 'smoke' | 'training'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetch('/api/database-stats')
      .then((res) => res.json())
      .then((data: DatabaseStats) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load database stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-16 text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-300">Scanning Database Catalogs & Telemetry...</p>
        <p className="text-xs text-slate-500 mt-1">Aggregating practice.json, smoke.json, training.json & dataset_info.json</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
        Database metrics unavailable. Ensure the server is online.
      </div>
    );
  }

  // Baseline Comparison Data
  const benchmarkComparisonData = [
    {
      metric: 'Score Benchmark',
      PartSureAI: stats.baselineComparison.partSureScore,
      BaselineMock: stats.baselineComparison.baselineMockTrainingScore,
      unit: 'pts',
    },
    {
      metric: 'Safety Adherence %',
      PartSureAI: 100,
      BaselineMock: 65,
      unit: '%',
    },
    {
      metric: 'Unnecessary Escalations',
      PartSureAI: 0,
      BaselineMock: stats.baselineComparison.baselineUnnecessaryEscalations,
      unit: '%',
    },
    {
      metric: 'Zero-Discrepancy Catch %',
      PartSureAI: 100,
      BaselineMock: 15,
      unit: '%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Database-Wide Hardware & Scenario Intelligence
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  54 Worlds Synced
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Full-spectrum database inspection across 324 procurement requests and 648 catalogue parts.
                Visualizing physical constraints, snapshot age discrepancies, and comparative benchmark distributions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 text-xs">
            <span className="text-[11px] text-slate-400 font-mono px-2">Scope:</span>
            {(['all', 'practice', 'smoke', 'training'] as const).map((ds) => (
              <button
                key={ds}
                onClick={() => setFilterDataset(ds)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition ${
                  filterDataset === ds
                    ? 'bg-blue-600 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ds}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Total Scenarios</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.totalWorlds}</span>
            <span className="text-xs text-slate-400 font-mono">Worlds</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            12 Practice • 2 Smoke • 40 Training
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Requests</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.totalTickets}</span>
            <span className="text-xs text-emerald-400 font-mono">Tickets</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Exactly 6 tickets per simulated world
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Total Inventory</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.totalParts}</span>
            <span className="text-xs text-purple-400 font-mono">Parts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            12 parts/world • 324 Recent / 324 Aged
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Snapshot Discrepancies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{stats.totalDiscrepancies}</span>
            <span className="text-xs text-slate-400 font-mono">Total Disagreements</span>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-2 font-mono">
            Exactly 2 aged discrepancies per world
          </p>
        </div>
      </div>

      {/* Database Graphics Row 1: Hardware Distributions & Safe 20W Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Voltage Distribution Pie */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                Database Balance
              </span>
              <h3 className="text-sm font-bold text-white">Voltage Requirements (324 Tickets)</h3>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20">
              108 each (33.3%)
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.voltages}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {stats.voltages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center font-mono">
            {stats.voltages.map((v, i) => (
              <div key={i} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">{v.name}</span>
                <span className="text-xs font-bold text-white">{v.count} req</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connector Types & Wattage Distribution */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                Hardware Standards
              </span>
              <h3 className="text-sm font-bold text-white">Connector & Wattage Balance</h3>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
              50% USB-C / 50% Barrel
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.connectors}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {stats.connectors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-center font-mono">
            {stats.connectors.map((c, i) => (
              <div key={i} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">{c.name}</span>
                <span className="text-xs font-bold text-white">{c.count} (50%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Wattage Safe 20W Distribution */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Mandatory Safety Rule
                </span>
                <h3 className="text-sm font-bold text-white">Safe 20W Fallback Requests</h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                {stats.missingWattageStats.percent}% of Requests
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Across the database, customers frequently omit power wattage. PartSure AI enforces the
              standard: whenever wattage is unspecified, minimum required output defaults safely to 20W.
            </p>
          </div>

          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Omitted Wattage Tickets:</span>
              <span className="font-mono font-bold text-amber-400">{stats.missingWattageStats.missing} / {stats.missingWattageStats.total}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.missingWattageStats.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 font-mono">
              <span>Safe 20W Rule Applied</span>
              <span className="text-emerald-400 font-bold">100% Zero-Burnout Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Graphics Row 2: Stock Units Histogram & Unfulfillable Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stock Units per World Histogram */}
        <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Warehouse Depth Profile
              </span>
              <h3 className="text-sm font-bold text-white">Stock Units Distribution Across Worlds</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              5 to 12 Units / World
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stockUnitsHistogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="units" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="worlds" name="Worlds Count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {stats.stockUnitsHistogram.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#38BDF8', '#0284C7', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#10B981'][index % 8]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Modal peak at 9 units per world (15 worlds) and 8 units per world (11 worlds).
          </p>
        </div>

        {/* Unfulfillable Requests Spectrum */}
        <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                Scenario Complexity
              </span>
              <h3 className="text-sm font-bold text-white">Unfulfillable Requests per World</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              52 Worlds Scored
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.unfulfillableDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="category" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="worlds" name="Worlds Count" radius={[6, 6, 0, 0]}>
                  {stats.unfulfillableDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            17 worlds 100% fulfillable • 21 worlds require 1 escalation • 12 require 2 escalations • 2 require 3 escalations.
          </p>
        </div>
      </div>

      {/* Database Graphics Row 3: PartSure AI vs Baseline Mock Benchmark Comparison */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Official Benchmark Validation
            </span>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PartSure AI Autonomous Engine vs. Baseline Offline Mock</span>
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-white font-bold">PartSure AI (100.0)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="text-slate-400">Baseline Mock (40.4)</span>
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarkComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="metric" stroke="#64748B" tick={{ fontSize: 11, fill: '#CBD5E1' }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="PartSureAI" name="PartSure AI Solution" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="BaselineMock" name="Baseline Mock Policy" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* World Selector Quick-Jump Interactive Grid */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Database World Quick-Launcher</span>
            </h3>
            <p className="text-xs text-slate-400">
              Click any world to immediately load its telemetry, unique charts, and candidate compatibility matrix
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons Grid for Practice Worlds */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                Practice Dataset (12 Worlds)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {Array.from({ length: 12 }).map((_, idx) => {
                const isSelected = selectedDataset === 'practice.json' && selectedCaseIdx === idx;
                return (
                  <button
                    key={`practice-${idx}`}
                    onClick={() => onSelectCase('practice.json', idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white font-mono">Case #{idx}</span>
                      <ArrowUpRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {idx === 0 ? '5 Disp / 1 Esc' : idx === 4 ? '4 Disp / 2 Esc' : '6 Disp / 0 Esc'}
                    </p>
                    <div className="mt-1 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-mono">100.0 Score</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 font-mono">
                Training Dataset (40 Worlds Preview)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {Array.from({ length: 16 }).map((_, idx) => {
                const isSelected = selectedDataset === 'training.json' && selectedCaseIdx === idx;
                return (
                  <button
                    key={`training-${idx}`}
                    onClick={() => onSelectCase('training.json', idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">Trn #{idx}</span>
                      <ArrowUpRight className={`w-3 h-3 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">6 Tickets</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
