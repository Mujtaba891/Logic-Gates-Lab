import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Download,
  BookOpen,
  Cpu,
  Trophy,
  HelpCircle,
  Table,
  Activity,
  FolderOpen,
  Image,
  FileCode,
  FileSpreadsheet,
  Undo,
  Redo,
  Plus,
  Maximize2,
  Minimize2,
  Check,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Folder,
  Sparkles,
} from 'lucide-react';
import { PRESET_CIRCUITS, CircuitPreset } from '../data/presets';
import { UserProject } from '../types';

interface HeaderProps {
  currentMode: 'builder' | 'explorer' | 'challenges' | 'quiz';
  setMode: (mode: 'builder' | 'explorer' | 'challenges' | 'quiz') => void;
  clockRunning: boolean;
  toggleClock: () => void;
  stepClock: () => void;
  clearCanvas: () => void;
  loadPreset: (preset: CircuitPreset) => void;
  showTruthTable: boolean;
  setShowTruthTable: (show: boolean) => void;
  showTimingDiagram: boolean;
  setShowTimingDiagram: (show: boolean) => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportLGL: () => void;
  onExportCSV: () => void;
  onImportLGL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Projects & Persistence Props
  projects: UserProject[];
  activeProjectId: string;
  activeProjectName: string;
  saveStatus: 'saved' | 'saving';
  onCreateProject: (name?: string) => void;
  onLoadProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  // Fullscreen
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  setMode,
  clockRunning,
  toggleClock,
  stepClock,
  clearCanvas,
  loadPreset,
  showTruthTable,
  setShowTruthTable,
  showTimingDiagram,
  setShowTimingDiagram,
  onExportPNG,
  onExportSVG,
  onExportLGL,
  onExportCSV,
  onImportLGL,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  projects,
  activeProjectId,
  activeProjectName,
  saveStatus,
  onCreateProject,
  onLoadProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  isFullscreen,
  toggleFullscreen,
}) => {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // New Project Form inside menu
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Rename inline state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Active project inline rename
  const [isRenamingActive, setIsRenamingActive] = useState(false);
  const [activeTitleInput, setActiveTitleInput] = useState(activeProjectName);

  const handleStartRename = (proj: UserProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(proj.id);
    setEditingName(proj.name);
  };

  const handleSaveRename = (projId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      onRenameProject(projId, editingName.trim());
    }
    setEditingProjectId(null);
  };

  const handleActiveTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTitleInput.trim()) {
      onRenameProject(activeProjectId, activeTitleInput.trim());
    }
    setIsRenamingActive(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(newProjectName.trim() || undefined);
    setNewProjectName('');
    setIsCreatingProject(false);
    setShowPresetMenu(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none">
      {/* Left: Brand, Active Project Title & Mode Switchers */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-100 flex items-center gap-1.5">
              LogicGate<span className="text-emerald-400">Lab</span>
            </h1>
            {/* Active Project Title & Auto-Save Badge */}
            <div className="flex items-center gap-1.5 text-xs">
              {isRenamingActive ? (
                <form onSubmit={handleActiveTitleSubmit} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={activeTitleInput}
                    onChange={(e) => setActiveTitleInput(e.target.value)}
                    onBlur={() => {
                      if (activeTitleInput.trim()) onRenameProject(activeProjectId, activeTitleInput.trim());
                      setIsRenamingActive(false);
                    }}
                    autoFocus
                    className="bg-slate-950 text-white px-1.5 py-0.5 rounded border border-emerald-500 text-xs focus:outline-none"
                  />
                  <button type="submit" className="text-emerald-400 p-0.5">
                    <Check className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setActiveTitleInput(activeProjectName);
                    setIsRenamingActive(true);
                  }}
                  title="Click to rename project"
                  className="text-slate-300 font-medium text-[11px] hover:text-emerald-400 flex items-center gap-1.5 group"
                >
                  <img src="/lgl.png" alt=".lgl project" className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
                  <span className="max-w-[130px] truncate">{activeProjectName}</span>
                  <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition text-slate-400" />
                </button>
              )}

              {/* Instant Auto-Save Indicator Badge */}
              <div className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-slate-800 border border-slate-700/80 text-[10px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                <span className="text-slate-400 text-[9px] font-mono">
                  {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setMode('builder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentMode === 'builder'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Circuit Builder
          </button>

          <button
            onClick={() => setMode('explorer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentMode === 'explorer'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Gate Encyclopedia
          </button>

          <button
            onClick={() => setMode('challenges')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentMode === 'challenges'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Challenges
          </button>

          <button
            onClick={() => setMode('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentMode === 'quiz'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Quiz Mode
          </button>
        </nav>
      </div>

      {/* Right: Toolbar Controls & Fullscreen */}
      {currentMode === 'builder' && (
        <div className="flex items-center gap-2.5">
          {/* History Controls */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`p-1.5 rounded-lg transition ${
                canUndo ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`p-1.5 rounded-lg transition ${
                canRedo ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Clock controls */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
            <button
              onClick={toggleClock}
              title={clockRunning ? 'Pause Clock Generator' : 'Start Clock Generator'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                clockRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {clockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {clockRunning ? 'Pause Clock' : 'Run Clock'}
            </button>
            <button
              onClick={stepClock}
              title="Pulse clock once"
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panels Toggles */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
            <button
              onClick={() => setShowTruthTable(!showTruthTable)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                showTruthTable
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Truth Table
            </button>
            <button
              onClick={() => setShowTimingDiagram(!showTimingDiagram)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                showTimingDiagram
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Waveform
            </button>
          </div>

          {/* Projects & Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPresetMenu(!showPresetMenu);
                setShowExportMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition"
            >
              <img src="/lgl.png" alt=".lgl" className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
              Projects & Presets
            </button>

            {showPresetMenu && (
              <div className="absolute right-0 mt-2 w-80 max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Primary Button: + Create New Project */}
                {!isCreatingProject ? (
                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md mb-3"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    + Create a new project
                  </button>
                ) : (
                  <form onSubmit={handleCreateSubmit} className="mb-3 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/50">
                    <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      New Project Name
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="e.g. 4-Bit Adder, Ripple Counter..."
                        className="flex-1 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingProject(false)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  </form>
                )}

                {/* Section: My Saved Projects */}
                <div className="mb-4">
                  <div className="flex items-center justify-between px-1 mb-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <img src="/lgl.png" alt=".lgl" className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
                      My Saved Projects (.lgl) ({projects.length})
                    </p>
                    <span className="text-[9px] text-emerald-400 font-mono">Auto-Saved</span>
                  </div>

                  <div className="space-y-1">
                    {projects.map((proj) => {
                      const isActive = proj.id === activeProjectId;
                      const isEditingThis = editingProjectId === proj.id;

                      return (
                        <div
                          key={proj.id}
                          onClick={() => {
                            onLoadProject(proj.id);
                            setShowPresetMenu(false);
                          }}
                          className={`w-full group text-left px-2.5 py-2 rounded-xl text-xs transition cursor-pointer border ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            {isEditingThis ? (
                              <form
                                onSubmit={(e) => handleSaveRename(proj.id, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 flex-1"
                              >
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="flex-1 bg-slate-950 px-2 py-0.5 rounded border border-emerald-500 text-xs text-white"
                                  autoFocus
                                />
                                <button type="submit" className="text-emerald-400 p-0.5">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            ) : (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <img src="/lgl.png" alt=".lgl" className="w-4 h-4 object-contain shrink-0" referrerPolicy="no-referrer" />
                                {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                                <span className="font-semibold truncate text-slate-100 group-hover:text-emerald-400">
                                  {proj.name}
                                </span>
                              </div>
                            )}

                            {/* Project Actions */}
                            {!isEditingThis && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                              >
                                <button
                                  onClick={(e) => handleStartRename(proj, e)}
                                  title="Rename project"
                                  className="p-1 hover:text-emerald-400 text-slate-400 transition"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDuplicateProject(proj.id)}
                                  title="Duplicate project"
                                  className="p-1 hover:text-cyan-400 text-slate-400 transition"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                {projects.length > 1 && (
                                  <button
                                    onClick={() => onDeleteProject(proj.id)}
                                    title="Delete project"
                                    className="p-1 hover:text-rose-400 text-slate-400 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Layers className="w-2.5 h-2.5" />
                              {proj.components?.length || 0} gates
                            </span>
                            <span>
                              {new Date(proj.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-800 my-2" />

                {/* Section: Educational Sample Circuits */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-1 mb-1.5 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Educational Preset Templates
                  </p>
                  <div className="space-y-1">
                    {PRESET_CIRCUITS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          loadPreset(preset);
                          setShowPresetMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-xl text-xs transition group border border-transparent hover:border-slate-700"
                      >
                        <div className="font-semibold text-slate-200 group-hover:text-emerald-400">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{preset.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export & Import Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowExportMenu(!showExportMenu);
                setShowPresetMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-xl text-xs transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                  Diagram & Data Export
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onExportPNG();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg text-xs transition"
                  >
                    <Image className="w-4 h-4 text-emerald-400" />
                    Export as PNG Image
                  </button>
                  <button
                    onClick={() => {
                      onExportSVG();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg text-xs transition"
                  >
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    Export as Vector SVG
                  </button>
                  <button
                    onClick={() => {
                      onExportLGL();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg text-xs transition"
                  >
                    <img src="/lgl.png" alt=".lgl" className="w-4 h-4 object-contain shrink-0" referrerPolicy="no-referrer" />
                    Export Project (.lgl)
                  </button>
                  <button
                    onClick={() => {
                      onExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg text-xs transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                    Export Truth Table (.csv)
                  </button>

                  <div className="border-t border-slate-800 my-1 pt-1">
                    <label className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer transition">
                      <img src="/lgl.png" alt=".lgl" className="w-4 h-4 object-contain shrink-0" referrerPolicy="no-referrer" />
                      Import Project (.lgl)
                      <input type="file" accept=".lgl,application/json" onChange={onImportLGL} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear Canvas Button */}
          <button
            onClick={clearCanvas}
            title="Reset/Clear Current Canvas"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Mode Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Editor'}
            className={`p-2 rounded-xl transition ${
              isFullscreen
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </header>
  );
};
