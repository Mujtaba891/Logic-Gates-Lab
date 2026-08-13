import React, { useState } from 'react';
import { GateType, ComponentCategory } from '../types';
import { GATE_DEFINITIONS } from '../data/gateLibrary';
import { GateSymbolSvg } from './GateSymbolSvg';
import { Search, Plus, Sparkles } from 'lucide-react';

interface PaletteProps {
  onAddComponent: (type: GateType) => void;
}

export interface PaletteItem {
  type: GateType;
  name: string;
  category: ComponentCategory;
  description: string;
}

export const PALETTE_ITEMS: PaletteItem[] = [
  // Inputs
  { type: 'INPUT', name: 'Toggle Switch (0/1)', category: 'inputs', description: 'Interactive manual high/low signal switch' },
  { type: 'CLOCK', name: 'Clock Generator', category: 'inputs', description: 'Pulsing clock oscillator signal' },
  { type: 'HIGH', name: 'Constant High (1)', category: 'inputs', description: 'Fixed logic 1 voltage level' },
  { type: 'LOW', name: 'Constant Low (0)', category: 'inputs', description: 'Fixed logic 0 ground level' },

  // Basic Gates
  { type: 'AND', name: 'AND Gate', category: 'gates', description: GATE_DEFINITIONS.AND.description },
  { type: 'OR', name: 'OR Gate', category: 'gates', description: GATE_DEFINITIONS.OR.description },
  { type: 'NOT', name: 'NOT Gate (Inverter)', category: 'gates', description: GATE_DEFINITIONS.NOT.description },
  { type: 'NAND', name: 'NAND Gate', category: 'gates', description: GATE_DEFINITIONS.NAND.description },
  { type: 'NOR', name: 'NOR Gate', category: 'gates', description: GATE_DEFINITIONS.NOR.description },
  { type: 'XOR', name: 'XOR Gate', category: 'gates', description: GATE_DEFINITIONS.XOR.description },
  { type: 'XNOR', name: 'XNOR Gate', category: 'gates', description: GATE_DEFINITIONS.XNOR.description },
  { type: 'BUFFER', name: 'Buffer Gate', category: 'gates', description: GATE_DEFINITIONS.BUFFER.description },

  // Outputs
  { type: 'OUTPUT', name: 'LED Indicator Bulb', category: 'outputs', description: 'Glows bright green when signal is 1' },

  // Modules / Combinational
  { type: 'HALF_ADDER', name: 'Half Adder Module', category: 'modules', description: '2-bit adder with Sum and Carry outputs' },
  { type: 'FULL_ADDER', name: 'Full Adder Module', category: 'modules', description: '3-bit adder with Sum and Carry-in/out' },
  { type: 'MUX_21', name: '2:1 Multiplexer', category: 'modules', description: 'Selects between two data lines with select S' },
];

export const Palette: React.FC<PaletteProps> = ({ onAddComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  const filteredItems = PALETTE_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, type: GateType) => {
    e.dataTransfer.setData('gateType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-72 bg-slate-900/95 border-r border-slate-800 text-slate-200 flex flex-col h-full select-none shadow-xl">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search gates or components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px] font-medium">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('gates')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              selectedCategory === 'gates'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Logic Gates
          </button>
          <button
            onClick={() => setSelectedCategory('inputs')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              selectedCategory === 'inputs'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Inputs
          </button>
          <button
            onClick={() => setSelectedCategory('outputs')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              selectedCategory === 'outputs'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Outputs
          </button>
          <button
            onClick={() => setSelectedCategory('modules')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              selectedCategory === 'modules'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Modules
          </button>
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => onAddComponent(item.type)}
            className="group relative bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl p-2.5 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:shadow-emerald-950/20"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-slate-100 group-hover:text-emerald-400 transition">
                {item.name}
              </span>
              <button
                title="Click to add to canvas"
                className="opacity-0 group-hover:opacity-100 p-1 bg-emerald-500/20 text-emerald-400 rounded-md transition hover:bg-emerald-500 hover:text-slate-950"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 flex-1">
                {item.description}
              </p>
              <div className="w-14 h-10 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-center p-1 shrink-0">
                <GateSymbolSvg type={item.type} width={48} height={32} />
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No matching components found.
          </div>
        )}
      </div>

      {/* Drag Tip Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Drag items onto canvas or click to place.</span>
      </div>
    </aside>
  );
};
