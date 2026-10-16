import React, { useState, useEffect } from 'react';
import { ActiveTab } from './types/cleantech';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { GridMasterGame } from './components/games/GridMasterGame';
import { CleanVentureTycoon } from './components/games/CleanVentureTycoon';
import { EcoDecarbCalculator } from './components/tools/EcoDecarbCalculator';
import { CarbonExExchange } from './components/tools/CarbonExExchange';
import { GreenTechAcademy } from './components/academy/GreenTechAcademy';
import { testConnection } from './lib/firebase';
import { Activity, Briefcase, Calculator, Globe2, Award, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('gridmaster');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // Validate Firestore connection on boot
    testConnection();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLaunchDispatch = () => {
    setActiveTab('gridmaster');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black pb-16 md:pb-0">
      {/* Offline state banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline mode active. PWA cached data and simulations remain fully operational.</span>
        </div>
      )}

      {/* Top Bar Navigation conforming to the 3-Zone Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickPlay={handleLaunchDispatch}
      />

      {/* Hero Banner with clean visual assets & quantitative proof points */}
      <HeroBanner activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Interactive Stage Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'gridmaster' && <GridMasterGame />}
        {activeTab === 'tycoon' && <CleanVentureTycoon />}
        {activeTab === 'calculator' && <EcoDecarbCalculator />}
        {activeTab === 'carbonex' && <CarbonExExchange />}
        {activeTab === 'academy' && <GreenTechAcademy />}
      </main>

      {/* Clean Formal Editorial Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 text-xs text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" />
            <span className="font-bold text-white tracking-tight">VerdantX</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tiruchirappalli Edition
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>TANGEDCO Regional Grid & BHEL CleanTech Ecosystem</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Tiruchirappalli, Tamil Nadu, India</span>
            <span aria-hidden="true">·</span>
            <span>Google Cloud Sync</span>
            <span aria-hidden="true">·</span>
            <span>Aligned with BEE CCTS, CEA & TNERC Standards</span>
          </div>
        </div>
      </footer>

      {/* Mobile App Bottom Navigation Bar for Native-App Experience */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('gridmaster')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'gridmaster' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('tycoon')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'tycoon' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Tycoon</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'calculator' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Decarb</span>
        </button>

        <button
          onClick={() => setActiveTab('carbonex')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'carbonex' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Carbon</span>
        </button>

        <button
          onClick={() => setActiveTab('academy')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'academy' ? 'text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Academy</span>
        </button>
      </div>
    </div>
  );
}
