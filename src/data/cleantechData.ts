import { AcademyLesson, CarbonMarketAsset, DecarbInputs, QuizQuestion, VentureStartup } from '../types/cleantech';

export const INITIAL_STARTUPS: VentureStartup[] = [
  {
    id: 'perovskite_tandem',
    name: 'HeliosTandem Trichy Solar',
    sector: 'High-Temperature Photovoltaics',
    description: 'Silicon-perovskite tandem cells engineered in Trichy to maintain >30% efficiency even in Tamil Nadu 42°C summer heat.',
    iconName: 'Sun',
    initialCapex: 35, // in ₹ Crores
    baseLCOE: 3.80, // ₹/kWh
    targetLCOE: 1.95,
    currentLCOE: 3.80,
    trl: 5,
    carbonAbatementRate: 1200, // tons CO2/yr per MW
    marketCap: 210, // ₹ Crores
    revenueAnnual: 18.5,
    ebitda: -4.2,
    patents: 7,
    unitsDeployed: 2,
    color: '#F59E0B',
  },
  {
    id: 'bhel_hydrogen',
    name: 'Cauvery Green H2 Synthetics',
    sector: 'Electrolyzers & Green Ammonia',
    description: 'Indigenous alkaline and solid-oxide electrolyzers manufactured near BHEL Trichy for Tamil Nadu fertilizer and chemical plants.',
    iconName: 'Waves',
    initialCapex: 55, // ₹ Crores
    baseLCOE: 380, // ₹/kg H2
    targetLCOE: 160,
    currentLCOE: 380,
    trl: 4,
    carbonAbatementRate: 4200,
    marketCap: 320,
    revenueAnnual: 14.2,
    ebitda: -8.5,
    patents: 12,
    unitsDeployed: 1,
    color: '#8B5CF6',
  },
  {
    id: 'deltabio_pellets',
    name: 'DeltaBio Paddy Biomass Coal',
    sector: 'Agri-Waste Decarbonization',
    description: 'Torrefied biomass pelletization converting Cauvery delta paddy straw and sugarcane bagasse into clean boiler fuel.',
    iconName: 'Flame',
    initialCapex: 22,
    baseLCOE: 2.40, // ₹/kg
    targetLCOE: 1.25,
    currentLCOE: 2.40,
    trl: 6,
    carbonAbatementRate: 3100,
    marketCap: 165,
    revenueAnnual: 26.4,
    ebitda: 3.8,
    patents: 4,
    unitsDeployed: 4,
    color: '#EC4899',
  },
  {
    id: 'dravida_battery',
    name: 'Dravida LFP & Sodium Cells',
    sector: 'EV Energy Storage (3W & Grid)',
    description: 'Locally formulated Sodium-Ion battery packs tailored for Indian electric auto-rickshaws and TANGEDCO substation peak shaving.',
    iconName: 'Zap',
    initialCapex: 48,
    baseLCOE: 8.50, // ₹/kWh storage
    targetLCOE: 4.10,
    currentLCOE: 8.50,
    trl: 4,
    carbonAbatementRate: 1900,
    marketCap: 290,
    revenueAnnual: 12.0,
    ebitda: -6.4,
    patents: 9,
    unitsDeployed: 1,
    color: '#06B6D4',
  },
  {
    id: 'kallanai_floatovoltaics',
    name: 'Kallanai Reservoir Floatovoltaics',
    sector: 'Irrigation Canal Solar',
    description: 'Modular pontoon floating solar deployed on Cauvery canals and Grand Anicut reservoirs, cutting water evaporation by 65%.',
    iconName: 'Wind',
    initialCapex: 28,
    baseLCOE: 3.10,
    targetLCOE: 1.85,
    currentLCOE: 3.10,
    trl: 5,
    carbonAbatementRate: 2600,
    marketCap: 190,
    revenueAnnual: 21.0,
    ebitda: 2.1,
    patents: 5,
    unitsDeployed: 3,
    color: '#10B981',
  },
  {
    id: 'deltacool_storage',
    name: 'Trichy DeltaCool Solar Agri-Vaults',
    sector: 'Decentralized Cold Chain',
    description: 'Thermal salt-battery powered solar cold rooms enabling Cauvery banana, coconut, and paddy growers to eliminate post-harvest losses.',
    iconName: 'Leaf',
    initialCapex: 18,
    baseLCOE: 1.60,
    targetLCOE: 0.85,
    currentLCOE: 1.60,
    trl: 6,
    carbonAbatementRate: 1800,
    marketCap: 140,
    revenueAnnual: 16.5,
    ebitda: 1.9,
    patents: 6,
    unitsDeployed: 5,
    color: '#14B8A6',
  },
];

