import React from 'react';
import { TruthTableData, CircuitComponent } from '../types';
import { Table, Download, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface TruthTablePanelProps {
  truthTable: TruthTableData;
  components: CircuitComponent[];
  onApplyInputCombination: (inputStates: { [label: string]: boolean }) => void;
  onExportCSV: () => void;
  onClose: () => void;
}

export const TruthTablePanel: React.FC<TruthTablePanelProps> = ({
  truthTable,
  components,
  onApplyInputCombination,
  onExportCSV,
  onClose,
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
    <aside className="w-80 bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col h-full shadow-2xl z-30 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Real-Time Truth Table</h3>
            <p className="text-[10px] text-slate-400">Live logic state evaluator</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onExportCSV}
            title="Export CSV"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {!hasInputs || !hasOutputs ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Table className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 font-medium">No Complete Circuit Detected</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Add at least <strong className="text-emerald-400">1 Input Switch</strong> and{' '}
              <strong className="text-emerald-400">1 Output LED</strong> connected with wires to generate a truth
              table.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Click any row to test that state on the live canvas!</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    {truthTable.inputLabels.map((lbl) => (
                      <th key={`in-${lbl}`} className="py-2 px-1 font-semibold text-emerald-400 border-r border-slate-800">
                        {lbl}
                      </th>
                    ))}
                    {truthTable.outputLabels.map((lbl) => (
                      <th key={`out-${lbl}`} className="py-2 px-1 font-semibold text-blue-400">
                        {lbl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {truthTable.rows.map((row, idx) => {
                    // Check if this row matches current circuit state
                    const isCurrent = truthTable.inputLabels.every(
                      (lbl) => row.inputs[lbl] === currentInputs[lbl]
                    );

                    return (
                      <tr
                        key={idx}
                        onClick={() => onApplyInputCombination(row.inputs)}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        {truthTable.inputLabels.map((lbl) => (
                          <td key={`in-${lbl}`} className={`py-1.5 px-1 border-r border-slate-800 ${
                              row.inputs[lbl] ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {row.inputs[lbl] ? '1' : '0'}
                          </td>
                        ))}
                        {truthTable.outputLabels.map((lbl) => (
                          <td key={`out-${lbl}`} className={`py-1.5 px-1 ${
                              row.outputs[lbl] ? 'text-blue-400 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1 justify-center">
                              {row.outputs[lbl] ? '1' : '0'}
                              {isCurrent && row.outputs[lbl] && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              )}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-[10px] text-slate-400 text-right">
              Total states evaluated: {truthTable.rows.length}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
