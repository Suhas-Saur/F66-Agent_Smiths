import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '←', desc: 'Navigate to Previous Case' },
    { key: '→', desc: 'Navigate to Next Case' },
    { key: 'Space', desc: 'Run / Re-evaluate Simulation' },
    { key: '1', desc: 'Switch to Ticket Workbench' },
    { key: '2', desc: 'Switch to Performance & Policy Overview' },
    { key: '3', desc: 'Switch to Simulation Timeline Player' },
    { key: '4', desc: 'Switch to 6×12 Compatibility Matrix' },
    { key: '5', desc: 'Switch to Parts Catalogue' },
    { key: '6', desc: 'Switch to What-If Sandbox' },
    { key: '7', desc: 'Switch to Audit Trail' },
    { key: '?', desc: 'Toggle Keyboard Shortcuts Modal' },
    { key: 'Esc', desc: 'Close Modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Keyboard Navigation Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {shortcuts.map((s, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between">
              <span className="text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] font-bold text-blue-400 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-500">
          Press <kbd className="text-slate-400 font-mono">Esc</kbd> anytime to dismiss this modal
        </div>
      </div>
    </div>
  );
};
