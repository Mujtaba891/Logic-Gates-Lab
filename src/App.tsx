import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CircuitComponent, Wire, GateType, Position, WaveformPoint, UserProject } from './types';
import { PRESET_CIRCUITS, CircuitPreset } from './data/presets';
import { useCircuitHistory } from './hooks/useCircuitHistory';
import { createComponentPorts, propagateCircuitLogic, generateCircuitTruthTable } from './utils/logicEngine';
import { exportTruthTableToCSV, exportCanvasToPNG, exportCanvasToSVG } from './utils/exportUtils';
import { downloadLGLProject, parseAndValidateLGL } from './utils/lglSystem';
import { Header } from './components/Header';
import { Palette } from './components/Palette';
import { FullscreenTopBar } from './components/FullscreenTopBar';
import { CircuitCanvas, CanvasControlHandle } from './components/CircuitCanvas';
import { TruthTablePanel } from './components/TruthTablePanel';
import { TimingDiagram } from './components/TimingDiagram';
import { GateEncyclopedia } from './components/GateEncyclopedia';
import { ChallengePanel } from './components/ChallengePanel';
import { IdentificationQuiz } from './components/IdentificationQuiz';

// Mobile Responsive UI Components
import { MobileHeader } from './components/MobileHeader';
import { ViewSwitcher, ActiveView } from './components/ViewSwitcher';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ComponentsDrawer } from './components/ComponentsDrawer';
import { MoreBottomSheet } from './components/MoreBottomSheet';
import { MobileCanvasToolbar } from './components/MobileCanvasToolbar';
import { MobileQuickActionsBar } from './components/MobileQuickActionsBar';
import { TruthTableView } from './components/TruthTableView';
import { WaveformView } from './components/WaveformView';

const STORAGE_KEY = 'logicgate_user_projects_v2';

const DEFAULT_PROJECT: UserProject = {
  id: 'proj-default-half-adder',
  name: 'Half Adder Circuit',
  description: 'Default sample circuit',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  components: PRESET_CIRCUITS[0].components,
  wires: PRESET_CIRCUITS[0].wires,
};

function sanitizeProjects(rawProjects: any[]): UserProject[] {
  if (!Array.isArray(rawProjects) || rawProjects.length === 0) {
    return [DEFAULT_PROJECT];
  }

  const seenIds = new Set<string>();
  const sanitized: UserProject[] = [];

  for (const proj of rawProjects) {
    if (!proj || typeof proj !== 'object') continue;

    let projId = typeof proj.id === 'string' && proj.id.trim() ? proj.id.trim() : '';

    if (!projId || seenIds.has(projId)) {
      projId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }

    seenIds.add(projId);

    sanitized.push({
      ...proj,
      id: projId,
      name: typeof proj.name === 'string' && proj.name.trim() ? proj.name.trim() : 'Untitled Circuit',
      components: Array.isArray(proj.components) ? proj.components : [],
      wires: Array.isArray(proj.wires) ? proj.wires : [],
    });
  }

  return sanitized.length > 0 ? sanitized : [DEFAULT_PROJECT];
}

