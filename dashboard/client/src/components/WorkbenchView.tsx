import { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Info,
  Wrench,
} from 'lucide-react';
import { CaseRunData } from '../types';

interface WorkbenchViewProps {
  runData: CaseRunData | null;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({ runData }) => {
  const tickets = runData?.tickets || [];
  const [selectedId, setSelectedId] = useState<string>(tickets[0]?.id || '');
  const [candidateFilter, setCandidateFilter] = useState<'all' | 'compatible' | 'rejected'>('all');

  const activeTicket = tickets.find((t) => t.id === selectedId) || tickets[0];
  const activeMatrixRow = runData?.compatibility_matrix.find((r) => r.ticket_id === activeTicket?.id);

  // Relevant tool steps for this ticket
  const ticketSteps = (runData?.steps || []).filter(
    (s) => s.action.ticket_id === activeTicket?.id || (s.action.part_id && activeTicket?.assigned_part_id === s.action.part_id)
  );

  const candidates = activeMatrixRow?.candidates || [];
  const filteredCandidates = candidates.filter((c) => {
    if (candidateFilter === 'compatible') return c.compatible;
    if (candidateFilter === 'rejected') return !c.compatible;
    return true;
  });

  if (!activeTicket) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        No ticket data available. Please run a simulation.
      </div>
    );
  }

  const isFulfilled = activeTicket.decision === 'dispatch';

  return (
    <div className="space-y-6">
      {/* 1. TICKET SELECTOR STRIP (CAROUSEL) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            Select Workshop Request (6 Batch Tickets)
          </span>
          <span>Click any request below for full safety gate breakdown</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tickets.map((t, idx) => {
            const isSelected = t.id === activeTicket.id;
            const fulfilled = t.decision === 'dispatch';

            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/15 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        fulfilled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {fulfilled ? 'Fulfilled' : 'Escalated'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {t.text}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">
                    {t.voltage ? `${t.voltage}V` : '?V'} • {t.connector || '?'}
                  </span>
                  <span className="text-slate-300 font-semibold">
                    {t.watts ? `${t.watts}W` : '20W safe'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE TICKET STORY & SAFETY PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Customer Request & AI Extraction Specs */}
        <div className="lg:col-span-5 space-y-5">
          {/* A. Customer Request Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {activeTicket.id}
                </span>
                <span className="text-xs font-semibold text-slate-300">Raw Customer Request</span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  isFulfilled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {activeTicket.decision}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans relative">
              <span className="text-slate-500 text-lg leading-none absolute -top-1 left-2 select-none">“</span>
              <p className="pl-3 italic">{activeTicket.text}</p>
            </div>

            {/* Clarification status banner if needed */}
            {activeTicket.clarified ? (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Customer Clarification Received:</span>
                  <span className="text-slate-200 italic font-mono text-[11px]">
                    "{activeTicket.clarification_reply}"
                  </span>
                </div>
              </div>
            ) : activeTicket.watts === null ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Unspecified Wattage Handled Safely:</span>
                  <span className="text-slate-300 text-[11px]">
                    Safe 20W policy applied: any 20W component satisfies either 10W or 20W without wasting 2 tool units of customer clarification!
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* B. Normalized Technical Specifications */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Extracted Technical Specs
                </span>
              </div>
              <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                Deterministic Normalization
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                  Voltage
                </span>
                <span className="text-lg font-mono font-extrabold text-white mt-1 block">
                  {activeTicket.voltage ? `${activeTicket.voltage} V` : 'Unknown'}
                </span>
                <span className="text-[10px] text-slate-400">Hard match</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                  Connector
                </span>
                <span className="text-lg font-mono font-extrabold text-white mt-1 block truncate">
                  {activeTicket.connector || 'Unknown'}
                </span>
                <span className="text-[10px] text-slate-400">Hard match</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                  Min Watts
                </span>
                <span className="text-lg font-mono font-extrabold text-white mt-1 block">
                  {activeTicket.watts ? `${activeTicket.watts} W` : '20 W (Safe)'}
                </span>
                <span className="text-[10px] text-slate-400">≥ rating</span>
              </div>
            </div>

            {/* Decision Rationale */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
              <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">
                Automated Decision Rationale
              </span>
              <p className="text-slate-200 font-medium">
                {activeTicket.decision_reason}
              </p>
              {activeTicket.assigned_part_id && (
                <div className="pt-2 flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Assigned Component:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {activeTicket.assigned_part_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* C. Tool Steps for this Ticket */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tool Actions Taken for Request
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {ticketSteps.length} action(s)
              </span>
            </div>

            {ticketSteps.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Resolved directly from existing catalog snapshot without consuming extra tool units.
              </p>
            ) : (
              <div className="space-y-2">
                {ticketSteps.map((st, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-slate-500">#{st.step}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          st.action.op === 'dispatch'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : st.action.op === 'escalate'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {st.action.op}
                      </span>
                      <span className="text-slate-300 font-sans">
                        {st.action.part_id || st.action.ticket_id}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Cost: {st.action.op === 'inspect' ? '1' : st.action.op in ['verify', 'clarify'] ? '2' : '0'} unit(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): 4-Stage Safety Pipeline & Candidate Elimination Matrix */}
        <div className="lg:col-span-7 space-y-5">
          {/* Visual 4-Stage Safety Gate Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Deterministic 4-Stage Safety Gate</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                0% Incompatible Guarantee
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {/* Gate 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center mx-auto mb-1.5 font-mono">
                  1
                </div>
                <span className="font-semibold text-slate-200 block text-[11px]">Voltage</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  {activeTicket.voltage ? `${activeTicket.voltage}V exact` : 'Unresolved'}
                </span>
              </div>

              {/* Gate 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center mx-auto mb-1.5 font-mono">
                  2
                </div>
                <span className="font-semibold text-slate-200 block text-[11px]">Connector</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  {activeTicket.connector || 'Unresolved'}
                </span>
              </div>

              {/* Gate 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center mx-auto mb-1.5 font-mono">
                  3
                </div>
                <span className="font-semibold text-slate-200 block text-[11px]">Wattage</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  ≥ {activeTicket.watts ? `${activeTicket.watts}W` : '20W safe'}
                </span>
              </div>

              {/* Gate 4 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center mx-auto mb-1.5 font-mono">
                  4
                </div>
                <span className="font-semibold text-slate-200 block text-[11px]">Stock Status</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  {isFulfilled ? 'Available (>0)' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Parts Evaluation Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Catalog Candidate Elimination Matrix
                </h3>
                <p className="text-[11px] text-slate-400">
                  Every catalog part evaluated against this request's technical constraints
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setCandidateFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    candidateFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setCandidateFilter('compatible')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    candidateFilter === 'compatible'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Compatible ({candidates.filter((c) => c.compatible).length})
                </button>
                <button
                  onClick={() => setCandidateFilter('rejected')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    candidateFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rejected ({candidates.filter((c) => !c.compatible).length})
                </button>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Part ID & Specs</th>
                    <th className="py-2.5 px-3">Voltage Match</th>
                    <th className="py-2.5 px-3">Connector</th>
                    <th className="py-2.5 px-3">Wattage</th>
                    <th className="py-2.5 px-3">Inventory</th>
                    <th className="py-2.5 px-3">Gate Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredCandidates.map((cand) => {
                    const isWinner = activeTicket.assigned_part_id === cand.part_id;

                    return (
                      <tr
                        key={cand.part_id}
                        className={`transition ${
                          isWinner
                            ? 'bg-emerald-500/15 hover:bg-emerald-500/20 font-semibold'
                            : cand.compatible
                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                            : 'hover:bg-slate-900/40 opacity-75'
                        }`}
                      >
                        {/* Part ID */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1.5">
                            {isWinner && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            <span className={isWinner ? 'text-emerald-300 font-bold' : 'text-blue-400 font-bold'}>
                              {cand.part_id}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            {cand.voltage}V • {cand.connector} • {cand.watts}W
                          </span>
                        </td>

                        {/* Voltage check */}
                        <td className="py-2.5 px-3 font-sans">
                          {cand.v_match ? (
                            <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                              <Check className="w-3.5 h-3.5" />
                              <span>{cand.voltage}V Match</span>
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center space-x-1 font-medium">
                              <X className="w-3.5 h-3.5" />
                              <span>{cand.voltage}V ≠ {activeTicket.voltage}V</span>
                            </span>
                          )}
                        </td>

                        {/* Connector check */}
                        <td className="py-2.5 px-3 font-sans">
                          {cand.c_match ? (
                            <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                              <Check className="w-3.5 h-3.5" />
                              <span>{cand.connector}</span>
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center space-x-1 font-medium">
                              <X className="w-3.5 h-3.5" />
                              <span>{cand.connector}</span>
                            </span>
                          )}
                        </td>

                        {/* Wattage check */}
                        <td className="py-2.5 px-3 font-sans">
                          {cand.w_match ? (
                            <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                              <Check className="w-3.5 h-3.5" />
                              <span>{cand.watts}W valid</span>
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center space-x-1 font-medium">
                              <X className="w-3.5 h-3.5" />
                              <span>{cand.watts}W &lt; {activeTicket.watts || 20}W</span>
                            </span>
                          )}
                        </td>

                        {/* Stock status */}
                        <td className="py-2.5 px-3 font-sans">
                          {cand.stock_known ? (
                            cand.stock && cand.stock > 0 ? (
                              <span className="text-emerald-400 font-medium">
                                In Stock ({cand.stock})
                              </span>
                            ) : (
                              <span className="text-rose-400 font-medium">
                                Out of Stock (0)
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-[10px]">
                              {cand.snapshot_age} snapshot
                            </span>
                          )}
                        </td>

                        {/* Gate Outcome */}
                        <td className="py-2.5 px-3 font-sans">
                          {isWinner ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ASSIGNED
                            </span>
                          ) : cand.compatible ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              COMPATIBLE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              REJECTED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
