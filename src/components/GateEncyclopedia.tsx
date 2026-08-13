import React, { useState } from 'react';
import { GATE_DEFINITIONS } from '../data/gateLibrary';
import { GateType } from '../types';
import { GateSymbolSvg } from './GateSymbolSvg';
import { BookOpen, Cpu, Sparkles, Check, ArrowRight } from 'lucide-react';

export const GateEncyclopedia: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<GateType>('AND');
  const [testInputs, setTestInputs] = useState<{ [key: string]: boolean }>({ a: true, b: false });

  const gateInfo = GATE_DEFINITIONS[selectedGate] || GATE_DEFINITIONS.AND;

  // Calculate live test output
  const computeTestOutput = () => {
    const a = !!testInputs.a;
    const b = !!testInputs.b;
    switch (selectedGate) {
      case 'AND':
        return a && b;
      case 'OR':
        return a || b;
      case 'NOT':
        return !a;
      case 'NAND':
        return !(a && b);
      case 'NOR':
        return !(a || b);
      case 'XOR':
        return a !== b;
      case 'XNOR':
        return a === b;
      case 'BUFFER':
        return a;
      default:
        return false;
    }
  };

  const currentOutput = computeTestOutput();

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Banner Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px] sm:text-xs tracking-wider uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              Logic Gate Library & Identification Guide
            </div>
            <h2 className="text-base sm:text-2xl font-extrabold text-white">Identify & Understand All Logic Gates</h2>
            <p className="text-[10px] sm:text-xs text-slate-400 max-w-2xl">
              Explore standard schematic symbols, Boolean algebra formulas, transistor counts, commercial IC chip pinouts, and applications.
            </p>
          </div>
        </div>

        {/* Gate Selection Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {Object.keys(GATE_DEFINITIONS).map((type) => {
            const def = GATE_DEFINITIONS[type];
            const isSelected = selectedGate === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedGate(type as GateType)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold transition shadow-sm whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-950/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{def.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Gate Deep-Dive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Visual Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 space-y-4 sm:space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-xl font-bold text-white flex items-center gap-2">
                  {gateInfo.name}
                </h3>
                <span className="inline-block mt-0.5 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Boolean: {gateInfo.booleanExpr}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-400 block uppercase font-mono">IC Chip</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-200 font-mono">{gateInfo.icChip}</span>
              </div>
            </div>

            {/* Symbol Visualization & Interactive Single Gate Tester */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-6 flex flex-wrap items-center justify-around gap-4">
              <div className="text-center space-y-1">
                <p className="text-[9px] font-mono uppercase text-slate-400">IEEE Standard Symbol</p>
                <div className="p-2 sm:p-4 bg-slate-900 border border-slate-800 rounded-xl inline-block shadow-inner">
                  <GateSymbolSvg type={selectedGate} active={currentOutput} width={90} height={55} />
                </div>
              </div>

              {/* Live Test Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 w-full sm:w-60 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Interactive Test
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      currentOutput ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Y = {currentOutput ? '1' : '0'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Input A:</span>
                    <button
                      onClick={() => setTestInputs({ ...testInputs, a: !testInputs.a })}
                      className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                        testInputs.a ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {testInputs.a ? 'HIGH (1)' : 'LOW (0)'}
                    </button>
                  </div>

                  {selectedGate !== 'NOT' && selectedGate !== 'BUFFER' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Input B:</span>
                      <button
                        onClick={() => setTestInputs({ ...testInputs, b: !testInputs.b })}
                        className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                          testInputs.b ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {testInputs.b ? 'HIGH (1)' : 'LOW (0)'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description & Technical Specs */}
            <div className="space-y-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Behavior & Principle of Operation
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{gateInfo.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Transistors</span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
                    ~{gateInfo.transistorCount} MOSFETs
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">I/O Count</span>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-400 font-mono">
                    {gateInfo.defaultInputCount} In / {gateInfo.defaultOutputCount} Out
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Real-World Applications
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {gateInfo.realWorldApps.map((app, i) => (
                    <li
                      key={i}
                      className="text-[10px] bg-slate-950/40 border border-slate-800 p-1.5 rounded-lg text-slate-300 flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Truth Table Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 space-y-3 shadow-xl">
            <h3 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5">
              Truth Table Reference
            </h3>
            <p className="text-[10px] text-slate-400">
              Output mappings for all possible binary inputs.
            </p>

            <div className="border border-slate-800 rounded-lg overflow-hidden font-mono text-[10px]">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="py-1.5 px-1 font-semibold text-emerald-400">In A</th>
                    {selectedGate !== 'NOT' && selectedGate !== 'BUFFER' && (
                      <th className="py-1.5 px-1 font-semibold text-emerald-400 border-l border-slate-800">
                        In B
                      </th>
                    )}
                    <th className="py-1.5 px-1 font-semibold text-blue-400 border-l border-slate-800">
                      Out Y
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {gateInfo.truthTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition">
                      <td className={`py-1.5 px-1 ${row.a ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {row.a}
                      </td>
                      {selectedGate !== 'NOT' && selectedGate !== 'BUFFER' && (
                        <td
                          className={`py-1.5 px-1 border-l border-slate-800 ${
                            row.b ? 'text-emerald-400 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {row.b}
                        </td>
                      )}
                      <td
                        className={`py-1.5 px-1 border-l border-slate-800 font-bold ${
                          row.out ? 'text-blue-400' : 'text-slate-500'
                        }`}
                      >
                        {row.out}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
