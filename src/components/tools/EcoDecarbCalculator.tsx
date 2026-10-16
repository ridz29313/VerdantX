import React, { useState } from 'react';
import { 
  Building2, Calculator, CheckCircle2, ChevronDown, DollarSign, 
  Download, FileSpreadsheet, Flame, Leaf, Percent, Printer, 
  Share2, Sun, TrendingUp, Zap, MapPin
} from 'lucide-react';
import { FACILITY_PRESETS } from '../../data/cleantechData';
import { DecarbInputs } from '../../types/cleantech';

export const EcoDecarbCalculator: React.FC = () => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('industrial_steel');
  const [inputs, setInputs] = useState<DecarbInputs>(FACILITY_PRESETS.industrial_steel);

  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    if (FACILITY_PRESETS[key]) {
      setInputs(FACILITY_PRESETS[key]);
    }
  };

  // Indian Techno-Economic Calculations
  const annualElectricityBill = (inputs.annualConsumptionGWh * 1000000) * inputs.electricityTariffPerKWh;
  const gridCarbonFactor = 0.72; // Indian CEA grid emission factor: ~0.72 tons CO2 per MWh
  const baselineEmissionsTons = (inputs.annualConsumptionGWh * 1000) * gridCarbonFactor;
  const baselineCarbonTaxBill = baselineEmissionsTons * inputs.carbonTaxPerTon;

  // Interventions:
  // 1. Solar PV (₹4.2 Cr per MW installed in Tamil Nadu)
  const solarGenMWh = inputs.hasSolarPV ? inputs.solarCapacityMW * 1650 : 0;
  const solarCapex = inputs.hasSolarPV ? inputs.solarCapacityMW * 42000000 : 0;
  const solarPowerSavings = inputs.hasSolarPV ? solarGenMWh * 1000 * inputs.electricityTariffPerKWh : 0;
  const solarCO2Abated = inputs.hasSolarPV ? solarGenMWh * gridCarbonFactor : 0;

  // 2. Battery Storage (₹2.1 Cr per MWh)
  const bessCapex = inputs.hasBESS ? inputs.bessCapacityMWh * 21000000 : 0;
  const bessDemandChargeSavings = inputs.hasBESS ? inputs.peakDemandMW * 0.25 * 450 * 12 * 1000 : 0;

  // 3. Industrial Heat Pump (₹45 Lakhs)
  const heatPumpCapex = inputs.hasHeatPump ? 4500000 : 0;
  const heatPumpGasSavings = inputs.hasHeatPump ? 1800000 : 0;
  const heatPumpCO2Abated = inputs.hasHeatPump ? 820 : 0;

  // 4. Waste Heat Recovery Loop (₹65 Lakhs)
  const wasteHeatCapex = inputs.hasWasteHeatRecovery ? 6500000 : 0;
  const wasteHeatSavings = inputs.hasWasteHeatRecovery ? 2400000 : 0;
  const wasteHeatCO2Abated = inputs.hasWasteHeatRecovery ? 1150 : 0;

  // Total Capex & Annual Savings
  const totalCapex = solarCapex + bessCapex + heatPumpCapex + wasteHeatCapex;
  const annualEnergySavings = solarPowerSavings + bessDemandChargeSavings + heatPumpGasSavings + wasteHeatSavings;
  const annualCO2Abated = solarCO2Abated + heatPumpCO2Abated + wasteHeatCO2Abated;
  const annualCarbonTaxSavings = annualCO2Abated * inputs.carbonTaxPerTon;
  const totalAnnualSavings = annualEnergySavings + annualCarbonTaxSavings;

  // Payback & 10-Year DCF
  const paybackYears = totalCapex > 0 ? (totalCapex / Math.max(1, totalAnnualSavings)).toFixed(1) : '0.0';
  const discountRate = inputs.discountRatePct / 100;
  let npv = -totalCapex;
  const cashFlows: { year: number; savings: number; discounted: number; cumulative: number }[] = [];
  let cumulative = -totalCapex;

  for (let y = 1; y <= 10; y++) {
    const adjustedSavings = totalAnnualSavings * Math.pow(1.02, y - 1);
    const discounted = adjustedSavings / Math.pow(1 + discountRate, y);
    npv += discounted;
    cumulative += adjustedSavings;
    cashFlows.push({
      year: y,
      savings: Math.round(adjustedSavings),
      discounted: Math.round(discounted),
      cumulative: Math.round(cumulative),
    });
  }

  const simpleIRR = totalCapex > 0 ? Math.min(65, Math.round(((totalAnnualSavings / totalCapex) - 0.03) * 100)) : 0;

  // Print/Download Memo handler in Indian Context
  const handleExportMemo = () => {
    const memoText = `
================================================================================
VERDANTX TIRUCHIRAPPALLI - TECHNO-ECONOMIC DECARBONIZATION EXECUTIVE MEMO
Location: Tiruchirappalli, Tamil Nadu, India
Utility: TANGEDCO / TANTRANSCO Grid Connection
Facility: ${inputs.facilityName}
Date: ${new Date().toLocaleDateString('en-IN')}
================================================================================

1. EXECUTIVE SUMMARY & BASELINE
- Baseline Annual Electricity Consumption: ${inputs.annualConsumptionGWh} GWh
- Baseline Annual Grid Electricity Bill: ₹${annualElectricityBill.toLocaleString('en-IN')}
- Current Industrial Tariff: ₹${inputs.electricityTariffPerKWh.toFixed(2)} / unit (kWh)
- Indian CCTS / BEE Carbon Exposure: ₹${baselineCarbonTaxBill.toLocaleString('en-IN')}
- Baseline Footprint: ${baselineEmissionsTons.toLocaleString('en-IN')} tCO2e/year

2. RECOMMENDED CLEAN ENERGY INTERVENTIONS
- Onsite Solar PV: ${inputs.hasSolarPV ? `${inputs.solarCapacityMW} MW (₹${(solarCapex/10000000).toFixed(2)} Cr)` : 'Disabled'}
- Battery BESS Storage: ${inputs.hasBESS ? `${inputs.bessCapacityMWh} MWh (₹${(bessCapex/10000000).toFixed(2)} Cr)` : 'Disabled'}
- High-COP Industrial Heat Pumps: ${inputs.hasHeatPump ? `Enabled (₹${(heatPumpCapex/100000).toFixed(1)} Lakhs)` : 'Disabled'}
- Waste Heat Recovery Flue Loop: ${inputs.hasWasteHeatRecovery ? `Enabled (₹${(wasteHeatCapex/100000).toFixed(1)} Lakhs)` : 'Disabled'}
- Total Overnight Turnkey CAPEX: ₹${(totalCapex/10000000).toFixed(2)} Crores (₹${totalCapex.toLocaleString('en-IN')})

3. FINANCIAL RETURNS & RECOVERY
- Net Present Value (10-Yr @ ${inputs.discountRatePct}% WACC): ₹${(npv/10000000).toFixed(2)} Crores
- Internal Rate of Return (IRR): ${simpleIRR}%
- Simple Payback Horizon: ${paybackYears} Years
- Projected 10-Year Cumulative Cash Flow: ₹${((cashFlows[9]?.cumulative || 0)/10000000).toFixed(2)} Crores

4. ENVIRONMENTAL & BEE PAT REGULATORY IMPACT
- Annual Carbon Abated: ${Math.round(annualCO2Abated).toLocaleString('en-IN')} tCO2e/year
- Annual Avoided Carbon Tax / BEE Penalties: ₹${Math.round(annualCarbonTaxSavings).toLocaleString('en-IN')}/year
- Total 10-Year Carbon Abatement: ${Math.round(annualCO2Abated * 10).toLocaleString('en-IN')} tCO2e

Confidential Assessment · Prepared via VerdantX Tiruchirappalli Clean Energy Engine
================================================================================
    `;

    const blob = new Blob([memoText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VerdantX_Trichy_Decarb_Memo_${inputs.facilityType}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wide">
              <MapPin className="w-4 h-4" />
              <span>Tiruchirappalli Industrial Decarb Engine</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>TANGEDCO & BEE CCTS</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Facility Decarbonization Feasibility & ROI</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Facility Presets */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => handleSelectPreset('industrial_steel')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  selectedPresetKey === 'industrial_steel' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                BHEL Trichy Complex
              </button>
              <button
                onClick={() => handleSelectPreset('datacenter')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  selectedPresetKey === 'datacenter' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Trichy IT Park
              </button>
              <button
                onClick={() => handleSelectPreset('commercial')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  selectedPresetKey === 'commercial' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                NIT Trichy Campus
              </button>
              <button
                onClick={() => handleSelectPreset('cold_storage')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  selectedPresetKey === 'cold_storage' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Cauvery Delta Agri Hub
              </button>
            </div>

            <button
              onClick={handleExportMemo}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Memo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Calculator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters & Clean Interventions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Baseline Facility Inputs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="text-sm font-semibold text-white">1. Facility Operational Baseline</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Facility Name / Location</label>
                <input
                  type="text"
                  value={inputs.facilityName}
                  onChange={(e) => setInputs({ ...inputs, facilityName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Annual Power (GWh)</label>
                  <input
                    type="number"
                    value={inputs.annualConsumptionGWh}
                    onChange={(e) => setInputs({ ...inputs, annualConsumptionGWh: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Peak Demand (MW)</label>
                  <input
                    type="number"
                    value={inputs.peakDemandMW}
                    onChange={(e) => setInputs({ ...inputs, peakDemandMW: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">TANGEDCO Tariff (₹/unit)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={inputs.electricityTariffPerKWh}
                    onChange={(e) => setInputs({ ...inputs, electricityTariffPerKWh: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">BEE CCTS Carbon Price (₹/ton)</label>
                  <input
                    type="number"
                    value={inputs.carbonTaxPerTon}
                    onChange={(e) => setInputs({ ...inputs, carbonTaxPerTon: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clean Technology Interventions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="text-sm font-semibold text-white">2. Clean Energy Interventions (Tiruchirappalli)</h4>

            {/* Solar Microgrid */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.hasSolarPV}
                    onChange={(e) => setInputs({ ...inputs, hasSolarPV: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">Bifacial / Floating Solar Array</span>
                </label>
                <span className="text-xs font-mono text-cyan-400 font-bold">{inputs.solarCapacityMW} MW</span>
              </div>

              {inputs.hasSolarPV && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={inputs.solarCapacityMW}
                    onChange={(e) => setInputs({ ...inputs, solarCapacityMW: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 MW (₹4.2 Cr)</span>
                    <span>30 MW (₹126 Cr)</span>
                  </div>
                </div>
              )}
            </div>

            {/* BESS Storage */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.hasBESS}
                    onChange={(e) => setInputs({ ...inputs, hasBESS: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">TANGEDCO Peak-Shaving BESS</span>
                </label>
                <span className="text-xs font-mono text-cyan-400 font-bold">{inputs.bessCapacityMWh} MWh</span>
              </div>

              {inputs.hasBESS && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min="2"
                    max="60"
                    step="2"
                    value={inputs.bessCapacityMWh}
                    onChange={(e) => setInputs({ ...inputs, bessCapacityMWh: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2 MWh (₹4.2 Cr)</span>
                    <span>60 MWh (₹126 Cr)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Heat Pump Retrofit */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.hasHeatPump}
                    onChange={(e) => setInputs({ ...inputs, hasHeatPump: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">Industrial Electric Heat Pumps</span>
                </label>
                <span className="text-[11px] text-slate-400 block mt-0.5 ml-6">Replaces diesel/furnace oil boilers with high-COP electrification</span>
              </div>
              <span className="text-xs font-mono text-slate-300 font-semibold">₹45 Lakhs</span>
            </div>

            {/* Waste Heat Recovery Loop */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.hasWasteHeatRecovery}
                    onChange={(e) => setInputs({ ...inputs, hasWasteHeatRecovery: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">Flue Gas Waste Heat Exchangers</span>
                </label>
                <span className="text-[11px] text-slate-400 block mt-0.5 ml-6">Recycles high-temperature foundry exhaust into process steam</span>
              </div>
              <span className="text-xs font-mono text-slate-300 font-semibold">₹65 Lakhs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Techno-Economic Returns (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive KPI Board */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400">Total CAPEX</span>
              <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
                ₹{(totalCapex / 10000000).toFixed(2)} Cr
              </div>
              <span className="text-[10px] text-slate-500">Overnight turnkey cost</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400">10-Yr Net Present Value</span>
              <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${npv > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{(npv / 10000000).toFixed(2)} Cr
              </div>
              <span className="text-[10px] text-slate-500">@ {inputs.discountRatePct}% WACC</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400">Project IRR</span>
              <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums mt-1">
                {simpleIRR}% IRR
              </div>
              <span className="text-[10px] text-slate-500">Commercial viability</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400">Simple Payback</span>
              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-1">
                {paybackYears} Yrs
              </div>
              <span className="text-[10px] text-slate-500">Capital recovery</span>
            </div>
          </div>

          {/* Environmental Carbon Abatement Impact */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Annual Tamil Nadu Emissions Abated</h4>
                <p className="text-xs text-slate-400">Scope 1 (thermal fuel) and Scope 2 (TANGEDCO grid) displacement.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Annual Reduction</span>
                <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                  {Math.round(annualCO2Abated).toLocaleString('en-IN')} tCO2e/yr
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Direct TANGEDCO Power Bill Savings</span>
                <div className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                  ₹{(annualEnergySavings / 10000000).toFixed(2)} Cr / yr
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Avoided BEE CCTS Carbon Penalties</span>
                <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums mt-0.5">
                  ₹{(annualCarbonTaxSavings / 100000).toFixed(1)} Lakhs / yr
                </div>
              </div>
            </div>
          </div>

          {/* 10-Year Cumulative Cash Flow Projections */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">10-Year Cumulative Net Cash Flow Timeline</h4>
              <span className="text-xs text-slate-400 font-mono">Assumes 2% energy inflation</span>
            </div>

            <div className="space-y-2">
              {cashFlows.map((cf) => {
                const isPositive = cf.cumulative > 0;
                const maxRange = Math.max(totalCapex * 2.5, 10000000);
                const barWidth = Math.min(100, Math.round((Math.abs(cf.cumulative) / maxRange) * 100));

                return (
                  <div key={cf.year} className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-400 w-12 shrink-0">Year {cf.year}</span>
                    <div className="flex-1 bg-slate-950 h-5 rounded-md overflow-hidden relative border border-slate-800/80">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isPositive ? 'bg-emerald-500/80' : 'bg-rose-500/60'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono tabular-nums text-slate-200">
                        Savings: ₹{(cf.savings / 10000000).toFixed(2)} Cr · Cum: ₹{(cf.cumulative / 10000000).toFixed(2)} Cr
                      </span>
                    </div>
                    <span className={`font-mono tabular-nums w-24 text-right shrink-0 font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      ₹{(cf.cumulative / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