export default function App() {
  const [mode, setMode] = useState<'builder' | 'explorer' | 'challenges' | 'quiz'>('builder');

  // Fullscreen State (Supports Native Browser Fullscreen + App-level Immersive Fullscreen Mode on Mobile / iOS / iframe)
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc: any = document;
      const isNativeFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isNativeFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const doc: any = document;
    const docEl: any = document.documentElement;

    const isNativeFs = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFullscreen && !isNativeFs) {
      // Enter Fullscreen: Attempt browser API first, fallback cleanly to UI Fullscreen
      try {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {
            setIsFullscreen(true);
          });
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      } catch (e) {
        console.warn('Native fullscreen request caught:', e);
      }
      setIsFullscreen(true);
    } else {
      // Exit Fullscreen: Exit native if active, always exit UI fullscreen
      try {
        if (doc.exitFullscreen && (doc.fullscreenElement || doc.webkitFullscreenElement)) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        }
      } catch (e) {
        console.warn('Native exit fullscreen caught:', e);
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Saved User Projects State & Persistence
  const [projects, setProjects] = useState<UserProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeProjects(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          return sanitized;
        }
      }
    } catch (e) {
      console.error('Failed to load saved projects from localStorage:', e);
    }
    return [DEFAULT_PROJECT];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || DEFAULT_PROJECT.id;
  });

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECT;

  // Circuit Canvas State
  const [components, setComponents] = useState<CircuitComponent[]>(activeProject?.components || []);
  const [wires, setWires] = useState<Wire[]>(activeProject?.wires || []);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const { pushHistory, undo, redo, canUndo, canRedo, resetHistory } = useCircuitHistory({
    components: activeProject?.components || [],
    wires: activeProject?.wires || [],
  });

  // Sync state when active project changes
  useEffect(() => {
    if (activeProject) {
      const { components: propagatedComps, wires: propagatedWires } = propagateCircuitLogic(
        activeProject.components,
        activeProject.wires
      );
      setComponents(propagatedComps);
      setWires(propagatedWires);
      resetHistory({ components: propagatedComps, wires: propagatedWires });
    }
  }, [activeProjectId]);

  // Instant Auto-Save Effect whenever components or wires update
  useEffect(() => {
    if (!activeProjectId) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setProjects((prevProjects) => {
        const updatedProjects = prevProjects.map((p) => {
          if (p.id === activeProjectId) {
            return {
              ...p,
              components,
              wires,
              updatedAt: Date.now(),
            };
          }
          return p;
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
        } catch (e) {
          console.error('Error saving projects to localStorage:', e);
        }

        return updatedProjects;
      });
      setSaveStatus('saved');
    }, 200);

    return () => clearTimeout(timer);
  }, [components, wires, activeProjectId]);

  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      updateCircuitState(prevState.components, prevState.wires, false);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      updateCircuitState(nextState.components, nextState.wires, false);
    }
  }, [redo]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Clock generator state
  const [clockRunning, setClockRunning] = useState(false);

  // UI Panels
  const [showTruthTable, setShowTruthTable] = useState(true);
  const [showTimingDiagram, setShowTimingDiagram] = useState(false);

  // Mobile Responsive UI States
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 900 : false);
  const [activeMobileView, setActiveMobileView] = useState<ActiveView>('builder');
  const [isComponentsDrawerOpen, setIsComponentsDrawerOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [canvasTool, setCanvasTool] = useState<'select' | 'pan'>('select');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Timing Diagram Waveform History
  const [waveformHistory, setWaveformHistory] = useState<WaveformPoint[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<CanvasControlHandle | null>(null);

  // Maintain refs for stable interval callbacks
  const componentsRef = useRef(components);
  const wiresRef = useRef(wires);

  useEffect(() => {
    componentsRef.current = components;
    wiresRef.current = wires;
  });

  // Run Real-Time Signal Propagation on any component/wire update
  const updateCircuitState = useCallback(
    (newComps: CircuitComponent[], newWires: Wire[], commitToHistory: boolean = false) => {
      const { components: propagatedComps, wires: propagatedWires } = propagateCircuitLogic(newComps, newWires);
      setComponents(propagatedComps);
      setWires(propagatedWires);

      // Record Waveform Point for Timing Diagram (All components/gates probed)
      const timeNow = Date.now();
      const signalValues: { [id: string]: boolean } = {};

      propagatedComps.forEach((c) => {
        if (c.type === 'INPUT' || c.type === 'CLOCK' || c.type === 'HIGH') {
          signalValues[c.id] = !!c.state;
        } else if (c.type === 'LOW') {
          signalValues[c.id] = false;
        } else if (c.type === 'OUTPUT') {
          signalValues[c.id] = c.inputs[0]?.value ?? !!c.state;
        } else {
          if (c.outputs && c.outputs.length > 1) {
            c.outputs.forEach((port, idx) => {
              signalValues[`${c.id}_p_${idx}`] = port.value ?? false;
            });
          } else {
            signalValues[c.id] = c.outputs[0]?.value ?? false;
          }
        }
      });

      setWaveformHistory((prev) => [...prev.slice(-150), { time: timeNow, values: signalValues }]);

      if (commitToHistory) {
        pushHistory({ components: propagatedComps, wires: propagatedWires });
      }
    },
    [pushHistory]
  );

  // Continuous Waveform Ticker: runs continuously non-stop
  useEffect(() => {
    const ticker = setInterval(() => {
      const timeNow = Date.now();
      const signalValues: { [id: string]: boolean } = {};

      componentsRef.current.forEach((c) => {
        if (c.type === 'INPUT' || c.type === 'CLOCK' || c.type === 'HIGH') {
          signalValues[c.id] = !!c.state;
        } else if (c.type === 'LOW') {
          signalValues[c.id] = false;
        } else if (c.type === 'OUTPUT') {
          signalValues[c.id] = c.inputs[0]?.value ?? !!c.state;
        } else {
          if (c.outputs && c.outputs.length > 1) {
            c.outputs.forEach((port, idx) => {
              signalValues[`${c.id}_p_${idx}`] = port.value ?? false;
            });
          } else {
            signalValues[c.id] = c.outputs[0]?.value ?? false;
          }
        }
      });

      setWaveformHistory((prev) => [...prev.slice(-150), { time: timeNow, values: signalValues }]);
    }, 150);

    return () => clearInterval(ticker);
  }, []);

  // Handlers for canvas component/wire updates
  const handleUpdateComponents = (newComps: CircuitComponent[]) => {
    updateCircuitState(newComps, wires);
  };

  const handleUpdateWires = (newWires: Wire[]) => {
    updateCircuitState(components, newWires);
  };

  // Add new component to canvas
  const handleAddComponent = (type: GateType, pos?: Position) => {
    const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const ports = createComponentPorts(type, id);

    // Default placement center-ish or specified position
    const placement: Position = pos || {
      x: 220 + Math.random() * 80,
      y: 160 + Math.random() * 80,
    };

    const newComp: CircuitComponent = {
      id,
      type,
      label: type,
      x: placement.x,
      y: placement.y,
      state: type === 'HIGH',
      inputs: ports.inputs,
      outputs: ports.outputs,
    };

    updateCircuitState([...componentsRef.current, newComp], wiresRef.current, true);
  };

  // Clock Pulse Generator Interval
  useEffect(() => {
    if (!clockRunning) return;

    const interval = setInterval(() => {
      const currentComps = componentsRef.current;
      const currentWires = wiresRef.current;

      const hasClockComp = currentComps.some((c) => c.type === 'CLOCK');
      if (!hasClockComp) {
        return;
      }

      // Toggle state of all CLOCK components
      const updatedComps = currentComps.map((c) => {
        if (c.type === 'CLOCK') {
          const nextState = !c.state;
          return {
            ...c,
            state: nextState,
            outputs: c.outputs.map((p) => ({ ...p, value: nextState })),
          };
        }
        return c;
      });

      const { components: propagatedComps, wires: propagatedWires } = propagateCircuitLogic(
        updatedComps,
        currentWires
      );

      setComponents(propagatedComps);
      setWires(propagatedWires);
    }, 600);

    return () => clearInterval(interval);
  }, [clockRunning]);

  // Pulse clock once
  const handleStepClock = () => {
    const currentComps = componentsRef.current;
    const currentWires = wiresRef.current;

    const hasClockComp = currentComps.some((c) => c.type === 'CLOCK');
    if (!hasClockComp) {
      handleAddComponent('CLOCK', { x: 200, y: 150 });
      return;
    }

    const updatedComps = currentComps.map((c) => {
      if (c.type === 'CLOCK') {
        const nextState = !c.state;
        return {
          ...c,
          state: nextState,
          outputs: c.outputs.map((p) => ({ ...p, value: nextState })),
        };
      }
      return c;
    });

    const { components: propagatedComps, wires: propagatedWires } = propagateCircuitLogic(
      updatedComps,
      currentWires
    );
    setComponents(propagatedComps);
    setWires(propagatedWires);
  };

  const handleToggleClock = () => {
    const nextRunning = !clockRunning;
    setClockRunning(nextRunning);
    if (nextRunning && !componentsRef.current.some((c) => c.type === 'CLOCK')) {
      handleAddComponent('CLOCK', { x: 200, y: 150 });
    }
  };

  // Project Management Handlers
  const handleCreateProject = (customName?: string) => {
    const name = customName || `Project ${projects.length + 1}`;
    const newProj: UserProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      components: [],
      wires: [],
    };

    const updatedProjects = sanitizeProjects([newProj, ...projects]);
    setProjects(updatedProjects);
    setActiveProjectId(newProj.id);
    setComponents([]);
    setWires([]);
    resetHistory({ components: [], wires: [] });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadProject = (projectId: string) => {
    if (projectId === activeProjectId) return;
    setActiveProjectId(projectId);
  };

  const handleRenameProject = (projectId: string, newName: string) => {
    if (!newName.trim()) return;
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === projectId ? { ...p, name: newName.trim(), updatedAt: Date.now() } : p));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDuplicateProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    const dupProj: UserProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${target.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      components: JSON.parse(JSON.stringify(target.components)),
      wires: JSON.parse(JSON.stringify(target.wires)),
    };

    const updatedProjects = sanitizeProjects([dupProj, ...projects]);
    setProjects(updatedProjects);
    setActiveProjectId(dupProj.id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const remaining = projects.filter((p) => p.id !== projectId);
    const updatedProjects = sanitizeProjects(remaining);

    setProjects(updatedProjects);

    if (activeProjectId === projectId) {
      const nextActive = updatedProjects[0];
      if (nextActive && nextActive.id) {
        setActiveProjectId(nextActive.id);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (e) {
      console.error(e);
    }
  };

  // Load Preset Circuit onto Canvas
  const handleLoadPreset = (preset: CircuitPreset) => {
    updateCircuitState(preset.components, preset.wires);
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    setComponents([]);
    setWires([]);
    setWaveformHistory([]);
  };

  // Apply combination from Truth Table row click
  const handleApplyInputCombination = (inputStates: { [label: string]: boolean }) => {
    const updated = components.map((c, i) => {
      if (c.type === 'INPUT' || c.type === 'CLOCK') {
        const label = c.label || `Input ${i + 1}`;
        if (label in inputStates) {
          const val = inputStates[label];
          return {
            ...c,
            state: val,
            outputs: c.outputs.map((p) => ({ ...p, value: val })),
          };
        }
      }
      return c;
    });
    updateCircuitState(updated, wires);
  };

  // LGL Project Toast & Error Modal Notifications
  const [lglToast, setLglToast] = useState<{ message: string; filename?: string } | null>(null);
  const [importErrorModal, setImportErrorModal] = useState<{ open: boolean; reasons: string[]; fileName?: string } | null>(null);
  const [isDraggingLGLFile, setIsDraggingLGLFile] = useState(false);

  const showLGLToast = (message: string, filename?: string) => {
    setLglToast({ message, filename });
    setTimeout(() => {
      setLglToast((current) => (current?.filename === filename ? null : current));
    }, 4500);
  };

  // Process and import an .lgl file
  const processImportLGLFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      const parseResult = parseAndValidateLGL(fileContent);

      if (!parseResult.valid) {
        setImportErrorModal({
          open: true,
          reasons: parseResult.report.errors,
          fileName: file.name,
        });
        return;
      }

      const { project: importedProject, components: importedComps, wires: importedWires } = parseResult;

      if (importedProject && importedComps && importedWires) {
        let cleanName = (importedProject.name || file.name)
          .replace(/\.lgl$/i, '')
          .replace(/\.json$/i, '')
          .replace(/\.circuit$/i, '')
          .replace(/\.logic$/i, '')
          .replace(/\.project$/i, '')
          .trim() || 'Imported Circuit';

        const newProjId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        const newProj: UserProject = {
          id: newProjId,
          name: cleanName,
          description: importedProject.description,
          createdAt: importedProject.createdAt || Date.now(),
          updatedAt: Date.now(),
          components: importedComps,
          wires: importedWires,
        };

        const { components: propagatedComps, wires: propagatedWires } = propagateCircuitLogic(
          importedComps,
          importedWires
        );

        setProjects((prevProjects) => {
          const updatedProjects = sanitizeProjects([newProj, ...prevProjects]);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
          } catch (err) {
            console.error(err);
          }
          return updatedProjects;
        });

        setActiveProjectId(newProjId);
        setComponents(propagatedComps);
        setWires(propagatedWires);
        resetHistory({ components: propagatedComps, wires: propagatedWires });

        showLGLToast('Project imported successfully', `${cleanName}.lgl`);
      }
    };
    reader.readAsText(file);
  }, [resetHistory]);

  // Window drag-and-drop listener for .lgl project files
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
        setIsDraggingLGLFile(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        setIsDraggingLGLFile(false);
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        e.preventDefault();
        setIsDraggingLGLFile(false);
        const file = e.dataTransfer.files[0];
        if (file) {
          processImportLGLFile(file);
        }
      }
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [processImportLGLFile]);

  // Export .lgl with visual confirmation toast
  const handleExportLGL = useCallback(() => {
    const proj = activeProject || { id: activeProjectId, name: 'logic_circuit' };
    downloadLGLProject(proj, components, wires, { clockRunning });
    let cleanName = (proj.name || 'logic_circuit')
      .replace(/\.lgl$/i, '')
      .replace(/\.json$/i, '')
      .replace(/\.circuit$/i, '')
      .replace(/\.logic$/i, '')
      .trim();
    if (!cleanName) cleanName = 'logic_circuit';
    showLGLToast('Project exported', `${cleanName}.lgl`);
  }, [activeProject, activeProjectId, components, wires, clockRunning]);

  // Import LogicGate Lab (.lgl) Project from file input
  const handleImportLGL = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processImportLGLFile(file);
    e.target.value = '';
  };

  // Compute live truth table
  const currentTruthTable = generateCircuitTruthTable(components, wires);

  // Compute signal labels for Waveform Analyzer (Includes ALL components & intermediate logic gates)
  const activeSignals = components.flatMap((c) => {
    let category: 'input' | 'clock' | 'gate' | 'output' = 'gate';
    if (c.type === 'INPUT' || c.type === 'HIGH' || c.type === 'LOW') category = 'input';
    else if (c.type === 'CLOCK') category = 'clock';
    else if (c.type === 'OUTPUT' || c.type === 'HEX_OUTPUT' || c.type === 'SEVEN_SEGMENT') category = 'output';

    let displayLabel = c.label;
    if (!displayLabel || displayLabel === c.type) {
      displayLabel = c.type;
    }

    if (c.outputs && c.outputs.length > 1) {
      return c.outputs.map((p, idx) => ({
        id: `${c.id}_p_${idx}`,
        compId: c.id,
        type: c.type,
        category,
        label: `${displayLabel} (${p.name || 'Out ' + (idx + 1)})`,
      }));
    }

    return [{
      id: c.id,
      compId: c.id,
      type: c.type,
      category,
      label: displayLabel,
    }];
  });

  // Sort logically for textbook ordering: Clocks -> Inputs -> Intermediate Gates -> Outputs
  activeSignals.sort((a, b) => {
    const order = { clock: 0, input: 1, gate: 2, output: 3 };
    return order[a.category] - order[b.category];
  });

  const handleDeleteSelected = () => {
    const selectedCompIds = new Set(components.filter((c) => c.selected).map((c) => c.id));
    const selectedWireIds = new Set(wires.filter((w) => w.selected).map((w) => w.id));

    if (selectedCompIds.size === 0 && selectedWireIds.size === 0) return;

    const remainingComps = components.filter((c) => !c.selected);
    const remainingWires = wires.filter((w) => {
      if (w.selected) return false;
      return !selectedCompIds.has(w.fromComponentId) && !selectedCompIds.has(w.toComponentId);
    });

    updateCircuitState(remainingComps, remainingWires, true);
  };

  const hasSelection = components.some((c) => c.selected) || wires.some((w) => w.selected);

  return (
    <div className="flex flex-col h-full w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 font-sans antialiased select-none fixed inset-0">
      {/* Mobile Top Header Bar */}
      {isMobile && !isFullscreen && (
        <MobileHeader
          projectName={activeProject?.name || 'Untitled Project'}
          clockRunning={clockRunning}
          toggleClock={handleToggleClock}
          onOpenDrawer={() => setIsComponentsDrawerOpen(true)}
          saveStatus={saveStatus}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Desktop Header Bar - Hidden in Fullscreen or Mobile */}
      {!isMobile && !isFullscreen && (
        <Header
          currentMode={mode}
          setMode={setMode}
          clockRunning={clockRunning}
          toggleClock={handleToggleClock}
          stepClock={handleStepClock}
          clearCanvas={handleClearCanvas}
          loadPreset={handleLoadPreset}
          showTruthTable={showTruthTable}
          setShowTruthTable={setShowTruthTable}
          showTimingDiagram={showTimingDiagram}
          setShowTimingDiagram={setShowTimingDiagram}
          onExportPNG={() => exportCanvasToPNG(svgRef.current)}
          onExportSVG={() => exportCanvasToSVG(svgRef.current)}
          onExportLGL={handleExportLGL}
          onExportCSV={() => exportTruthTableToCSV(currentTruthTable)}
          onImportLGL={handleImportLGL}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          // Project persistence props
          projects={projects}
          activeProjectId={activeProjectId}
          activeProjectName={activeProject?.name || 'Untitled Project'}
          saveStatus={saveStatus}
          onCreateProject={handleCreateProject}
          onLoadProject={handleLoadProject}
          onRenameProject={handleRenameProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          // Fullscreen
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {mode === 'builder' && (
          <>
            {/* Mobile View Switching */}
            {isMobile ? (
              <>
                {activeMobileView === 'builder' && (
                  <div className="flex-1 relative flex flex-col overflow-hidden">
                    <CircuitCanvas
                      ref={canvasRef}
                      components={components}
                      wires={wires}
                      canvasTool={canvasTool}
                      isMobile={isMobile}
                      onUpdateComponents={handleUpdateComponents}
                      onUpdateCircuit={updateCircuitState}
                      onUpdateWires={handleUpdateWires}
                      onAddComponent={handleAddComponent}
                      svgRef={svgRef}
                      isFullscreen={isFullscreen}
                      toggleFullscreen={toggleFullscreen}
                    />

                    {/* Unified Bottom Floating Controls: Canvas Toolbar besides Quick Actions Bar */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 max-w-[98vw] overflow-x-auto px-1 select-none">
                      <MobileCanvasToolbar
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onZoomIn={() => canvasRef.current?.zoomIn()}
                        onZoomOut={() => canvasRef.current?.zoomOut()}
                        onFitScreen={() => canvasRef.current?.fitToScreen()}
                        onClearCanvas={handleClearCanvas}
                        isFullscreen={isFullscreen}
                        toggleFullscreen={toggleFullscreen}
                      />

                      <MobileQuickActionsBar
                        canvasTool={canvasTool}
                        setCanvasTool={setCanvasTool}
                        hasSelection={hasSelection}
                        onDeleteSelected={handleDeleteSelected}
                        onOpenComponentsDrawer={() => setIsComponentsDrawerOpen(true)}
                      />
                    </div>
                  </div>
                )}

                {activeMobileView === 'truth' && (
                  <TruthTableView
                    truthTable={currentTruthTable}
                    components={components}
                    onApplyInputCombination={handleApplyInputCombination}
                    onExportCSV={() => exportTruthTableToCSV(currentTruthTable)}
                  />
                )}

                {activeMobileView === 'waveform' && (
                  <WaveformView
                    waveformHistory={waveformHistory}
                    signals={activeSignals}
                    onClearHistory={() => setWaveformHistory([])}
                  />
                )}
              </>
            ) : (
              /* Desktop Layout */
              <>
                {/* Draggable Component Palette Sidebar - Hidden in Fullscreen */}
                {!isFullscreen && <Palette onAddComponent={handleAddComponent} />}

                {/* Floating Top Palette Bar in Fullscreen Mode */}
                {isFullscreen && (
                  <FullscreenTopBar
                    onAddComponent={handleAddComponent}
                    clockRunning={clockRunning}
                    toggleClock={handleToggleClock}
                    stepClock={handleStepClock}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onClearCanvas={handleClearCanvas}
                    toggleFullscreen={toggleFullscreen}
                  />
                )}

                {/* Interactive Drag-and-Drop Circuit Canvas */}
                <CircuitCanvas
                  components={components}
                  wires={wires}
                  canvasTool={canvasTool}
                  isMobile={isMobile}
                  onUpdateComponents={handleUpdateComponents}
                  onUpdateCircuit={updateCircuitState}
                  onUpdateWires={handleUpdateWires}
                  onAddComponent={handleAddComponent}
                  svgRef={svgRef}
                  isFullscreen={isFullscreen}
                  toggleFullscreen={toggleFullscreen}
                />

                {/* Dynamic Truth Table Side Panel - Hidden in Fullscreen */}
                {!isFullscreen && showTruthTable && (
                  <TruthTablePanel
                    truthTable={currentTruthTable}
                    components={components}
                    onApplyInputCombination={handleApplyInputCombination}
                    onExportCSV={() => exportTruthTableToCSV(currentTruthTable)}
                    onClose={() => setShowTruthTable(false)}
                  />
                )}
              </>
            )}
          </>
        )}

        {mode === 'explorer' && <GateEncyclopedia />}

        {mode === 'challenges' && (
          <ChallengePanel
            components={components}
            wires={wires}
            onLoadChallengeCircuit={(ch) => {
              if (ch.initialCircuit) {
                updateCircuitState(ch.initialCircuit.components, ch.initialCircuit.wires);
              }
            }}
            onSwitchToBuilder={() => {
              setMode('builder');
              setActiveMobileView('builder');
            }}
          />
        )}

        {mode === 'quiz' && <IdentificationQuiz />}
      </div>

      {/* Desktop Bottom Timing Waveform Analyzer Drawer */}
      {!isMobile && mode === 'builder' && showTimingDiagram && (
        <TimingDiagram
          waveformHistory={waveformHistory}
          signals={activeSignals}
          onClearHistory={() => setWaveformHistory([])}
          onClose={() => setShowTimingDiagram(false)}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && !isFullscreen && (
        <MobileBottomNav
          activeView={activeMobileView}
          setActiveView={(v) => {
            setMode('builder');
            setActiveMobileView(v);
          }}
          onOpenComponentsDrawer={() => setIsComponentsDrawerOpen(true)}
          onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
        />
      )}

      {/* Mobile Components Slide-in Drawer */}
      {isMobile && (
        <ComponentsDrawer
          isOpen={isComponentsDrawerOpen}
          onClose={() => setIsComponentsDrawerOpen(false)}
          onAddComponent={handleAddComponent}
        />
      )}

      {/* Mobile More Bottom Sheet */}
      {isMobile && (
        <MoreBottomSheet
          isOpen={isMoreSheetOpen}
          onClose={() => setIsMoreSheetOpen(false)}
          projects={projects}
          activeProjectId={activeProjectId}
          activeProjectName={activeProject?.name || 'Untitled Project'}
          onCreateProject={handleCreateProject}
          onLoadProject={handleLoadProject}
          onExportPNG={() => exportCanvasToPNG(svgRef.current)}
          onExportSVG={() => exportCanvasToSVG(svgRef.current)}
          onExportLGL={handleExportLGL}
          onExportCSV={() => exportTruthTableToCSV(currentTruthTable)}
          onImportLGL={handleImportLGL}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          onSelectMode={(m) => {
            setMode(m);
            if (m === 'builder') setActiveMobileView('builder');
          }}
        />
      )}

      {/* Drag & Drop File Import Overlay */}
      {isDraggingLGLFile && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingLGLFile(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 border-4 border-dashed border-emerald-500 animate-in fade-in duration-150 select-none"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl border border-emerald-500/40 flex items-center justify-center mb-4 shadow-2xl animate-bounce">
            <img src="/lgl.png" alt=".lgl" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            Drop LogicGate Lab (.lgl) Project Here
          </h2>
          <p className="text-sm text-slate-300 max-w-sm text-center">
            Import circuit components, connections, and configurations into your workspace
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
            Supported Format: .lgl
          </div>
        </div>
      )}

      {/* Import Validation Failure Modal */}
      {importErrorModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Unable to import project</h3>
                <p className="text-xs text-slate-400">This .lgl file is invalid or corrupted.</p>
              </div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 my-3 max-h-40 overflow-y-auto custom-scrollbar">
              <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider mb-1">Validation Errors</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {importErrorModal.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setImportErrorModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LGL Toast Notification */}
      {lglToast && (
        <div className="fixed bottom-14 right-4 z-50 flex items-center gap-2.5 bg-slate-900/95 border border-emerald-500/50 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 select-none">
          <img src="/lgl.png" alt=".lgl" className="w-5 h-5 object-contain shrink-0" referrerPolicy="no-referrer" />
          <div>
            <p className="text-xs font-bold text-slate-100">{lglToast.message}</p>
            {lglToast.filename && <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{lglToast.filename}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
