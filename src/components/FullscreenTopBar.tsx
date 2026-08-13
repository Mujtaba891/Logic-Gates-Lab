import React from 'react';
import { GateType } from '../types';
import { PALETTE_ITEMS } from './Palette';
import { GateSymbolSvg } from './GateSymbolSvg';
import {
  Play,
  Pause,
  SkipForward,
  Undo,
  Redo,
  Minimize2,
  RotateCcw,
  Plus,
  Cpu,
} from 'lucide-react';

interface FullscreenTopBarProps {
  onAddComponent: (type: GateType) => void;
  clockRunning: boolean;
  toggleClock: () => void;
  stepClock: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearCanvas: () => void;
  toggleFullscreen: () => void;
}

export const FullscreenTopBar: React.FC<FullscreenTopBarProps> = ({
  onAddComponent,
  clockRunning,
  toggleClock,
  stepClock,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearCanvas,
  toggleFullscreen,
}) => {
  const handleDragStart = (e: React.DragEvent, type: GateType) => {
    e.dataTransfer.setData('gateType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="absolute top-3 left-3 right-3 z-40 bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md text-slate-100 flex items-center gap-3 select-none animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Exit Fullscreen & Mode Badge */}
      <div className="flex items-center gap-2 shrink-0 border-r border-slate-800 pr-3">
        <button
          onClick={toggleFullscreen}
          title="Exit Fullscreen Mode"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold transition"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit Fullscreen</span>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Editor</span>
        </div>
      </div>

      {/* Clock Generator & History Controls */}
      <div className="flex items-center gap-1.5 shrink-0 border-r border-slate-800 pr-3">
        {/* Run/Pause Clock */}
        <button
          onClick={toggleClock}
          title={clockRunning ? 'Pause Clock Generator' : 'Run Clock Generator'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            clockRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
        >
          {clockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{clockRunning ? 'Pause' : 'Run Clock'}</span>
        </button>

        {/* Step Clock */}
        <button
          onClick={stepClock}
          title="Pulse clock once"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-950/60 p-0.5 rounded-xl border border-slate-800 gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1 rounded-lg transition ${
              canUndo ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1 rounded-lg transition ${
              canRedo ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal X-Axis Scrollable Component Palette Items */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1 scroll-smooth">
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => onAddComponent(item.type)}
            className="group flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl shrink-0 cursor-grab active:cursor-grabbing transition-all hover:scale-105"
          >
            <div className="w-8 h-6 bg-slate-950/80 rounded border border-slate-800 flex items-center justify-center p-0.5 shrink-0">
              <GateSymbolSvg type={item.type} width={28} height={18} />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 whitespace-nowrap">
              {item.type}
            </span>
            <Plus className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>
        ))}
      </div>

      {/* Right Controls: Clear Canvas */}
      <div className="shrink-0 border-l border-slate-800 pl-3">
        <button
          onClick={onClearCanvas}
          title="Clear Canvas"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
