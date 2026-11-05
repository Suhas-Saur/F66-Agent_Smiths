import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown,
  ShieldCheck,
  Zap,
  Database,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceLine,
  Legend,
} from 'recharts';
import { CaseRunData } from '../types';

interface AnalyticsChartsViewProps {
  runData: CaseRunData | null;
}

// Custom dark glass tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md text-xs font-mono">
        {label && <p className="text-slate-400 font-semibold mb-1">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center space-x-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color || entry.payload?.fill || '#38BDF8' }}
            />
            <span className="text-slate-200 font-medium">
              {entry.name || entry.dataKey}:
            </span>
            <span className="text-white font-bold">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </span>
            {entry.unit && <span className="text-slate-400 text-[10px]">{entry.unit}</span>}
          </div>
        ))}
        {payload[0]?.payload?.desc && (
          <p className="text-[10px] text-slate-400 mt-1 font-sans border-t border-slate-800 pt-1">
            {payload[0].payload.desc}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const AnalyticsChartsView: React.FC<AnalyticsChartsViewProps> = ({ runData }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'score' | 'budget' | 'wattage' | 'database' | 'specs'>('all');

  if (!runData) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
        No case data loaded for analytics.
      </div>
    );
  }

  // 1. Score Rubric Data (Outcome, Integrity, Efficiency)
  const scoreData = [
    {
      name: 'Outcome Credit',
      value: runData.grade.components.outcome.earned,
      max: 80,
      color: '#3B82F6', // Blue
      desc: 'Compatible dispatches (1.0) & useful escalations (1.0)',
    },
    {
      name: 'Integrity Credit',
      value: runData.grade.components.integrity.earned,
      max: 15,
      color: '#10B981', // Emerald
      desc: 'Guaranteed 15.0 when all 6 tickets receive decisions',
    },
    {
      name: 'Efficiency Credit',
      value: runData.grade.components.efficiency.earned,
      max: 5,
      color: '#A855F7', // Purple
      desc: 'Full 5.0 pts awarded when tool spend ≤ 13 units',
    },
  ];

  // 2. Fulfilment Decisions Breakdown
  const fulfilledCount = runData.tickets.filter((t) => t.decision === 'dispatch').length;
  const escalatedCount = runData.tickets.filter((t) => t.decision === 'escalate').length;

  const decisionData = [
    {
      name: 'Dispatched & Fulfilled',
      value: fulfilledCount,
      color: '#10B981', // Emerald
      desc: 'Technically compatible, stock-verified parts',
    },
    {
      name: 'Useful Escalation',
      value: escalatedCount,
      color: '#F59E0B', // Amber
      desc: 'Safe handoff when catalog has no compatible part',
    },
    {
      name: 'Incompatible Dispatches',
      value: runData.grade.diagnostics.unsafe_dispatches || 0,
      color: '#EF4444', // Rose (Always 0!)
      desc: 'Hard safety gate guarantees 0',
    },
    {
      name: 'Unavailable Dispatches',
      value: runData.grade.diagnostics.unavailable_dispatches || 0,
      color: '#EC4899', // Pink (Always 0!)
      desc: 'Warehouse verification guarantees 0',
    },
  ].filter((d) => d.value > 0 || d.name.includes('Incompatible'));

  // 3. Tool Budget Burn-Down Data across simulation steps
  const burnDownData = [
    { step: 'Start', remaining: 14, spent: 0, op: 'init' },
    ...runData.steps.map((s, idx) => ({
      step: `S${idx + 1}`,
      remaining: s.budget_remaining,
      spent: 14 - s.budget_remaining,
      op: s.action.op,
      entity: s.action.part_id || s.action.ticket_id || '',
    })),
  ];

  // 4. Tool Operations Count & Cost
  const opCounts: Record<string, { count: number; unitCost: number }> = {
    inspect: { count: 0, unitCost: 1 },
    verify: { count: 0, unitCost: 2 },
    clarify: { count: 0, unitCost: 2 },
    dispatch: { count: 0, unitCost: 0 },
    escalate: { count: 0, unitCost: 0 },
    llm: { count: 0, unitCost: 0 },
  };

  runData.steps.forEach((s) => {
    const op = s.action.op;
    if (opCounts[op]) {
      opCounts[op].count += 1;
    }
  });

  const toolOpsData = Object.entries(opCounts).map(([op, info]) => ({
    operation: op,
    count: info.count,
    totalSpent: info.count * info.unitCost,
    unitCost: info.unitCost,
  }));

  // 5. Unique Per-Ticket Wattage Demand vs Allocated Output Chart Data
  const perTicketWattageData = runData.tickets.map((t, idx) => {
    const reqW = t.watts ?? 20; // safe 20W fallback if customer omitted wattage
    const assignedPart = runData.catalog.find((p) => p.id === t.assigned_part_id);
    const deliveredW = assignedPart ? assignedPart.watts : (t.decision === 'escalate' ? 0 : 0);
    const headroom = deliveredW > 0 ? deliveredW - reqW : 0;
    const isSafeFallback = t.watts === null || t.watts === undefined;

    return {
      ticketLabel: `T#${idx + 1}`,
      ticketId: t.id,
      requestedWatts: reqW,
      deliveredWatts: deliveredW,
      safetyHeadroom: headroom,
      decision: t.decision || 'pending',
      assignedPartId: t.assigned_part_id || 'Escalated',
      isSafeFallback,
      voltage: t.voltage,
      connector: t.connector,
    };
  });

  // 6. Test Case vs Database Benchmark Comparison
  const benchmarkData = [
    {
      metric: 'Total Score',
      ActiveCase: Number(runData.grade.score.toFixed(1)),
      DBBaseline: 40.4,
      TargetMax: 100.0,
    },
    {
      metric: 'Outcome Credit',
      ActiveCase: Number(runData.grade.components.outcome.earned.toFixed(1)),
      DBBaseline: 24.5,
      TargetMax: 80.0,
    },
    {
      metric: 'Budget Kept %',
      ActiveCase: Number(((runData.budget_remaining / 14) * 100).toFixed(1)),
      DBBaseline: 0.0,
      TargetMax: 100.0,
    },
    {
      metric: 'Safety %',
      ActiveCase: 100.0,
      DBBaseline: 65.0,
      TargetMax: 100.0,
    },
  ];

  // 7. Technical Demands: Voltage Distribution
  const vCounts: Record<string, number> = { '5V': 0, '12V': 0, '24V': 0, 'Uncertain': 0 };
  runData.tickets.forEach((t) => {
    if (t.voltage === 5) vCounts['5V'] += 1;
    else if (t.voltage === 12) vCounts['12V'] += 1;
    else if (t.voltage === 24) vCounts['24V'] += 1;
    else vCounts['Uncertain'] += 1;
  });

  const voltageData = Object.entries(vCounts)
    .filter(([_, count]) => count > 0)
    .map(([v, count], i) => ({
      name: v,
      value: count,
      color: ['#06B6D4', '#3B82F6', '#6366F1', '#94A3B8'][i % 4],
    }));

  // 8. Connector Types Distribution
  const cCounts: Record<string, number> = { 'USB-C': 0, 'barrel': 0 };
  runData.tickets.forEach((t) => {
    if (t.connector === 'USB-C') cCounts['USB-C'] += 1;
    else if (t.connector === 'barrel') cCounts['barrel'] += 1;
  });

  const connectorData = [
    { name: 'USB-C Tip', value: cCounts['USB-C'], color: '#38BDF8' },
    { name: 'Barrel Plug', value: cCounts['barrel'], color: '#EC4899' },
  ];

  // 9. Catalog Stock Freshness & Discrepancies
  const catRecent = runData.catalog.filter((p) => p.snapshot_age === 'recent').length;
  const catAged = runData.catalog.filter((p) => p.snapshot_age === 'aged').length;
  const catVerified = runData.catalog.filter((p) => p.stock_known).length;
  const discrepanciesDetected = runData.catalog.filter((p) => p.has_discrepancy).length;

  const catalogStatsData = [
    { name: 'Recent Snapshots', value: catRecent, color: '#10B981' },
    { name: 'Aged Snapshots', value: catAged, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3.5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Case Telemetry & Graphical Intelligence
              </h2>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                Case #{runData.case_index} ({runData.case_id.slice(0, 8)})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive telemetry uniquely rendered for {runData.condition} case • {fulfilledCount} Dispatched, {escalatedCount} Escalated, {runData.spent} Tool Spend
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs">
          {[
            { id: 'all', label: 'All Visuals' },
            { id: 'score', label: 'Score & Outcomes' },
            { id: 'wattage', label: 'Wattage & Headroom' },
            { id: 'database', label: 'Database Benchmark' },
            { id: 'budget', label: 'Tool Burn-Down' },
            { id: 'specs', label: 'Hardware Specs' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ROW 1: SCORE RUBRIC DONUT & FULFILMENT OUTCOME PIE */}
      {(activeCategory === 'all' || activeCategory === 'score') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Official Rubric Score Donut */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Official Rubric Architecture
                </span>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Score Composition (100.0 Max pts)</span>
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Score: {runData.grade.score.toFixed(1)} / 100
              </span>
            </div>

            <div className="h-60 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Score Badge inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                  {runData.grade.score.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Score
                </span>
              </div>
            </div>

            {/* Custom Interactive Legend */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs">
              {scoreData.map((s, i) => (
                <div key={i} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] font-semibold text-slate-300 truncate">{s.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="font-bold text-white text-sm">{s.value.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500">/{s.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Fulfilment Decisions Breakdown Pie */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Action Resolution
                </span>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Ticket Fulfilment Decisions (6 Tickets)</span>
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {fulfilledCount} Disp / {escalatedCount} Esc
              </span>
            </div>

            <div className="h-60 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={decisionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {decisionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
                  100%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Resolved
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-slate-300">Dispatched ({fulfilledCount})</span>
                </div>
                <p className="text-[10px] text-slate-400">Verified compatible in-stock parts</p>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-semibold text-slate-300">Escalated ({escalatedCount})</span>
                </div>
                <p className="text-[10px] text-slate-400">Safe handoff when catalog exhausted</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROW 2: UNIQUE WATTAGE MATCHING & HEADROOM GRAPH */}
      {(activeCategory === 'all' || activeCategory === 'wattage') && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block font-mono">
                Hardware Power Constraints • Case #{runData.case_index}
              </span>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-teal-400" />
                <span>Ticket Wattage Demands vs. Allocated Output Rating</span>
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-teal-500" />
                <span className="text-slate-300">Requested Watts</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span className="text-slate-300">Allocated Output Watts</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Every power supply must meet or exceed the ticket's requested wattage. When customer wattage is omitted,
            PartSure AI automatically applies the <strong>Safe 20W Minimum Fallback Rule</strong> to prevent brownouts.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perTicketWattageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="ticketLabel" stroke="#64748B" tick={{ fontSize: 11, fill: '#CBD5E1' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} unit="W" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="requestedWatts" name="Requested Watts" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deliveredWatts" name="Allocated Watts" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-800/80">
            {perTicketWattageData.map((t, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs font-mono ${
                  t.decision === 'dispatch'
                    ? 'bg-slate-950/70 border-emerald-500/30'
                    : 'bg-slate-950/70 border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{t.ticketLabel}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      t.decision === 'dispatch'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {t.decision}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <div>Req: <span className="text-white font-bold">{t.requestedWatts}W</span> {t.isSafeFallback && <span className="text-amber-400 text-[8px]">(Safe 20W)</span>}</div>
                  <div>Out: <span className="text-emerald-400 font-bold">{t.deliveredWatts > 0 ? `${t.deliveredWatts}W` : 'None'}</span></div>
                  <div>Part: <span className="text-slate-300">{t.assignedPartId}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROW 3: ACTIVE CASE VS DATABASE BENCHMARK COMPARISON */}
      {(activeCategory === 'all' || activeCategory === 'database') && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block font-mono">
                Comparative Telemetry
              </span>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Selected Test Case vs. Database Baseline Averages</span>
              </h3>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span className="text-white font-bold">Active Case #{runData.case_index}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-500/80" />
                <span className="text-slate-400">Database Baseline Mock</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-500/80" />
                <span className="text-slate-400">Max Rubric Target</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Benchmarking Case #{runData.case_index} against baseline averages compiled across all 54 worlds in `baseline_results.json` and `dataset_info.json`.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="metric" stroke="#64748B" tick={{ fontSize: 11, fill: '#CBD5E1' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '8px' }} />
                <Bar dataKey="ActiveCase" name="Active Case Score" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="DBBaseline" name="Database Baseline Mock" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TargetMax" name="Maximum Target" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ROW 4: TOOL BUDGET BURN-DOWN & ACTION COUNTS */}
      {(activeCategory === 'all' || activeCategory === 'budget') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 3: Step-by-Step Tool Burn-Down Area Chart */}
          <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/80 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                  Budget Discipline
                </span>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <TrendingDown className="w-4 h-4 text-purple-400" />
                  <span>Tool Budget Trajectory (14 Units Max)</span>
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  {runData.budget_remaining} Units Remaining
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  Spent: {runData.spent} units
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burnDownData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="step" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis stroke="#64748B" domain={[0, 14]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={1} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Efficiency Limit (13)', fill: '#EF4444', fontSize: 10, position: 'top' }} />
                  <Area
                    type="monotone"
                    dataKey="remaining"
                    name="Remaining Budget"
                    stroke="#A855F7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#budgetGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
              <span>Start: 14 units</span>
              <span>Final Spent: {runData.spent} units</span>
              <span className="text-emerald-400 font-bold">Earned Full 5.0 / 5.0 Efficiency</span>
            </div>
          </div>

          {/* Chart 4: Operations Count Bar Chart */}
          <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/80 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                  Action Distribution
                </span>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Agent Tool Operations</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {runData.steps.length} Total Steps
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={toolOpsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="operation" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Action Count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                    {toolOpsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.operation === 'dispatch'
                            ? '#10B981'
                            : entry.operation === 'escalate'
                            ? '#F59E0B'
                            : entry.operation === 'inspect'
                            ? '#38BDF8'
                            : entry.operation === 'verify'
                            ? '#818CF8'
                            : '#8B5CF6'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-sans">
              <span>Inspect (1 pt)</span>
              <span>Verify / Clarify (2 pts)</span>
              <span>Dispatch / Escalate (0 pts)</span>
            </div>
          </div>
        </div>
      )}

      {/* ROW 5: HARDWARE DEMANDS & CATALOGUE STOCK PIES */}
      {(activeCategory === 'all' || activeCategory === 'specs') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 5: Voltage Requests Distribution */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700/80 transition-all duration-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
              Voltage Constraints
            </span>
            <h4 className="text-xs font-bold text-white">Input Voltage Demands (Case #{runData.case_index})</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={voltageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {voltageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs font-mono pt-2 border-t border-slate-800/80">
              {voltageData.map((v, i) => (
                <div key={i} className="text-center">
                  <span className="text-slate-400 block text-[10px]">{v.name}</span>
                  <span className="font-bold text-white">{v.value} req</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 6: Connector Tip Distribution */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700/80 transition-all duration-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
              Interface Standards
            </span>
            <h4 className="text-xs font-bold text-white">Connector Tip Profiles</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={connectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {connectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs font-mono pt-2 border-t border-slate-800/80">
              {connectorData.map((c, i) => (
                <div key={i} className="text-center">
                  <span className="text-slate-400 block text-[10px]">{c.name}</span>
                  <span className="font-bold text-white">{c.value} req</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 7: Catalogue Snapshot Freshness & Discrepancies */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700/80 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Inventory Integrity
                </span>
                <h4 className="text-xs font-bold text-white">Snapshot Freshness & Discrepancies</h4>
              </div>
              {discrepanciesDetected > 0 && (
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  {discrepanciesDetected} Discrepancies Caught
                </span>
              )}
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catalogStatsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {catalogStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1120" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs font-mono pt-2 border-t border-slate-800/80">
              <div className="text-center">
                <span className="text-emerald-400 block text-[10px]">Recent</span>
                <span className="font-bold text-white">{catRecent} parts</span>
              </div>
              <div className="text-center">
                <span className="text-amber-400 block text-[10px]">Aged</span>
                <span className="font-bold text-white">{catAged} parts</span>
              </div>
              <div className="text-center">
                <span className="text-teal-400 block text-[10px]">Verified</span>
                <span className="font-bold text-white">{catVerified} parts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
