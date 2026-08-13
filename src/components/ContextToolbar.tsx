import React from 'react';
import { CircuitComponent } from '../types';
import { RotateCw, Copy, Trash2, Tag } from 'lucide-react';

interface ContextToolbarProps {
  component: CircuitComponent;
  onRotate: (compId: string) => void;
  onDuplicate: (compId: string) => void;
  onDelete: (compId: string) => void;
  onChangeInputCount: (compId: string, count: number) => void;
  onChangeColor: (compId: string, color: string) => void;
  onChangeLabel: (compId: string, label: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Default', hex: '' },
  { name: 'Emerald', hex: '#22c55e' },
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
];

export const ContextToolbar: React.FC<ContextToolbarProps> = ({
  component,
  onRotate,
  onDuplicate,
  onDelete,
  onChangeInputCount,
  onChangeColor,
  onChangeLabel,
}) => {
  const isMultiInputGate = ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].includes(component.type);

  return (
    <div className="flex flex-col items-center gap-1.5 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100">
      {/* Label Edit */}
      <div className="flex flex-col items-center gap-1 pb-1.5 border-b border-slate-800 w-full">
        <Tag className="w-3 h-3 text-slate-400" />
        <input
          type="text"
          value={component.label}
          onChange={(e) => onChangeLabel(component.id, e.target.value)}
          placeholder="Label..."
          className="w-16 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded-lg text-[10px] text-center text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Rotate Button */}
      <button
        onClick={() => onRotate(component.id)}
        title="Rotate 90° Clockwise"
        className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-emerald-400 transition flex items-center gap-1 text-xs"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono text-slate-400">{component.rotation || 0}°</span>
      </button>

      {/* Input Pins Selector */}
      {isMultiInputGate && (
        <div className="flex flex-col items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs w-full">
          <span className="text-[9px] text-slate-400 font-semibold uppercase leading-none mt-0.5">Pins</span>
          <div className="flex items-center gap-0.5">
            {[2, 3, 4].map((cnt) => (
              <button
                key={cnt}
                onClick={() => onChangeInputCount(component.id, cnt)}
                className={`px-1.5 py-0.5 rounded font-bold transition text-[10px] ${
                  (component.inputCount || 2) === cnt
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Picker */}
      <div className="grid grid-cols-2 gap-1.5 py-1.5 border-y border-slate-800 w-full justify-items-center">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.name}
            onClick={() => onChangeColor(component.id, c.hex)}
            title={c.name}
            style={{ backgroundColor: c.hex || '#64748b' }}
            className={`w-3.5 h-3.5 rounded-full transition transform hover:scale-125 ${
              (component.color || '') === c.hex ? 'ring-2 ring-white scale-110' : 'opacity-70'
            }`}
          />
        ))}
      </div>

      {/* Duplicate Button */}
      <button
        onClick={() => onDuplicate(component.id)}
        title="Duplicate Component (Ctrl+D)"
        className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-emerald-400 transition"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(component.id)}
        title="Delete Component (Del)"
        className="p-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
