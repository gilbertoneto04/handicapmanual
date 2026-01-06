import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SurebetCalculator: React.FC = () => {
  const [totalStake, setTotalStake] = useState('100');
  const [odds, setOdds] = useState<{id: number, val: string}[]>([
      { id: 1, val: '' }, { id: 2, val: '' }
  ]);

  const addOdd = () => {
    // Generate a unique ID based on max ID + 1
    const newId = odds.length > 0 ? Math.max(...odds.map(o => o.id)) + 1 : 1;
    setOdds([...odds, { id: newId, val: '' }]);
  };

  const removeOdd = (id: number) => {
    if (odds.length > 2) {
        setOdds(odds.filter(o => o.id !== id));
    }
  };

  const updateOdd = (id: number, val: string) => {
    setOdds(odds.map(o => o.id === id ? { ...o, val } : o));
  };

  const calculate = () => {
    const validOdds = odds.map(o => parseFloat(o.val)).filter(v => !isNaN(v) && v > 1);
    
    // Only calculate if all fields entered are valid and we have at least 2 odds
    if (validOdds.length !== odds.length || validOdds.length < 2) return null;

    const impliedProbSum = validOdds.reduce((acc, odd) => acc + (1 / odd), 0);
    const stake = parseFloat(totalStake) || 0;

    const profitPct = (1 / impliedProbSum - 1) * 100;
    const isSurebet = profitPct > 0;
    
    // Calculate individual stakes
    // Stake_i = (TotalStake / ImpliedSum) / Odd_i
    let currentOddIndex = 0;
    const results = odds.map(oddObj => {
        const oddVal = parseFloat(oddObj.val);
        const indStake = (stake / impliedProbSum) / oddVal;
        return {
            id: oddObj.id,
            stake: indStake,
            odd: oddVal
        };
    });

    return { profitPct, results, isSurebet, profitAmount: stake * (profitPct / 100) };
  };

  const data = calculate();

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Calculadora Surebet</h2>
      
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        
        <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Investimento Total</label>
                <input
                    type="number"
                    value={totalStake}
                    onChange={(e) => setTotalStake(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ex: 100"
                />
            </div>

            <div className="space-y-3">
                {odds.map((o, idx) => (
                    <div key={o.id} className="relative flex items-end gap-2">
                        <div className="w-full">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Odd {idx + 1}</label>
                            <input
                                type="number"
                                value={o.val}
                                onChange={(e) => updateOdd(o.id, e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder={`Odd para Opção ${idx + 1}`}
                            />
                        </div>
                        {odds.length > 2 && (
                            <button 
                                onClick={() => removeOdd(o.id)}
                                className="p-3 mb-[1px] text-slate-500 hover:text-red-400 bg-slate-900 border border-slate-600 rounded-lg transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={addOdd}
                className="w-full py-3 border-2 border-dashed border-slate-700 text-slate-500 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <Plus size={20} />
                Adicionar Opção
            </button>

            {data && (
                <div className={`mt-6 rounded-xl p-6 border text-center ${data.isSurebet ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                    <h3 className={`text-xl font-bold mb-2 ${data.isSurebet ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.isSurebet ? 'Oportunidade de Arbitragem!' : 'Sem Arbitragem'}
                    </h3>
                    <p className="text-white text-lg mb-4">
                        Lucro Garantido: <span className="font-bold">{data.profitPct.toFixed(2)}%</span> (R$ {data.profitAmount.toFixed(2)})
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left mt-4 border-t border-slate-700/50 pt-4">
                        {data.results.map((res) => (
                            <div key={res.id} className="bg-slate-900/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase">Apostar na Odd {res.odd}</p>
                                <p className="font-bold text-white">R$ {res.stake.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SurebetCalculator;