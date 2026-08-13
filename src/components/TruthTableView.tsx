import React from 'react';
import { TruthTableData, CircuitComponent } from '../types';
import { Table, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface TruthTableViewProps {
  truthTable: TruthTableData;
  components: CircuitComponent[];
  onApplyInputCombination: (inputStates: { [label: string]: boolean }) => void;
  onExportCSV: () => void;
}

export const TruthTableView: React.FC<TruthTableViewProps> = ({
  truthTable,
  components,
  onApplyInputCombination,
  onExportCSV,
}) => {
  // Check current circuit input state
  const currentInputs = components
    .filter((c) => c.type === 'INPUT' || c.type === 'CLOCK')
    .reduce((acc, c, idx) => {
      const label = c.label || `Input ${idx + 1}`;
      acc[label] = !!c.state;
      return acc;
    }, {} as { [label: string]: boolean });

  const hasInputs = truthTable.inputLabels.length > 0;
  const hasOutputs = truthTable.outputLabels.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
            <Table className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">Real-Time Truth Table</h2>
            <p className="text-[10px] text-slate-400">
              Live logic evaluator • {truthTable.rows.length} Total States
            </p>
          </div>
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-[10px] font-bold text-emerald-400 rounded-lg transition shadow-sm"
        >
          <Download className="w-3 h-3" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!hasInputs || !hasOutputs ? (
          <div className="text-center py-10 px-3 space-y-3 max-w-sm mx-auto my-auto">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-xl">
              <Table className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">No Complete Circuit Detected</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Place at least <strong className="text-emerald-400">1 Input Switch</strong> and{' '}
              <strong className="text-emerald-400">1 Output LED</strong> connected with wires on the canvas to generate a truth table matrix.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Tap any row to apply those inputs directly to the canvas!</span>
            </div>

            {/* Scrollable Table Wrapper */}
            <div className="border border-slate-800 rounded-xl overflow-x-auto shadow-2xl bg-slate-900/80 custom-scrollbar">
              <table className="w-full text-[10px] text-center border-collapse font-mono min-w-[240px]">
                <thead>
                  <tr className="bg-slate-950 text-slate-200 border-b border-slate-800">
                    {truthTable.inputLabels.map((lbl) => (
                      <th
                        key={`in-${lbl}`}
                        className="py-1.5 px-2 font-bold text-emerald-400 border-r border-slate-800/80 uppercase tracking-wider text-[9px]"
                      >
                        IN {lbl}
                      </th>
                    ))}
                    {truthTable.outputLabels.map((lbl) => (
                      <th
                        key={`out-${lbl}`}
                        className="py-1.5 px-2 font-bold text-sky-400 uppercase tracking-wider text-[9px]"
                      >
                        OUT {lbl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {truthTable.rows.map((row, idx) => {
                    const isCurrent = truthTable.inputLabels.every(
                      (lbl) => row.inputs[lbl] === currentInputs[lbl]
                    );

                    return (
                      <tr
                        key={idx}
                        onClick={() => onApplyInputCombination(row.inputs)}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300 font-black'
                            : 'hover:bg-slate-800/80 active:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {truthTable.inputLabels.map((lbl) => (
                          <td
                            key={`in-${lbl}`}
                            className={`py-1.5 px-2 border-r border-slate-800/60 ${
                              row.inputs[lbl] ? 'text-emerald-400 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {row.inputs[lbl] ? '1' : '0'}
                          </td>
                        ))}
                        {truthTable.outputLabels.map((lbl) => (
                          <td
                            key={`out-${lbl}`}
                            className={`py-1.5 px-2 ${
                              row.outputs[lbl] ? 'text-sky-400 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {row.outputs[lbl] ? '1' : '0'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