export const CARBON_MARKET_ASSETS: CarbonMarketAsset[] = [
  {
    ticker: 'BEE-CCTS-26',
    name: 'India Carbon Credit Trading Scheme (BEE PAT)',
    standard: 'BEE CCTS',
    price: 1920.00, // ₹ / ton CO2e
    change24h: 3.40,
    volume24h: 284000,
    durabilityYears: 100,
    co2Type: 'Compliance Allowance',
    sparkline: [1840, 1865, 1880, 1895, 1910, 1920],
  },
  {
    ticker: 'CAUVERY-BIOCHAR',
    name: 'Cauvery Delta Rice Husk Biochar Removal',
    standard: 'Puro.earth CDR',
    price: 4850.00, // ₹ / ton CO2e
    change24h: 5.20,
    volume24h: 32000,
    durabilityYears: 500,
    co2Type: 'Removal',
    sparkline: [4500, 4600, 4680, 4720, 4800, 4850],
  },
  {
    ticker: 'TN-SOLAR-REC',
    name: 'Tamil Nadu TANGEDCO Renewable Energy Certificate',
    standard: 'I-REC',
    price: 1150.00,
    change24h: 1.80,
    volume24h: 125000,
    durabilityYears: 50,
    co2Type: 'Avoidance',
    sparkline: [1110, 1120, 1135, 1140, 1145, 1150],
  },
  {
    ticker: 'GHATS-RESTORE',
    name: 'Western Ghats Biodiversity & Watershed Carbon',
    standard: 'Verra VCS',
    price: 920.00,
    change24h: -1.50,
    volume24h: 84000,
    durabilityYears: 60,
    co2Type: 'Avoidance',
    sparkline: [950, 940, 935, 930, 925, 920],
  },
];

