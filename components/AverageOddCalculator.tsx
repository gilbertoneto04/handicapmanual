import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AverageOddCalculator: React.FC = () => {
  // Initialize with 2 slots
  const [bets, setBets] = useState([
    { id: 1, stake: '', odd: '' },
    { id: 2, stake: '', odd: '' }
  ]);

  const addBet = () => {
    // Generate unique ID based on previous max
    const newId = bets.length > 0 ? Math.max(...bets.map(b => b.id)) + 1 : 1;
    setBets([...bets, { id: newId, stake: '', odd: '' }]);
  };

  const removeBet = (id: number) => {
    if (bets.length > 1) {
        setBets(bets.filter(b => b.id !== id));
    }
  };

  const updateBet = (id: number, field: 'stake' | 'odd', value: string) => {
    setBets(bets.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const calculate = () => {
    let totalStake = 0;
    let totalReturn = 0;
    let valid = false;

    bets.forEach(b => {
        const s = parseFloat(b.stake);
        const o = parseFloat(b.odd);
        if (!isNaN(s) && !isNaN(o) && s > 0 && o > 1) {
            totalStake += s;
            totalReturn += s * o;
            valid = true;
        }
    });

    if (!valid) return null;
    return {
        avgOdd: totalReturn / totalStake,
        totalStake,
        potentialProfit: totalReturn - totalStake
    };
  };

  const result = calculate();

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Calculadora de Odd Média</h2>
      
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {bets.map((bet, idx) => (
                <div key={bet.id} className="flex gap-3 items-end bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Stake {idx + 1}</label>
                        <input
                            type="number"
                            value={bet.stake}
                            onChange={(e) => updateBet(bet.id, 'stake', e.target.value)}
                            placeholder="Valor"
                            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Odd {idx + 1}</label>
                        <input
                            type="number"
                            value={bet.odd}
                            onChange={(e) => updateBet(bet.id, 'odd', e.target.value)}
                            placeholder="Odd"
                            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                    </div>
                    {bets.length > 1 && (
                        <button 
                            onClick={() => removeBet(bet.id)}
                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ))}
        </div>

        <button
            onClick={addBet}
            className="w-full mt-4 py-2 border-2 border-dashed border-slate-700 text-slate-500 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-medium text-sm"
          >
            <Plus size={16} />
            Adicionar Aposta
        </button>

        {result && (
             <div className="mt-8 bg-slate-900 rounded-xl p-6 border border-slate-700 animate-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-slate-500 text-xs uppercase mb-1">Odd Média</p>
                        <p className="text-3xl font-bold text-emerald-400">{result.avgOdd.toFixed(3)}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase mb-1">Investimento Total</p>
                        <p className="text-xl font-bold text-white">R$ {result.totalStake.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase mb-1">Lucro Projetado</p>
                        <p className="text-xl font-bold text-white">R$ {result.potentialProfit.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AverageOddCalculator;