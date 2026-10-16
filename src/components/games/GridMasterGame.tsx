import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, Pause, RotateCcw, FastForward, Sun, Wind, BatteryCharging, 
  Flame, Zap, AlertTriangle, TrendingUp, DollarSign, Award, RefreshCw, 
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { GridAsset, GridSimulationState } from '../../types/cleantech';

const INITIAL_ASSETS: GridAsset[] = [
  {
    id: 'solar',
    name: 'Cauvery Floatovoltaics & Trichy Solar',
    type: 'solar',
    capacityMW: 450,
    currentOutputMW: 0,
    operatingCostPerMWh: 450,
    carbonIntensity: 0,
    color: '#F59E0B',
    isDispatchable: false,
    status: 'active',
    level: 1,
    upgradeCost: 120000,
  },
  {
    id: 'wind',
    name: 'Muppandal-Palakkad Gap Wind Infeed',
    type: 'wind',
    capacityMW: 320,
    currentOutputMW: 120,
    operatingCostPerMWh: 650,
    carbonIntensity: 0,
    color: '#06B6D4',
    isDispatchable: false,
    status: 'active',
    level: 1,
    upgradeCost: 150000,
  },
  {
    id: 'battery',
    name: 'Trichy Substation LFP Grid BESS',
    type: 'battery',
    capacityMW: 200,
    currentOutputMW: 0,
    operatingCostPerMWh: 950,
    carbonIntensity: 0,
    color: '#10B981',
    isDispatchable: true,
    status: 'active',
    level: 1,
    upgradeCost: 200000,
  },
  {
    id: 'hydrogen',
    name: 'BHEL Green H2 Fuel Cell Peaker',
    type: 'hydrogen',
    capacityMW: 150,
    currentOutputMW: 0,
    operatingCostPerMWh: 3200,
    carbonIntensity: 0,
    color: '#8B5CF6',
    isDispatchable: true,
    status: 'standby',
    level: 1,
    upgradeCost: 250000,
  },
  {
    id: 'geothermal',
    name: 'Neyveli-Trichy Biomass Cogeneration',
    type: 'geothermal',
    capacityMW: 180,
    currentOutputMW: 180,
    operatingCostPerMWh: 1400,
    carbonIntensity: 0,
    color: '#EC4899',
    isDispatchable: true,
    status: 'active',
    level: 1,
    upgradeCost: 280000,
  },
];

// 24-hour demand curve template for Tiruchirappalli (in MW)
const BASE_DEMAND_CURVE = [
  380, 360, 350, 360, 390, 480, 620, 710, 750, 740, 720, 700,
  690, 680, 710, 760, 820, 920, 960, 940, 880, 760, 580, 450
];

// Solar irradiation bell-curve factors (hour 0 to 23)
const SOLAR_PROFILE = [
  0, 0, 0, 0, 0, 0.05, 0.25, 0.55, 0.80, 0.95, 1.0, 1.0,
  0.98, 0.90, 0.75, 0.50, 0.20, 0.02, 0, 0, 0, 0, 0, 0
];

// Wind variability factors (hour 0 to 23)
const WIND_PROFILE = [
  0.65, 0.70, 0.75, 0.70, 0.60, 0.55, 0.45, 0.40, 0.35, 0.30, 0.25, 0.25,
  0.30, 0.35, 0.40, 0.45, 0.55, 0.65, 0.75, 0.80, 0.85, 0.80, 0.75, 0.70
];