export const FACILITY_PRESETS: Record<string, DecarbInputs> = {
  datacenter: {
    facilityType: 'datacenter',
    facilityName: 'Trichy IT Park & Tier-3 Data Hub (Navalpattu SEZ)',
    annualConsumptionGWh: 42,
    peakDemandMW: 6.5,
    electricityTariffPerKWh: 8.50, // ₹8.50/unit TANGEDCO HT commercial
    carbonTaxPerTon: 1800, // ₹1,800/ton under Indian CCTS
    rooftopAreaSqM: 18000,
    hasSolarPV: true,
    solarCapacityMW: 2.8,
    hasBESS: true,
    bessCapacityMWh: 10,
    hasHeatPump: false,
    hasWasteHeatRecovery: true,
    discountRatePct: 8.5,
  },
  industrial_steel: {
    facilityType: 'industrial_steel',
    facilityName: 'BHEL Trichy Heavy Fabrication & Boiler Unit',
    annualConsumptionGWh: 280,
    peakDemandMW: 45,
    electricityTariffPerKWh: 7.80, // ₹7.80/unit TANGEDCO HT Industrial
    carbonTaxPerTon: 2200,
    rooftopAreaSqM: 120000,
    hasSolarPV: true,
    solarCapacityMW: 18.0,
    hasBESS: true,
    bessCapacityMWh: 50,
    hasHeatPump: false,
    hasWasteHeatRecovery: true,
    discountRatePct: 9.0,
  },
  commercial: {
    facilityType: 'commercial',
    facilityName: 'NIT Tiruchirappalli (NITT) Academic & Lab Campus',
    annualConsumptionGWh: 16,
    peakDemandMW: 2.8,
    electricityTariffPerKWh: 8.20,
    carbonTaxPerTon: 1500,
    rooftopAreaSqM: 25000,
    hasSolarPV: true,
    solarCapacityMW: 3.5,
    hasBESS: true,
    bessCapacityMWh: 8.0,
    hasHeatPump: true,
    hasWasteHeatRecovery: false,
    discountRatePct: 7.5,
  },
  cold_storage: {
    facilityType: 'cold_storage',
    facilityName: 'Cauvery Delta Agri-Logistics & Banana Hub (Thiruverumbur)',
    annualConsumptionGWh: 24,
    peakDemandMW: 4.2,
    electricityTariffPerKWh: 8.90,
    carbonTaxPerTon: 1600,
    rooftopAreaSqM: 32000,
    hasSolarPV: true,
    solarCapacityMW: 4.2,
    hasBESS: true,
    bessCapacityMWh: 12,
    hasHeatPump: true,
    hasWasteHeatRecovery: false,
    discountRatePct: 8.0,
  },
};

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'lcoe',
    title: 'Levelized Cost of Electricity in India (LCOE)',
    category: 'Indian Energy Economics',
    readTime: '4 min',
    summary: 'How utility solar in Tamil Nadu and Rajasthan reached ₹2.10/kWh ($0.025/kWh), beating domestic coal plants.',
    keyFormula: 'LCOE = \\frac{\\sum_{t=1}^n \\frac{\\text{CAPEX}_t + \\text{OPEX}_t}{(1+r)^t}}{\\sum_{t=1}^n \\frac{\\text{Electricity}_t}{(1+r)^t}}',
    content: [
      'In India, solar auctions by SECI (Solar Energy Corporation of India) and TANGEDCO regularly clear at ₹2.20 to ₹2.60 per unit, while new pithead coal plants cost over ₹4.50/unit.',
      'Tamil Nadu holds the unique distinction of having one of the world\'s highest wind energy penetrations, thanks to the Muppandal-Palakkad pass wind corridor.',
      'Under the PM-KUSUM scheme, solarizing agricultural pump sets in rural Trichy eliminates state electricity subsidies and provides farmers with daytime power.',
    ],
    takeaway: 'Low-cost domestic solar paired with 4-hour battery storage in Tamil Nadu is now cheaper than importing thermal coal.',
  },
  {
    id: 'duck_curve',
    title: 'The TANGEDCO Duck Curve & Cauvery Delta Grid Balancing',
    category: 'Tamil Nadu Power Grid',
    readTime: '5 min',
    summary: 'Managing daytime solar influx and steep evening lighting/pump peaks in Tiruchirappalli.',
    content: [
      'Between 10:00 AM and 2:00 PM, rooftop and utility solar generation across central Tamil Nadu depresses net grid demand.',
      'When solar drops at sunset (6:00 PM), industrial workers return home and agricultural irrigation pumps turn on, creating a sudden 4,000 MW ramp on the TANGEDCO transmission system.',
      'Battery Energy Storage Systems (BESS) installed at Trichy 230kV substations absorb surplus midday power and discharge during the 18:00 to 22:00 peak hours, earning high IEX Real-Time Market (RTM) tariffs.',
    ],
    takeaway: 'Discharging stored clean solar into the evening grid yields ₹8 to ₹12 per unit on the Indian Energy Exchange.',
  },
  {
    id: 'ccts_market',
    title: 'India Carbon Credit Trading Scheme (CCTS) & BEE PAT',
    category: 'Indian Carbon Policy',
    readTime: '4 min',
    summary: 'The national cap-and-trade compliance framework established under the Energy Conservation (Amendment) Act.',
    content: [
      'India\'s Bureau of Energy Efficiency (BEE) mandates energy reduction targets for Designated Consumers (steel plants, cement kilns, and BHEL boiler fabrication units in Trichy).',
      'Facilities that exceed their energy-efficiency targets earn Energy Saving Certificates (ESCerts) and Carbon Credits, which can be traded on domestic power exchanges.',
      'Trichy fabrication units that replace furnace oil with bio-pellets or electrified heat pumps earn carbon credits currently valued at ₹1,800 to ₹2,500 per ton.',
    ],
    takeaway: 'Decarbonizing industrial heat directly converts regulatory penalties into carbon credit trading profits.',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Why is Tiruchirappalli (Trichy) strategically positioned to lead India’s industrial decarbonization and green hydrogen transition?',
    options: [
      'It has no existing manufacturing infrastructure and relies purely on tourism',
      'It is home to BHEL, heavy boiler fabrication clusters, and premier research institutions like NIT Trichy with high solar insolation',
      'It experiences snowfall for six months every year',
      'It is situated on an offshore oceanic trench'
    ],
    correctIndex: 1,
    explanation: 'Trichy is the "Energy Fabrication Capital of India", hosting BHEL, hundreds of fabrication MSMEs, NIT Trichy, and high solar irradiance (5.5 kWh/m²/day) along the Cauvery industrial corridor.',
    conceptTag: 'Trichy CleanTech'
  },
  {
    id: 2,
    question: 'Under India\'s Carbon Credit Trading Scheme (CCTS) managed by BEE, what happens when an industrial plant in Trichy reduces emissions below its designated baseline?',
    options: [
      'It is forced to pay a penalty to the central government',
      'It receives verified Carbon Credit Certificates (CCCs) that can be monetized on Indian energy exchanges',
      'Its factory license is immediately revoked',
      'The savings are confiscated by the local municipality'
    ],
    correctIndex: 1,
    explanation: 'Plants achieving energy reductions beyond BEE targets are issued verified carbon credits, which they can sell to non-compliant industrial facilities on power exchanges like IEX.',
    conceptTag: 'Indian Carbon Markets'
  },
  {
    id: 3,
    question: 'How do "Floatovoltaics" (floating solar) installed on Cauvery river reservoirs and irrigation tanks in Tamil Nadu create dual economic value?',
    options: [
      'They turn the reservoir water into carbonated soda',
      'They generate clean electricity while conserving water by drastically reducing evaporation losses in agricultural areas',
      'They prevent fish from swimming in the irrigation canals',
      'They convert river water directly into crude oil'
    ],
    correctIndex: 1,
    explanation: 'Floating solar panels on water bodies conserve valuable irrigation water by shading the surface (reducing evaporation by up to 60-70%) while water cooling boosts solar panel efficiency by 8-12%.',
    conceptTag: 'Floatovoltaics'
  },
  {
    id: 4,
    question: 'What is the role of TANGEDCO in managing Tamil Nadu’s massive renewable energy mix?',
    options: [
      'It exclusively imports coal from Australia without grid management',
      'It serves as the state utility balancing fluctuating wind (Muppandal) and solar generation through load dispatch centers',
      'It prohibits private rooftop solar installations across the state',
      'It operates only residential diesel generators'
    ],
    correctIndex: 1,
    explanation: 'TANGEDCO / TANTRANSCO is the state transmission and distribution utility managing the integration of Tamil Nadu\'s nation-leading wind and solar capacities through regional state load dispatch centers (SLDC).',
    conceptTag: 'TANGEDCO Grid'
  },
  {
    id: 5,
    question: 'Under the Indian PM-KUSUM Scheme, how do farmers in the Cauvery delta benefit from solar agriculture pumps?',
    options: [
      'They can sell excess solar electricity back to the DISCOM during non-irrigation hours and get reliable daytime water',
      'They must pay 100% upfront tariffs with zero subsidies',
      'The pumps only operate at midnight during peak tariff hours',
      'They are required to stop growing paddy and bananas'
    ],
    correctIndex: 0,
    explanation: 'PM-KUSUM provides subsidized solar pump sets and solar feeders, allowing farmers to irrigate during daylight without relying on diesel, while selling surplus clean power to the state grid.',
    conceptTag: 'Agri-Solar'
  },
  {
    id: 6,
    question: 'How does converting Cauvery delta paddy straw into torrefied bio-pellets prevent air pollution while generating profit for MSMEs in Trichy?',
    options: [
      'It requires burning the fields openly at night',
      'It replaces expensive imported coal in industrial boilers, avoiding crop residue burning and earning carbon credits',
      'It converts straw into synthetic plastic wrappers',
      'It dumps biomass directly into the Bay of Bengal'
    ],
    correctIndex: 1,
    explanation: 'Densified agri-biomass pellets substitute fossil coal in thermal boilers (like BHEL-designed systems), creating clean rural income, eliminating crop burning smoke, and generating carbon revenue.',
    conceptTag: 'Biomass Energy'
  },
];
