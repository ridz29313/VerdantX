import React, { useState, useEffect } from 'react';
import { 
  Globe2, TrendingUp, TrendingDown, ArrowUpDown, 
  ShieldCheck, AlertCircle, RefreshCw, BarChart2, Plus, Minus, MapPin 
} from 'lucide-react';
import { CARBON_MARKET_ASSETS } from '../../data/cleantechData';
import { CarbonMarketAsset } from '../../types/cleantech';

export const CarbonExExchange: React.FC = () => {
  const [assets, setAssets] = useState<CarbonMarketAsset[]>(CARBON_MARKET_ASSETS);
  const [selectedTicker, setSelectedTicker] = useState<string>('BEE-CCTS-26');
  const [tradeQuantity, setTradeQuantity] = useState<number>(50); // tons
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [userCash, setUserCash] = useState<number>(3500000); // ₹35 Lakhs initial liquidity
  const [userHoldings, setUserHoldings] = useState<Record<string, number>>({
    'BEE-CCTS-26': 450,
    'CAUVERY-BIOCHAR': 80,
    'TN-SOLAR-REC': 600,
    'GHATS-RESTORE': 300,
  });

  const [tradeHistory, setTradeHistory] = useState<{
    id: string;
    ticker: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    total: number;
    time: string;
  }[]>([
    { id: '1', ticker: 'BEE-CCTS-26', type: 'buy', quantity: 150, price: 1920, total: 288000, time: '10:14:22' },
    { id: '2', ticker: 'CAUVERY-BIOCHAR', type: 'buy', quantity: 40, price: 4850, total: 194000, time: '10:12:05' },
    { id: '3', ticker: 'TN-SOLAR-REC', type: 'buy', quantity: 200, price: 1150, total: 230000, time: '09:45:18' },
  ]);

  const [newsAlert, setNewsAlert] = useState<string | null>(
    'BEE CCTS Exchange: Industrial compliance demand from Tamil Nadu boiler & cement clusters lifts allowance prices +3.4%.'
  );

  const selectedAsset = assets.find(a => a.ticker === selectedTicker) || assets[0];

  // Market live tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        const deltaPct = (Math.random() - 0.48) * 0.8; // slight upward drift
        const newPrice = Math.max(100.0, parseFloat((asset.price * (1 + deltaPct / 100)).toFixed(2)));
        const newChange = parseFloat((asset.change24h + deltaPct).toFixed(2));
        const newSparkline = [...asset.sparkline.slice(1), newPrice];

        return {
          ...asset,
          price: newPrice,
          change24h: newChange,
          sparkline: newSparkline,
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Execute trade
  const handleExecuteTrade = () => {
    const totalCost = tradeQuantity * selectedAsset.price;

    if (orderType === 'buy') {
      if (userCash < totalCost) {
        alert(`Insufficient cash balance! Required: ₹${Math.round(totalCost).toLocaleString('en-IN')}`);
        return;
      }

      setUserCash(prev => prev - totalCost);
      setUserHoldings(prev => ({
        ...prev,
        [selectedAsset.ticker]: (prev[selectedAsset.ticker] || 0) + tradeQuantity,
      }));
    } else {
      const currentHolding = userHoldings[selectedAsset.ticker] || 0;
      if (currentHolding < tradeQuantity) {
        alert(`Insufficient credit inventory! You only hold ${currentHolding} tons of ${selectedAsset.ticker}.`);
        return;
      }

      setUserCash(prev => prev + totalCost);
      setUserHoldings(prev => ({
        ...prev,
        [selectedAsset.ticker]: currentHolding - tradeQuantity,
      }));
    }

    const newTrade = {
      id: Math.random().toString(36).substring(2, 9),
      ticker: selectedAsset.ticker,
      type: orderType,
      quantity: tradeQuantity,
      price: selectedAsset.price,
      total: Math.round(totalCost),
      time: new Date().toLocaleTimeString('en-IN'),
    };

    setTradeHistory(prev => [newTrade, ...prev.slice(0, 6)]);
  };

  // Portfolio total valuation
  const portfolioCarbonValue = Object.entries(userHoldings).reduce((acc, [ticker, qty]) => {
    const asset = assets.find(a => a.ticker === ticker);
    return acc + (qty * (asset?.price || 0));
  }, 0);

  const totalNetWorth = userCash + portfolioCarbonValue;

  return (
    <div className="space-y-6">
      {/* Carbon Exchange Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wide">
              <Globe2 className="w-4 h-4" />
              <span>India CarbonEx Commodity Desk</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
                Tiruchirappalli & Cauvery Basin
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">BEE Carbon Credits & Clean Energy Trading Floor</h3>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <div className="text-xs text-slate-400">Trading Liquidity</div>
              <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                ₹{Math.round(userCash).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Carbon Credit Holdings</div>
              <div className="text-lg font-bold font-mono text-teal-400 tabular-nums">
                ₹{Math.round(portfolioCarbonValue).toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Total Portfolio Net Worth</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                ₹{Math.round(totalNetWorth).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Live Market Alert */}
        {newsAlert && (
          <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-xs text-teal-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-semibold text-white">Market Intelligence:</span>
              <span>{newsAlert}</span>
            </div>
            <span className="font-mono text-teal-400 font-medium shrink-0">IEX & BEE Live</span>
          </div>
        )}
      </div>

      {/* Main Two-Zone Trading Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Asset Watchlist & Sparklines (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Listed Indian Carbon & Renewable Instruments (Spot Pricing)
            </span>
            <span className="text-xs text-slate-500">IEX / PXIL clearing</span>
          </div>

          <div className="space-y-3">
            {assets.map(asset => {
              const isSelected = asset.ticker === selectedTicker;
              const isUp = asset.change24h >= 0;

              return (
                <div
                  key={asset.ticker}
                  onClick={() => setSelectedTicker(asset.ticker)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-teal-400/80 shadow-md ring-1 ring-teal-400/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-white">{asset.ticker}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-xs text-slate-400">{asset.standard}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-xs text-teal-400">{asset.co2Type}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 mt-1">{asset.name}</h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Permanence: <strong className="text-slate-300 font-mono">{asset.durabilityYears.toLocaleString()} yrs</strong> · 24h Vol: {asset.volume24h.toLocaleString()} tons
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold font-mono text-white tabular-nums">
                        ₹{asset.price.toFixed(2)}
                      </div>
                      <div className={`text-xs font-mono font-medium flex items-center justify-end gap-1 mt-0.5 ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isUp ? `+${asset.change24h}%` : `${asset.change24h}%`}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Holding: <strong className="text-slate-300 font-mono">{userHoldings[asset.ticker] || 0} tons</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Note on Indian Carbon Framework */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
            <h5 className="text-sm font-semibold text-white">India Carbon Credit Trading Scheme (CCTS) & BEE Compliance</h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under India&apos;s Energy Conservation (Amendment) Act, designated heavy industrial units in Tiruchirappalli (such as BHEL boiler fabrication and auxiliary foundries) must surrender Carbon Credit Certificates (CCCs) to meet Bureau of Energy Efficiency targets. Furthermore, high-permanence biochar made from Cauvery delta agricultural residues locks carbon for over 500 years, earning premium prices on international and domestic voluntary markets.
            </p>
          </div>
        </div>

        {/* Right Column: Execution Order Ticket & Order Book (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Order Placement Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400">Order Ticket</span>
                <h4 className="text-base font-bold text-white">{selectedAsset.ticker}</h4>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setOrderType('buy')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    orderType === 'buy' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    orderType === 'sell' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Quantity to {orderType === 'buy' ? 'Acquire' : 'Liquidate'}</span>
                <span className="font-mono font-bold text-white">{tradeQuantity} Metric Tons CO2</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={tradeQuantity}
                onChange={(e) => setTradeQuantity(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10 tons</span>
                <span>500 tons</span>
              </div>
            </div>

            {/* Order Total & Settlement */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Unit Spot Price:</span>
                <span className="font-mono text-white">₹{selectedAsset.price.toFixed(2)} / ton</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Exchange Clearing & Stamp Duty (0.1%):</span>
                <span className="font-mono text-white">₹{((tradeQuantity * selectedAsset.price) * 0.001).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between font-semibold text-sm">
                <span className="text-white">Estimated Settlement:</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  ₹{Math.round(tradeQuantity * selectedAsset.price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleExecuteTrade}
              className={`w-full py-2.5 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer ${
                orderType === 'buy'
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              Confirm {orderType.toUpperCase()} Order ({tradeQuantity} tons of {selectedAsset.ticker})
            </button>
          </div>

          {/* Recent Executed Trades */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Recent Transaction Ledger (IEX CCTS)
              </span>
              <span className="text-xs text-slate-500">Audit trail</span>
            </div>

            <div className="space-y-2">
              {tradeHistory.map(trade => (
                <div key={trade.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold uppercase text-[11px] ${
                        trade.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {trade.type}
                      </span>
                      <span className="text-slate-200 font-semibold">{trade.ticker}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{trade.time}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white tabular-nums">₹{trade.total.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 block">{trade.quantity}t @ ₹{trade.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
