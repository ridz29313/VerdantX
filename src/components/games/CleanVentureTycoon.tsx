import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Briefcase, TrendingUp, DollarSign, Award, ShieldCheck, Zap, 
  ArrowRight, Sparkles, Building2, Flame, Wind, Sun, Waves, 
  Leaf, RotateCcw, ChevronRight, FileText, CheckCircle2, 
  Bot, Loader2, AlertTriangle, X, MapPin
} from 'lucide-react';
import { INITIAL_STARTUPS } from '../../data/cleantechData';
import { VentureStartup } from '../../types/cleantech';

interface AIDueDiligenceReport {
  viabilityScore: number;
  executiveVerdict: string;
  thermodynamicRealityCheck: string;
  economicMoat: string;
  criticalRisks: string[];
  recommendedInvestmentStage: string;
  suggestedSyndicatePartners: string[];
}

export const CleanVentureTycoon: React.FC = () => {
  const [startups, setStartups] = useState<VentureStartup[]>(INITIAL_STARTUPS);
  const [selectedStartupId, setSelectedStartupId] = useState<string>(INITIAL_STARTUPS[0].id);
  const [quarter, setQuarter] = useState<number>(1);
  const [fundCashM, setFundCashM] = useState<number>(85.0); // ₹85 Crores starting fund
  const [totalAbatedTons, setTotalAbatedTons] = useState<number>(24500);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [log, setLog] = useState<{ quarter: number; message: string; type: 'neutral' | 'success' | 'alert' }[]>([
    { quarter: 1, message: 'Cauvery Climate Venture Fund established in Tiruchirappalli with ₹85.0 Cr seed capital.', type: 'neutral' }
  ]);

  const [aiReport, setAiReport] = useState<AIDueDiligenceReport | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);

  const selectedStartup = startups.find(s => s.id === selectedStartupId) || startups[0];

  const handleRunAIDueDiligence = async () => {
    setIsAuditing(true);
    setAuditError(null);
    setShowAIModal(true);
    try {
      const res = await fetch('/api/gemini/evaluate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName: `${selectedStartup.name} (Tiruchirappalli, Tamil Nadu)`,
          sector: selectedStartup.sector,
          description: selectedStartup.description,
          targetLCOE: `₹${selectedStartup.targetLCOE}`,
          targetTRL: selectedStartup.trl,
          targetAbatement: selectedStartup.carbonAbatementRate,
        }),
      });

      if (!res.ok) {
        throw new Error('AI due diligence evaluation service temporarily unavailable.');
      }

      const data = await res.json();
      setAiReport(data);
    } catch (err: any) {
      setAuditError(err.message || 'Failed to complete AI due diligence.');
    } finally {
      setIsAuditing(false);
    }
  };

  // Advance quarter turn
  const handleNextQuarter = () => {
    if (quarter >= 20) {
      setGameFinished(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      return;
    }

    const nextQ = quarter + 1;

    // Macro economy event every 4 quarters
    const macroEvents = [
      { text: 'National Green Hydrogen Mission approves ₹15 Cr production-linked incentive for Trichy manufacturing clusters!', impact: 'grant' },
      { text: 'BEE Indian Carbon Credit (CCTS) price surges to ₹2,400/tCO2e across power exchanges!', impact: 'carbon' },
      { text: 'TANGEDCO mandates 25% solar agrivoltaics integration for Cauvery delta feeders.', impact: 'solar' },
      { text: 'Tamil Nadu EV Policy 2.0 unlocks 30% capital subsidy for Sodium-Ion battery production in Tiruchirappalli.', impact: 'grant' },
    ];

    let fundDelta = 0;
    let quarterAbatement = 0;

    const updatedStartups = startups.map(s => {
      const rev = s.unitsDeployed * 3.5 * (s.trl / 5);
      const ebitda = rev - (s.unitsDeployed * 1.2) - 1.5;
      quarterAbatement += s.unitsDeployed * (s.carbonAbatementRate / 4);
      const valuation = Math.max(80, Math.round(rev * 8 + s.patents * 15 + s.trl * 25));

      return {
        ...s,
        revenueAnnual: parseFloat(rev.toFixed(1)),
        ebitda: parseFloat(ebitda.toFixed(1)),
        marketCap: valuation,
      };
    });

    const totalRev = updatedStartups.reduce((acc, s) => acc + s.revenueAnnual, 0);
    fundDelta += totalRev * 0.15;

    let eventLog = null;
    if (nextQ % 4 === 0) {
      const ev = macroEvents[Math.floor(Math.random() * macroEvents.length)];
      if (ev.impact === 'grant') fundDelta += 15.0;
      eventLog = { quarter: nextQ, message: ev.text, type: 'alert' as const };
    }

    setQuarter(nextQ);
    setFundCashM(prev => Math.max(1.0, parseFloat((prev + fundDelta - 1.5).toFixed(1))));
    setTotalAbatedTons(prev => Math.round(prev + quarterAbatement));
    setStartups(updatedStartups);

    const newLogs = [...log];
    if (eventLog) newLogs.unshift(eventLog);
    newLogs.unshift({
      quarter: nextQ,
      message: `Quarter ${nextQ} completed. Portfolio generated ₹${(totalRev * 0.15).toFixed(1)} Cr in clean tech earnings.`,
      type: 'neutral'
    });
    setLog(newLogs.slice(0, 8));

    if (nextQ >= 20) {
      setGameFinished(true);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  };

  // Action 1: Invest in R&D
  const handleInvestRD = () => {
    const cost = 12.0; // ₹12 Cr
    if (fundCashM < cost) {
      alert('Insufficient fund cash! Need ₹12.0 Cr.');
      return;
    }

    setFundCashM(prev => parseFloat((prev - cost).toFixed(1)));

    setStartups(prev => prev.map(s => {
      if (s.id === selectedStartupId) {
        const nextTrl = Math.min(9, s.trl + 1);
        const newLCOE = Math.max(s.targetLCOE, parseFloat((s.currentLCOE * 0.86).toFixed(2)));
        return {
          ...s,
          trl: nextTrl,
          currentLCOE: newLCOE,
          patents: s.patents + 1,
        };
      }
      return s;
    }));

    setLog(prev => [
      {
        quarter,
        message: `Injected ₹${cost} Cr R&D into ${selectedStartup.name} (NIT Trichy Labs). TRL advanced to ${Math.min(9, selectedStartup.trl + 1)}. Cost reduced to ₹${Math.max(selectedStartup.targetLCOE, parseFloat((selectedStartup.currentLCOE * 0.86).toFixed(2)))}.`,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Action 2: Construct Commercial Site
  const handleDeployUnit = () => {
    const cost = 18.0; // ₹18 Cr
    if (fundCashM < cost) {
      alert('Insufficient fund cash! Need ₹18.0 Cr to commission operational unit in Trichy.');
      return;
    }

    setFundCashM(prev => parseFloat((prev - cost).toFixed(1)));

    setStartups(prev => prev.map(s => {
      if (s.id === selectedStartupId) {
        const newUnits = s.unitsDeployed + 1;
        return {
          ...s,
          unitsDeployed: newUnits,
          marketCap: s.marketCap + 45,
          revenueAnnual: parseFloat((s.revenueAnnual + 8.5).toFixed(1)),
        };
      }
      return s;
    }));

    setLog(prev => [
      {
        quarter,
        message: `Commissioned operational site for ${selectedStartup.name} in Cauvery Industrial Corridor. Revenue expanded +₹8.5 Cr/yr.`,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Action 3: Sell Verified Carbon Credits
  const handleSellCarbonCredits = () => {
    if (selectedStartup.unitsDeployed === 0) {
      alert('Must have at least 1 commercial unit deployed to mint verified carbon removal credits!');
      return;
    }

    const creditsSoldTons = selectedStartup.unitsDeployed * (selectedStartup.carbonAbatementRate / 2);
    const revenueCr = parseFloat(((creditsSoldTons * 1920) / 10000000).toFixed(2)); // ₹1,920/t to Cr

    setFundCashM(prev => parseFloat((prev + revenueCr).toFixed(1)));

    setLog(prev => [
      {
        quarter,
        message: `Minted & traded ${Math.round(creditsSoldTons).toLocaleString()} BEE CCTS carbon credits for ${selectedStartup.name} at ₹1,920/ton. +₹${revenueCr} Cr cash realized.`,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Action 4: Syndicate Series Round
  const handleSyndicateRound = () => {
    const fundingCr = 35.0; // ₹35 Cr
    setFundCashM(prev => parseFloat((prev + fundingCr).toFixed(1)));

    setStartups(prev => prev.map(s => {
      if (s.id === selectedStartupId) {
        return {
          ...s,
          marketCap: s.marketCap + 90,
        };
      }
      return s;
    }));

    setLog(prev => [
      {
        quarter,
        message: `Syndicated ₹35.0 Cr Series B equity round for ${selectedStartup.name} with Indian climate funds and Tamil Nadu green venture partners!`,
        type: 'success'
      },
      ...prev
    ]);
  };

  const handleRestart = () => {
    setStartups(INITIAL_STARTUPS);
    setSelectedStartupId(INITIAL_STARTUPS[0].id);
    setQuarter(1);
    setFundCashM(85.0);
    setTotalAbatedTons(24500);
    setGameFinished(false);
    setLog([
      { quarter: 1, message: 'Trichy Climate Venture Fund rebooted with ₹85.0 Cr seed capital.', type: 'neutral' }
    ]);
  };

  const totalPortfolioValuation = startups.reduce((acc, s) => acc + s.marketCap, 0);
  const isUnicorn = totalPortfolioValuation >= 2500; // ₹2,500 Cr

  return (
    <div className="space-y-6">
      {/* Portfolio Command Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wide">
              <MapPin className="w-4 h-4" />
              <span>Tiruchirappalli Clean Venture Studio</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Cauvery Delta Capital</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Tamil Nadu Climate Tech Incubator</h3>
          </div>

          {/* Core fund metrics */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <div className="text-xs text-slate-400">Quarter Timeline</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                Q{quarter} <span className="text-xs text-slate-500 font-sans font-normal">/ 20</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Available Fund Cash</div>
              <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                ₹{fundCashM.toFixed(1)} Cr
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Total Portfolio Valuation</div>
              <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                ₹{totalPortfolioValuation} Cr
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Lifetime Carbon Abated</div>
              <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                {totalAbatedTons.toLocaleString()} <span className="text-xs text-slate-500 font-sans">tCO2e</span>
              </div>
            </div>

            <button
              onClick={handleNextQuarter}
              disabled={gameFinished}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                gameFinished
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95'
              }`}
            >
              <span>Advance Quarter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Startup Selector & Venture Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 6 DeepTech Startup Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Trichy Frontier Startups ({startups.length})
            </span>
            <span className="text-xs text-slate-500">Select to manage</span>
          </div>

          <div className="space-y-2.5">
            {startups.map(s => {
              const isSelected = s.id === selectedStartupId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStartupId(s.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">{s.sector}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-xs font-mono font-medium text-amber-400">TRL {s.trl}/9</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{s.name}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Valuation</span>
                      <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                        ₹{s.marketCap} Cr
                      </div>
                    </div>
                  </div>

                  {/* Micro stats strip */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                    <span>Target Cost: <strong className="text-slate-200 font-mono">₹{s.currentLCOE}</strong></span>
                    <span>Units: <strong className="text-slate-200 font-mono">{s.unitsDeployed}</strong></span>
                    <span>Revenue: <strong className="text-emerald-400 font-mono">₹{s.revenueAnnual} Cr/yr</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: DeepTech Workbench & Capital Allocation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Startup Detail Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-medium text-amber-400">{selectedStartup.sector}</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedStartup.name}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{selectedStartup.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAIDueDiligence}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Gemini AI Audit</span>
                </button>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 shrink-0 text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Valuation</span>
                  <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                    ₹{selectedStartup.marketCap} Cr
                  </div>
                </div>
              </div>
            </div>

            {/* TRL Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Technology Readiness Level (NASA / DST Scale):</span>
                <span className="font-mono text-amber-400 font-bold">TRL {selectedStartup.trl} of 9</span>
              </div>

              <div className="grid grid-cols-9 gap-1.5 h-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                  <div
                    key={lvl}
                    className={`rounded-xs transition-colors ${
                      lvl <= selectedStartup.trl ? 'bg-amber-400' : 'bg-slate-800'
                    }`}
                    title={`TRL ${lvl}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                <span>TRL 1: NIT Trichy Lab</span>
                <span>TRL 5: BHEL Industrial Pilot</span>
                <span>TRL 9: Commercial Deployment</span>
              </div>
            </div>

            {/* Key Techno-Economic Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Unit Cost</span>
                <div className="text-base font-bold font-mono text-white tabular-nums mt-0.5">
                  ₹{selectedStartup.currentLCOE}
                </div>
                <span className="text-[10px] text-slate-500">Target: ₹{selectedStartup.targetLCOE}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Deployed Sites</span>
                <div className="text-base font-bold font-mono text-cyan-400 tabular-nums mt-0.5">
                  {selectedStartup.unitsDeployed} Active
                </div>
                <span className="text-[10px] text-slate-500">Operational units</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Annual Revenue</span>
                <div className="text-base font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  ₹{selectedStartup.revenueAnnual} Cr
                </div>
                <span className="text-[10px] text-slate-500">EBITDA: ₹{selectedStartup.ebitda} Cr</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Indian Patents</span>
                <div className="text-base font-bold font-mono text-violet-400 tabular-nums mt-0.5">
                  {selectedStartup.patents} Filed
                </div>
                <span className="text-[10px] text-slate-500">IP defensibility</span>
              </div>
            </div>

            {/* Strategic Venture Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Executive Capital Allocations:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleInvestRD}
                  disabled={selectedStartup.trl >= 9 || fundCashM < 12.0}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedStartup.trl >= 9
                      ? 'bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed'
                      : fundCashM >= 12.0
                      ? 'bg-slate-950 border-slate-800 hover:border-amber-400 text-slate-200 hover:text-white cursor-pointer'
                      : 'bg-slate-950 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Fund R&D at NIT Trichy Labs</span>
                    <span className="font-mono text-amber-400">₹12.0 Cr</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedStartup.trl >= 9 ? 'Maximum TRL 9 achieved' : 'Advance TRL +1, reduce cost by 14%, file 1 Indian patent.'}
                  </p>
                </button>

                <button
                  onClick={handleDeployUnit}
                  disabled={fundCashM < 18.0}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    fundCashM >= 18.0
                      ? 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-200 hover:text-white cursor-pointer'
                      : 'bg-slate-950 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Commission Commercial Site</span>
                    <span className="font-mono text-cyan-400">₹18.0 Cr</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Build operational facility in Cauvery Industrial Corridor (+₹8.5 Cr/yr run rate).
                  </p>
                </button>

                <button
                  onClick={handleSellCarbonCredits}
                  disabled={selectedStartup.unitsDeployed === 0}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedStartup.unitsDeployed > 0
                      ? 'bg-slate-950 border-slate-800 hover:border-emerald-400 text-slate-200 hover:text-white cursor-pointer'
                      : 'bg-slate-950 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Trade BEE CCTS Carbon Credits</span>
                    <span className="font-mono text-emerald-400">Liquid Cash</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Monetize verified avoided CO2 on IEX at ₹1,920/tCO2e.
                  </p>
                </button>

                <button
                  onClick={handleSyndicateRound}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-violet-400 text-slate-200 hover:text-white transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Syndicate Institutional Round</span>
                    <span className="font-mono text-violet-400">+₹35.0 Cr Inbound</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Partner with Tamil Nadu Green Climate Fund and domestic clean tech investors.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Venture Activity & Macro Log */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Dealflow & Regional Regulatory Feed
              </span>
              <span className="text-xs text-slate-500">Trichy & Tamil Nadu</span>
            </div>

            <div className="space-y-2">
              {log.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg text-xs flex items-start gap-2.5 ${
                    item.type === 'alert'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                      : item.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-950 border border-slate-850 text-slate-300'
                  }`}
                >
                  <span className="font-mono text-[11px] text-slate-500 shrink-0">Q{item.quarter}</span>
                  <span className="leading-relaxed">{item.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Due Diligence Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-750 p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">
                  Gemini Climate Due Diligence Audit: {selectedStartup.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAuditing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-sm font-medium text-slate-200">Evaluating thermodynamic limits, Trichy supply chains, and unit economics...</span>
                <span className="text-xs text-slate-500">Gemini 3.8 Flash Climate Model</span>
              </div>
            ) : auditError ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {auditError}
              </div>
            ) : aiReport ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Viability & Parity Score</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">{aiReport.viabilityScore} / 100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 uppercase text-[10px] block">Recommended Round</span>
                    <span className="text-sm font-semibold text-amber-400">{aiReport.recommendedInvestmentStage}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-semibold text-white block">Executive Investment Verdict:</span>
                  <p className="text-slate-300 leading-relaxed">{aiReport.executiveVerdict}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-semibold text-cyan-400 block">Physics & Thermodynamic Reality Check:</span>
                  <p className="text-slate-300 leading-relaxed">{aiReport.thermodynamicRealityCheck}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-semibold text-emerald-400 block">Economic Moat vs Fossil & Imported Silicon:</span>
                  <p className="text-slate-300 leading-relaxed">{aiReport.economicMoat}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-amber-400 block">Critical Engineering & Supply Chain Risks:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {aiReport.criticalRisks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-violet-400 block">Suggested Climate Syndicate Partners:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiReport.suggestedSyndicatePartners.map((partner, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 font-medium text-[11px]">
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Game Over / Exit Valuation Celebration */}
      {gameFinished && (
        <div className="p-6 bg-slate-900 border-2 border-amber-400 rounded-2xl shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>5-Year Tamil Nadu Climate Mandate Complete</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {isUnicorn ? '₹2,500 Cr CleanTech Unicorn! NSE Clean Index Listing.' : 'Trichy Climate Fund Impact Report'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Your portfolio successfully abated {totalAbatedTons.toLocaleString()} tons of CO2 across the Cauvery basin while scaling sustainable commercial enterprises.
              </p>
            </div>

            <button
              onClick={handleRestart}
              className="px-5 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-md transition-all cursor-pointer self-start sm:self-center"
            >
              Reboot Venture Fund
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Final Portfolio Valuation</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ₹{totalPortfolioValuation} Cr
              </div>
              <span className="text-[11px] text-slate-500">Market capitalization</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Carbon Abated</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {totalAbatedTons.toLocaleString()} tCO2e
              </div>
              <span className="text-[11px] text-slate-500">Permanent climate impact</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Fund Internal Rate of Return (IRR)</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {Math.round((totalPortfolioValuation / 85) * 6.5)}%
              </div>
              <span className="text-[11px] text-slate-500">Top-decile climate fund</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
