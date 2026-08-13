import React, { useState, useEffect, useRef } from 'react';
import { GateType, Position } from '../types';
import { GATE_DEFINITIONS } from '../data/gateLibrary';
import { GateSymbolSvg } from './GateSymbolSvg';
import { Search, Sparkles, X } from 'lucide-react';

interface QuickAddMenuProps {
  position: Position;
  onAdd: (type: GateType) => void;
  onClose: () => void;
}

const GATE_TYPES: GateType[] = [
  'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER',
  'INPUT', 'OUTPUT', 'CLOCK', 'HIGH', 'LOW',
  'HALF_ADDER', 'FULL_ADDER', 'MUX_21'
];

export const QuickAddMenu: React.FC<QuickAddMenuProps> = ({ position, onAdd, onClose }) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = GATE_TYPES.filter((type) => {
    const def = GATE_DEFINITIONS[type];
    const name = def?.name || type;
    return name.toLowerCase().includes(search.toLowerCase()) || type.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div
      style={{ left: Math.min(position.x, window.innerWidth - 280), top: Math.min(position.y, window.innerHeight - 340) }}
      className="fixed z-50 w-64 bg-slate-900 border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl text-slate-100 animate-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-1">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Quick Add Gate
        </span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Type gate name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      <div className="max-h-56 overflow-y-auto space-y-1 pr-1 no-scrollbar">
        {filtered.map((type) => {
          const def = GATE_DEFINITIONS[type];
          return (
            <button
              key={type}
              onClick={() => {
                onAdd(type);
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-800/90 rounded-xl text-xs transition text-left group"
            >
              <div>
                <div className="font-bold text-slate-200 group-hover:text-emerald-400">{def?.name || type}</div>
                <div className="text-[10px] text-slate-400 font-mono">{type}</div>
              </div>
              <div className="w-10 h-7 bg-slate-950 border border-slate-800 rounded flex items-center justify-center p-0.5 shrink-0">
                <GateSymbolSvg type={type} width={36} height={22} />
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-4 text-xs text-slate-500">No matching gates found</div>
        )}
      </div>
    </div>
  );
};
