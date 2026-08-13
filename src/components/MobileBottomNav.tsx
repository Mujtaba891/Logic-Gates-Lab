import React from 'react';
import { LayoutGrid, Cpu, Table, Activity, MoreHorizontal } from 'lucide-react';
import { ActiveView } from './ViewSwitcher';

interface MobileBottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenComponentsDrawer: () => void;
  onOpenMoreSheet: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenComponentsDrawer,
  onOpenMoreSheet,
}) => {
  return (
    <nav className="bg-slate-950/95 border-t border-slate-800/90 text-slate-400 flex items-center justify-around z-30 shrink-0 select-none px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] backdrop-blur shadow-2xl">
      {/* 1. Components Drawer Trigger */}
      <button
        onClick={onOpenComponentsDrawer}
        className="flex-1 min-h-[42px] flex flex-col items-center justify-center gap-0.5 py-1 text-slate-400 hover:text-emerald-400 active:text-emerald-300 transition"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-[10px] font-medium tracking-tight">Components</span>
      </button>

      {/* 2. Canvas Builder View */}
      <button
        onClick={() => setActiveView('builder')}
        className={`flex-1 min-h-[42px] flex flex-col items-center justify-center gap-0.5 py-1 transition ${
          activeView === 'builder' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Cpu className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Canvas</span>
      </button>

      {/* 3. Truth Table View */}
      <button
        onClick={() => setActiveView('truth')}
        className={`flex-1 min-h-[42px] flex flex-col items-center justify-center gap-0.5 py-1 transition ${
          activeView === 'truth' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Table className="w-4 h-4" />
        <span className="text-[10px] tracking-tight whitespace-nowrap">Truth Table</span>
      </button>

      {/* 4. Waveform View */}
      <button
        onClick={() => setActiveView('waveform')}
        className={`flex-1 min-h-[42px] flex flex-col items-center justify-center gap-0.5 py-1 transition ${
          activeView === 'waveform' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Activity className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Waveform</span>
      </button>

      {/* 5. More Bottom Sheet Trigger */}
      <button
        onClick={onOpenMoreSheet}
        className="flex-1 min-h-[42px] flex flex-col items-center justify-center gap-0.5 py-1 text-slate-400 hover:text-emerald-400 active:text-emerald-300 transition"
      >
        <MoreHorizontal className="w-4 h-4" />
        <span className="text-[10px] font-medium tracking-tight">More</span>
      </button>
    </nav>
  );
};
