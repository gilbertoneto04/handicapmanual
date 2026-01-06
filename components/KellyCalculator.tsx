import React, { useState, useEffect } from 'react';
import { Percent, Hash } from 'lucide-react';

const KellyCalculator: React.FC = () => {
  const [bankroll, setBankroll] = useState('1000');
  const [odd, setOdd] = useState('');
  
  // Input mode: 'prob' (Probability %) or 'fairOdd' (Fair Odd)
  const [inputMode, setInputMode] = useState<'prob' | 'fairOdd'>('prob');
  const [inputValue, setInputValue] = useState(''); // Stores either prob% or fair odd

  const [kellyFraction, setKellyFraction] = useState('1'); 
  const [result, setResult] = useState<{ stake: string, percentage: string, color: string } | null>(null);

  useEffect(() => {
    const b = parseFloat(bankroll);
    const o = parseFloat(odd);
    const fraction = parseFloat(kellyFraction);
    const val = parseFloat(inputValue);

    if (!isNaN(b) && !isNaN(o) && !isNaN(val) && o > 1 && val > 0 && fraction > 0) {
      
      let probDecimal = 0;

      if (inputMode === 'prob') {
        // Input is percentage (e.g., 55 for 55%)
        probDecimal = val / 100;
      } else {
        // Input is fair odd (e.g., 2.00)
        // Prob = 1 / FairOdd
        if (val <= 1) { // Fair odd must be > 1
            setResult(null);
            return;
        }
        probDecimal = 1 / val;
      }

      // Kelly Formula: f = (bp - q) / b
      // where b = net odds (decimal - 1)
      // p = probability of winning (0.0 to 1.0)
      // q = probability of losing (1 - p)
      
      const netOdds = o - 1;
      const q = 1 - probDecimal;
      
      const f = (netOdds * probDecimal - q) / netOdds;
      const adjustedF = f * fraction;

      if (adjustedF <= 0) {
        setResult({
            stake: '0.00',
            percentage: '0.00%',
            color: 'text-red-400'
        });
      } else {
        const stakeAmount = b * adjustedF;
        setResult({
            stake: stakeAmount.toFixed(2),
            percentage: (adjustedF * 100).toFixed(2) + '%',
            color: 'text-emerald-400'
        });
      }
    } else {
        setResult(null);
    }
  }, [bankroll, odd, inputValue, kellyFraction, inputMode]);

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Critério de Kelly</h2>
      
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <div className="space-y-6">
            
            {/* Bankroll */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Banca Total (Bankroll)</label>
                <input
                    type="number"
                    value={bankroll}
                    onChange={(e) => setBankroll(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ex: 1000"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Odd da Aposta</label>
                    <input
                        type="number"
                        value={odd}
                        onChange={(e) => setOdd(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Ex: 2.00"
                    />
                </div>
                
                {/* Dynamic Input (Prob or Fair Odd) */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-400">
                            {inputMode === 'prob' ? 'Probabilidade Real (%)' : 'Odd Justa (Fair Odd)'}
                        </label>
                        <button 
                            onClick={() => {
                                setInputMode(prev => prev === 'prob' ? 'fairOdd' : 'prob');
                                setInputValue(''); // Clear input on switch to avoid confusion
                            }}
                            className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            {inputMode === 'prob' ? <Hash size={12}/> : <Percent size={12}/>}
                            Trocar para {inputMode === 'prob' ? 'Odd Justa' : 'Probabilidade'}
                        </button>
                    </div>
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder={inputMode === 'prob' ? "Ex: 55" : "Ex: 1.80"}
                    />
                </div>
            </div>

            {/* Fraction Slider & Input */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-slate-400">
                        Fração do Kelly
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">x</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="1"
                            value={kellyFraction}
                            onChange={(e) => setKellyFraction(e.target.value)}
                            className="w-20 bg-slate-800 border border-slate-600 text-white text-center rounded-lg p-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>
                
                <input 
                    type="range" 
                    min="0.01" 
                    max="1" 
                    step="0.01" 
                    value={kellyFraction}
                    onChange={(e) => setKellyFraction(e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Conservador (0.1)</span>
                    <span>Meio Kelly (0.5)</span>
                    <span>Full Kelly (1.0)</span>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="mt-6 bg-slate-900/50 rounded-xl p-6 border border-slate-700 text-center animate-in slide-in-from-bottom-2">
                     <p className="text-slate-500 text-xs uppercase mb-1">Valor da Aposta Sugerida</p>
                     <p className={`text-4xl font-bold ${result.color} mb-2`}>R$ {result.stake}</p>
                     <p className="text-slate-400 text-sm">
                        Representa <span className="font-bold text-white">{result.percentage}</span> da sua banca
                     </p>
                </div>
            )}
            
        </div>
      </div>
    </div>
  );
};

export default KellyCalculator;