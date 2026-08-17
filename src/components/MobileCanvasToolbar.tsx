import React from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Minimize2, Focus, Trash2 } from 'lucide-react';

interface MobileCanvasToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onClearCanvas: () => void;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
}

export const MobileCanvasToolbar: React.FC<MobileCanvasToolbarProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onClearCanvas,
  isFullscreen = false,
  toggleFullscreen,
}) => {
  return (
    <div className="flex items-center gap-0.5 bg-slate-900/90 backdrop-blur border border-slate-800 p-1 rounded-2xl shadow-xl select-none shrink-0">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 hover:bg-slate-800 transition"
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 hover:bg-slate-800 transition"
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-3.5 bg-slate-800 my-auto mx-0.5" />

      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onFitScreen}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
        title="Fit to Screen"
        aria-label="Fit to Screen"
      >
        <Focus className="w-3.5 h-3.5" />
      </button>

      {toggleFullscreen && (
        <button
          onClick={toggleFullscreen}
          className={`p-1.5 rounded-xl transition ${
            isFullscreen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      )}

      <div className="w-[1px] h-3.5 bg-slate-800 my-auto mx-0.5" />

      <button
        onClick={onClearCanvas}
        className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 transition"
        title="Clear Canvas"
        aria-label="Clear Canvas"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

