import React from 'react';
import { Cpu, Table, Activity } from 'lucide-react';

export type ActiveView = 'builder' | 'truth' | 'waveform';

interface ViewSwitcherProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="bg-slate-950/90 border-b border-slate-800/80 px-2 py-1 flex items-center justify-around text-xs font-semibold select-none z-20 shrink-0">
      <button
        onClick={() => setActiveView('builder')}
        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
          activeView === 'builder'
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <Cpu className="w-3.5 h-3.5" />
        <span>Builder</span>
      </button>

      <button
        onClick={() => setActiveView('truth')}
        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
          activeView === 'truth'
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <Table className="w-3.5 h-3.5" />
        <span>Truth Table</span>
      </button>

      <button
        onClick={() => setActiveView('waveform')}
        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
          activeView === 'waveform'
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <Activity className="w-3.5 h-3.5" />
        <span>Waveform</span>
      </button>
    </div>
  );
};
