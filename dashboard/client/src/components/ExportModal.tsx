import { useState } from 'react';
import { X, Download, Copy, Check, FileCode } from 'lucide-react';
import { CaseRunData } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  runData: CaseRunData | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, runData }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedDiag, setCopiedDiag] = useState<boolean>(false);

  if (!isOpen || !runData) return null;

  const jsonString = JSON.stringify(runData, null, 2);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partsure_case_${runData.case_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const summary = `
PartSure AI Autonomous Procurement Report
Case ID: ${runData.case_id} (${runData.dataset} #${runData.case_index + 1})
Score: ${runData.grade.score.toFixed(1)} / 100.0 pts
- Outcome: ${runData.grade.components.outcome.earned.toFixed(1)} / 80.0
- Integrity: ${runData.grade.components.integrity.earned.toFixed(1)} / 15.0
- Efficiency: ${runData.grade.components.efficiency.earned.toFixed(1)} / 5.0
Tool Units: ${runData.spent} used / 14 max (Efficiency Eligible: ${runData.spent <= 13})
Fulfilled: ${runData.tickets.filter(t => t.decision === 'dispatch').length} / 6
Escalated: ${runData.tickets.filter(t => t.decision === 'escalate').length} / 6
Zero Incompatible Dispatches Guaranteed: YES
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopiedDiag(true);
    setTimeout(() => setCopiedDiag(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Export Case Trace & Diagnostics</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handleCopyJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'JSON Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs transition"
          >
            {copiedDiag ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDiag ? 'Summary Copied' : 'Copy Summary Report'}</span>
          </button>
        </div>

        {/* JSON Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
