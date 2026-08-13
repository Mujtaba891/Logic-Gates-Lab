import React from 'react';
import {
  Save,
  FolderOpen,
  Download,
  Upload,
  Share2,
  BookOpen,
  HelpCircle,
  X,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { UserProject } from '../types';

interface MoreBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  projects: UserProject[];
  activeProjectId: string;
  activeProjectName: string;
  onCreateProject: () => void;
  onLoadProject: (id: string) => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportLGL: () => void;
  onExportCSV: () => void;
  onImportLGL: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectMode: (mode: 'builder' | 'explorer' | 'challenges' | 'quiz') => void;
}

export const MoreBottomSheet: React.FC<MoreBottomSheetProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  activeProjectName,
  onCreateProject,
  onLoadProject,
  onExportPNG,
  onExportSVG,
  onExportLGL,
  onExportCSV,
  onImportLGL,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-Up Bottom Sheet */}
      <div className="relative w-full max-h-[80vh] bg-slate-900 border-t border-slate-800 rounded-t-2xl shadow-2xl z-10 flex flex-col p-3 pb-6 animate-in slide-in-from-bottom duration-250 overflow-hidden">
        {/* Top Drag Bar Handle */}
        <div className="w-10 h-1 rounded-full bg-slate-700/80 mx-auto mb-2 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
          <div>
            <h3 className="text-xs font-bold text-white">Project & Simulator Tools</h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <img src="/lgl.png" alt=".lgl" className="w-3 h-3 object-contain" referrerPolicy="no-referrer" />
              <span>Active: {activeProjectName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 active:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List Grid / Scroller */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-0.5">
          {/* Section 1: Projects Management */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Projects & Persistence
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onCreateProject();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/80 text-left flex items-center gap-2 transition"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <PlusCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-100">New Project</span>
                  <span className="block text-[9px] text-slate-400">Fresh workspace</span>
                </div>
              </button>

              <button
                onClick={() => {
                  /* toggle project list below */
                }}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left flex items-center gap-2 transition"
              >
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <FolderOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-100">Load Project</span>
                  <span className="block text-[9px] text-slate-400">{projects.length} Saved</span>
                </div>
              </button>
            </div>

            {/* Quick Project Switcher List */}
            <div className="mt-1.5 space-y-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 max-h-28 overflow-y-auto custom-scrollbar">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onLoadProject(p.id);
                    onClose();
                  }}
                  className={`w-full px-2 py-1 rounded-lg text-left text-[11px] flex items-center justify-between transition ${
                    p.id === activeProjectId
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src="/lgl.png" alt=".lgl" className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
                    <span className="truncate">{p.name}</span>
                  </div>
                  {p.id === activeProjectId && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 shrink-0">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Import & Export Actions */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Import & Export Options
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onExportPNG();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-semibold text-slate-200">Export PNG</span>
              </button>

              <button
                onClick={() => {
                  onExportSVG();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-semibold text-slate-200">Export SVG</span>
              </button>

              <button
                onClick={() => {
                  onExportLGL();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-1.5 transition"
              >
                <img src="/lgl.png" alt=".lgl" className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
                <span className="text-[11px] font-semibold text-slate-200">Export .lgl</span>
              </button>

              <button
                onClick={() => {
                  onExportCSV();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold text-slate-200">Truth CSV</span>
              </button>
            </div>

            {/* Import LGL File Input */}
            <label className="mt-1.5 flex items-center justify-center gap-1.5 w-full py-2 px-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-bold text-slate-200 cursor-pointer transition">
              <img src="/lgl.png" alt=".lgl" className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
              <span>Import Project (.lgl)</span>
              <input
                type="file"
                accept=".lgl,application/json"
                onChange={(e) => {
                  onImportLGL(e);
                  onClose();
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Section 3: Learning & Exploration Modes */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Learning & Lab Modes
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onSelectMode('explorer');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-2 transition"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-100">Encyclopedia</span>
                  <span className="block text-[9px] text-slate-400">Gate specs</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectMode('challenges');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-2 transition"
              >
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-100">Challenges</span>
                  <span className="block text-[9px] text-slate-400">Puzzles & Adders</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectMode('quiz');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-2 transition col-span-2"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-100">Identification Quiz</span>
                  <span className="block text-[9px] text-slate-400">Test gate symbol recognition</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
