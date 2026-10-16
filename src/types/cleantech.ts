export type ActiveTab = 'gridmaster' | 'tycoon' | 'calculator' | 'carbonex' | 'academy';

export interface GridAsset {
  id: string;
  name: string;
  type: 'solar' | 'wind' | 'battery' | 'hydrogen' | 'geothermal';
  capacityMW: number;
  currentOutputMW: number;
  operatingCostPerMWh: number; // OPEX $/MWh
  carbonIntensity: number; // kg CO2 / MWh (0 for pure clean)
  color: string;
  isDispatchable: boolean;
  status: 'active' | 'curtailed' | 'standby';
  level: number;
  upgradeCost: number;
}

export interface GridSimulationState {
  hour: number; // 0 to 23
  minute: number; // 0 to 59
  speed: 0 | 1 | 2 | 5; // 0 = paused
  solarMultiplier: number;
  windMultiplier: number;
  gridDemandMW: number;
  spotPricePerMWh: number; // Dynamic wholesale price
  batteryStorageMWh: number;
  batteryCapacityMWh: number;
  batteryMode: 'charge' | 'discharge' | 'idle' | 'auto';
  batteryDispatchRateMW: number;
  hydrogenFuelReserveKg: number;
  hydrogenDispatchMW: number;
  cashReserves: number;
  carbonAbatedTons: number;
  blackoutSeconds: number;
  blackoutPenaltyTotal: number;
  hourlyHistory: {
    time: string;
    demand: number;
    solar: number;
    wind: number;
    battery: number;
    cleanTotal: number;
    spotPrice: number;
    revenue: number;
  }[];
  activeEvent: {
    title: string;
    description: string;
    impact: string;
    durationHours: number;
    type: 'weather' | 'demand' | 'market';
  } | null;
  dayComplete: boolean;
  score: number;
}

export interface VentureStartup {
  id: string;
  name: string;
  sector: string;
  description: string;
  iconName: string;
  initialCapex: number; // in $M
  baseLCOE: number; // $/MWh or $/ton
  targetLCOE: number;
  currentLCOE: number;
  trl: number; // 1 (Basic research) to 9 (Commercial deployment)
  carbonAbatementRate: number; // tons CO2/year per unit
  marketCap: number; // in $M
  revenueAnnual: number;
  ebitda: number;
  patents: number;
  unitsDeployed: number;
  color: string;
}

export interface TycoonGameState {
  quarter: number; // 1 to 20 (5 years)
  cashBalanceM: number;
  reputation: number; // 0 to 100
  totalCarbonAbatedTons: number;
  portfolio: {
    startupId: string;
    sharesPercent: number;
    trl: number;
    currentLCOE: number;
    unitsDeployed: number;
    annualRevenueM: number;
    cumulativeProfitM: number;
  }[];
  marketCondition: 'Bullish Tech Wave' | 'Stable Transition' | 'Supply Chain Bottleneck' | 'Government Subsidy Surge';
  completed: boolean;
  highScore: number;
}

export interface DecarbInputs {
  facilityType: 'commercial' | 'industrial_steel' | 'datacenter' | 'cold_storage';
  facilityName: string;
  annualConsumptionGWh: number;
  peakDemandMW: number;
  electricityTariffPerKWh: number;
  carbonTaxPerTon: number;
  rooftopAreaSqM: number;
  hasSolarPV: boolean;
  solarCapacityMW: number;
  hasBESS: boolean;
  bessCapacityMWh: number;
  hasHeatPump: boolean;
  hasWasteHeatRecovery: boolean;
  discountRatePct: number;
}

export interface CarbonMarketAsset {
  ticker: string;
  name: string;
  standard: 'BEE CCTS' | 'EU ETS' | 'Verra VCS' | 'Gold Standard' | 'Puro.earth CDR' | 'I-REC';
  price: number;
  change24h: number;
  volume24h: number;
  durabilityYears: number; // Permanence: 20 yrs for trees, 1000+ yrs for DAC/Biochar
  co2Type: 'Removal' | 'Avoidance' | 'Compliance Allowance';
  sparkline: number[];
}

export interface AcademyLesson {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  keyFormula?: string;
  variables?: { name: string; symbol: string; unit: string; description: string }[];
  content: string[];
  takeaway: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
}
