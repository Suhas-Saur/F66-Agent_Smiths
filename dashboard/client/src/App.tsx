import { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ScoreCards } from './components/ScoreCards';
import { HomePortal } from './components/HomePortal';
import { CustomerPortalView } from './components/CustomerPortalView';
import { WorkbenchView } from './components/WorkbenchView';
import { AnalyticsChartsView } from './components/AnalyticsChartsView';
import { DatabaseIntelligenceView } from './components/DatabaseIntelligenceView';
import { OverviewView } from './components/OverviewView';
import { SimulationPlayer } from './components/SimulationPlayer';
import { CompatibilityMatrixView } from './components/CompatibilityMatrixView';
import { CatalogView } from './components/CatalogView';
import { SandboxView } from './components/SandboxView';
import { AuditLogView } from './components/AuditLogView';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ExportModal } from './components/ExportModal';
import { FlashIntroCard } from './components/FlashIntroCard';
import { AuthModal, PRESET_USERS } from './components/AuthModal';
import { TabType, CaseRunData, CaseMetaItem, UserProfile, LiveCustomerQuery } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedDataset, setSelectedDataset] = useState<string>('practice.json');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [runData, setRunData] = useState<CaseRunData | null>(null);
  const [casesList, setCasesList] = useState<Record<string, CaseMetaItem[]>>({});
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const [showFlashIntro, setShowFlashIntro] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS.admin);
  const [liveQueries, setLiveQueries] = useState<LiveCustomerQuery[]>([]);
  const [liveToastQuery, setLiveToastQuery] = useState<LiveCustomerQuery | null>(null);

  const pendingAlertCount = liveQueries.filter((q) => q.status === 'pending_approval').length;

  const handleNewInboundQuery = (query: LiveCustomerQuery) => {
    setLiveQueries((prev) => [query, ...prev.filter((q) => q.id !== query.id)]);
    setLiveToastQuery(query);
    setTimeout(() => setLiveToastQuery(null), 10000);
  };

  // Fetch available cases list on mount
  useEffect(() => {
    fetch('/api/cases')
      .then((res) => res.json())
      .then((data) => {
        setCasesList(data);
      })
      .catch((err) => console.error('Failed to load cases:', err));
  }, []);

  // Listen to Real-Time Server-Sent Events (SSE) for Live Customer Queries
  useEffect(() => {
    // Initial fetch
    fetch('/api/customer-queries')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLiveQueries(data);
      })
      .catch((err) => console.error('Failed to load live queries:', err));

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/customer-queries/stream');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (Array.isArray(parsed)) {
            setLiveQueries(parsed);
          }
        } catch (e) {
          console.error('SSE JSON parse error:', e);
        }
      };
      eventSource.onerror = () => {
        // Fallback polling if SSE drops
      };
    } catch (e) {
      console.error('SSE initialization error:', e);
    }

    // Polling fallback every 3 seconds to guarantee updates
    const pollTimer = setInterval(() => {
      fetch('/api/customer-queries')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setLiveQueries(data);
        })
        .catch(() => {});
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollTimer);
    };
  }, []);

  // Action on Live Query (Confirm Dispatch / Escalate)
  const handleQueryAction = async (id: string, action: 'approve' | 'dispatch' | 'escalate', adminNotes?: string) => {
    try {
      const res = await fetch(`/api/customer-queries/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes }),
      });
      const data = await res.json();
      if (data.query) {
        setLiveQueries((prev) => prev.map((q) => (q.id === id ? data.query : q)));
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  // Simulate an incoming live customer query
  const handleSimulateInbound = async () => {
    const samples = [
      'Need 5V USB-C power supply for inspection camera, minimum 20W rating.',
      'Emergency replacement for bench lamp: 12V barrel plug tip, draws 20 watts minimum load.',
      'Heavy duty drill stand requires 24V with barrel plug tip. Rated minimum power is 10 watts.',
      'Sensor node takes 5V USB-C supply. The load label is unreadable. Safe 20W required.',
      'Diagnostic spectrometer needs 12V barrel supply with 10W load capacity.',
    ];
    const names = ['Maya Chen', 'Marcus Brody', 'Alex Rivera', 'Devin Patel', 'Zoe Walker'];
    const chosenText = samples[Math.floor(Math.random() * samples.length)];
    const chosenName = names[Math.floor(Math.random() * names.length)];

    try {
      await fetch('/api/customer-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: chosenName,
          customerTitle: 'Workshop Field Technician',
          dataset: selectedDataset,
          index: selectedCaseIdx,
          text: chosenText,
        }),
      });
    } catch (err) {
      console.error('Simulation inbound error:', err);
    }
  };

  // Run simulation on dataset or index change
  const executeSimulation = useCallback(
    async (dataset: string, idx: number) => {
      setLoading(true);
      try {
        const res = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataset, index: idx }),
        });
        const data = await res.json();
        setRunData(data);
      } catch (err) {
        console.error('Simulation execution failed:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    executeSimulation(selectedDataset, selectedCaseIdx);
  }, [selectedDataset, selectedCaseIdx, executeSimulation]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.key === 'Escape') {
        setShortcutsOpen(false);
        setExportOpen(false);
        setAuthModalOpen(false);
        setShowFlashIntro(false);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        executeSimulation(selectedDataset, selectedCaseIdx);
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedCaseIdx > 0) {
          setSelectedCaseIdx((prev) => prev - 1);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const max = (casesList[selectedDataset]?.length || 1) - 1;
        if (selectedCaseIdx < max) {
          setSelectedCaseIdx((prev) => prev + 1);
        }
        return;
      }

      // 0-9 Tab Switcher
      const tabMap: Record<string, TabType> = {
        '1': 'home',
        '2': 'customer',
        '3': 'workbench',
        '4': 'charts',
        '5': 'database',
        '6': 'overview',
        '7': 'player',
        '8': 'matrix',
        '9': 'catalog',
        '0': 'sandbox',
        'a': 'audit',
      };

      if (tabMap[e.key]) {
        setActiveTab(tabMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDataset, selectedCaseIdx, casesList, executeSimulation]);

  return (
    <div className="min-h-screen cyber-background text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased relative overflow-x-hidden">
      {/* Ambient Lighting Glow Orbs */}
      <div className="glow-orb-blue" />
      <div className="glow-orb-purple" />
      <div className="glow-orb-teal" />

      {/* Top Enterprise Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        selectedCaseIdx={selectedCaseIdx}
        setSelectedCaseIdx={setSelectedCaseIdx}
        casesList={casesList}
        loading={loading}
        onRunSimulation={() => executeSimulation(selectedDataset, selectedCaseIdx)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onReplayIntro={() => setShowFlashIntro(true)}
        caseId={runData?.case_id}
        condition={runData?.condition}
        pendingAlertCount={pendingAlertCount}
      />

      {/* 🔴 LIVE RED NOTIFICATION BANNER / TOAST (TRIGGERED WHEN LIVE QUERY SENT) */}
      {liveToastQuery && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500 rounded-2xl p-4 shadow-2xl shadow-red-500/50 text-white space-y-3 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-red-500/40 pb-2">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-black tracking-wide text-red-300 uppercase font-mono">
                  🚨 Live Query Sent • Admin Alert
                </span>
              </div>
              <button
                onClick={() => setLiveToastQuery(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-white">
                {liveToastQuery.customerName}{' '}
                <span className="text-[10px] text-slate-400 font-normal">({liveToastQuery.customerTitle})</span>
              </p>
              <p className="text-xs text-red-200 font-mono italic mt-1 bg-black/50 p-2.5 rounded-xl border border-red-500/30">
                "{liveToastQuery.text}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-300 font-mono">
                Recommendation:{' '}
                <strong className="text-emerald-400 uppercase font-bold">{liveToastQuery.decision}</strong>{' '}
                {liveToastQuery.assigned_part_id ? `(${liveToastQuery.assigned_part_id})` : ''}
              </span>
              <button
                onClick={() => {
                  setActiveTab('workbench');
                  setLiveToastQuery(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 flex items-center space-x-1 cursor-pointer transition active:scale-95"
              >
                <span>Open Admin Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        {/* Top Score Cards Banner shown on operational tabs */}
        {activeTab !== 'home' && <ScoreCards runData={runData} loading={loading} />}

        {/* Tab Views */}
        {activeTab === 'home' && (
          <HomePortal
            runData={runData}
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReplayIntro={() => setShowFlashIntro(true)}
          />
        )}
        {activeTab === 'customer' && (
          <CustomerPortalView
            runData={runData}
            currentUser={currentUser}
            selectedDataset={selectedDataset}
            selectedCaseIdx={selectedCaseIdx}
            liveQueries={liveQueries}
            onAction={handleQueryAction}
            onSimulateInbound={handleSimulateInbound}
            onQuerySubmitted={handleNewInboundQuery}
          />
        )}
        {activeTab === 'workbench' && (
          <WorkbenchView
            runData={runData}
            liveQueries={liveQueries}
            onAction={handleQueryAction}
            onSimulateInbound={handleSimulateInbound}
          />
        )}
        {activeTab === 'charts' && <AnalyticsChartsView runData={runData} />}
        {activeTab === 'database' && (
          <DatabaseIntelligenceView
            selectedDataset={selectedDataset}
            selectedCaseIdx={selectedCaseIdx}
            onSelectCase={(ds, idx) => {
              setSelectedDataset(ds);
              setSelectedCaseIdx(idx);
              setActiveTab('charts');
            }}
          />
        )}
        {activeTab === 'overview' && <OverviewView runData={runData} />}
        {activeTab === 'player' && <SimulationPlayer runData={runData} />}
        {activeTab === 'matrix' && <CompatibilityMatrixView runData={runData} />}
        {activeTab === 'catalog' && <CatalogView catalog={runData?.catalog || []} />}
        {activeTab === 'sandbox' && (
          <SandboxView
            runData={runData}
            selectedDataset={selectedDataset}
            selectedCaseIdx={selectedCaseIdx}
          />
        )}
        {activeTab === 'audit' && <AuditLogView runData={runData} />}
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PartSure AI — Autonomous Parts Procurement Intelligence</span>
          <span className="font-mono text-[11px] text-slate-400">
            Active: {currentUser.name} ({currentUser.badge}) | Live Stream: {liveQueries.length} inbound queries
          </span>
          <button
            onClick={() => setShortcutsOpen(true)}
            className="text-[11px] text-blue-400 hover:text-blue-300 transition cursor-pointer"
          >
            Press <kbd className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">?</kbd> for shortcuts
          </button>
        </div>
      </footer>

      {/* Modals */}
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} runData={runData} />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          if (user.role === 'customer') {
            setActiveTab('customer');
          } else {
            setActiveTab('workbench');
          }
        }}
      />
      <FlashIntroCard isOpen={showFlashIntro} onDismiss={() => setShowFlashIntro(false)} />
    </div>
  );
}
