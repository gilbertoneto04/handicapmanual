import React, { useState, useEffect } from 'react';
import { Percent, Hash, Plus, Trash2 } from 'lucide-react';

interface Allocation {
  id: number;
  odd: string;
  pct: string;
}

interface KellyIncrementProps {
  initialData?: {
    bankroll: string;
    fairOdd: string;
    kellyFraction: string;
    allocations: { odd: string; pct: string }[];
  };
}

interface Result {
  x: string;
  xPct: string;
  xColor: string;
  total: string;
  totalPct: string;
  oddPonderada: string;
  kellyOp: string;
  K1: string;
  K2: string;
}

const KellyIncrementCalculator: React.FC<KellyIncrementProps> = ({ initialData }) => {
  const [bankroll, setBankroll] = useState(initialData?.bankroll ?? '100');
  const [inputMode, setInputMode] = useState<'prob' | 'fairOdd'>('fairOdd');
  const [inputValue, setInputValue] = useState(initialData?.fairOdd ?? '');
  const [kellyFraction, setKellyFraction] = useState(initialData?.kellyFraction ?? '1');
  const [o2, setO2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Alocações anteriores (pode ter várias)
  const [allocations, setAllocations] = useState<Allocation[]>(() => {
    if (initialData?.allocations?.length) {
      return initialData.allocations.map((a, i) => ({ id: i + 1, odd: a.odd, pct: a.pct }));
    }
    return [{ id: 1, odd: '', pct: '' }];
  });

  const nextId = () => Math.max(...allocations.map(a => a.id)) + 1;

  const addAllocation = () => {
    setAllocations(prev => [...prev, { id: nextId(), odd: '', pct: '' }]);
  };

  const removeAllocation = (id: number) => {
    if (allocations.length === 1) return;
    setAllocations(prev => prev.filter(a => a.id !== id));
  };

  const updateAllocation = (id: number, field: 'odd' | 'pct', value: string) => {
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // Recalcular quando qualquer input mudar
  useEffect(() => {
    setError(null);
    setResult(null);

    const b   = parseFloat(bankroll);
    const o2v = parseFloat(o2);
    const kf  = parseFloat(kellyFraction);
    const val = parseFloat(inputValue);

    if (isNaN(b) || isNaN(o2v) || isNaN(kf) || isNaN(val) || val <= 0 || o2v <= 1 || kf <= 0) return;

    let p: number;
    if (inputMode === 'prob') {
      p = val / 100;
    } else {
      if (val <= 1) return;
      p = 1 / val;
    }
    const q = 1 - p;

    // Validar e somar alocações
    const parsedAllocs = allocations.map(a => ({
      odd: parseFloat(a.odd),
      pct: parseFloat(a.pct) / 100,
    }));

    if (parsedAllocs.some(a => isNaN(a.odd) || isNaN(a.pct) || a.odd <= 1 || a.pct <= 0)) return;


    // A1 total e odd ponderada atual das alocações existentes
    const totalA1 = parsedAllocs.reduce((s, a) => s + a.pct, 0);
    const weightedReturn = parsedAllocs.reduce((s, a) => s + a.pct / a.odd, 0);

    // Kelly na última odd (a menor, usada como o1 referência)
    // Para múltiplas alocações: usamos a odd ponderada atual como o1 efetivo
    const o1_eff = totalA1 / weightedReturn; // odd ponderada atual

    const K1 = kf * (p * (o1_eff - 1) - q) / (o1_eff - 1);
    const K2 = kf * (p * (o2v - 1) - q) / (o2v - 1);

    if (K2 <= 0) { setError('Sem valor esperado positivo na nova odd.'); return; }

    if (totalA1 >= K1 && K1 > 0) {
      setError(`Total alocado (${(totalA1*100).toFixed(2)}%) já é ≥ Kelly da odd ponderada atual (${(K1*100).toFixed(2)}%). Não há espaço para incremento.`);
      return;
    }

    // Equação quadrática: a·x² + b·x + c = 0
    // op_nova = (totalA1·o1_eff + x·o2) / (totalA1 + x)
    const a_c = o2v - 1;
    const b_c = totalA1 * (o1_eff + o2v - 2) - K2 * (o2v - 1);
    const c_c = totalA1 * (o1_eff - 1) * (totalA1 - K1);

    const disc = b_c * b_c - 4 * a_c * c_c;
    if (disc < 0) { setError('Sem solução real para o incremento.'); return; }

    const x = (-b_c + Math.sqrt(disc)) / (2 * a_c);
    if (x <= 0) { setError('Incremento calculado é zero ou negativo.'); return; }

    const total   = totalA1 + x;
    const op      = (totalA1 * o1_eff + x * o2v) / total;
    const kellyOp = kf * (p * (op - 1) - q) / (op - 1);

    setResult({
      x:            (b * x).toFixed(2),
      xPct:         (x * 100).toFixed(2) + '%',
      xColor:       'text-emerald-400',
      total:        (b * total).toFixed(2),
      totalPct:     (total * 100).toFixed(2) + '%',
      oddPonderada: op.toFixed(4),
      kellyOp:      (kellyOp * 100).toFixed(2) + '%',
      K1:           (K1 * 100).toFixed(2) + '%',
      K2:           (K2 * 100).toFixed(2) + '%',
    });
  }, [bankroll, o2, inputValue, kellyFraction, inputMode, allocations]);

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Incremento de Kelly</h2>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <div className="space-y-6">

          {/* Banca */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Banca Total (Bankroll)</label>
            <input
              type="number" value={bankroll} onChange={e => setBankroll(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ex: 100"
            />
          </div>

          {/* Odd justa / prob */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-400">
                {inputMode === 'prob' ? 'Probabilidade Real (%)' : 'Odd Justa (Fair Odd)'}
              </label>
              <button
                onClick={() => { setInputMode(p => p === 'prob' ? 'fairOdd' : 'prob'); setInputValue(''); }}
                className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {inputMode === 'prob' ? <Hash size={12} /> : <Percent size={12} />}
                Trocar para {inputMode === 'prob' ? 'Odd Justa' : 'Probabilidade'}
              </button>
            </div>
            <input
              type="number" value={inputValue} onChange={e => setInputValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder={inputMode === 'prob' ? 'Ex: 55' : 'Ex: 1.80'}
            />
          </div>

          {/* Alocações anteriores */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-400">Alocações Anteriores</label>
              <button
                onClick={addAllocation}
                className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus size={12} /> Adicionar odd
              </button>
            </div>
            <div className="space-y-3">
              {allocations.map((alloc, idx) => (
                <div key={alloc.id} className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Odd {idx + 1}</label>
                    <input
                      type="number"
                      value={alloc.odd}
                      onChange={e => updateAllocation(alloc.id, 'odd', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: 2.00"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Já Alocado (%)</label>
                      <input
                        type="number"
                        value={alloc.pct}
                        onChange={e => updateAllocation(alloc.id, 'pct', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Ex: 1.5"
                      />
                    </div>
                    {allocations.length > 1 && (
                      <button
                        onClick={() => removeAllocation(alloc.id)}
                        className="mb-0 mt-auto p-3 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nova odd */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nova Odd</label>
            <input
              type="number" value={o2} onChange={e => setO2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ex: 2.25 (deve ser maior que todas as anteriores)"
            />
          </div>

          {/* Fração Kelly */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-slate-400">Fração do Kelly</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">x</span>
                <input
                  type="number" step="0.01" min="0.01" max="1"
                  value={kellyFraction} onChange={e => setKellyFraction(e.target.value)}
                  className="w-20 bg-slate-800 border border-slate-600 text-white text-center rounded-lg p-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <input
              type="range" min="0.01" max="1" step="0.01"
              value={kellyFraction} onChange={e => setKellyFraction(e.target.value)}
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
                  <p className="text-slate-500 text-xs mb-1">Kelly na Odd Ponderada Atual</p>
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
                  <p className="text-slate-500 text-xs mb-1">Odd Ponderada Final</p>
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
