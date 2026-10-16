import React from 'react';
import { ActiveTab } from '../types/cleantech';
import { Activity, BarChart3, Coins, Globe2, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

interface HeroBannerProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ activeTab, setActiveTab }) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-slate-900/40">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Value proposition */}
          <div className="lg:col-span-7 space-y-5">
            {/* Unboxed metadata kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
              <span className="flex items-center gap-1 text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
                Tiruchirappalli, Tamil Nadu
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>TANGEDCO Regional Grid</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Cauvery Delta Clean Tech</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
              Lead the Green Revolution in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-teal-400">Tiruchirappalli</span> & Tamil Nadu.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              Step into the regional control room of Tamil Nadu&apos;s energy capital. Balance Cauvery floatovoltaics, Muppandal wind infeed, and BHEL green hydrogen peakers. Build venture-scale climate startups and trade Indian Carbon Credits (BEE CCTS).
            </p>

            {/* Quick launch interactive segmented selector */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">Hubs:</span>
              <button
                onClick={() => setActiveTab('gridmaster')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'gridmaster'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>TANGEDCO Dispatch Sim</span>
              </button>

              <button
                onClick={() => setActiveTab('tycoon')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'tycoon'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Trichy Venture Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'calculator'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>BHEL & Delta Decarb ROI</span>
              </button>

              <button
                onClick={() => setActiveTab('carbonex')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'carbonex'
                    ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Indian Carbon Exchange</span>
              </button>

              <button
                onClick={() => setActiveTab('academy')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'academy'
                    ? 'bg-violet-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NIT Trichy Academy</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual with fallbacks */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800/50">
              <img
                src="/src/assets/images/trichy_cleantech_microgrid_1792136751321.jpg"
                alt="Tiruchirappalli Green Technology Hub and Cauvery River Floating Solar Arrays"
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-72 lg:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-80 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950';
                    fallback.innerHTML = '<span class="text-amber-400 text-sm font-semibold">Tiruchirappalli Green Tech Hub</span><p class="text-xs text-slate-400 mt-1">Cauvery River Floating Solar · BHEL Green Hydrogen</p>';
                    parent.appendChild(fallback);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Trichy Clean Energy Corridor
                </span>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">Cauvery River Microgrid</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Proof & Metric Strip below Hero */}
        <div className="mt-8 pt-8 border-t border-slate-800/70 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400">Tamil Nadu Solar LCOE</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-1">₹2.45 <span className="text-xs text-emerald-400 font-sans font-medium">/ unit</span></div>
            <div className="text-xs text-slate-400 mt-0.5">Beats thermal coal tariffs</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Indian Carbon Price (CCTS)</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-1">₹1,920 <span className="text-xs text-amber-400 font-sans font-medium">/ tCO2e</span></div>
            <div className="text-xs text-slate-400 mt-0.5">BEE PAT verified credits</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">TANGEDCO Evening Peak</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-1">₹8.50 <span className="text-xs text-cyan-400 font-sans font-medium">/ unit spread</span></div>
            <div className="text-xs text-slate-400 mt-0.5">Trichy BESS arbitrage</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Trichy Climate Portfolio</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-1">₹500+ Cr <span className="text-xs text-violet-400 font-sans font-medium">Valuation</span></div>
            <div className="text-xs text-slate-400 mt-0.5">BHEL & NITT innovation pipeline</div>
          </div>
        </div>
      </div>
    </section>
  );
};
