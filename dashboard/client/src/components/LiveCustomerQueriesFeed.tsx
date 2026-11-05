import { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';
import { LiveCustomerQuery } from '../types';

interface LiveCustomerQueriesFeedProps {
  queries: LiveCustomerQuery[];
  onAction: (id: string, action: 'approve' | 'dispatch' | 'escalate', adminNotes?: string) => Promise<void>;
  onSimulateInbound: () => void;
  isAdmin: boolean;
}

export const LiveCustomerQueriesFeed: React.FC<LiveCustomerQueriesFeedProps> = ({
  queries,
  onAction,
  onSimulateInbound,
  isAdmin,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'dispatched' | 'escalated'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredQueries = queries.filter((q) => {
    if (filter === 'pending') return q.status === 'pending_approval';
    if (filter === 'dispatched') return q.status === 'dispatched' || q.status === 'approved';
    if (filter === 'escalated') return q.status === 'escalated';
    return true;
  });

  const pendingCount = queries.filter((q) => q.status === 'pending_approval').length;
  const dispatchedCount = queries.filter((q) => q.status === 'dispatched' || q.status === 'approved').length;

  const handleActionClick = async (id: string, action: 'approve' | 'dispatch' | 'escalate') => {
    setActionLoadingId(id);
    try {
      await onAction(id, action);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Top Header with Live Beacon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Live Customer Inbound Stream</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>Auto-Synced (Live)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live queries submitted by field technicians stream directly to this dispatcher queue
            </p>
          </div>
        </div>

        {/* Quick Filter Chips & Simulate Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({queries.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('dispatched')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'dispatched' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dispatched ({dispatchedCount})
            </button>
          </div>

          <button
            onClick={onSimulateInbound}
            title="Simulate a new incoming customer request"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Simulate Inbound</span>
          </button>
        </div>
      </div>

      {/* Query List */}
      <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredQueries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <p>No customer queries matching current filter.</p>
          </div>
        ) : (
          filteredQueries.map((q) => {
            const isApproved = q.status === 'approved' || q.status === 'dispatched';
            const isEscalated = q.status === 'escalated';
            const isPending = q.status === 'pending_approval';

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border transition-all duration-200 space-y-3 bg-slate-950/80 ${
                  isPending
                    ? 'border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                    : isApproved
                    ? 'border-emerald-500/30'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Header: Customer Info + Status Pill */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 font-bold text-xs font-mono text-white flex items-center justify-center shrink-0">
                      {q.avatar}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{q.customerName}</span>
                        <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                          {q.id}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{q.customerTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500 flex items-center space-x-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{formatTimeAgo(q.timestamp)}</span>
                    </span>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        isApproved
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      {isApproved ? 'Approved & Dispatched' : isPending ? 'Action Required' : 'Escalated'}
                    </span>
                  </div>
                </div>

                {/* Raw Query Text */}
                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/70 p-3 rounded-xl border border-slate-800/70 italic">
                  "{q.text}"
                </p>

                {/* Extracted Specs + Rationale */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      {q.extracted.voltage ? `${q.extracted.voltage}V` : 'Voltage ?'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      {q.extracted.connector || 'Connector ?'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      {q.extracted.watts ? `${q.extracted.watts}W` : '20W Safe Fallback'}
                    </span>
                  </div>

                  {q.assigned_part_id ? (
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Part: {q.assigned_part_id}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium">
                      No matching part in stock
                    </span>
                  )}
                </div>

                {/* Admin Action Buttons (for Admins) */}
                {isAdmin && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {q.adminNotes || q.decision_reason}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {isPending && q.decision === 'dispatch' && (
                        <button
                          onClick={() => handleActionClick(q.id, 'approve')}
                          disabled={actionLoadingId === q.id}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] transition shadow-sm cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirm Dispatch</span>
                        </button>
                      )}

                      {!isEscalated && (
                        <button
                          onClick={() => handleActionClick(q.id, 'escalate')}
                          disabled={actionLoadingId === q.id}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-medium transition cursor-pointer"
                        >
                          <span>Escalate</span>
                        </button>
                      )}

                      {isApproved && (
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Dispatch Confirmed</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
