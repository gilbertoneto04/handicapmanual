import React, { useState, useMemo } from 'react';
import { EvOddInput } from '../types';
import { Trash2, Plus, RotateCcw } from 'lucide-react';

type MethodType = 'traditional' | 'mpto' | 'logarithmic' | 'oddsratio';

const EvCalculator: React.FC = () => {
  const [odds, setOdds] = useState<EvOddInput[]>([
    { id: 1, odd: '', betOdd: '' },
    { id: 2, odd: '', betOdd: '' }
  ]);
  const [method, setMethod] = useState<MethodType>('traditional');

  const addOddField = () => {
    const newId = odds.length > 0 ? Math.max(...odds.map(o => o.id)) + 1 : 1;
    setOdds([...odds, { id: newId, odd: '', betOdd: '' }]);
  };

  const removeOddField = (id: number) => {
    if (odds.length <= 2) return; // Minimum 2 inputs
    setOdds(odds.filter(o => o.id !== id));
  };

  const updateOdd = (id: number, field: 'odd' | 'betOdd', value: string) => {
    setOdds(odds.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const resetFields = () => {
    setOdds([
        { id: 1, odd: '', betOdd: '' },
        { id: 2, odd: '', betOdd: '' }
    ]);
  };

  // Helper solvers
  const solveLogarithmic = (impliedProbs: number[]): number[] => {
    // Solve for k in sum(p^k) = 1
    // Newton-Raphson
    let k = 1.0; 
    const target = 1.0;
    for (let i = 0; i < 20; i++) {
        let sum = 0;
        let slope = 0;
        for (const p of impliedProbs) {
            const val = Math.pow(p, k);
            sum += val;
            slope += val * Math.log(p);
        }
        if (Math.abs(sum - target) < 1e-6) break;
        k = k - (sum - target) / slope;
    }
    return impliedProbs.map(p => Math.pow(p, k));
  };

  const solveOddsRatio = (impliedProbs: number[]): number[] => {
    // Solve for c in sum( (c * p/(1-p)) / (1 + c * p/(1-p)) ) = 1
    // Let ratio_i = p_i / (1 - p_i)
    // We want sum( (c * ratio_i) / (1 + c * ratio_i) ) = 1
    const ratios = impliedProbs.map(p => p / (1 - p));
    let c = 1.0;
    
    // Simple bisection or Newton. Bisection is safer for 0 to inf.
    let min = 0;
    let max = 10; // usually close to 1
    
    // Find generic bounds if 10 is too low
    while (true) {
        let sum = 0;
        for (const r of ratios) {
            sum += (max * r) / (1 + max * r);
        }
        if (sum > 1) break;
        min = max;
        max *= 2;
        if (max > 1000) break; // Safety
    }

    // Bisection
    for (let i = 0; i < 30; i++) {
        c = (min + max) / 2;
        let sum = 0;
        for (const r of ratios) {
            sum += (c * r) / (1 + c * r);
        }
        if (sum > 1) max = c;
        else min = c;
    }

    return ratios.map(r => (c * r) / (1 + c * r));
  };


  // Main calculation
  const { results, totalJuice } = useMemo(() => {
    let sumImplied = 0;
    const impliedProbs: number[] = [];
    const ids: number[] = [];

    // Collect valid odds
    odds.forEach(item => {
        const val = parseFloat(item.odd);
        if (!isNaN(val) && val > 1) {
            const p = 1 / val;
            impliedProbs.push(p);
            ids.push(item.id);
            sumImplied += p;
        }
    });

    if (impliedProbs.length < 2) return { results: {}, totalJuice: 0 };

    const juice = (sumImplied - 1) * 100;
    
    let fairProbs: number[] = [];

    switch (method) {
        case 'mpto': 
            // Additive / Equal Margin distribution
            // P_fair = P_implied - (Margin / N)
            // Margin = sumImplied - 1
            const diff = sumImplied - 1;
            fairProbs = impliedProbs.map(p => p - (diff / impliedProbs.length));
            break;
        case 'logarithmic':
            // Power function
            fairProbs = solveLogarithmic(impliedProbs);
            break;
        case 'oddsratio':
            // Shin / Odds Ratio
            fairProbs = solveOddsRatio(impliedProbs);
            break;
        case 'traditional':
        default:
            // Multiplicative / Normalization
            fairProbs = impliedProbs.map(p => p / sumImplied);
            break;
    }

    const resultMap: Record<number, { fairOdd: string, margin: string, marginColor: string }> = {};

    ids.forEach((id, idx) => {
        const prob = fairProbs[idx];
        const fairOdd = prob > 0 ? 1 / prob : 0;
        
        let marginText = "";
        let marginColor = "text-slate-500";
        
        // Find input
        const inputItem = odds.find(o => o.id === id);
        if (inputItem && fairOdd > 0) {
            const betOddVal = parseFloat(inputItem.betOdd);
            if (!isNaN(betOddVal) && betOddVal > 0) {
                const margin = (betOddVal / fairOdd - 1) * 100; // (Odd / Fair - 1) %
                marginText = `${margin > 0 ? '+' : ''}${margin.toFixed(2)}%`;
                
                if (margin > 0) marginColor = "text-emerald-400";
                else if (margin === 0) marginColor = "text-blue-400";
                else marginColor = "text-red-400";
            }
        }

        resultMap[id] = {
            fairOdd: fairOdd > 0 ? fairOdd.toFixed(3) : '-',
            margin: marginText,
            marginColor
        };
    });

    return { results: resultMap, totalJuice: juice };

  }, [odds, method]);


  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Calculadora EV%</h2>
        <div className="flex items-center gap-2">
            <button 
                onClick={resetFields}
                className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-full hover:bg-slate-700 border border-slate-700"
                title="Limpar tudo"
            >
                <RotateCcw size={18} />
            </button>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        
        {/* Method Selector */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Método de Cálculo</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { id: 'traditional', label: 'Tradicional' },
                    { id: 'mpto', label: 'MPTO (Aditivo)' },
                    { id: 'logarithmic', label: 'Logarítmica' },
                    { id: 'oddsratio', label: 'Odds Ratio' }
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMethod(m.id as MethodType)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${method === m.id 
                                ? 'bg-emerald-500 text-white shadow-lg' 
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-700'}
                        `}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Juice Display */}
        {totalJuice > 0 && (
             <div className="mb-6 p-3 bg-slate-900/50 rounded-xl border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium">Juice (Margem da Casa)</span>
                <span className="text-emerald-400 font-bold font-mono">{totalJuice.toFixed(2)}%</span>
            </div>
        )}

        <div className="space-y-4">
            
          {odds.map((item, index) => {
            const result = results[item.id];
            const hasValidOdd = parseFloat(item.odd) > 1;

            return (
                <div key={item.id} className="relative bg-slate-900/50 p-4 rounded-xl border border-slate-700 transition-all hover:border-slate-600">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                        
                        {/* Reference Odd Input */}
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                                Odd {index + 1} (Ref)
                            </label>
                            <input
                                type="number"
                                value={item.odd}
                                onChange={(e) => updateOdd(item.id, 'odd', e.target.value)}
                                placeholder="Ex: 1.90"
                                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        {/* Fair Odd Display */}
                        <div className={`flex-1 w-full md:text-center transition-opacity duration-300 ${result ? 'opacity-100' : 'opacity-0'}`}>
                             <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Fair Odd</label>
                             <div className="text-xl font-mono font-bold text-white py-2">
                                {result ? result.fairOdd : '-'}
                             </div>
                        </div>

                         {/* Betting Odd Input */}
                        <div className={`flex-1 w-full transition-opacity duration-300 ${hasValidOdd ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                                Odd Apostada
                            </label>
                            <input
                                type="number"
                                value={item.betOdd}
                                onChange={(e) => updateOdd(item.id, 'betOdd', e.target.value)}
                                placeholder="Sua odd"
                                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                         {/* Margin Display */}
                         <div className={`flex-1 w-full md:text-center transition-opacity duration-300 ${result && result.margin ? 'opacity-100' : 'opacity-0'}`}>
                             <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">EV (Margem)</label>
                             <div className={`text-xl font-mono font-bold py-2 ${result?.marginColor}`}>
                                {result ? result.margin : '-'}
                             </div>
                        </div>

                        {/* Delete Button */}
                        {odds.length > 2 && (
                            <button 
                                onClick={() => removeOddField(item.id)}
                                className="absolute top-2 right-2 md:static md:mb-3 text-slate-600 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            );
          })}

          <button
            onClick={addOddField}
            className="w-full py-3 border-2 border-dashed border-slate-700 text-slate-500 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} />
            Adicionar Odd
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvCalculator;