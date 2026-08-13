import React from 'react';
import { MousePointer, Hand, Trash2, Plus } from 'lucide-react';

interface MobileQuickActionsBarProps {
  canvasTool: 'select' | 'pan';
  setCanvasTool: (tool: 'select' | 'pan') => void;
  hasSelection: boolean;
  onDeleteSelected: () => void;
  onOpenComponentsDrawer: () => void;
}

export const MobileQuickActionsBar: React.FC<MobileQuickActionsBarProps> = ({
  canvasTool,
  setCanvasTool,
  hasSelection,
  onDeleteSelected,
  onOpenComponentsDrawer,
}) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800/90 p-1 rounded-2xl shadow-2xl select-none shrink-0">
      {/* 1. Select Tool */}
      <button
        onClick={() => setCanvasTool('select')}
        className={`p-1.5 rounded-xl flex items-center gap-1 text-[10px] font-bold transition ${
          canvasTool === 'select'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        aria-label="Select Tool"
      >
        <MousePointer className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Select</span>
      </button>

      {/* 2. Pan Hand Tool */}
      <button
        onClick={() => setCanvasTool('pan')}
        className={`p-1.5 rounded-xl flex items-center gap-1 text-[10px] font-bold transition ${
          canvasTool === 'pan'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        aria-label="Pan Tool"
      >
        <Hand className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Pan</span>
      </button>

      {/* 3. Delete Selected */}
      <button
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 active:bg-rose-500/30 disabled:opacity-30 disabled:hover:bg-transparent transition"
        title="Delete Selected"
        aria-label="Delete Selected"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-3.5 bg-slate-800/80 my-auto mx-0.5" />

      {/* 4. Add Component FAB Button */}
      <button
        onClick={onOpenComponentsDrawer}
        className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black rounded-xl shadow flex items-center gap-1 text-[10px] transition"
        aria-label="Add Component"
      >
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
        <span>Add</span>
      </button>
    </div>
  );
};

