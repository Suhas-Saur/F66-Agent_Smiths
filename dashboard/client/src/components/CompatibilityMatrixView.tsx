import { useState } from 'react';
import {
  Check,
  X,
  Star,
  Sliders,
} from 'lucide-react';
import { CaseRunData, CompatibilityRow, CandidateCheck, CatalogPart } from '../types';

interface CompatibilityMatrixViewProps {
  runData: CaseRunData | null;
}

export const CompatibilityMatrixView: React.FC<CompatibilityMatrixViewProps> = ({ runData }) => {
  const matrix = runData?.compatibility_matrix || [];
  const catalog = runData?.catalog || [];

  const [selectedCell, setSelectedCell] = useState<{
    ticketId: string;
    partId: string;
    cand: CandidateCheck;
    ticketReq: CompatibilityRow;
    part: CatalogPart;
  } | null>(null);

  if (matrix.length === 0 || catalog.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        No compatibility matrix available. Please run a case.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span>Interactive 6 × 12 Compatibility Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Full pairwise evaluation of all 6 workshop tickets against 12 catalog parts
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Assigned Dispatch</span>
          </span>
          <span className="flex items-center space-x-1.5 text-teal-400">
            <Check className="w-3.5 h-3.5" />
            <span>Compatible</span>
          </span>
          <span className="flex items-center space-x-1.5 text-rose-400">
            <X className="w-3.5 h-3.5" />
            <span>Incompatible</span>
          </span>
          <span className="text-slate-500 text-[10px] pl-2 border-l border-slate-800">
            Click any cell to inspect
          </span>
        </div>
      </div>

      {/* 2D Matrix Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            {/* Table Header: Parts Columns */}
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider min-w-[140px] sticky left-0 bg-slate-900 z-10">
                  Request Ticket
                </th>
                {catalog.map((part) => (
                  <th key={part.id} className="py-3 px-2 font-mono text-[10px] min-w-[76px] border-l border-slate-800/80">
                    <span className="text-blue-400 font-bold block">{part.id.slice(0, 7)}</span>
                    <span className="text-slate-400 block font-normal">{part.voltage}V {part.connector}</span>
                    <span className="text-slate-500 block font-normal">{part.watts}W • {part.snapshot_age}</span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: 6 Tickets Rows */}
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {matrix.map((row) => {
                const assignedPartId = row.assigned_part_id;

                return (
                  <tr key={row.ticket_id} className="hover:bg-slate-900/40 transition">
                    {/* Row Header (Ticket Info) */}
                    <td className="py-3 px-4 text-left font-sans sticky left-0 bg-slate-950 hover:bg-slate-900/60 z-10 border-r border-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-blue-400 font-bold text-xs">{row.ticket_id}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            row.decision === 'dispatch'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {row.decision}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {row.req_v}V • {row.req_c} • {row.req_w ? `${row.req_w}W` : '20W safe'}
                      </div>
                    </td>

                    {/* Matrix Cells */}
                    {catalog.map((part) => {
                      const cand = row.candidates.find((c) => c.part_id === part.id);
                      if (!cand) return <td key={part.id} className="py-2 px-1">-</td>;

                      const isAssigned = assignedPartId === part.id;
                      const isCompat = cand.compatible;

                      let cellBg = 'bg-slate-950 hover:bg-slate-900';

                      if (isAssigned) {
                        cellBg = 'bg-emerald-500/20 hover:bg-emerald-500/30 font-bold';
                      } else if (isCompat) {
                        cellBg = 'bg-teal-500/10 hover:bg-teal-500/20';
                      } else {
                        cellBg = 'hover:bg-rose-500/5';
                      }

                      return (
                        <td
                          key={part.id}
                          onClick={() =>
                            setSelectedCell({
                              ticketId: row.ticket_id,
                              partId: part.id,
                              cand,
                              ticketReq: row,
                              part,
                            })
                          }
                          className={`py-3 px-2 border-l border-slate-800/60 cursor-pointer transition select-none ${cellBg}`}
                          title={`Click to inspect ${row.ticket_id} vs ${part.id}`}
                        >
                          <div className="flex items-center justify-center">
                            {isAssigned ? (
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-sm">
                                <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                              </div>
                            ) : isCompat ? (
                              <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 flex items-center justify-center text-slate-600">
                                <X className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Modal / Inspector */}
      {selectedCell && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                {selectedCell.ticketId}
              </span>
              <span className="text-slate-500 font-mono text-xs">vs</span>
              <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {selectedCell.partId}
              </span>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Gate 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                1. Voltage Match
              </span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-300">Req: {selectedCell.ticketReq.req_v}V</span>
                <span className="text-slate-300">Part: {selectedCell.part.voltage}V</span>
              </div>
              <div className="mt-2">
                {selectedCell.cand.v_match ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Exact Match</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center space-x-1">
                    <X className="w-3.5 h-3.5" />
                    <span>Mismatch</span>
                  </span>
                )}
              </div>
            </div>

            {/* Gate 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                2. Connector Tip
              </span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-300">Req: {selectedCell.ticketReq.req_c}</span>
                <span className="text-slate-300">Part: {selectedCell.part.connector}</span>
              </div>
              <div className="mt-2">
                {selectedCell.cand.c_match ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Exact Match</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center space-x-1">
                    <X className="w-3.5 h-3.5" />
                    <span>Mismatch</span>
                  </span>
                )}
              </div>
            </div>

            {/* Gate 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                3. Wattage Rating
              </span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-300">Req: {selectedCell.ticketReq.req_w || '20 (safe)'}W</span>
                <span className="text-slate-300">Part: {selectedCell.part.watts}W</span>
              </div>
              <div className="mt-2">
                {selectedCell.cand.w_match ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Sufficient (≥ min)</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center space-x-1">
                    <X className="w-3.5 h-3.5" />
                    <span>Insufficient</span>
                  </span>
                )}
              </div>
            </div>

            {/* Gate 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                4. Inventory Status
              </span>
              <div className="font-mono text-slate-300">
                {selectedCell.part.snapshot_age} snapshot
              </div>
              <div className="mt-2">
                {selectedCell.part.stock_known ? (
                  selectedCell.part.stock && selectedCell.part.stock > 0 ? (
                    <span className="text-emerald-400 font-semibold">
                      In Stock ({selectedCell.part.stock})
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold">Out of Stock (0)</span>
                  )
                ) : (
                  <span className="text-slate-400">Desk Snapshot (Available)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