export const GridMasterGame: React.FC = () => {
  const [assets, setAssets] = useState<GridAsset[]>(INITIAL_ASSETS);
  const [sim, setSim] = useState<GridSimulationState>({
    hour: 6,
    minute: 0,
    speed: 1,
    solarMultiplier: 1.0,
    windMultiplier: 1.0,
    gridDemandMW: 620,
    spotPricePerMWh: 3800, // ₹3,800/MWh (₹3.80/unit)
    batteryStorageMWh: 400,
    batteryCapacityMWh: 800,
    batteryMode: 'auto',
    batteryDispatchRateMW: 120,
    hydrogenFuelReserveKg: 8500,
    hydrogenDispatchMW: 0,
    cashReserves: 2500000, // ₹25 Lakhs
    carbonAbatedTons: 0,
    blackoutSeconds: 0,
    blackoutPenaltyTotal: 0,
    hourlyHistory: [],
    activeEvent: null,
    dayComplete: false,
    score: 0,
  });

  const [h2ElectrolyzerActive, setH2ElectrolyzerActive] = useState(true);
  const [manualBatterySlider, setManualBatterySlider] = useState(0);
  const [manualH2Slider, setManualH2Slider] = useState(0);
  const [eventAlert, setEventAlert] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiCopilotAdvice, setAiCopilotAdvice] = useState<{
    tacticalAction: string;
    economicRationale: string;
    gridStabilityRating: string;
    nextHourForecast: string;
  } | null>(null);
  const simRef = useRef(sim);
  simRef.current = sim;

  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  // Weather and grid events pool in Tiruchirappalli & Tamil Nadu
  const POSSIBLE_EVENTS = [
    {
      title: 'Cauvery Delta Monsoon Cloudburst',
      description: 'Sudden stratocumulus cloud deck lowers solar yield across Trichy by 50% for 2 hours.',
      impact: 'Solar Multiplier: 0.50x',
      durationHours: 2,
      type: 'weather' as const,
      apply: () => setSim(s => ({ ...s, solarMultiplier: 0.5 })),
      revert: () => setSim(s => ({ ...s, solarMultiplier: 1.0 }))
    },
    {
      title: 'Trichy Summer Heatwave (42°C)',
      description: 'Suburban AC and Cauvery irrigation pump sets surge demand by +150 MW.',
      impact: 'TANGEDCO Demand: +150 MW',
      durationHours: 3,
      type: 'demand' as const,
      apply: () => {},
      revert: () => {}
    },
    {
      title: 'Palakkad Gap Wind Gale Infeed',
      description: 'Western Ghats pass accelerates wind turbine feed into central Tamil Nadu by +40%.',
      impact: 'Wind Multiplier: 1.40x',
      durationHours: 3,
      type: 'weather' as const,
      apply: () => setSim(s => ({ ...s, windMultiplier: 1.4 })),
      revert: () => setSim(s => ({ ...s, windMultiplier: 1.0 }))
    },
    {
      title: 'TANGEDCO Feeder Congestion',
      description: 'Regional transmission bottleneck raises local IEX market clearing price by +₹4.50/unit (+₹4,500/MWh).',
      impact: 'IEX Clearing: +₹4.50/unit',
      durationHours: 2,
      type: 'market' as const,
      apply: () => {},
      revert: () => {}
    }
  ];

  // Simulation tick timer
  useEffect(() => {
    if (sim.speed === 0 || sim.dayComplete) return;

    const intervalTime = 1000 / sim.speed; // 1s at 1x speed represents 10 simulated minutes
    const timer = setInterval(() => {
      setSim(prev => {
        let nextMinute = prev.minute + 10;
        let nextHour = prev.hour;

        if (nextMinute >= 60) {
          nextMinute = 0;
          nextHour = prev.hour + 1;
        }

        // Check if 24 hours completed
        if (nextHour >= 24) {
          // Trigger confetti!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          // Calculate final score
          const finalScore = Math.max(0, Math.round(
            prev.cashReserves * 0.1 + 
            prev.carbonAbatedTons * 15 - 
            prev.blackoutPenaltyTotal * 0.5
          ));

          return {
            ...prev,
            hour: 23,
            minute: 59,
            speed: 0,
            dayComplete: true,
            score: finalScore,
          };
        }

        // Base demand with slight noise
        let demand = BASE_DEMAND_CURVE[nextHour] || 600;
        if (prev.activeEvent && prev.activeEvent.title.includes('Heatwave')) {
          demand += 140;
        }

        // Calculate generation from current asset levels
        const solarAsset = assetsRef.current.find(a => a.type === 'solar')!;
        const windAsset = assetsRef.current.find(a => a.type === 'wind')!;
        const batteryAsset = assetsRef.current.find(a => a.type === 'battery')!;
        const geothermalAsset = assetsRef.current.find(a => a.type === 'geothermal')!;

        const solarGen = Math.round(solarAsset.capacityMW * SOLAR_PROFILE[nextHour] * prev.solarMultiplier);
        const windGen = Math.round(windAsset.capacityMW * WIND_PROFILE[nextHour] * prev.windMultiplier);
        const geoGen = geothermalAsset.capacityMW;

        // Determine wholesale spot price (₹/MWh) on Indian Energy Exchange (IEX) based on merit order & duck curve
        // Base formula: Low demand + high solar = low price; High evening demand + low solar = high peak
        const rawRenewables = solarGen + windGen + geoGen;
        const netDeficit = demand - rawRenewables;

        let spotPrice = 3800; // baseline ₹3.80/unit
        if (netDeficit < -100) {
          // Severe midday surplus: solar duck curve dip in Tamil Nadu
          spotPrice = 1400; // ₹1.40/unit
        } else if (netDeficit < 0) {
          spotPrice = 2200; // cheap clean solar ₹2.20/unit
        } else if (netDeficit < 150) {
          spotPrice = 4200 + netDeficit * 18;
        } else if (netDeficit < 300) {
          spotPrice = 7200 + netDeficit * 12;
        } else {
          spotPrice = 9500 + Math.min(2500, (netDeficit - 300) * 15); // CERC ceiling capped ~₹12/unit
        }

        if (prev.activeEvent && prev.activeEvent.title.includes('Congestion')) {
          spotPrice += 2500;
        }

        // Battery dispatch handling
        let batteryDispatch = 0; // positive = discharging into grid, negative = charging
        let currentStorage = prev.batteryStorageMWh;
        const maxBatteryMW = batteryAsset.capacityMW;
        const maxStorage = prev.batteryCapacityMWh;

        if (prev.batteryMode === 'auto') {
          // Smart Arbitrage algorithm for TANGEDCO substation BESS:
          if (spotPrice <= 2500 && currentStorage < maxStorage) {
            // Surplus / cheap price: charge rapidly during solar peak
            const chargePower = Math.min(maxBatteryMW, (maxStorage - currentStorage) * 6);
            batteryDispatch = -chargePower;
          } else if (spotPrice >= 7200 && currentStorage > 10) {
            // Expensive peak: discharge profitably during evening industrial ramp
            const dischargePower = Math.min(maxBatteryMW, currentStorage * 6, Math.max(50, netDeficit));
            batteryDispatch = dischargePower;
          } else if (netDeficit > 50 && currentStorage > 10) {
            // Grid needs backup
            batteryDispatch = Math.min(maxBatteryMW, netDeficit, currentStorage * 6);
          }
        } else if (prev.batteryMode === 'charge') {
          const chargePower = Math.min(maxBatteryMW, (maxStorage - currentStorage) * 6);
          batteryDispatch = -chargePower;
        } else if (prev.batteryMode === 'discharge') {
          const dischargePower = Math.min(maxBatteryMW, currentStorage * 6);
          batteryDispatch = dischargePower;
        }

        // Apply battery energy delta (10 simulated minutes = 1/6 hour)
        if (batteryDispatch > 0) {
          currentStorage = Math.max(0, currentStorage - (batteryDispatch / 6));
        } else if (batteryDispatch < 0) {
          currentStorage = Math.min(maxStorage, currentStorage + (Math.abs(batteryDispatch) / 6) * 0.92); // 92% roundtrip efficiency
        }

        // Hydrogen fuel cell peaker dispatch
        let h2Dispatch = 0;
        let h2Reserve = prev.hydrogenFuelReserveKg;
        if (manualH2Slider > 0 && h2Reserve > 50) {
          h2Dispatch = Math.min(manualH2Slider, h2Reserve * 0.1);
          h2Reserve = Math.max(0, h2Reserve - (h2Dispatch * 1.8)); // consumes ~1.8kg H2 per MW per 10min
        }

        // Green hydrogen production from surplus solar
        if (h2ElectrolyzerActive && rawRenewables > demand && spotPrice < 20) {
          const excessMW = rawRenewables - demand;
          const h2Produced = Math.round(excessMW * 0.8);
          h2Reserve += h2Produced;
        }

        // Total generation delivered
        const totalClean = solarGen + windGen + geoGen + (batteryDispatch > 0 ? batteryDispatch : 0) + h2Dispatch;
        const totalLoadWithCharging = demand + (batteryDispatch < 0 ? Math.abs(batteryDispatch) : 0);

        // Power balance
        const balance = totalClean - totalLoadWithCharging;
        let blackoutSecs = prev.blackoutSeconds;
        let blackoutPenalty = prev.blackoutPenaltyTotal;

        if (balance < -50) {
          // Significant unserved energy! Grid stress & DSM deviation penalty
          blackoutSecs += 10;
          blackoutPenalty += Math.abs(balance) * 450; // ₹450/MW deficit deviation penalty
        }

        // Financial accounting (10 minutes = 1/6 of an hour)
        // Revenue = (Delivered MWh * spot price)
        const deliveredMWh = (Math.min(totalClean, totalLoadWithCharging)) / 6;
        const grossRevenue = deliveredMWh * spotPrice;

        // Opex costs in Indian Rupees (₹/MWh)
        const opex = (solarGen * 80 + windGen * 120 + geoGen * 250 + Math.abs(batteryDispatch) * 150 + h2Dispatch * 600) / 6;
        const netCashDelta = grossRevenue - opex;

        // Carbon abated vs legacy fossil grid (0.72 tons CO2 / MWh Indian CEA grid emission factor)
        const carbonDelta = deliveredMWh * 0.72;

        // Random event trigger every few hours
        let nextEvent = prev.activeEvent;
        if (!nextEvent && nextHour > 8 && nextHour < 21 && Math.random() < 0.15 && nextMinute === 0) {
          const randEvent = POSSIBLE_EVENTS[Math.floor(Math.random() * POSSIBLE_EVENTS.length)];
          randEvent.apply();
          nextEvent = {
            title: randEvent.title,
            description: randEvent.description,
            impact: randEvent.impact,
            durationHours: randEvent.durationHours,
            type: randEvent.type
          };
          setEventAlert(randEvent.title);
          setTimeout(() => setEventAlert(null), 6000);
        } else if (nextEvent && nextMinute === 0) {
          nextEvent = { ...nextEvent, durationHours: nextEvent.durationHours - 1 };
          if (nextEvent.durationHours <= 0) {
            nextEvent = null;
          }
        }

        // Record history snapshot every hour
        let newHistory = prev.hourlyHistory;
        if (nextMinute === 0) {
          const snapshot = {
            time: `${String(nextHour).padStart(2, '0')}:00`,
            demand,
            solar: solarGen,
            wind: windGen,
            battery: batteryDispatch,
            cleanTotal: Math.round(totalClean),
            spotPrice: Math.round(spotPrice),
            revenue: Math.round(grossRevenue)
          };
          newHistory = [...prev.hourlyHistory.slice(-15), snapshot];
        }

        return {
          ...prev,
          hour: nextHour,
          minute: nextMinute,
          gridDemandMW: Math.round(demand),
          spotPricePerMWh: Math.round(spotPrice),
          batteryStorageMWh: Math.round(currentStorage),
          hydrogenFuelReserveKg: Math.round(h2Reserve),
          cashReserves: Math.round(prev.cashReserves + netCashDelta),
          carbonAbatedTons: Math.round(prev.carbonAbatedTons + carbonDelta),
          blackoutSeconds: blackoutSecs,
          blackoutPenaltyTotal: Math.round(blackoutPenalty),
          activeEvent: nextEvent,
          hourlyHistory: newHistory,
        };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [sim.speed, sim.dayComplete, manualH2Slider, h2ElectrolyzerActive]);

  // Upgrade handler
  const handleUpgradeAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    if (sim.cashReserves < asset.upgradeCost) {
      alert(`Insufficient funds! Need $${asset.upgradeCost.toLocaleString()}`);
      return;
    }

    setSim(s => ({ ...s, cashReserves: s.cashReserves - asset.upgradeCost }));

    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const newLevel = a.level + 1;
        const capacityBoost = Math.round(a.capacityMW * 0.25);
        return {
          ...a,
          level: newLevel,
          capacityMW: a.capacityMW + capacityBoost,
          upgradeCost: Math.round(a.upgradeCost * 1.5),
        };
      }
      return a;
    }));
  };

  const resetGame = () => {
    setAssets(INITIAL_ASSETS);
    setSim({
      hour: 6,
      minute: 0,
      speed: 1,
      solarMultiplier: 1.0,
      windMultiplier: 1.0,
      gridDemandMW: 620,
      spotPricePerMWh: 42,
      batteryStorageMWh: 400,
      batteryCapacityMWh: 800,
      batteryMode: 'auto',
      batteryDispatchRateMW: 120,
      hydrogenFuelReserveKg: 8500,
      hydrogenDispatchMW: 0,
      cashReserves: 25000,
      carbonAbatedTons: 0,
      blackoutSeconds: 0,
      blackoutPenaltyTotal: 0,
      hourlyHistory: [],
      activeEvent: null,
      dayComplete: false,
      score: 0,
    });
    setManualH2Slider(0);
  };

  // Calculations for current moment
  const solarAsset = assets.find(a => a.type === 'solar')!;
  const windAsset = assets.find(a => a.type === 'wind')!;
  const batteryAsset = assets.find(a => a.type === 'battery')!;
  const geoAsset = assets.find(a => a.type === 'geothermal')!;
  const h2Asset = assets.find(a => a.type === 'hydrogen')!;

  const solarOutput = Math.round(solarAsset.capacityMW * SOLAR_PROFILE[sim.hour] * sim.solarMultiplier);
  const windOutput = Math.round(windAsset.capacityMW * WIND_PROFILE[sim.hour] * sim.windMultiplier);
  const geoOutput = geoAsset.capacityMW;
  const currentTotalGen = solarOutput + windOutput + geoOutput + manualH2Slider;
  const netDeficit = sim.gridDemandMW - currentTotalGen;
  const batteryPct = Math.round((sim.batteryStorageMWh / sim.batteryCapacityMWh) * 100);

  // Reliability metric
  const reliabilityPct = Math.max(0, 100 - (sim.blackoutSeconds * 0.2)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Controller & Stats Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Simulation Clock & Controls */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="text-xs text-slate-400 uppercase font-medium">Clock</span>
              <span className="font-mono text-2xl font-bold tracking-tight text-emerald-400 tabular-nums">
                {String(sim.hour).padStart(2, '0')}:{String(sim.minute).padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-500 font-mono">Day 1</span>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setSim(s => ({ ...s, speed: s.speed === 0 ? 1 : 0 }))}
                className={`p-2 rounded-md text-xs font-medium transition-colors ${
                  sim.speed === 0 ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
                title={sim.speed === 0 ? 'Resume Simulation' : 'Pause Simulation'}
              >
                {sim.speed === 0 ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSim(s => ({ ...s, speed: 1 }))}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  sim.speed === 1 ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setSim(s => ({ ...s, speed: 2 }))}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  sim.speed === 2 ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                2x
              </button>
              <button
                onClick={() => setSim(s => ({ ...s, speed: 5 }))}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  sim.speed === 5 ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                5x
              </button>
              <button
                onClick={resetGame}
                className="p-2 rounded-md text-xs text-slate-400 hover:text-white transition-colors"
                title="Restart Day"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Live Financial and Grid KPIs */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <div className="text-xs text-slate-400">Cash Reserves</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                ₹{sim.cashReserves.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">IEX Wholesale Tariff</div>
              <div className={`text-lg font-bold font-mono tabular-nums ${
                sim.spotPricePerMWh < 0 ? 'text-rose-400' : sim.spotPricePerMWh > 8000 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                ₹{(sim.spotPricePerMWh / 1000).toFixed(2)} <span className="text-xs text-slate-400 font-sans">/ unit (₹{sim.spotPricePerMWh}/MWh)</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Carbon Abated</div>
              <div className="text-lg font-bold font-mono tabular-nums text-cyan-400">
                {sim.carbonAbatedTons.toLocaleString()} <span className="text-xs text-slate-400 font-sans">tCO2e</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Grid Reliability</div>
              <div className={`text-lg font-bold font-mono tabular-nums ${
                parseFloat(reliabilityPct) > 98 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {reliabilityPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Weather / Grid Event Banner */}
        {sim.activeEvent && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-white">{sim.activeEvent.title}:</span>
              <span>{sim.activeEvent.description}</span>
            </div>
            <span className="font-mono font-medium text-amber-400 shrink-0">
              {sim.activeEvent.impact} ({sim.activeEvent.durationHours}h left)
            </span>
          </div>
        )}
      </div>

      {/* Main Grid Interactive Stage: Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Live 24h Interactive Grid Stage & Waveform (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Dispatch Stage Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Power Dispatch Balance & Load Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">Matching clean generation with variable municipal & industrial demand.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Target Demand</span>
                <div className="text-lg font-bold font-mono tabular-nums text-white">
                  {sim.gridDemandMW} MW
                </div>
              </div>
            </div>

            {/* SVG Visualizer of 24h Duck Curve and Power Curves */}
            <div className="relative h-64 w-full bg-slate-950/80 rounded-lg p-2 border border-slate-800/80 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 240 120" preserveAspectRatio="none">
                {/* Grid guidelines */}
                <line x1="0" y1="30" x2="240" y2="30" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="60" x2="240" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="90" x2="240" y2="90" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                {/* Demand Line Curve */}
                <polyline
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                  points={BASE_DEMAND_CURVE.map((d, i) => `${i * 10},${120 - (d / 1000) * 110}`).join(' ')}
                />

                {/* Solar Bell Curve Area */}
                <polygon
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  points={`0,120 ${SOLAR_PROFILE.map((s, i) => `${i * 10},${120 - ((solarAsset.capacityMW * s) / 1000) * 110}`).join(' ')} 240,120`}
                />

                {/* Current Time Needle Cursor */}
                <line
                  x1={sim.hour * 10 + (sim.minute / 60) * 10}
                  y1="0"
                  x2={sim.hour * 10 + (sim.minute / 60) * 10}
                  y2="120"
                  stroke="#10B981"
                  strokeWidth="2.5"
                />
              </svg>

              {/* Legend overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-0.5 bg-slate-200 inline-block" /> Grid Demand (MW)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 bg-amber-500/40 border border-amber-400 inline-block rounded-xs" /> Solar PV
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Current Hour ({sim.hour}:00)
                </span>
              </div>

              {/* Duck Curve note */}
              <div className="absolute bottom-2 right-3 text-[11px] text-slate-500 font-mono">
                Midday Belly: 11:00-15:00 · Evening Peak: 18:00-21:00
              </div>
            </div>

            {/* Real-time Generation Stack Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Clean Generation Stack: <strong className="text-white font-mono">{currentTotalGen} MW</strong></span>
                <span>
                  Net Grid Margin: <strong className={`font-mono ${netDeficit > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {netDeficit > 0 ? `-${netDeficit} MW Deficit` : `+${Math.abs(netDeficit)} MW Surplus`}
                  </strong>
                </span>
              </div>

              {/* Multi-segment stacked bar */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                <div style={{ width: `${(solarOutput / (sim.gridDemandMW || 1)) * 100}%` }} className="bg-amber-500 h-full transition-all" title={`Solar: ${solarOutput} MW`} />
                <div style={{ width: `${(windOutput / (sim.gridDemandMW || 1)) * 100}%` }} className="bg-cyan-500 h-full transition-all" title={`Wind: ${windOutput} MW`} />
                <div style={{ width: `${(geoOutput / (sim.gridDemandMW || 1)) * 100}%` }} className="bg-pink-500 h-full transition-all" title={`Geothermal: ${geoOutput} MW`} />
                {manualH2Slider > 0 && (
                  <div style={{ width: `${(manualH2Slider / (sim.gridDemandMW || 1)) * 100}%` }} className="bg-violet-500 h-full transition-all" title={`Hydrogen: ${manualH2Slider} MW`} />
                )}
              </div>
            </div>
          </div>

          {/* Asset Upgrades and Fleet Performance */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Clean Tech Asset Portfolio & Upgrades</h4>
                <p className="text-xs text-slate-400">Reinvest power revenue to expand capacity and capture greater market share.</p>
              </div>
              <span className="text-xs text-slate-400">5 Active Assets</span>
            </div>

            <div className="space-y-3">
              {assets.map(asset => {
                const isSolar = asset.type === 'solar';
                const isWind = asset.type === 'wind';
                const curOutput = isSolar ? solarOutput : isWind ? windOutput : asset.type === 'geothermal' ? geoOutput : manualH2Slider;

                return (
                  <div key={asset.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${asset.color}20`, color: asset.color }}>
                        {isSolar && <Sun className="w-5 h-5" />}
                        {isWind && <Wind className="w-5 h-5" />}
                        {asset.type === 'battery' && <BatteryCharging className="w-5 h-5" />}
                        {asset.type === 'hydrogen' && <Flame className="w-5 h-5" />}
                        {asset.type === 'geothermal' && <Zap className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{asset.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Lvl {asset.level}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>Cap: <strong className="text-slate-200 font-mono">{asset.capacityMW} MW</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>Delivering: <strong className="text-emerald-400 font-mono">{curOutput} MW</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>OPEX: ₹{asset.operatingCostPerMWh}/MWh</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpgradeAsset(asset.id)}
                      disabled={sim.cashReserves < asset.upgradeCost}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-end sm:self-center cursor-pointer ${
                        sim.cashReserves >= asset.upgradeCost
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      }`}
                    >
                      Upgrade +25% (₹{asset.upgradeCost.toLocaleString()})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Zone: Dispatch Controls & Arbitrage Strategy (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Battery Storage & Smart Arbitrage Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Utility BESS Storage Arbitrage</h4>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-400 font-semibold">
                {sim.batteryStorageMWh} / {sim.batteryCapacityMWh} MWh ({batteryPct}%)
              </span>
            </div>

            {/* Battery state of charge visual bar */}
            <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${batteryPct}%` }}
              />
            </div>

            {/* BESS Mode Selector */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400">Automated Dispatch Strategy:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSim(s => ({ ...s, batteryMode: 'auto' }))}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    sim.batteryMode === 'auto'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Smart Auto
                </button>
                <button
                  onClick={() => setSim(s => ({ ...s, batteryMode: 'charge' }))}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    sim.batteryMode === 'charge'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Force Charge
                </button>
                <button
                  onClick={() => setSim(s => ({ ...s, batteryMode: 'discharge' }))}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    sim.batteryMode === 'discharge'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Discharge Peak
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Economic Logic:</span>
                <span className="text-emerald-400 font-medium">Buy Low, Sell High</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Smart Auto charges when midday spot price falls under ₹2.50/unit (₹2,500/MWh) during solar influx and dumps power when spot price climbs above ₹7.20/unit (₹7,200/MWh) during the 18:00 TANGEDCO evening peak.
              </p>
            </div>
          </div>

          {/* Green Hydrogen Electrolyzer & Peaker Control */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-violet-400" />
                <h4 className="text-sm font-semibold text-white">Green Hydrogen Peaker & Electrolyzer</h4>
              </div>
              <span className="text-xs font-mono text-violet-300 tabular-nums">
                {sim.hydrogenFuelReserveKg.toLocaleString()} kg H2
              </span>
            </div>

            {/* Manual Peaker Dispatch Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Dispatch Peaker Output</span>
                <span className="font-mono font-bold text-violet-400">{manualH2Slider} MW</span>
              </div>
              <input
                type="range"
                min="0"
                max={h2Asset.capacityMW}
                step="10"
                value={manualH2Slider}
                onChange={(e) => setManualH2Slider(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 MW (Standby)</span>
                <span>Max: {h2Asset.capacityMW} MW</span>
              </div>
            </div>

            {/* Electrolyzer Auto Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Auto Electrolyzer Synthesis</span>
                <span className="text-[11px] text-slate-400">Convert surplus midday solar into zero-carbon H2.</span>
              </div>
              <button
                onClick={() => setH2ElectrolyzerActive(!h2ElectrolyzerActive)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  h2ElectrolyzerActive
                    ? 'bg-violet-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {h2ElectrolyzerActive ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Gemini AI Grid Dispatch Advisor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                <TrendingUp className="w-4 h-4" />
                <span>AI Grid Dispatch Copilot</span>
              </div>
              <button
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const res = await fetch('/api/gemini/grid-copilot', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        hour: sim.hour,
                        demandMW: sim.gridDemandMW,
                        totalCleanMW: currentTotalGen,
                        spotPrice: sim.spotPricePerMWh,
                        batteryStorageMWh: sim.batteryStorageMWh,
                        batteryCapacityMWh: sim.batteryCapacityMWh,
                        activeEvent: sim.activeEvent,
                      }),
                    });
                    const data = await res.json();
                    setAiCopilotAdvice(data);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 transition-colors cursor-pointer"
              >
                {aiLoading ? 'Analyzing Grid...' : 'Consult Gemini AI'}
              </button>
            </div>

            {aiCopilotAdvice ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Recommended Action:</span>
                  <span className="font-mono text-emerald-400 font-bold">{aiCopilotAdvice.gridStabilityRating}</span>
                </div>
                <div className="text-emerald-300 font-medium">
                  {aiCopilotAdvice.tacticalAction}
                </div>
                <p className="text-[11px] text-slate-400">
                  {aiCopilotAdvice.economicRationale}
                </p>
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-850">
                  Forecast: {aiCopilotAdvice.nextHourForecast}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click above to have Gemini 3.8 analyze real-time duck curve conditions, price spreads, and battery state-of-charge for optimal dispatch.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal / Summary Card */}
      {sim.dayComplete && (
        <div className="p-6 bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>24-Hour Cycle Complete</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-1">Dispatch Performance & Financial Audit</h3>
              <p className="text-xs text-slate-400 mt-1">Review your revenue, avoided penalties, and grid stability rating.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 uppercase">Mastery Score</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {sim.score.toLocaleString()} pts
                </div>
              </div>
              <button
                onClick={resetGame}
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg shadow-md transition-all cursor-pointer"
              >
                Play Next Day
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Closing Cash Balance</span>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                ₹{sim.cashReserves.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500">Power arbitrage revenue</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Carbon Abated</span>
              <div className="text-xl font-bold font-mono tabular-nums text-cyan-400 mt-1">
                {sim.carbonAbatedTons.toLocaleString()} tCO2e
              </div>
              <span className="text-[11px] text-slate-500">Equivalent to {Math.round(sim.carbonAbatedTons * 45)} trees</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Grid Reliability Achieved</span>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                {reliabilityPct}%
              </div>
              <span className="text-[11px] text-slate-500">
                {sim.blackoutSeconds === 0 ? 'Zero Blackout Time (Flawless)' : `${sim.blackoutSeconds}s Unserved Demand`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
