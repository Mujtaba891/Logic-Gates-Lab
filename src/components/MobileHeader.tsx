import React from 'react';
import { Menu, Play, Pause, Cpu } from 'lucide-react';

interface MobileHeaderProps {
  projectName?: string;
  clockRunning: boolean;
  toggleClock: () => void;
  onOpenDrawer: () => void;
  saveStatus?: 'saved' | 'saving';
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  projectName = 'LogicGate Lab',
  clockRunning,
  toggleClock,
  onOpenDrawer,
  saveStatus = 'saved',
}) => {
  return (
    <header className="min-h-[46px] bg-slate-950/95 border-b border-slate-800/80 text-slate-100 flex items-center justify-between px-2.5 z-30 shrink-0 select-none pt-[env(safe-area-inset-top,0px)] pb-1 shadow-sm">
      {/* Left: Hamburger Button */}
      <button
        onClick={onOpenDrawer}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/80 active:bg-slate-700/80 transition"
        aria-label="Open Components Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Center: Brand Title & Active Project */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-3 h-3" />
          </div>
          <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-0.5">
            LogicGate <span className="text-emerald-400">Lab</span>
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <img src="/lgl.png" alt=".lgl project" className="w-2.5 h-2.5 object-contain" referrerPolicy="no-referrer" />
          <span className="text-[9px] text-slate-400 max-w-[120px] truncate font-sans">
            {projectName}
          </span>
          {saveStatus === 'saving' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </div>
      </div>

      {/* Right: Simulation Run Clock Button */}
      <button
        onClick={toggleClock}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition shadow-sm border ${
          clockRunning
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
        }`}
        aria-label={clockRunning ? 'Pause Clock' : 'Run Clock'}
      >
        {clockRunning ? (
          <>
            <Pause className="w-3 h-3 fill-current" />
            <span className="hidden xs:inline">Pause</span>
          </>
        ) : (
          <>
            <Play className="w-3 h-3 fill-current" />
            <span>Clock</span>
          </>
        )}
      </button>
    </header>
  );
};
