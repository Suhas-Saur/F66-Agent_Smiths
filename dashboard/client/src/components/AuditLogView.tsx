import { useState } from 'react';
import {
  FileText,
  Search,
  Copy,
  Download,
  Check,
} from 'lucide-react';
import { CaseRunData } from '../types';

interface AuditLogViewProps {
  runData: CaseRunData | null;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ runData }) => {
  const steps = runData?.steps || [];
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [opFilter, setOpFilter] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredSteps = steps.filter((st) => {
    const term = searchTerm.toLowerCase();
    const op = st.action.op.toLowerCase();
    const entity = (st.action.part_id || st.action.ticket_id || '').toLowerCase();

    const matchesOp = opFilter === 'all' || op === opFilter;
    const matchesSearch = op.includes(term) || entity.includes(term);

    return matchesOp && matchesSearch;
  });

  const handleCopyMarkdown = () => {
    let md = `| Step | Operation | Entity | Tool Cost | Remaining Budget |\n`;
    md += `|---|---|---|---|---|\n`;
    steps.forEach((st, i) => {
      const cost = st.action.op === 'inspect' ? 1 : ['verify', 'clarify'].includes(st.action.op) ? 2 : 0;
      const entity = st.action.part_id || st.action.ticket_id || 'batch';
      md += `| ${i + 1} | ${st.action.op} | ${entity} | ${cost} | ${st.budget_remaining} |\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    let csv = `Step,Operation,Entity,ToolCost,RemainingBudget\n`;
    steps.forEach((st, i) => {
      const cost = st.action.op === 'inspect' ? 1 : ['verify', 'clarify'].includes(st.action.op) ? 2 : 0;
      const entity = st.action.part_id || st.action.ticket_id || 'batch';
      csv += `${i + 1},${st.action.op},${entity},${cost},${st.budget_remaining}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partsure_audit_case_${runData?.case_id || 'log'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Immutable Decision & Safety Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically reliable event ledger recorded for official platform verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none w-48"
            />
          </div>

          {/* Operation Filter */}
          <select
            value={opFilter}
            onChange={(e) => setOpFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-200 outline-none"
          >
            <option value="all">All Actions ({steps.length})</option>
            <option value="inspect">inspect</option>
            <option value="verify">verify</option>
            <option value="clarify">clarify</option>
            <option value="dispatch">dispatch</option>
            <option value="escalate">escalate</option>
            <option value="llm">llm</option>
          </select>

          {/* Actions */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Step #</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Tool Cost</th>
                <th className="py-3 px-4">Result / Description</th>
                <th className="py-3 px-4">Remaining Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {filteredSteps.map((st, idx) => {
                const cost = st.action.op === 'inspect' ? 1 : ['verify', 'clarify'].includes(st.action.op) ? 2 : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-4 text-slate-500 font-bold">{st.step + 1}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          st.action.op === 'dispatch'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : st.action.op === 'escalate'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : st.action.op === 'llm'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {st.action.op}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-blue-400 font-bold">
                      {st.action.part_id || st.action.ticket_id || 'batch'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-bold">
                      {cost} unit{cost === 1 ? '' : 's'}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-300 max-w-md">
                      {st.action.op === 'dispatch' && 'Recorded irreversible dispatch decision'}
                      {st.action.op === 'escalate' && 'Recorded safe human escalation handoff'}
                      {st.action.op === 'inspect' && `Inspected desk snapshot: ${st.result?.data?.available ?? 0} in stock`}
                      {st.action.op === 'verify' && `Verified warehouse stock: ${st.result?.data?.available ?? 0} in stock`}
                      {st.action.op === 'clarify' && `Customer reply: "${st.result?.data?.reply ?? ''}"`}
                      {st.action.op === 'llm' && 'Structured schema analysis completed'}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-bold">
                      {st.budget_remaining} / 14
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
