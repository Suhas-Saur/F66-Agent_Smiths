import { useState } from 'react';
import {
  Boxes,
  Search,
  Info,
} from 'lucide-react';
import { CatalogPart } from '../types';

interface CatalogViewProps {
  catalog: CatalogPart[];
}

export const CatalogView: React.FC<CatalogViewProps> = ({ catalog }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [freshnessFilter, setFreshnessFilter] = useState<'all' | 'recent' | 'aged'>('all');

  const filteredParts = catalog.filter((p) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.id.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      `${p.voltage}v`.includes(term) ||
      p.connector.toLowerCase().includes(term) ||
      `${p.watts}w`.includes(term);

    // Freshness
    const matchesFreshness =
      freshnessFilter === 'all' || p.snapshot_age === freshnessFilter;

    return matchesSearch && matchesFreshness;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-blue-400" />
            <span>Workshop Parts Catalogue ({catalog.length} Components)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Fixed technical specifications with desk snapshots and authoritative warehouse verification
          </p>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search parts by ID, spec, connector..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none w-56"
            />
          </div>

          {/* Freshness Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setFreshnessFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                freshnessFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFreshnessFilter('recent')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                freshnessFilter === 'recent' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Recent (6)
            </button>
            <button
              onClick={() => setFreshnessFilter('aged')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                freshnessFilter === 'aged' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Aged (6)
            </button>
          </div>
        </div>
      </div>

      {/* Explanatory Callout Banner for Snapshot Strategy */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3 text-xs">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300">
          <span className="font-semibold text-white block">
            Snapshot Synchronization & Divergence Policy:
          </span>
          <p>
            The workshop holds 6 <strong>Recent Snapshots</strong> (synchronized at batch open, safe to inspect for 1 tool unit) and 6 <strong>Aged Snapshots</strong> (where exactly 2 disagree with warehouse truth). For aged parts, PartSure AI intelligently calls <code>verify</code> (cost 2) before any dispatch to guarantee zero unavailable dispatches!
          </p>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Part ID</th>
                <th className="py-3 px-4">Technical Description</th>
                <th className="py-3 px-4">Voltage</th>
                <th className="py-3 px-4">Connector</th>
                <th className="py-3 px-4">Wattage</th>
                <th className="py-3 px-4">Snapshot Age</th>
                <th className="py-3 px-4">Inventory Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredParts.map((p) => {
                const isRecent = p.snapshot_age === 'recent';
                const isVerified = p.stock_known;

                return (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-bold text-blue-400">{p.id}</td>
                    <td className="py-3 px-4 font-sans text-slate-300 max-w-sm">{p.description}</td>
                    <td className="py-3 px-4 text-white font-medium">{p.voltage} V</td>
                    <td className="py-3 px-4 text-white font-medium">{p.connector}</td>
                    <td className="py-3 px-4 text-white font-medium">{p.watts} W</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          isRecent
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {p.snapshot_age}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {isVerified ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                            p.stock && p.stock > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {p.source === 'warehouse' ? 'Verified Warehouse' : 'Inspected Desk'}: {p.stock ?? 0} in stock
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Uninspected Snapshot</span>
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
  );
};
