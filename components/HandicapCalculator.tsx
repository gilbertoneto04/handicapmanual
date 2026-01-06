import React, { useState, useEffect } from 'react';
import { HandicapResult } from '../types';

const HandicapCalculator: React.FC = () => {
  const [stake, setStake] = useState<string>('');
  const [oddDraw, setOddDraw] = useState<string>('');
  const [oddWin, setOddWin] = useState<string>('');
  const [result, setResult] = useState<HandicapResult | null>(null);
  const [lastOp, setLastOp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = (operation: string | null = lastOp) => {
    if (!operation) return;
    
    // Validate inputs
    if (!stake || !oddDraw || !oddWin) {
      if (operation !== lastOp) { // Only show error if user clicked a button
         setError("Preencha todos os campos corretamente.");
      }
      return;
    }
    
    setError(null);
    setLastOp(operation);

    const s = parseFloat(stake);
    const od = parseFloat(oddDraw);
    const ow = parseFloat(oddWin);

    if (isNaN(s) || isNaN(od) || isNaN(ow)) return;

    let finalOdd = 0;
    let stakeDraw = 0;
    let stakeWin = 0;

    switch (operation) {
      case 'dc': // Dupla Chance (+0.5)
        finalOdd = (od * ow) / (od + ow);
        stakeDraw = (s * ow) / (od + ow);
        stakeWin = s - stakeDraw;
        break;
      case 'dnb': // Empate Anula (0.0)
        stakeDraw = s / od;
        stakeWin = s - stakeDraw;
        finalOdd = (stakeWin * ow) / s;
        break;
      case 'mais025': // +0.25
        // Formula from source: let x = (100 * oddml + 100) / (2 * oddempate + oddml) / 100;
        const x = (100 * ow + 100) / (2 * od + ow) / 100;
        stakeDraw = s * x;
        stakeWin = s - stakeDraw;
        finalOdd = (stakeWin * ow) / s;
        break;
      case 'menos025': // -0.25
        stakeDraw = s / 2 / od;
        stakeWin = s - stakeDraw;
        finalOdd = (stakeWin * ow) / s;
        break;
      default:
        return;
    }

    setResult({
      finalOdd,
      stakeDraw,
      stakeWin
    });
  };

  // Re-calculate on input change if an operation was already selected
  useEffect(() => {
    if (lastOp) {
      calculate(lastOp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stake, oddDraw, oddWin]);

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Handicap Manual</h2>
      
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Stake (Valor da aposta)</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Ex: 100"
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Odd do Empate</label>
              <input
                type="number"
                value={oddDraw}
                onChange={(e) => setOddDraw(e.target.value)}
                placeholder="Ex: 3.50"
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Odd da Vitória</label>
              <input
                type="number"
                value={oddWin}
                onChange={(e) => setOddWin(e.target.value)}
                placeholder="Ex: 2.10"
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-900/50">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
                onClick={() => calculate('menos025')}
                className={`p-3 rounded-xl font-semibold transition-all ${lastOp === 'menos025' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Handicap -0.25
            </button>
            <button 
                onClick={() => calculate('dnb')}
                className={`p-3 rounded-xl font-semibold transition-all ${lastOp === 'dnb' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Empate Anula (0.0)
            </button>
            <button 
                onClick={() => calculate('mais025')}
                className={`p-3 rounded-xl font-semibold transition-all ${lastOp === 'mais025' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Handicap +0.25
            </button>
            <button 
                onClick={() => calculate('dc')}
                className={`p-3 rounded-xl font-semibold transition-all ${lastOp === 'dc' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Dupla Chance (+0.5)
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-slate-900/50 rounded-xl p-6 border border-slate-700 animate-in slide-in-from-bottom-2">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Resultados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Odd Final</p>
                <p className="text-2xl font-bold text-emerald-400">{result.finalOdd.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Apostar no Empate</p>
                <p className="text-2xl font-bold text-white">R$ {result.stakeDraw.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Apostar na Vitória</p>
                <p className="text-2xl font-bold text-white">R$ {result.stakeWin.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandicapCalculator;