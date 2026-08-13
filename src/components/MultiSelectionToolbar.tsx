import React, { useState } from 'react';
import {
  Trash2,
  Copy,
  RotateCw,
  AlignLeft,
  AlignStartVertical,
  AlignCenter,
  Palette,
  ToggleLeft,
  X,
  Layers,
  Tag,
} from 'lucide-react';
import { CircuitComponent } from '../types';

interface MultiSelectionToolbarProps {
  selectedCount: number;
  singleComponent?: CircuitComponent | null;
  onDelete: () => void;
  onDuplicate: () => void;
  onRotate: () => void;
  onAlignLeft: () => void;
  onAlignTop: () => void;
  onAlignCenter: () => void;
  onChangeColor: (color: string) => void;
  onToggleInputs?: () => void;
  hasInputsSelected: boolean;
  onClearSelection: () => void;
  onChangeLabel?: (label: string) => void;
  onChangeInputCount?: (count: number) => void;
}

const COLOR_OPTIONS = [
  { name: 'Default', hex: '' },
  { name: 'Emerald', hex: '#22c55e' },
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
];

export const MultiSelectionToolbar: React.FC<MultiSelectionToolbarProps> = ({
  selectedCount,
  singleComponent,
  onDelete,
  onDuplicate,
  onRotate,
  onAlignLeft,
  onAlignTop,
  onAlignCenter,
  onChangeColor,
  onToggleInputs,
  hasInputsSelected,
  onClearSelection,
  onChangeLabel,
  onChangeInputCount,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isMultiInputGate =
    singleComponent && ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].includes(singleComponent.type);

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 bg-slate-900/95 border border-emerald-500/40 rounded-2xl px-3 py-2 shadow-2xl backdrop-blur-md text-slate-100 select-none animate-in fade-in zoom-in-95 duration-150 z-50 flex-wrap"
    >
      {/* Badge or Single Comp Info */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold">
        <Layers className="w-3.5 h-3.5" />
        <span>
          {selectedCount === 1 && singleComponent
            ? singleComponent.type
            : `${selectedCount} Selected`}
        </span>
      </div>

      {/* Editable Label for Single Selected Component */}
      {selectedCount === 1 && singleComponent && onChangeLabel && (
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl">
          <Tag className="w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={singleComponent.label || ''}
            onChange={(e) => onChangeLabel(e.target.value)}
            placeholder="Label..."
            className="w-20 bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
          />
        </div>
      )}

      {/* Input Pins Selector for Single Gate */}
      {selectedCount === 1 && isMultiInputGate && onChangeInputCount && (
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase mr-0.5">Pins</span>
          {[2, 3, 4].map((cnt) => (
            <button
              key={cnt}
              onClick={() => onChangeInputCount(cnt)}
              className={`px-1.5 py-0.5 rounded font-bold transition text-[10px] ${
                (singleComponent.inputCount || 2) === cnt
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      )}

      <div className="h-4 w-[1px] bg-slate-800" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Rotate */}
        <button
          onClick={onRotate}
          title="Rotate Selected 90° (R)"
          className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl text-xs font-medium transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rotate</span>
        </button>

        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          title="Duplicate Selected (Ctrl+D)"
          className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl text-xs font-medium transition"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Duplicate</span>
        </button>

        {/* Alignment Controls (Only when 2 or more selected) */}
        {selectedCount >= 2 && (
          <>
            <button
              onClick={onAlignLeft}
              title="Align Left"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-xl transition"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onAlignTop}
              title="Align Top"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-xl transition"
            >
              <AlignStartVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onAlignCenter}
              title="Align Center"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-xl transition"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Color Tagging */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change Color"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-xl transition"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 bg-slate-950 border border-slate-700 rounded-xl p-2 shadow-xl flex items-center gap-1.5 z-50">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    onChangeColor(c.hex);
                    setShowColorPicker(false);
                  }}
                  title={c.name}
                  style={{ backgroundColor: c.hex || '#64748b' }}
                  className="w-4 h-4 rounded-full hover:scale-125 transition transform"
                />
              ))}
            </div>
          )}
        </div>

        {/* Toggle Inputs if any */}
        {hasInputsSelected && onToggleInputs && (
          <button
            onClick={onToggleInputs}
            title="Toggle Selected Inputs (0/1)"
            className="flex items-center gap-1 px-2 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 rounded-xl text-xs font-medium transition"
          >
            <ToggleLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Toggle Switches</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-800 my-auto" />

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Delete Selected Items (Del)"
          className="flex items-center gap-1 px-2 py-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Clear Selection */}
      <button
        onClick={onClearSelection}
        title="Deselect All (Esc)"
        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
