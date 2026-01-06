import React, { useState, useEffect, useCallback } from 'react';
import { GoalsResult } from '../types';
import { Minus, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const GoalsCalculator: React.FC = () => {
  const [isOver, setIsOver] = useState(true);
  // Default to 1.5 or 1.0, minimum allowed is 0.75
  const [goals, setGoals] = useState(1.5);
  const [stake, setStake] = useState('');
  const [oddExact, setOddExact] = useState('');
  const [oddOU, setOddOU] = useState('');
  const [result, setResult] = useState<GoalsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine the "Exactly" number based on current line and market
  const getExactGoals = (line: number, over: boolean) => {
    const decimal = line % 1;
    let exact = Math.floor(line);
    
    if (over) {
      if (decimal === 0.5 || decimal === 0.75) {
        exact = Math.floor(line) + 1;
      }
    } else {
      if (decimal === 0.75) {
        exact = Math.floor(line) + 1;
      }
    }
    return exact;
  };

  const exactValue = getExactGoals(goals, isOver);
  const marketLabel = isOver ? "Mais" : "Menos";

  const calculate = useCallback(() => {
    if (!stake || !oddExact || !oddOU) {
        setResult(null);
        return;
    }

    const s = parseFloat(stake);
    const oExact = parseFloat(oddExact);
    const oOU = parseFloat(oddOU);

    if (isNaN(s) || isNaN(oExact) || isNaN(oOU)) return;

    // Use toFixed to avoid float precision issues (0.7500001)
    const decimalPart = parseFloat((goals % 1).toFixed(2));
    
    let selectedLine = '';

    if (decimalPart === 0) selectedLine = 'linha0';
    else if (decimalPart === 0.25) selectedLine = isOver ? 'over025' : 'under025';
    else if (decimalPart === 0.75) selectedLine = isOver ? 'over075' : 'under075';
    else if (decimalPart === 0.5) selectedLine = 'linha05';
    else {
      setError("Linha inválida");
      return;
    }

    let stakeExactly = 0;
    let stakeOU = 0;
    let finalOdd = 0;

    // Common factor
    const x = (100 * oOU + 100) / (2 * oExact + oOU) / 100;

    switch (selectedLine) {
      case "linha0":
        stakeExactly = s / oExact;
        stakeOU = s - stakeExactly;
        finalOdd = (stakeOU * oOU) / s;
        break;
      case "over025":
        stakeExactly = s / 2 / oExact;
        stakeOU = s - stakeExactly;
        finalOdd = (stakeOU * oOU) / s;
        break;
      case "over075":
        stakeExactly = s * x;
        stakeOU = s - stakeExactly;
        finalOdd = (stakeOU * oOU) / s;
        break;
      case "under025":
        stakeExactly = s * x;
        stakeOU = s - stakeExactly;
        finalOdd = (stakeOU * oOU) / s;
        break;
      case "under075":
        stakeExactly = s / 2 / oExact;
        stakeOU = s - stakeExactly;
        finalOdd = (stakeOU * oOU) / s;
        break;
      case "linha05":
        finalOdd = (oExact * oOU) / (oExact + oOU);
        stakeExactly = (s * oOU) / (oExact + oOU);
        stakeOU = s - stakeExactly;
        break;
      default:
        return;
    }

    setError(null);
    setResult({ finalOdd, stakeExactly, stakeOU });
  }, [goals, isOver, stake, oddExact, oddOU]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const changeGoals = (amount: number) => {
    setGoals(prev => {
        const newVal = prev + amount;
        // Minimum allowed line is 0.75 as per request (cannot be 0.5)
        return parseFloat(Math.max(0.75, newVal).toFixed(2));
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Calculadora de Gols</h2>
      
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        
        {/* Market Selector & Line Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <button 
                onClick={() => setIsOver(!isOver)}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition-all w-full md:w-auto justify-center
                    ${isOver ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-red-500 text-white hover:bg-red-600'}
                `}
            >
                {isOver ? <ArrowUpCircle size={24}/> : <ArrowDownCircle size={24}/>}
                <span>{isOver ? 'Over (Mais)' : 'Under (Menos)'}</span>
            </button>

            <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-xl border border-slate-700">
                <button 
                    onClick={() => changeGoals(-0.25)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                    <Minus size={20} />
                </button>
                <div className="text-2xl font-mono font-bold text-white w-20 text-center">
                    {goals.toFixed(2)}
                </div>
                <button 
                    onClick={() => changeGoals(0.25)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>

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
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Odd "Exatamente {exactValue} gols"
              </label>
              <input
                type="number"
                value={oddExact}
                onChange={(e) => setOddExact(e.target.value)}
                placeholder="Ex: 3.50"
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Odd "{marketLabel} de {exactValue} gols"
              </label>
              <input
                type="number"
                value={oddOU}
                onChange={(e) => setOddOU(e.target.value)}
                placeholder="Ex: 1.90"
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-900/50">
              {error}
            </div>
          )}

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
                <p className="text-slate-500 text-xs uppercase mb-1">Apostar "Exatamente"</p>
                <p className="text-2xl font-bold text-white">R$ {result.stakeExactly.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Apostar "{marketLabel}"</p>
                <p className="text-2xl font-bold text-white">R$ {result.stakeOU.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsCalculator;