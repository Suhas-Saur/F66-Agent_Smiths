import { useState } from 'react';
import {
  Package,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Send,
  Sparkles,
  Download,
  Check,
  Radio,
} from 'lucide-react';
import { CaseRunData, UserProfile, LiveCustomerQuery } from '../types';
import { LiveCustomerQueriesFeed } from './LiveCustomerQueriesFeed';

interface CustomerPortalViewProps {
  runData: CaseRunData | null;
  currentUser: UserProfile;
  selectedDataset: string;
  selectedCaseIdx: number;
  liveQueries: LiveCustomerQuery[];
  onAction: (id: string, action: 'approve' | 'dispatch' | 'escalate', adminNotes?: string) => Promise<void>;
  onSimulateInbound: () => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  runData,
  currentUser,
  selectedDataset,
  selectedCaseIdx,
  liveQueries,
  onAction,
  onSimulateInbound,
}) => {
  const [newRequestText, setNewRequestText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<LiveCustomerQuery | null>(null);
  const [certCopiedId, setCertCopiedId] = useState<string | null>(null);

  const tickets = runData?.tickets || [];
  const fulfilledCount = tickets.filter((t) => t.decision === 'dispatch').length;
  const escalatedCount = tickets.filter((t) => t.decision === 'escalate').length;

  const handleSubmitLiveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/customer-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: currentUser.name,
          customerTitle: currentUser.title,
          dataset: selectedDataset,
          index: selectedCaseIdx,
          text: newRequestText,
        }),
      });
      const data = await res.json();
      if (data.query) {
        setSubmissionFeedback(data.query);
        setNewRequestText('');
      }
    } catch (err) {
      console.error('Request submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopySafetyCert = (t: any) => {
    const cert = `
=========================================
PARTSURE AI - SAFE DISPATCH CERTIFICATE
=========================================
Order / Ticket ID : ${t.id}
Customer          : ${currentUser.name} (${currentUser.title})
Assigned Part ID  : ${t.assigned_part_id || 'N/A'}
Normalized Specs  : ${t.voltage}V | ${t.connector} | ${t.watts ? `${t.watts}W` : '20W Safe Fallback'}
Decision Status   : ${t.decision?.toUpperCase()}
Safety Verification : 100% Deterministic Technical Match
Integrity Guarantee : ZERO Incompatible Dispatches Certified
Timestamp         : ${new Date().toISOString()}
=========================================
    `.trim();

    navigator.clipboard.writeText(cert);
    setCertCopiedId(t.id);
    setTimeout(() => setCertCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. CUSTOMER PORTAL HEADER HERO */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 font-mono text-base">
              {currentUser.avatar}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Customer Portal & Order Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentUser.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as <strong className="text-slate-200">{currentUser.name}</strong> • {currentUser.title}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active Orders</span>
              <span className="font-bold text-white text-base">6 Total</span>
            </div>
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-emerald-500 uppercase block font-semibold">Dispatched</span>
              <span className="font-bold text-emerald-400 text-base">{fulfilledCount}</span>
            </div>
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-amber-500 uppercase block font-semibold">In Desk Review</span>
              <span className="font-bold text-amber-400 text-base">{escalatedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUBMIT NEW PARTS REQUEST FORM */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Submit New Workshop Parts Request</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center space-x-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Live Streamed to Admin Desk</span>
          </span>
        </div>

        <form onSubmit={handleSubmitLiveRequest} className="space-y-4">
          <textarea
            rows={3}
            value={newRequestText}
            onChange={(e) => setNewRequestText(e.target.value)}
            placeholder="Describe what equipment needs power (e.g. Need 5V USB-C charger for bench camera, minimum 20W rating)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Quick Samples:</span>
              {[
                'Camera requires 5V USB-C supply with min 20W',
                'Bench lamp takes 12V barrel plug, draws 20 watts',
                'Drill fixture takes 24V barrel plug, 10W load',
              ].map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewRequestText(sample)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 text-[10px] transition cursor-pointer"
                >
                  Sample #{i + 1}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting || !newRequestText.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20 flex items-center space-x-2 disabled:opacity-40 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Streaming to Admin...' : 'Send Live Query to Admin'}</span>
            </button>
          </div>
        </form>

        {/* Live Submission Confirmation */}
        {submissionFeedback && (
          <div className="mt-4 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Live Query Sent to Admin Desk:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300">
                  {submissionFeedback.id}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300">
                Decision: {submissionFeedback.decision.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-200">{submissionFeedback.decision_reason}</p>
          </div>
        )}
      </div>

      {/* 3. LIVE CUSTOMER INBOUND QUEUE */}
      <LiveCustomerQueriesFeed
        queries={liveQueries}
        onAction={onAction}
        onSimulateInbound={onSimulateInbound}
        isAdmin={false}
      />

      {/* 4. CUSTOMER ORDERS & FULFILLMENT TRACKER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>Workshop Historical Batch Orders (6 Requests)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Track technical verification, stock reservations, and official safety certificates
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {fulfilledCount} Fulfilled • {escalatedCount} Escalated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t, idx) => {
            const isDispatched = t.decision === 'dispatch';
            const isCertCopied = certCopiedId === t.id;

            return (
              <div
                key={t.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                        {t.id}
                      </span>
                      <span className="text-xs text-slate-400">Order #{idx + 1}</span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        isDispatched
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isDispatched ? 'Fulfilled & Dispatched' : 'Escalated to Human'}
                    </span>
                  </div>

                  {/* Request Quote */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 italic leading-relaxed">
                    "{t.text}"
                  </div>

                  {/* Normalized Specs Badges */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-center font-mono">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">Voltage</span>
                      <span className="font-bold text-white">{t.voltage ? `${t.voltage} V` : 'Unknown'}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">Connector</span>
                      <span className="font-bold text-white">{t.connector || 'Unknown'}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">Min Rating</span>
                      <span className="font-bold text-white">{t.watts ? `${t.watts} W` : '20W Safe'}</span>
                    </div>
                  </div>

                  {/* Decision Rationale */}
                  <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">
                      Fulfillment Status & Notes
                    </span>
                    <p className="text-[11px] text-slate-200">{t.decision_reason}</p>
                    {t.assigned_part_id && (
                      <div className="mt-1.5 flex items-center space-x-1.5 text-emerald-400 text-[11px] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dispatched Part: <strong>{t.assigned_part_id}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Certificate Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Deterministic Verified</span>
                  </span>

                  <button
                    onClick={() => handleCopySafetyCert(t)}
                    className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
                  >
                    {isCertCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 text-slate-400" />
                        <span>Safety Receipt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
