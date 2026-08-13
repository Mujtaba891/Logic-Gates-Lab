import React, { useRef, useState, useEffect } from 'react';
import { WaveformPoint } from '../types';
import {
  Activity,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Filter,
  Cpu,
  Zap,
  ArrowUp,
  ArrowDown,
  Clock,
  Sliders,
} from 'lucide-react';

export interface SignalInfo {
  id: string;
  compId: string;
  type: string;
  category: 'input' | 'clock' | 'gate' | 'output';
  label: string;
}

interface TimingDiagramProps {
  waveformHistory: WaveformPoint[];
  signals: SignalInfo[];
  onClearHistory: () => void;
  onClose: () => void;
}

type FilterCategory = 'all' | 'io' | 'gates' | 'clocks';

export const TimingDiagram: React.FC<TimingDiagramProps> = ({
  waveformHistory,
  signals,
  onClearHistory,
  onClose,
}) => {
  const maxPoints = 120;
  const displayHistory = waveformHistory.slice(-maxPoints);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.2);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRefClock, setShowRefClock] = useState(true);

  useEffect(() => {
    // Auto-scroll to latest waveform point
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [waveformHistory.length, zoom]);

  // Calculate width per point based on zoom
  const pointWidth = Math.max(8, 14 * zoom);
  const totalWidth = displayHistory.length * pointWidth;

  // Filter signals based on filterMode and searchQuery
  const filteredSignals = signals.filter((sig) => {
    // Search query filter
    if (searchQuery.trim() && !sig.label.toLowerCase().includes(searchQuery.toLowerCase()) && !sig.type.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filterMode === 'all') return true;
    if (filterMode === 'io') return sig.category === 'input' || sig.category === 'output';
    if (filterMode === 'gates') return sig.category === 'gate';
    if (filterMode === 'clocks') return sig.category === 'clock';
    return true;
  });

  // Get distinct color config by category
  const getSignalCategoryStyle = (category: SignalInfo['category']) => {
    switch (category) {
      case 'clock':
        return {
          stroke: '#22c55e', // Emerald
          fill: 'rgba(34, 197, 94, 0.15)',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dotBg: 'bg-emerald-400',
        };
      case 'input':
        return {
          stroke: '#38bdf8', // Sky Cyan
          fill: 'rgba(56, 189, 248, 0.15)',
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          dotBg: 'bg-sky-400',
        };
      case 'gate':
        return {
          stroke: '#c084fc', // Purple
          fill: 'rgba(192, 132, 252, 0.15)',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          dotBg: 'bg-purple-400',
        };
      case 'output':
        return {
          stroke: '#f43f5e', // Bright Rose
          fill: 'rgba(244, 63, 94, 0.15)',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          dotBg: 'bg-rose-400',
        };
      default:
        return {
          stroke: '#a855f7',
          fill: 'rgba(168, 85, 247, 0.15)',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          dotBg: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 text-slate-200 p-2 sm:p-4 shadow-2xl z-30 animate-in slide-in-from-bottom duration-200 select-none flex-1 flex flex-col overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 border-b border-slate-800/80 pb-2 shrink-0">
        {/* Title & Badge */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-100 tracking-wide">
                Logic Analyzer & Waveforms
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                Lab
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              {signals.length} circuit signals
            </p>
          </div>
        </div>

        {/* Probing Filters & Controls */}
        <div className="flex items-center flex-wrap gap-1">
          {/* Signal Category Filters */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded border border-slate-800 text-[10px] font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-1.5 py-0.5 rounded transition ${
                filterMode === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({signals.length})
            </button>
            <button
              onClick={() => setFilterMode('io')}
              className={`px-1.5 py-0.5 rounded transition ${
                filterMode === 'io'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              I/O
            </button>
            <button
              onClick={() => setFilterMode('gates')}
              className={`px-1.5 py-0.5 rounded transition ${
                filterMode === 'gates'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gates
            </button>
          </div>

          {/* Reference Clock Toggle */}
          <button
            onClick={() => setShowRefClock(!showRefClock)}
            title="Toggle Reference Clock Line (CLK_ref)"
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border transition ${
              showRefClock
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>CLK<sub>ref</sub></span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-slate-950/80 rounded p-0.5 border border-slate-800">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[9px] font-mono text-slate-300 px-0.5 font-semibold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Reset History */}
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition border border-slate-700/60"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>

          {/* Close Panel */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Close Analyzer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Diagram Area */}
      {signals.length === 0 || displayHistory.length === 0 ? (
        <div className="text-center py-8 text-[11px] text-slate-400 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
          No signal probes active. Place components on the canvas to stream live logic state waveforms.
        </div>
      ) : (
        <div className="flex gap-2 flex-1 overflow-hidden">
          {/* Sticky Left Signal Labels Bar */}
          <div className="flex flex-col gap-2 pt-6 pb-2 sticky left-0 z-20 bg-slate-900 pr-2 border-r border-slate-800 shrink-0">
            {/* Reference Clock Label */}
            {showRefClock && (
              <div className="h-8 flex items-center justify-end gap-1 pr-1">
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  REF
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  CLK<sub>ref</sub>
                </span>
              </div>
            )}

            {/* Probed Signal Labels */}
            {filteredSignals.map((sig) => {
              const style = getSignalCategoryStyle(sig.category);
              return (
                <div key={sig.id} className="h-8 flex items-center justify-end gap-1 group">
                  <span
                    className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border uppercase shrink-0 ${style.badgeBg}`}
                  >
                    {sig.category === 'gate' ? sig.type : sig.category}
                  </span>
                  <span
                    className="text-[10px] font-mono font-semibold text-slate-200 truncate max-w-[90px] text-right"
                    title={sig.label}
                  >
                    {sig.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Waveform Canvas & Time Ticks Scroller */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar relative bg-slate-950/40 rounded-xl border border-slate-800/80 p-1.5"
          >
            <div
              className="flex flex-col gap-2 relative"
              style={{ minWidth: `${Math.max(160, totalWidth)}px` }}
            >
              {/* Top Time Axis & Clock Period Ticks (T0, T1, T2, T3...) */}
              <div className="h-5 flex border-b border-slate-800/80 mb-0.5 sticky top-0 bg-slate-950/90 z-10 backdrop-blur">
                {displayHistory.map((_, i) => (
                  <div
                    key={i}
                    className="h-full border-r border-slate-800/50 flex items-center justify-center shrink-0 select-none cursor-pointer"
                    style={{ width: pointWidth }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {i % 5 === 0 && (
                      <span className="text-[8px] font-mono text-slate-500 font-semibold">
                        T<sub>{i}</sub>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Background Grid Lines & Vertical Time Cursor */}
              <div className="absolute inset-0 top-5 flex pointer-events-none">
                {displayHistory.map((_, i) => (
                  <div
                    key={i}
                    className={`h-full border-r ${
                      i % 5 === 0 ? 'border-slate-800/60' : 'border-slate-900/40'
                    } relative`}
                    style={{ width: pointWidth }}
                  >
                    {hoveredIdx === i && (
                      <div className="absolute inset-y-0 left-0 border-l border-purple-500/60 bg-purple-500/10 z-0 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>

              {/* 1. Master Reference Clock Signal Waveform Line */}
              {showRefClock && (
                <div className="h-8 relative bg-slate-950/60 rounded overflow-visible border border-slate-800/60">
                  <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                    {displayHistory.map((_, idx) => {
                      if (idx === 0) return null;
                      const prevVal = (idx - 1) % 2 === 0;
                      const currVal = idx % 2 === 0;
                      const x1 = (idx - 1) * pointWidth;
                      const x2 = idx * pointWidth;
                      const yHigh = 6;
                      const yLow = 26;
                      const y1 = prevVal ? yHigh : yLow;
                      const y2 = currVal ? yHigh : yLow;

                      return (
                        <g key={idx}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x1}
                            y2={y2}
                            stroke="#22c55e"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={x1}
                            y1={y2}
                            x2={x2}
                            y2={y2}
                            stroke="#22c55e"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* 2. Probed Signal Waveform Tracks */}
              {filteredSignals.map((sig) => {
                const style = getSignalCategoryStyle(sig.category);

                return (
                  <div
                    key={sig.id}
                    className="h-8 relative bg-slate-950/70 rounded overflow-visible border border-slate-800/70 group hover:border-slate-700 transition"
                  >
                    <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                      {displayHistory.map((pt, idx) => {
                        if (idx === 0) return null;
                        const prevVal = !!displayHistory[idx - 1]?.values[sig.id];
                        const currVal = !!pt.values[sig.id];
                        const x1 = (idx - 1) * pointWidth;
                        const x2 = idx * pointWidth;
                        const yHigh = 6;
                        const yLow = 26;
                        const y1 = prevVal ? yHigh : yLow;
                        const y2 = currVal ? yHigh : yLow;

                        const isRisingEdge = !prevVal && currVal;
                        const isFallingEdge = prevVal && !currVal;

                        return (
                          <g key={idx}>
                            {/* Translucent fill under HIGH pulse */}
                            {currVal && (
                              <rect
                                x={x1}
                                y={yHigh}
                                width={pointWidth}
                                height={yLow - yHigh}
                                fill={style.fill}
                              />
                            )}

                            {/* Vertical transition step */}
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x1}
                              y2={y2}
                              stroke={style.stroke}
                              strokeWidth={isRisingEdge || isFallingEdge ? 2 : 1.2}
                            />

                            {/* Horizontal level line */}
                            <line
                              x1={x1}
                              y1={y2}
                              x2={x2}
                              y2={y2}
                              stroke={style.stroke}
                              strokeWidth={currVal ? 2 : 1.2}
                            />

                            {/* Edge Arrow Annotations */}
                            {isRisingEdge && (
                              <polygon
                                points={`${x1 - 2.5},${yLow - 3} ${x1 + 2.5},${yLow - 3} ${x1},${yHigh + 3}`}
                                fill={style.stroke}
                              />
                            )}
                            {isFallingEdge && (
                              <polygon
                                points={`${x1 - 2.5},${yHigh + 3} ${x1 + 2.5},${yHigh + 3} ${x1},${yLow - 3}`}
                                fill={style.stroke}
                              />
                            )}

                            {/* Logic State Text Labels (1 / 0) on Waveform */}
                            {(idx % 4 === 0 || isRisingEdge || isFallingEdge) && (
                              <text
                                x={x1 + pointWidth / 2}
                                y={currVal ? yHigh - 2 : yLow + 6}
                                textAnchor="middle"
                                fill={currVal ? style.stroke : '#64748b'}
                                fontSize="7"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                {currVal ? '1' : '0'}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Active Hover Logic Level Tooltip */}
                    {hoveredIdx !== null && displayHistory[hoveredIdx] && (
                      <div
                        className="absolute top-0.5 z-20 px-1 py-0.2 rounded text-[8px] font-bold font-mono transition-all pointer-events-none shadow"
                        style={{
                          left: hoveredIdx * pointWidth + 2,
                          backgroundColor: displayHistory[hoveredIdx].values[sig.id]
                            ? style.stroke
                            : '#334155',
                          color: displayHistory[hoveredIdx].values[sig.id] ? '#020617' : '#f8fafc',
                        }}
                      >
                        {displayHistory[hoveredIdx].values[sig.id] ? 'HIGH (1)' : 'LOW (0)'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
