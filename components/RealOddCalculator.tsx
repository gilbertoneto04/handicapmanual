import React, { useState } from 'react';
import { Plus, Trash2, Settings, DollarSign } from 'lucide-react';

const RealOddCalculator: React.FC = () => {
  const [commission, setCommission] = useState<string>('6');
  const [ticks, setTicks] = useState<string>('1');
  
  const [bets, setBets] = useState([
    { id: 1, stake: '', odd: '' }
  ]);

  const addBet = () => {
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

  const calculateRow = (stakeStr: string, oddStr: string) => {
      const s = parseFloat(stakeStr);
      const o = parseFloat(oddStr);
      const comm = parseFloat(commission);
      const t = parseFloat(ticks);

      if (isNaN(s) || isNaN(o) || isNaN(comm) || isNaN(t) || s <= 0 || o <= 1) {
          return null;
      }

      // Logic:
      // 1. Adjusted Odd = Odd - (Ticks * 0.01)
      // 2. Gross Profit = Stake * (Adjusted Odd - 1)
      // 3. Commission Amount = Gross Profit * (Commission / 100)
      // 4. Net Profit = Gross Profit - Commission Amount
      // 5. Net Return = Stake + Net Profit
      // 6. Real Odd = Net Return / Stake

      const adjustedOdd = o - (t * 0.01);
      
      // Safety: if adjusted odd is <= 1, profit is 0 or negative (loss of stake?)
      // Usually odds don't go below 1.01. If ticks reduce it below 1, it's invalid.
      if (adjustedOdd <= 1) return { realOdd: 0, netProfit: 0, netReturn: 0, error: true };

      const grossProfit = s * (adjustedOdd - 1);
      const commissionAmount = grossProfit * (comm / 100);
      const netProfit = grossProfit - commissionAmount;
      const netReturn = s + netProfit;
      const realOdd = netReturn / s;

      return {
          realOdd,
          netProfit,
          netReturn,
          commissionAmount,
          error: false
      };
  };

  const totals = bets.reduce((acc, bet) => {
      const res = calculateRow(bet.stake, bet.odd);
      if (res && !res.error) {
          acc.totalStake += parseFloat(bet.stake);
          acc.totalProfit += res.netProfit;
          acc.totalCommission += res.commissionAmount;
          acc.validBets++;
      }
      return acc;
  }, { totalStake: 0, totalProfit: 0, totalCommission: 0, validBets: 0 });

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Calculadora Odd Sem Taxa</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <Settings size={20} />
                    <h3 className="font-semibold">Configurações da Taxa</h3>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Comissão (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={commission}
                                onChange={(e) => setCommission(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 pl-3 pr-10 focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="6"
                            />
                            <span className="absolute right-3 top-3 text-slate-500">%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Padrão: 6%</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Ticks Removidos</label>
                        <input
                            type="number"
                            value={ticks}
                            onChange={(e) => setTicks(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="1"
                        />
                        <p className="text-xs text-slate-500 mt-1">Padrão: 1 tick (0.01)</p>
                    </div>
                </div>
            </div>

            {/* Totals Panel (Mobile/Desktop) */}
            {totals.validBets > 0 && (
                <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-4 text-emerald-400">
                        <DollarSign size={20} />
                        <h3 className="font-semibold">Resumo Total</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Investimento</span>
                            <span className="text-white font-bold">R$ {totals.totalStake.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Taxa Total</span>
                            <span className="text-red-400 font-bold">- R$ {totals.totalCommission.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Lucro Líquido</span>
                            <span className="text-emerald-400 font-bold">R$ {totals.totalProfit.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Calculator Panel */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {bets.map((bet, idx) => {
                    const res = calculateRow(bet.stake, bet.odd);
                    return (
                        <div key={bet.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">Aposta {idx + 1}</span>
                                {bets.length > 1 && (
                                    <button 
                                        onClick={() => removeBet(bet.id)}
                                        className="text-slate-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Stake</label>
                                    <input
                                        type="number"
                                        value={bet.stake}
                                        onChange={(e) => updateBet(bet.id, 'stake', e.target.value)}
                                        placeholder="Valor"
                                        className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Odd Inicial</label>
                                    <input
                                        type="number"
                                        value={bet.odd}
                                        onChange={(e) => updateBet(bet.id, 'odd', e.target.value)}
                                        placeholder="Odd"
                                        className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            {res && !res.error && (
                                <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-slate-800/50 rounded p-2">
                                        <p className="text-[10px] text-slate-500 uppercase">Odd Real</p>
                                        <p className="text-lg font-bold text-emerald-400">{res.realOdd.toFixed(3)}</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded p-2">
                                        <p className="text-[10px] text-slate-500 uppercase">Lucro Liq.</p>
                                        <p className="text-sm font-bold text-white">R$ {res.netProfit.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded p-2">
                                        <p className="text-[10px] text-slate-500 uppercase">Retorno</p>
                                        <p className="text-sm font-bold text-white">R$ {res.netReturn.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                onClick={addBet}
                className="w-full mt-4 py-3 border-2 border-dashed border-slate-700 text-slate-500 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <Plus size={18} />
                Adicionar Aposta
            </button>
        </div>
      </div>
    </div>
  );
};

export default RealOddCalculator;
