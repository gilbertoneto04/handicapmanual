import React, { useState, useEffect } from 'react';
import { Percent, Hash } from 'lucide-react';

const KellyIncrementCalculator: React.FC = () => {
  const [bankroll, setBankroll] = useState('100');
  const [o1, setO1] = useState('');
  const [a1Pct, setA1Pct] = useState('');
  const [o2, setO2] = useState('');

  const [inputMode, setInputMode] = useState<'prob' | 'fairOdd'>('prob');
  const [inputValue, setInputValue] = useState('');

  const [kellyFraction, setKellyFraction] = useState('1');

  const [result, setResult] = useState<{
    x: string; xPct: string; xColor: string;
    total: string; totalPct: string;
    oddPonderada: string;
    kellyOp: string;
    K1: string; K2: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setResult(null);

    const b   = parseFloat(bankroll);
    const o1v = parseFloat(o1);
    const o2v = parseFloat(o2);
    const a1v = parseFloat(a1Pct) / 100;
    const kf  = parseFloat(kellyFraction);
    const val = parseFloat(inputValue);

    if (
      isNaN(b) || isNaN(o1v) || isNaN(o2v) || isNaN(a1v) ||
      isNaN(kf) || isNaN(val) || val <= 0
    ) return;

    if (o1v <= 1 || o2v <= 1) return;
    if (o2v <= o1v) { setError('A nova odd deve ser maior que a odd original.'); return; }
    if (a1v <= 0)   return;
    if (kf  <= 0)   return;

    let p: number;
    if (inputMode === 'prob') {
      p = val / 100;
    } else {
      if (val <= 1) return;
      p = 1 / val;
    }
    const q = 1 - p;

    const K1 = kf * (p * (o1v - 1) - q) / (o1v - 1);
    const K2 = kf * (p * (o2v - 1) - q) / (o2v - 1);

    if (K2 <= 0) { setError('Sem valor esperado positivo na nova odd.'); return; }

    if (a1v >= K1 && K1 > 0) {
      setError(`Posição atual (${(a1v*100).toFixed(2)}%) já é ≥ Kelly (${(K1*100).toFixed(2)}%). Não há espaço para incremento.`);
      return;
    }

    // β·x² + b·x + c = 0
    // op = (A1·o1 + x·o2) / (A1 + x)
    const a_c = o2v - 1;
    const b_c = a1v * (o1v + o2v - 2) - K2 * (o2v - 1);
    const c_c = a1v * (o1v - 1) * (a1v - K1);

    const disc = b_c * b_c - 4 * a_c * c_c;
    if (disc < 0) { setError('Sem solução real para o incremento.'); return; }

    const x = (-b_c + Math.sqrt(disc)) / (2 * a_c);
    if (x <= 0) { setError('Incremento calculado é zero ou negativo.'); return; }

    const total   = a1v + x;
    const op      = (a1v * o1v + x * o2v) / total;
    const kellyOp = kf * (p * (op - 1) - q) / (op - 1);

    const xStake     = b * x;
    const totalStake = b * total;

    setResult({
      x:           xStake.toFixed(2),
      xPct:        (x * 100).toFixed(2) + '%',
      xColor:      'text-emerald-400',
      total:       totalStake.toFixed(2),
      totalPct:    (total * 100).toFixed(2) + '%',
      oddPonderada: op.toFixed(4),
      kellyOp:     (kellyOp * 100).toFixed(2) + '%',
      K1:          (K1 * 100).toFixed(2) + '%',
      K2:          (K2 * 100).toFixed(2) + '%',
    });
  }, [bankroll, o1, o2, a1Pct, inputValue, kellyFraction, inputMode]);

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Incremento de Kelly</h2>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <div className="space-y-6">

          {/* Banca */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Banca Total (Bankroll)</label>
            <input
              type="number"
              value={bankroll}
              onChange={e => setBankroll(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ex: 100"
            />
          </div>

          {/* Odd original + % já alocado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Odd Original</label>
              <input
                type="number"
                value={o1}
                onChange={e => setO1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Ex: 2.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Já Alocado (%)</label>
              <input
                type="number"
                value={a1Pct}
                onChange={e => setA1Pct(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Ex: 1.5"
              />
            </div>
          </div>

          {/* Nova odd + prob/fair odd */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nova Odd</label>
              <input
                type="number"
                value={o2}
                onChange={e => setO2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Ex: 2.25"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-400">
                  {inputMode === 'prob' ? 'Probabilidade Real (%)' : 'Odd Justa (Fair Odd)'}
                </label>
                <button
                  onClick={() => { setInputMode(p => p === 'prob' ? 'fairOdd' : 'prob'); setInputValue(''); }}
                  className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {inputMode === 'prob' ? <Hash size={12}/> : <Percent size={12}/>}
                  Trocar para {inputMode === 'prob' ? 'Odd Justa' : 'Probabilidade'}
                </button>
              </div>
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder={inputMode === 'prob' ? 'Ex: 55' : 'Ex: 1.80'}
              />
            </div>
          </div>

          {/* Fração Kelly */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-slate-400">Fração do Kelly</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">x</span>
                <input
                  type="number"
                  step="0.01" min="0.01" max="1"
                  value={kellyFraction}
                  onChange={e => setKellyFraction(e.target.value)}
                  className="w-20 bg-slate-800 border border-slate-600 text-white text-center rounded-lg p-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <input
              type="range" min="0.01" max="1" step="0.01"
              value={kellyFraction}
              onChange={e => setKellyFraction(e.target.value)}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Conservador (0.1)</span>
              <span>Meio Kelly (0.5)</span>
              <span>Full Kelly (1.0)</span>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="mt-6 bg-slate-900/50 rounded-xl p-6 border border-slate-700 animate-in slide-in-from-bottom-2 space-y-4">

              <div className="text-center">
                <p className="text-slate-500 text-xs uppercase mb-1">Incremento Sugerido</p>
                <p className={`text-4xl font-bold ${result.xColor}`}>R$ {result.x}</p>
                <p className="text-slate-400 text-sm mt-1">
                  Representa <span className="font-bold text-white">{result.xPct}</span> da sua banca
                </p>
              </div>

              <div className="border-t border-slate-700 pt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Kelly na Odd Original</p>
                  <p className="text-white font-medium">{result.K1}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Kelly na Nova Odd</p>
                  <p className="text-white font-medium">{result.K2}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Total Alocado</p>
                  <p className="text-emerald-400 font-medium">R$ {result.total} ({result.totalPct})</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Odd Ponderada</p>
                  <p className="text-white font-medium">{result.oddPonderada}</p>
                </div>
              </div>

              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">
                  Kelly (odd ponderada) = <span className="text-emerald-400 font-bold">{result.kellyOp}</span>
                  <span className="text-slate-500"> = Total Alocado ✓</span>
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default KellyIncrementCalculator;
