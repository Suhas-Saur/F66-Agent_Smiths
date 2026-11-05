import { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { CaseRunData } from '../types';

interface SandboxViewProps {
  runData?: CaseRunData | null;
  selectedDataset: string;
  selectedCaseIdx: number;
}

const PRESETS = [
  {
    name: '5V USB-C Camera (20W min)',
    text: 'Can you dispatch the correct supply for inspection camera? Power comes in through USB-C; its input voltage is 5. Minimum output rating is 20 W.',
  },
  {
    name: '12V Barrel Bench Lamp (20W)',
    text: 'Please prepare a supply for bench lamp. The current label says 12 V and barrel. The device draws 20 watts, so do not go below that.',
  },
  {
    name: '24V Barrel Machine (10W)',
    text: 'Need a replacement power adapter for heavy drill stand. Takes 24V with barrel plug tip. Rated minimum power is 10 watts.',
  },
  {
    name: 'Unreadable Label (Safe 20W Rule)',
    text: 'Workshop sensor unit takes 5V USB-C. The load label is unreadable. Please dispatch a safe power supply.',
  },
  {
    name: 'Milliunit Format (5000 mV & 10000 mW)',
    text: 'Handheld scanner requires 5000 mV via USB Type-C plug with power ceiling of 10000 mW.',
  },
];

export const SandboxView: React.FC<SandboxViewProps> = ({
  selectedDataset,
  selectedCaseIdx,
}) => {
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [voltage, setVoltage] = useState<string>('');
  const [connector, setConnector] = useState<string>('');
  const [watts, setWatts] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset: selectedDataset,
          index: selectedCaseIdx,
          text: inputText,
          voltage: voltage ? Number(voltage) : undefined,
          connector: connector || undefined,
          watts: watts ? Number(watts) : undefined,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Custom evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            <span>Interactive "What-If" Request Sandbox</span>
          </h2>
          <p className="text-xs text-slate-400">
            Test custom natural language workshop requests against the active catalog in real time
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Presets:</span>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(p.text);
                setVoltage('');
                setConnector('');
                setWatts('');
                setResult(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Input Controls */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Natural-Language Workshop Request
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Can you dispatch a supply for 5V USB-C camera with 20W minimum rating..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed font-sans"
            />
          </div>

          {/* Optional Overrides */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Optional Spec Overrides (Leave empty for Auto NLP)
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Voltage</label>
                <select
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                >
                  <option value="">Auto Detect</option>
                  <option value="5">5 V</option>
                  <option value="12">12 V</option>
                  <option value="24">24 V</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Connector</label>
                <select
                  value={connector}
                  onChange={(e) => setConnector(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                >
                  <option value="">Auto Detect</option>
                  <option value="USB-C">USB-C</option>
                  <option value="barrel">barrel</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Min Watts</label>
                <select
                  value={watts}
                  onChange={(e) => setWatts(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                >
                  <option value="">Auto Detect</option>
                  <option value="10">10 W</option>
                  <option value="20">20 W</option>
                </select>
              </div>
            </div>
          </div>

          {/* Evaluate Action Button */}
          <button
            onClick={handleEvaluate}
            disabled={evaluating || !inputText.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{evaluating ? 'Evaluating Safety Gates...' : 'Simulate Decision'}</span>
          </button>
        </div>

        {/* Right Column (7 Cols): Results & Candidate Breakdown */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          {!result ? (
            <div className="py-16 text-center space-y-3 text-slate-500">
              <FlaskConical className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs">
                Click <strong>"Simulate Decision"</strong> to parse the request and evaluate it against the active catalog.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Decision Outcome Header */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  result.decision === 'dispatch'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result.decision === 'dispatch' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Simulated Autonomous Action
                    </span>
                    <span className={`text-sm font-bold uppercase ${
                      result.decision === 'dispatch' ? 'text-emerald-300' : 'text-amber-300'
                    }`}>
                      {result.decision === 'dispatch'
                        ? `Dispatch Part: ${result.assigned_part_id}`
                        : 'Safe Handoff (Escalated to Human Desk)'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {result.extracted.safe_20w_applied ? '20W Safe Fallback' : 'Exact Specs'}
                </span>
              </div>

              {/* Rationale explanation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Rationale</span>
                {result.decision_reason}
              </div>

              {/* Parsed Specs Pills */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Voltage</span>
                  <span className="text-white font-mono font-bold mt-1 block">
                    {result.extracted.voltage ? `${result.extracted.voltage} V` : 'Missing'}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Connector</span>
                  <span className="text-white font-mono font-bold mt-1 block">
                    {result.extracted.connector || 'Missing'}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Wattage</span>
                  <span className="text-white font-mono font-bold mt-1 block">
                    {result.extracted.watts ? `${result.extracted.watts} W` : '20 W (Safe)'}
                  </span>
                </div>
              </div>

              {/* Matching Parts List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Eligible Candidates in Current Catalog
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {result.candidates
                    .filter((c: any) => c.compatible)
                    .map((c: any) => (
                      <div
                        key={c.part_id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          result.assigned_part_id === c.part_id
                            ? 'bg-emerald-500/15 border-emerald-500/40 font-bold'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-blue-400">{c.part_id}</span>
                          <span className="text-slate-300 font-sans">
                            {c.voltage}V • {c.connector} • {c.watts}W
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c.snapshot_age}
                        </span>
                      </div>
                    ))}
                  {result.candidates.filter((c: any) => c.compatible).length === 0 && (
                    <p className="text-xs text-amber-400 italic py-2">
                      No candidate parts in catalogue satisfy all technical requirements. Safe escalation warranted.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
