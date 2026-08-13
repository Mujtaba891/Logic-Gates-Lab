import React, { useState } from 'react';
import { GateType, ComponentCategory } from '../types';
import { PALETTE_ITEMS } from './Palette';
import { GateSymbolSvg } from './GateSymbolSvg';
import { Search, X, Plus } from 'lucide-react';

interface ComponentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (type: GateType) => void;
}

export const ComponentsDrawer: React.FC<ComponentsDrawerProps> = ({
  isOpen,
  onClose,
  onAddComponent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  if (!isOpen) return null;

  const filteredItems = PALETTE_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = (type: GateType) => {
    onAddComponent(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-in Drawer Container */}
      <div className="relative w-[85vw] max-w-[320px] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight">Components Palette</h2>
            <p className="text-[10px] text-slate-400">Tap component to add to canvas</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 active:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b border-slate-800/80 space-y-1.5 bg-slate-900/90">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search (AND, OR, Switch...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-[11px] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px] font-semibold">
            {(['all', 'gates', 'inputs', 'outputs', 'modules'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-lg transition whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-slate-200'
                }`}
              >
                {cat === 'all'
                  ? 'All'
                  : cat === 'gates'
                  ? 'Gates'
                  : cat === 'inputs'
                  ? 'Inputs'
                  : cat === 'outputs'
                  ? 'Outputs'
                  : 'Modules'}
              </button>
            ))}
          </div>
        </div>

        {/* Component Cards List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-[11px] text-slate-400">
              No components found matching "{searchTerm}".
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.type}
                onClick={() => handleAdd(item.type)}
                className="p-2 bg-slate-800/40 hover:bg-slate-800/90 active:bg-slate-700/80 border border-slate-700/60 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition shadow-sm group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5 shrink-0 group-hover:border-emerald-500/60 transition">
                    <GateSymbolSvg type={item.type} size="xs" state={false} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold text-slate-100 group-hover:text-emerald-400 transition truncate">
                      {item.name}
                    </h3>
                    <p className="text-[9px] text-slate-400 line-clamp-1 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(item.type);
                  }}
                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 shrink-0"
                  aria-label={`Add ${item.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
