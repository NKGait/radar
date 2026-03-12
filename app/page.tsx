'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Activity, ShieldAlert, RefreshCw, Database, Radio, Search, ShieldCheck, ExternalLink, Clock } from 'lucide-react';

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
}

interface Alert {
  id: string;
  timestamp: string;
  source: string;
  title: string;
  link: string;
  keyword: string;
  severity: 'high' | 'medium' | 'low';
}

const KEYWORDS = ['Σαμαράς', 'εκλογές'];

export default function PoliticalRadar() {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ scanned: 0, found: 0 });
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('el-GR', { hour12: false });
    setLogs(prev => [...prev.slice(-49), `[${time}] ${message}`]);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const scanFeeds = async () => {
    setIsScanning(true);
    setLogs([]);
    setAlerts([]);
    setStats({ scanned: 0, found: 0 });

    addLog('=== [ΕΚΚΙΝΗΣΗ ΣΥΣΤΗΜΑΤΟΣ ΠΟΛΙΤΙΚΟΥ ΡΑΝΤΑΡ v2.0] ===');
    addLog('[*] Φόρτωση μονάδων ανάλυσης δεδομένων...');
    addLog('[*] Σύνδεση με δίκτυο RSS ελληνικών μέσων...');
    addLog(`[*] Στόχευση: ${KEYWORDS.join(', ')}`);

    try {
      addLog('[SCAN] Έναρξη σάρωσης πηγών...');
      const response = await fetch('/api/rss');
      if (!response.ok) throw new Error('Failed to fetch feeds');

      const data = await response.json();
      const items: FeedItem[] = data.items || [];

      addLog(`[INFO] Εντοπίστηκαν ${items.length} πρόσφατα άρθρα.`);
      setStats(prev => ({ ...prev, scanned: items.length }));

      let foundCount = 0;
      const newAlerts: Alert[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const textToSearch = `${item.title} ${item.contentSnippet}`.toLowerCase();

        let matchedKeyword = '';
        let severity: 'high' | 'medium' | 'low' = 'low';

        for (const keyword of KEYWORDS) {
          if (textToSearch.includes(keyword.toLowerCase())) {
            matchedKeyword = keyword;
            if (keyword === 'Σαμαράς') severity = 'high';
            else if (keyword === 'εκλογές') severity = 'medium';
            break;
          }
        }

        if (matchedKeyword) {
          foundCount++;
          const alert: Alert = {
            id: `alert-${Date.now()}-${i}`,
            timestamp: new Date(item.pubDate || Date.now()).toLocaleTimeString('el-GR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            source: item.source,
            title: item.title,
            link: item.link,
            keyword: matchedKeyword,
            severity,
          };
          newAlerts.push(alert);
          addLog(`[ALERT] Εντοπίστηκε "${matchedKeyword}" - Πηγή: ${item.source}`);
        }
      }

      setAlerts(newAlerts);
      setStats(prev => ({ ...prev, found: foundCount }));
      addLog('=== [ΣΑΡΩΣΗ ΟΛΟΚΛΗΡΩΘΗΚΕ] ===');

    } catch (error) {
      addLog(`[ERROR] Αποτυχία σάρωσης: ${error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}`);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-red-900/50 selection:text-white pb-10">
      {/* Subtle Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, transparent 70%)' }}></div>
      <div className="fixed inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 flex flex-col gap-6 sm:gap-8">

        {/* Executive Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg ${isScanning ? 'shadow-red-900/20' : ''}`}>
                <RadarIcon className={`w-6 h-6 sm:w-7 sm:h-7 text-red-500 ${isScanning ? 'animate-spin-slow' : ''}`} />
              </div>
              {isScanning && <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-2xl animate-pulse pointer-events-none"></div>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-mono text-zinc-400 tracking-widest uppercase">Executive Briefing System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Πολιτικό Ραντάρ
              </h1>
            </div>
          </div>

          <button
            onClick={scanFeeds}
            disabled={isScanning}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl font-medium text-sm transition-all duration-300 min-h-[44px] ${
              isScanning
                ? 'bg-zinc-800/50 text-zinc-400 cursor-not-allowed border border-white/5'
                : 'bg-white text-black hover:bg-zinc-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Σάρωση σε εξέλιξη...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Ανανέωση Δεδομένων
              </>
            )}
          </button>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

          {/* Left Column: Stats & Logs (Takes 4 cols on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Stats Bento */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-zinc-900/60 border border-white/5 p-4 sm:p-5 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-zinc-400 mb-2 sm:mb-3">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Σαρώθηκαν</span>
                </div>
                <div className="text-3xl sm:text-4xl font-light text-white">{stats.scanned}</div>
              </div>
              <div className="bg-zinc-900/60 border border-white/5 p-4 sm:p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-2xl rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-2 text-zinc-400 mb-2 sm:mb-3 relative z-10">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-red-400/80">Εντοπισμοί</span>
                </div>
                <div className="text-3xl sm:text-4xl font-light text-white relative z-10">{stats.found}</div>
              </div>
              <div className="col-span-2 bg-zinc-900/60 border border-white/5 p-4 sm:p-5 rounded-2xl backdrop-blur-md">
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">Ενεργοί Στόχοι</div>
                <div className="flex flex-wrap gap-2">
                  {KEYWORDS.map(k => (
                    <span key={k} className="bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/5 shadow-sm">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal / System Logs */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col overflow-hidden h-[250px] lg:h-[400px]">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-zinc-900/80">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-wider">System Logs</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] sm:text-xs leading-relaxed space-y-2 custom-scrollbar">
                {logs.map((log, i) => (
                  <div key={i} className={`${
                    log.includes('[ERROR]') ? 'text-red-400 font-medium' :
                    log.includes('[ALERT]') ? 'text-amber-400' :
                    log.includes('[SCAN]') ? 'text-blue-400' :
                    'text-zinc-500'
                  }`}>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

          </div>

          {/* Right Column: Intelligence Feed (Takes 8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
              <h2 className="text-lg sm:text-xl font-medium text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                Live Intelligence Feed
              </h2>
              <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  {isScanning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isScanning ? 'bg-red-500' : 'bg-zinc-600'}`}></span>
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-300 font-medium uppercase tracking-wider">
                  {isScanning ? 'Συγχρονισμός...' : 'Ενημερωμένο'}
                </span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {isScanning && alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
                  <RadarIcon className="w-10 h-10 animate-spin-slow opacity-40" />
                  <p className="text-sm font-medium animate-pulse">Αναζήτηση αναφορών σε πραγματικό χρόνο...</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
                  <Database className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-medium">Δεν βρέθηκαν αναφορές για τους επιλεγμένους στόχους.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {alerts.map((alert) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={alert.id}
                      className="group bg-zinc-900/60 border border-white/5 hover:border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:bg-zinc-800/60 relative overflow-hidden"
                    >
                      {/* Severity Indicator Line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        alert.severity === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                        alert.severity === 'medium' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`}></div>

                      <a href={alert.link} target="_blank" rel="noopener noreferrer" className="block pl-3 sm:pl-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                              alert.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {alert.keyword}
                            </span>
                            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5" />
                              {alert.source}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {alert.timestamp}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-medium text-zinc-100 mb-2 leading-snug group-hover:text-white transition-colors">
                          {alert.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors mt-3">
                          Προβολή πλήρους αναφοράς
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 border-t border-white/10 pt-6 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>ΕΜΠΙΣΤΕΥΤΙΚΟ // ΑΥΣΤΗΡΑ ΠΡΟΣΩΠΙΚΟ</span>
          </div>
          <div className="font-mono tracking-wider">SYS.OP.ID: 8492-A</div>
        </footer>
      </div>
    </div>
  );
}

function RadarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
      <path d="M4 6h.01" />
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
      <path d="M12 18h.01" />
      <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
      <circle cx="12" cy="12" r="2" />
      <path d="m13.41 10.59 5.66-5.66" />
    </svg>
  );
}
