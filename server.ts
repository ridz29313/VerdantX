import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK on server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint 1: CleanTech Venture Pitch Evaluator
app.post('/api/gemini/evaluate-pitch', async (req, res) => {
  try {
    const { startupName, sector, description, targetLCOE, targetTRL, targetAbatement } = req.body;

    const prompt = `You are a Senior Principal at a top Indian Climate Tech Venture Capital fund (partnered with MNRE, IIT Madras Pravartak, and NIT Trichy Center of Excellence).
Conduct an institutional-grade techno-economic and physics due diligence audit of this GreenTech startup based in or around Tiruchirappalli, Tamil Nadu:

Startup Name: ${startupName}
Sector: ${sector}
Core Technology: ${description}
Target Cost/LCOE: ${targetLCOE}
Current TRL: ${targetTRL} / 9
Target Annual Carbon Abatement: ${targetAbatement} tons CO2/year

Provide a rigorous, quantitatively grounded evaluation assessing thermodynamic feasibility, unit economics in Indian Rupees (₹), local manufacturing synergy with the Tiruchirappalli heavy engineering corridor (BHEL, Thuvakudi fabrication clusters), defensibility under Indian climatic conditions, and investment recommendation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viabilityScore: {
              type: Type.NUMBER,
              description: 'Score from 1 to 100 on overall techno-economic viability and venture return potential in India',
            },
            executiveVerdict: {
              type: Type.STRING,
              description: 'Concise 2-sentence summary investment thesis for Indian clean tech',
            },
            thermodynamicRealityCheck: {
              type: Type.STRING,
              description: 'Scientific assessment of the physics, Carnot/Faraday/Shockley-Queisser limits, and high-ambient heat (40°C+) conversion efficiency',
            },
            economicMoat: {
              type: Type.STRING,
              description: 'Defensibility against conventional alternatives and cost-down curve potential in the Indian ecosystem',
            },
            criticalRisks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 3 engineering or market adoption risks in India',
            },
            recommendedInvestmentStage: {
              type: Type.STRING,
              description: 'Seed, Series A, Series B, or Non-dilutive Grant (e.g., BIRAC, TDB, MNRE)',
            },
            suggestedSyndicatePartners: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 real-world climate funds or corporate venture arms in India (e.g. Speciale Invest, Omnivore, BHEL Green Venture, Avaana Capital)',
            },
          },
          required: [
            'viabilityScore',
            'executiveVerdict',
            'thermodynamicRealityCheck',
            'economicMoat',
            'criticalRisks',
            'recommendedInvestmentStage',
            'suggestedSyndicatePartners',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/gemini/evaluate-pitch:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate pitch' });
  }
});

// Endpoint 2: Real-time Smart Grid Copilot Dispatch Advisor
app.post('/api/gemini/grid-copilot', async (req, res) => {
  try {
    const { hour, demandMW, totalCleanMW, spotPrice, batteryStorageMWh, batteryCapacityMWh, activeEvent } = req.body;

    const prompt = `You are the Chief Dispatch Officer at the TANGEDCO Central Regional Load Dispatch Center in Tiruchirappalli, Tamil Nadu.
Given current real-time grid conditions on the Cauvery delta transmission network:
- Time of Day: ${hour}:00
- Grid Total Demand: ${demandMW} MW
- Total Clean Output: ${totalCleanMW} MW (Net: ${totalCleanMW - demandMW} MW)
- Current Wholesale Spot Price: ₹${spotPrice}/MWh (₹${(spotPrice / 1000).toFixed(2)}/unit on IEX Real-Time Market)
- BESS Battery Storage: ${batteryStorageMWh} / ${batteryCapacityMWh} MWh (${Math.round((batteryStorageMWh / batteryCapacityMWh) * 100)}% State of Charge)
- Active Weather/Grid Shock: ${activeEvent ? `${activeEvent.title} (${activeEvent.impact})` : 'Nominal grid conditions'}

Recommend immediate tactical actions to optimize power revenue, ensure 100% grid frequency stability (49.90 - 50.05 Hz statutory band), prevent unserved energy/DSM blackout penalties, and maximize peak arbitrage profit.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tacticalAction: {
              type: Type.STRING,
              description: 'Primary dispatch command (e.g. Rapid BESS discharge, Curtail solar, Fire H2 peaker, or Maximize BESS charge)',
            },
            economicRationale: {
              type: Type.STRING,
              description: 'Explanation of wholesale spot arbitrage profit opportunity or penalty avoidance in Indian Rupees',
            },
            gridStabilityRating: {
              type: Type.STRING,
              description: 'Stable, Stressed, or Critical Alert',
            },
            nextHourForecast: {
              type: Type.STRING,
              description: 'Prediction of how demand ramp or solar duck curve will shift in the subsequent 60-120 minutes',
            },
          },
          required: ['tacticalAction', 'economicRationale', 'gridStabilityRating', 'nextHourForecast'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/gemini/grid-copilot:', err);
    res.status(500).json({ error: err.message || 'Failed to get grid copilot advice' });
  }
});

// Endpoint 3: AI Industrial Decarbonization Roadmap
app.post('/api/gemini/decarb-roadmap', async (req, res) => {
  try {
    const { facilityName, facilityType, annualGWh, currentTariff, totalCapex, annualSavings, npv, irr } = req.body;

    const prompt = `You are a Principal Industrial Energy & Decarbonization Advisor in Tamil Nadu, India.
Analyze this industrial decarbonization project in the Tiruchirappalli region:
- Facility: ${facilityName} (${facilityType})
- Annual Consumption: ${annualGWh} GWh
- Current Tariff: ₹${currentTariff}/kWh (TANGEDCO HT tariff)
- Project Overnight CAPEX: ₹${totalCapex.toLocaleString('en-IN')}
- Annual Savings: ₹${annualSavings.toLocaleString('en-IN')}/yr
- 10-Yr Net Present Value: ₹${npv.toLocaleString('en-IN')}
- Internal Rate of Return (IRR): ${irr}%

Provide an executive strategic implementation roadmap tailored to Indian Bureau of Energy Efficiency (BEE) guidelines and TANGEDCO interconnection regulations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  timeline: { type: Type.STRING },
                  actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['phaseNumber', 'title', 'timeline', 'actionItems'],
              },
            },
            grantFundingOpportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Real-world clean energy policy incentives (e.g. IRA Section 48 ITC, EU Innovation Fund, Horizon Europe)',
            },
            riskMitigations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['phases', 'grantFundingOpportunities', 'riskMitigations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/gemini/decarb-roadmap:', err);
    res.status(500).json({ error: err.message || 'Failed to generate decarbonization roadmap' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`VerdantX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
