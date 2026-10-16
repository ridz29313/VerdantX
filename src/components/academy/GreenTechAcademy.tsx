import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, BookOpen, CheckCircle2, ChevronRight, Download, 
  HelpCircle, Lightbulb, Play, Printer, RefreshCw, ShieldCheck, 
  Sliders, Sparkles, XCircle 
} from 'lucide-react';
import { ACADEMY_LESSONS, QUIZ_QUESTIONS } from '../../data/cleantechData';

export const GreenTechAcademy: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'formula' | 'exam'>('formula');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lcoe');

  // Interactive LCOE Sandbox Parameters (Indian Energy Market)
  const [capexPerKW, setCapexPerKW] = useState<number>(38000); // ₹38,000 / kW (~₹3.8 Cr/MW)
  const [waccDiscountRate, setWaccDiscountRate] = useState<number>(8.5); // % (Indian Rupee debt & equity)
  const [capacityFactor, setCapacityFactor] = useState<number>(24); // % (Cauvery basin solar avg)
  const [opexPerKWYear, setOpexPerKWYear] = useState<number>(750); // ₹/kW/yr
  const [lifetimeYears, setLifetimeYears] = useState<number>(25); // years

  // Interactive Battery DoD Sandbox
  const [dodPct, setDodPct] = useState<number>(80);

  // Exam state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('Clean Energy Fellow');

  // LCOE calculation logic in Indian Context
  // LCOE = (Annualized CAPEX + OPEX) / (8760 * Capacity Factor)
  const crf = (waccDiscountRate / 100 > 0)
    ? ( (waccDiscountRate / 100) * Math.pow(1 + waccDiscountRate / 100, lifetimeYears) ) /
      ( Math.pow(1 + waccDiscountRate / 100, lifetimeYears) - 1 )
    : 1 / lifetimeYears;

  const annualizedCapex = capexPerKW * crf;
  const annualTotalCost = annualizedCapex + opexPerKWYear;
  const annualMWhPerKW = (8760 * (capacityFactor / 100)) / 1000;
  const calculatedLCOEPerKWh = annualMWhPerKW > 0 ? (annualTotalCost / (annualMWhPerKW * 1000)).toFixed(2) : '0.00';
  const calculatedLCOEPerMWh = annualMWhPerKW > 0 ? Math.round(annualTotalCost / annualMWhPerKW).toLocaleString('en-IN') : '0';

  // Battery Cycle Life calculation based on Depth of Discharge
  // Approx: Cycles = 12000 * (1 - (dodPct / 100)^1.4)
  const estimatedCycles = Math.round(15000 * Math.pow(1 - (dodPct / 120), 1.2));
  const lifetimeThroughputMWh = ((estimatedCycles * (dodPct / 100) * 100) / 1000).toFixed(1);

  // Exam Score calculation
  const totalQuestions = QUIZ_QUESTIONS.length;
  const correctCount = Object.entries(userAnswers).filter(
    ([qId, ansIdx]) => QUIZ_QUESTIONS.find(q => q.id === Number(qId))?.correctIndex === ansIdx
  ).length;

  const passedExam = examSubmitted && (correctCount / totalQuestions) >= 0.75;

  const handleSubmitExam = () => {
    setExamSubmitted(true);
    if ((correctCount / totalQuestions) >= 0.75) {
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setExamSubmitted(false);
  };

  const selectedLesson = ACADEMY_LESSONS.find(l => l.id === selectedLessonId) || ACADEMY_LESSONS[0];

  return (
    <div className="space-y-6">
      {/* Academy Header Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>VerdantX CleanTech Academy</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Formal Quantitative Curriculum</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Physics, Economics & Certification Lab</h3>
          </div>

          {/* Sub-nav Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('formula')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeSubTab === 'formula' ? 'bg-violet-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Formula Sandbox
            </button>
            <button
              onClick={() => setActiveSubTab('lessons')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeSubTab === 'lessons' ? 'bg-violet-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Curriculum Core
            </button>
            <button
              onClick={() => setActiveSubTab('exam')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeSubTab === 'exam' ? 'bg-violet-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Certification Exam ({correctCount}/{totalQuestions})
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Formula Sandbox */}
      {activeSubTab === 'formula' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: LCOE Sensitivity Interactive Model (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-medium text-violet-400 uppercase">Interactive Formula Sandbox</span>
                <h4 className="text-lg font-bold text-white mt-0.5">Levelized Cost of Energy (LCOE) Equation</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust financial and engineering variables to observe real-time impact on power generation parity.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase">Calculated LCOE</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  ₹{calculatedLCOEPerKWh} <span className="text-sm font-sans font-normal text-slate-400">/ unit (kWh)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">₹{calculatedLCOEPerMWh} per MWh</span>
              </div>
            </div>

            {/* Formula display */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 text-center">
              LCOE = [ (CAPEX × CRF) + OPEX ] / (8,760 × Capacity Factor)
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {/* Slider 1: CAPEX */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Overnight Capital Expenditure (CAPEX)</span>
                  <span className="font-mono font-bold text-white">₹{capexPerKW.toLocaleString('en-IN')} / kW</span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="140000"
                  step="2500"
                  value={capexPerKW}
                  onChange={(e) => setCapexPerKW(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>₹28,000/kW (Utility Solar Tamil Nadu)</span>
                  <span>₹1,40,000/kW (BHEL H2 Peaker / Offshore Wind)</span>
                </div>
              </div>

              {/* Slider 2: WACC Discount Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Cost of Capital / Discount Rate (WACC)</span>
                  <span className="font-mono font-bold text-amber-400">{waccDiscountRate}%</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="16.0"
                  step="0.5"
                  value={waccDiscountRate}
                  onChange={(e) => setWaccDiscountRate(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5.0% (IREDA / Sovereign Green Bond)</span>
                  <span>14.0% (Commercial High-Risk Loan)</span>
                </div>
              </div>

              {/* Slider 3: Capacity Factor */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Plant Capacity Factor (%)</span>
                  <span className="font-mono font-bold text-cyan-400">{capacityFactor}%</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="90"
                  step="1"
                  value={capacityFactor}
                  onChange={(e) => setCapacityFactor(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>18% (Rooftop Solar)</span>
                  <span>40% (Muppandal Wind Corridor)</span>
                  <span>85% (Biomass Cogeneration)</span>
                </div>
              </div>

              {/* Slider 4: Fixed OPEX */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Operations & Maintenance (OPEX)</span>
                  <span className="font-mono font-bold text-slate-200">₹{opexPerKWYear} / kW / year</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="2500"
                  step="50"
                  value={opexPerKWYear}
                  onChange={(e) => setOpexPerKWYear(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>₹400/kW/yr (Automated Cleaning)</span>
                  <span>₹2,200/kW/yr (Complex Turbines)</span>
                </div>
              </div>
            </div>

            {/* Key takeaway */}
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg text-xs text-violet-200">
              <strong className="text-white">Quantitative Insight:</strong> In Tamil Nadu, utility solar LCOE regularly reaches ₹2.10 to ₹2.40 per unit, comfortably undercuting legacy thermal coal (₹4.80+/unit). Lowering WACC via green infrastructure debt is the single highest-leverage financial catalyst.
            </div>
          </div>

          {/* Right Column: Battery Depth of Discharge & Degradation (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-medium text-cyan-400 uppercase">Electrochemical Sandbox</span>
                <h4 className="text-base font-bold text-white mt-0.5">Battery Degradation vs. Depth of Discharge</h4>
                <p className="text-xs text-slate-400 mt-1">
                  How operating depth impacts Lithium Iron Phosphate (LFP) cell cycle longevity.
                </p>
              </div>

              {/* DoD Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Operating Depth of Discharge (DoD)</span>
                  <span className="font-mono font-bold text-cyan-400">{dodPct}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={dodPct}
                  onChange={(e) => setDodPct(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>20% (Gentle buffer)</span>
                  <span>100% (Full cycle stress)</span>
                </div>
              </div>

              {/* Degradation Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400">Estimated Cycle Life</span>
                  <div className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                    {estimatedCycles.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">Cycles to 80% SOH</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400">Operational Horizon</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                    {(estimatedCycles / 365).toFixed(1)} Years
                  </div>
                  <span className="text-[10px] text-slate-500">At 1 cycle / day</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Operating a BESS between 10% and 90% (80% DoD) instead of 0% to 100% can extend cell operational life from 8 years to over 16 years, drastically lowering lifetime Levelized Cost of Storage (LCOS).
              </p>
            </div>

            {/* Direct Air Capture Energy Penalty Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
              <h5 className="text-sm font-semibold text-white">Direct Air Capture (DAC) Thermodynamics</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Because atmospheric CO2 is diluted (~422 ppm or 0.042%), capturing 1 ton of CO2 requires processing over 2 million cubic meters of ambient air. Regeneration heat (desorption) demands between 5.5 to 8.5 GJ of thermal energy per metric ton.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Curriculum Core */}
      {activeSubTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
              Course Modules ({ACADEMY_LESSONS.length})
            </span>
            {ACADEMY_LESSONS.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedLessonId === lesson.id
                    ? 'bg-slate-800/90 border-violet-400/80 shadow-md ring-1 ring-violet-400/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{lesson.category}</span>
                  <span className="font-mono">{lesson.readTime}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{lesson.title}</h4>
              </div>
            ))}
          </div>

          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-medium text-violet-400 uppercase">{selectedLesson.category}</span>
              <h3 className="text-2xl font-bold text-white mt-1">{selectedLesson.title}</h3>
              <p className="text-xs text-slate-300 mt-1">{selectedLesson.summary}</p>
            </div>

            {selectedLesson.keyFormula && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-center text-emerald-400 text-sm">
                {selectedLesson.keyFormula}
              </div>
            )}

            <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
              {selectedLesson.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
              <strong className="text-white block mb-0.5">Core Executive Takeaway:</strong>
              {selectedLesson.takeaway}
            </div>
          </div>
        </div>
      )}

      {/* View 3: Certification Exam */}
      {activeSubTab === 'exam' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">
                  Official Assessment
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">CleanTech Analyst Certification Exam</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pass with 75% or higher (6 of 8 questions correct) to earn your verifiable analyst certificate.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Candidate Full Name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-400"
                />

                <button
                  onClick={handleSubmitExam}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-violet-400 hover:bg-violet-300 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Submit Exam
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6 pt-2">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const userChoice = userAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-white">
                        Question {idx + 1}. {q.question}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">{q.conceptTag}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700';

                        if (examSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 line-through';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-violet-500/30 border-violet-400 text-white font-semibold ring-1 ring-violet-400/40';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={examSubmitted}
                            onClick={() => setUserAnswers({ ...userAnswers, [q.id]: optIdx })}
                            className={`p-3 rounded-lg border text-left transition-all ${btnStyle}`}
                          >
                            <span className="font-mono text-slate-500 mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {examSubmitted && (
                      <div className="pt-2 text-xs text-slate-400 border-t border-slate-850/80 flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate View on Passing */}
          {passedExam && (
            <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-2 border-emerald-400/80 rounded-2xl shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-semibold tracking-widest text-emerald-400">
                  VerdantX Tiruchirappalli Clean Energy Institute
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1">Certificate of CleanTech Mastery</h3>
                <span className="text-[11px] font-mono text-amber-400 block mt-1">
                  Cauvery Clean Energy Consortium · In Alignment with NIT Tiruchirappalli (NITT) Framework
                </span>
                <p className="text-xs text-slate-400 mt-2">
                  This document formally verifies that
                </p>
                <div className="text-2xl font-serif text-white font-bold my-2 tracking-wide">
                  {candidateName || 'Candidate'}
                </div>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  has demonstrated verified competency in Tamil Nadu Levelized Cost of Energy modeling, TANGEDCO grid dispatch arbitrage, BHEL industrial decarbonization, and Indian Carbon Credit Trading Scheme (BEE CCTS) economics.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 font-mono">
                <div>Score: <strong className="text-emerald-400 font-bold">{correctCount}/{totalQuestions} ({Math.round((correctCount/totalQuestions)*100)}%)</strong></div>
                <div>Status: <strong className="text-white">Certified Trichy Fellow</strong></div>
                <div>Location: <strong className="text-amber-300">Tiruchirappalli, TN</strong></div>
                <div>Issued: <strong className="text-white">{new Date().toLocaleDateString('en-IN')}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
