import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CircuitComponent, Wire, GateType, Position, Port, WireStyle } from '../types';
import { GateSymbolSvg } from './GateSymbolSvg';
import { createComponentPorts } from '../utils/logicEngine';
import { ContextToolbar } from './ContextToolbar';
import { QuickAddMenu } from './QuickAddMenu';
import { MultiSelectionToolbar } from './MultiSelectionToolbar';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

interface CircuitCanvasProps {
  components: CircuitComponent[];
  wires: Wire[];
  wireStyle?: WireStyle;
  animateSignals?: boolean;
  canvasTool?: 'select' | 'pan';
  isMobile?: boolean;
  onUpdateComponents: (components: CircuitComponent[], commitHistory?: boolean) => void;
  onUpdateCircuit?: (components: CircuitComponent[], wires: Wire[], commitHistory?: boolean) => void;
  onUpdateWires: (wires: Wire[]) => void;
  onAddComponent: (type: GateType, pos?: Position) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
  onZoomChange?: (zoom: number) => void;
}

export interface CanvasControlHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
}

// Calculate port position after 0, 90, 180, 270 degree rotation
export const getRotatedPortOffset = (
  relativeX: number,
  relativeY: number,
  rotation: 0 | 90 | 180 | 270 = 0
): Position => {
  switch (rotation) {
    case 90:
      return { x: 65 - relativeY, y: relativeX - 15 };
    case 180:
      return { x: 80 - relativeX, y: 50 - relativeY };
    case 270:
      return { x: 15 + relativeY, y: 65 - relativeX };
    default:
      return { x: relativeX, y: relativeY };
  }
};

export const CircuitCanvas = React.forwardRef<CanvasControlHandle, CircuitCanvasProps>(
  (
    {
      components,
      wires,
      wireStyle = 'bezier',
      animateSignals = true,
      canvasTool = 'select',
      isMobile = false,
      onUpdateComponents,
      onUpdateCircuit,
      onUpdateWires,
      onAddComponent,
      svgRef,
      isFullscreen = false,
      toggleFullscreen,
      onZoomChange,
    },
    ref
  ) => {
    // Canvas Viewport Transformation
    const [zoom, setZoomState] = useState(1);
    const [pan, setPanState] = useState<Position>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });

    const panRef = useRef(pan);
    panRef.current = pan;
    const zoomRef = useRef(zoom);
    zoomRef.current = zoom;

    const setZoom = useCallback(
      (val: number | ((prev: number) => number)) => {
        setZoomState((prev) => {
          const next = typeof val === 'function' ? val(prev) : val;
          const clamped = Math.min(Math.max(next, 0.3), 3.0);
          if (onZoomChange) onZoomChange(clamped);
          return clamped;
        });
      },
      [onZoomChange]
    );

    const setPan = useCallback((val: Position | ((prev: Position) => Position)) => {
      setPanState(val);
    }, []);

  // Selection
  const [selectedCompIds, setSelectedCompIds] = useState<Set<string>>(new Set());
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Dragging Component State
  const [draggingCompIds, setDraggingCompIds] = useState<Set<string>>(new Set());
  const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
  const [dragInitialPositions, setDragInitialPositions] = useState<Map<string, Position>>(new Map());
  const [marqueeStart, setMarqueeStart] = useState<Position | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<Position | null>(null);

  // Wire Connection Pending State
  const [wireStart, _setWireStart] = useState<{ compId: string; portId: string; pos: Position } | null>(null);
  const wireStartRef = useRef<{ compId: string; portId: string; pos: Position } | null>(null);

  const setWireStart = (val: { compId: string; portId: string; pos: Position } | null) => {
    wireStartRef.current = val;
    _setWireStart(val);
  };

  const [mouseCanvasPos, setMouseCanvasPos] = useState<Position>({ x: 0, y: 0 });
  const [hoveredPortId, setHoveredPortId] = useState<string | null>(null);

  // Magnetic snap target port when dragging wire
  const [snapTarget, _setSnapTarget] = useState<{
    compId: string;
    portId: string;
    pos: Position;
    port: Port;
  } | null>(null);
  const snapTargetRef = useRef<{
    compId: string;
    portId: string;
    pos: Position;
    port: Port;
  } | null>(null);

  const setSnapTarget = (val: { compId: string; portId: string; pos: Position; port: Port } | null) => {
    snapTargetRef.current = val;
    _setSnapTarget(val);
  };

  // Synchronized state refs for smooth touch event tracking without stale closures
  const componentsRef = useRef(components);
  componentsRef.current = components;

  const wiresRef = useRef(wires);
  wiresRef.current = wires;

  const selectedCompIdsRef = useRef(selectedCompIds);
  selectedCompIdsRef.current = selectedCompIds;

  const draggingCompIdsRef = useRef(draggingCompIds);
  draggingCompIdsRef.current = draggingCompIds;

  const dragStartPosRef = useRef(dragStartPos);
  dragStartPosRef.current = dragStartPos;

  const dragInitialPositionsRef = useRef(dragInitialPositions);
  dragInitialPositionsRef.current = dragInitialPositions;

  const canvasToolRef = useRef(canvasTool);
  canvasToolRef.current = canvasTool;

  const isPanningRef = useRef(isPanning);
  isPanningRef.current = isPanning;

  const panStartRef = useRef(panStart);
  panStartRef.current = panStart;

  // Touch tracking state
  const touchStateRef = useRef<{
    isDraggingComp: boolean;
    hasMoved: boolean;
    startScreenPos: Position;
    draggedCompId: string | null;
    isWiring: boolean;
    wireStartPortId: string | null;
  }>({
    isDraggingComp: false,
    hasMoved: false,
    startScreenPos: { x: 0, y: 0 },
    draggedCompId: null,
    isWiring: false,
    wireStartPortId: null,
  });

  // Quick Add Spotlight Menu (double click)
  const [quickAddPos, setQuickAddPos] = useState<{ screen: Position; canvas: Position } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Convert screen pixels to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Position => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (screenX - rect.left - pan.x) / zoom,
        y: (screenY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Get absolute canvas coordinates for a port considering component position and rotation
  const getPortAbsolutePosition = useCallback(
    (compId: string, portId: string): Position => {
      const comp = components.find((c) => c.id === compId);
      if (!comp) return { x: 0, y: 0 };

      const port = comp.inputs.find((p) => p.id === portId) || comp.outputs.find((p) => p.id === portId);
      if (!port) return { x: comp.x, y: comp.y };

      const rotatedOffset = getRotatedPortOffset(port.relativeX, port.relativeY, comp.rotation || 0);

      return {
        x: comp.x + rotatedOffset.x,
        y: comp.y + rotatedOffset.y,
      };
    },
    [components]
  );

  // Get port helper
  const getPort = useCallback((compId: string, portId: string): Port | undefined => {
    const comp = componentsRef.current.find((c) => c.id === compId);
    if (!comp) return undefined;
    return comp.inputs.find((p) => p.id === portId) || comp.outputs.find((p) => p.id === portId);
  }, []);

  // Connect two ports bi-directionally
  const connectPorts = useCallback(
    (comp1Id: string, port1Id: string, comp2Id: string, port2Id: string) => {
      // Clear pending connection synchronously
      wireStartRef.current = null;
      _setWireStart(null);
      setSnapTarget(null);

      if (comp1Id === comp2Id) return;

      const comp1 = components.find((c) => c.id === comp1Id);
      const comp2 = components.find((c) => c.id === comp2Id);
      if (!comp1 || !comp2) return;

      const port1IsOutput = comp1.outputs.some((p) => p.id === port1Id);
      const port1IsInput = comp1.inputs.some((p) => p.id === port1Id);

      const port2IsOutput = comp2.outputs.some((p) => p.id === port2Id);
      const port2IsInput = comp2.inputs.some((p) => p.id === port2Id);

      let fromCompId = '';
      let fromPortId = '';
      let toCompId = '';
      let toPortId = '';

      if (port1IsOutput && port2IsInput) {
        fromCompId = comp1Id;
        fromPortId = port1Id;
        toCompId = comp2Id;
        toPortId = port2Id;
      } else if (port1IsInput && port2IsOutput) {
        fromCompId = comp2Id;
        fromPortId = port2Id;
        toCompId = comp1Id;
        toPortId = port1Id;
      } else {
        // Input-Input or Output-Output: invalid connection
        return;
      }

      // Replace existing wire connected to target input port if any
      const filteredWires = wires.filter((w) => !(w.toCompId === toCompId && w.toPortId === toPortId));

      const newWire: Wire = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fromCompId,
        fromPortId,
        toCompId,
        toPortId,
      };

      if (onUpdateCircuit) {
        onUpdateCircuit(components, [...filteredWires, newWire], true);
      } else {
        onUpdateWires([...filteredWires, newWire]);
      }
    },
    [components, wires, onUpdateCircuit, onUpdateWires]
  );

  // Handle Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setMouseCanvasPos(canvasPos);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingCompIds.size > 0 && dragStartPos) {
      const gridSnap = 10;
      const dx = canvasPos.x - dragStartPos.x;
      const dy = canvasPos.y - dragStartPos.y;

      const updated = components.map((c) => {
        if (draggingCompIds.has(c.id)) {
          const initial = dragInitialPositions.get(c.id);
          if (initial) {
            return {
              ...c,
              x: Math.round((initial.x + dx) / gridSnap) * gridSnap,
              y: Math.round((initial.y + dy) / gridSnap) * gridSnap,
            };
          }
        }
        return c;
      });
      onUpdateComponents(updated, false); // false = don't commit history while dragging
    } else if (marqueeStart) {
      setMarqueeCurrent(canvasPos);
    }

    // Handle Magnetic Snap when drawing wire
    const activeWireStart = wireStartRef.current;
    if (activeWireStart) {
      const startComp = components.find((c) => c.id === activeWireStart.compId);
      const isStartOutput = startComp?.outputs.some((p) => p.id === activeWireStart.portId);

      let closest: { compId: string; portId: string; pos: Position; port: Port } | null = null;
      let minDistance = 35; // Generous 35px magnetic snap radius

      for (const comp of components) {
        if (comp.id === activeWireStart.compId) continue; // Don't snap to same component

        // Only snap to COMPATIBLE ports (Output -> Input, Input -> Output)
        const candidatePorts = isStartOutput ? comp.inputs : comp.outputs;

        for (const p of candidatePorts) {
          const pPos = getPortAbsolutePosition(comp.id, p.id);
          const dist = Math.hypot(canvasPos.x - pPos.x, canvasPos.y - pPos.y);

          if (dist < minDistance) {
            minDistance = dist;
            closest = { compId: comp.id, portId: p.id, pos: pPos, port: p };
          }
        }
      }

      setSnapTarget(closest);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    
    if (draggingCompIds.size > 0) {
      // Commit history on drag end
      onUpdateComponents(components, true);
    }
    setDraggingCompIds(new Set());
    setDragStartPos(null);
    setDragInitialPositions(new Map());

    if (marqueeStart && marqueeCurrent) {
      const minX = Math.min(marqueeStart.x, marqueeCurrent.x);
      const maxX = Math.max(marqueeStart.x, marqueeCurrent.x);
      const minY = Math.min(marqueeStart.y, marqueeCurrent.y);
      const maxY = Math.max(marqueeStart.y, marqueeCurrent.y);

      const nextSelected = new Set(selectedCompIds);
      components.forEach((c) => {
        // Approximate bounding box of a component
        const compLeft = c.x;
        const compRight = c.x + 80;
        const compTop = c.y;
        const compBottom = c.y + 50;

        if (compLeft < maxX && compRight > minX && compTop < maxY && compBottom > minY) {
          nextSelected.add(c.id);
        }
      });
      setSelectedCompIds(nextSelected);
    }
    setMarqueeStart(null);
    setMarqueeCurrent(null);

    // If releasing wire over snap target
    const activeWireStart = wireStartRef.current;
    if (activeWireStart && snapTarget) {
      connectPorts(activeWireStart.compId, activeWireStart.portId, snapTarget.compId, snapTarget.portId);
    } else if (activeWireStart) {
      setWireStart(null);
      setSnapTarget(null);
    }
  };

  // Drag & Drop from Palette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('gateType') as GateType;
    if (gateType) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      onAddComponent(gateType, pos);
    }
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (canvasTool === 'pan' || e.button === 1 || (e.button === 0 && e.shiftKey && !e.ctrlKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 0) {
      if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'grid-rect') {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          setSelectedCompIds(new Set());
        }
        setSelectedWireId(null);
        setWireStart(null);
        setSnapTarget(null);
        setQuickAddPos(null);
        
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setMarqueeStart(canvasPos);
        setMarqueeCurrent(canvasPos);
      }
    }
  };

  // Double Click Canvas Spotlight Menu
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'grid-rect') {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setQuickAddPos({
        screen: { x: e.clientX, y: e.clientY },
        canvas: canvasPos,
      });
    }
  };

  // Component Drag Start
  const handleCompMouseDown = (e: React.MouseEvent, comp: CircuitComponent) => {
    e.stopPropagation();
    setSelectedWireId(null);
    setQuickAddPos(null);

    let nextSelected = new Set(selectedCompIds);
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (nextSelected.has(comp.id)) nextSelected.delete(comp.id);
      else nextSelected.add(comp.id);
    } else {
      if (!nextSelected.has(comp.id)) {
        nextSelected.clear();
        nextSelected.add(comp.id);
      }
    }
    setSelectedCompIds(nextSelected);

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDragStartPos(canvasPos);
    setDraggingCompIds(nextSelected);
    
    const initials = new Map<string, Position>();
    components.forEach(c => {
      if (nextSelected.has(c.id)) {
        initials.set(c.id, { x: c.x, y: c.y });
      }
    });
    setDragInitialPositions(initials);
  };

  // Component Touch Drag Start
  const handleCompTouchStart = (e: React.TouchEvent, comp: CircuitComponent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    setSelectedWireId(null);
    setQuickAddPos(null);

    let nextSelected = new Set(selectedCompIdsRef.current);
    if (!nextSelected.has(comp.id)) {
      nextSelected.clear();
      nextSelected.add(comp.id);
    }
    setSelectedCompIds(nextSelected);

    const canvasPos = screenToCanvas(t.clientX, t.clientY);
    setDragStartPos(canvasPos);
    setDraggingCompIds(nextSelected);

    const initials = new Map<string, Position>();
    componentsRef.current.forEach((c) => {
      if (nextSelected.has(c.id)) {
        initials.set(c.id, { x: c.x, y: c.y });
      }
    });
    setDragInitialPositions(initials);

    touchStateRef.current = {
      isDraggingComp: true,
      hasMoved: false,
      startScreenPos: { x: t.clientX, y: t.clientY },
      draggedCompId: comp.id,
      isWiring: false,
      wireStartPortId: null,
    };
  };

  // Component Actions
  const handleRotateComponent = (compId?: string) => {
    const idsToRotate = compId ? new Set([compId]) : selectedCompIds;
    if (idsToRotate.size === 0) return;
    
    const updated = components.map((c) => {
      if (idsToRotate.has(c.id)) {
        const nextRotation = (((c.rotation || 0) + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...c, rotation: nextRotation };
      }
      return c;
    });
    onUpdateComponents(updated, true);
  };

  const handleDuplicateComponent = () => {
    if (selectedCompIds.size === 0) return;
    
    const newIds = new Set<string>();
    const clonedComps: CircuitComponent[] = [];
    
    components.forEach((c) => {
      if (selectedCompIds.has(c.id)) {
        const newId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        newIds.add(newId);
        clonedComps.push({
          ...c,
          id: newId,
          x: c.x + 20,
          y: c.y + 20,
          inputs: c.inputs.map((p) => ({ ...p, id: `port-${Math.random().toString(36).substr(2, 6)}` })),
          outputs: c.outputs.map((p) => ({ ...p, id: `port-${Math.random().toString(36).substr(2, 6)}` })),
        });
      }
    });

    onUpdateComponents([...components, ...clonedComps], true);
    setSelectedCompIds(newIds);
  };

  const handleChangeInputCount = (compId: string, count: number) => {
    const updated = components.map((c) => {
      if (c.id === compId) {
        const ports = createComponentPorts(c.type, c.id, count);
        return {
          ...c,
          inputCount: count,
          inputs: ports.inputs,
          outputs: ports.outputs,
        };
      }
      return c;
    });

    const validComp = updated.find((c) => c.id === compId);
    const validPortIds = new Set([
      ...(validComp?.inputs.map((p) => p.id) || []),
      ...(validComp?.outputs.map((p) => p.id) || []),
    ]);

    const updatedWires = wires.filter(
      (w) =>
        (w.fromCompId !== compId || validPortIds.has(w.fromPortId)) &&
        (w.toCompId !== compId || validPortIds.has(w.toPortId))
    );

    if (onUpdateCircuit) {
      onUpdateCircuit(updated, updatedWires, true);
    } else {
      onUpdateComponents(updated, true);
      onUpdateWires(updatedWires);
    }
  };

  const handleChangeColor = (compId: string, color: string) => {
    onUpdateComponents(components.map((c) => (c.id === compId ? { ...c, color } : c)), true);
  };

  const handleChangeLabel = (compId: string, label: string) => {
    onUpdateComponents(components.map((c) => (c.id === compId ? { ...c, label } : c)), true);
  };

  const handleDeleteComp = (compId?: string) => {
    const idsToDelete = compId ? new Set([compId]) : selectedCompIds;
    const filteredComps = components.filter((c) => !idsToDelete.has(c.id));
    const filteredWires = wires.filter((w) => !idsToDelete.has(w.fromCompId) && !idsToDelete.has(w.toCompId));

    if (onUpdateCircuit) {
      onUpdateCircuit(filteredComps, filteredWires, true);
    } else {
      onUpdateComponents(filteredComps, true);
      onUpdateWires(filteredWires);
    }

    setSelectedCompIds(new Set());
  };

  // Alignment and Batch Handlers for Universal Multi-Selection
  const handleAlignLeft = () => {
    if (selectedCompIds.size < 2) return;
    const selectedComps = components.filter((c) => selectedCompIds.has(c.id));
    if (selectedComps.length < 2) return;
    const minX = Math.min(...selectedComps.map((c) => c.x));
    const updated = components.map((c) => (selectedCompIds.has(c.id) ? { ...c, x: minX } : c));
    onUpdateComponents(updated, true);
  };

  const handleAlignTop = () => {
    if (selectedCompIds.size < 2) return;
    const selectedComps = components.filter((c) => selectedCompIds.has(c.id));
    if (selectedComps.length < 2) return;
    const minY = Math.min(...selectedComps.map((c) => c.y));
    const updated = components.map((c) => (selectedCompIds.has(c.id) ? { ...c, y: minY } : c));
    onUpdateComponents(updated, true);
  };

  const handleAlignCenter = () => {
    if (selectedCompIds.size < 2) return;
    const selectedComps = components.filter((c) => selectedCompIds.has(c.id));
    if (selectedComps.length < 2) return;
    const avgY = Math.round(selectedComps.reduce((acc, c) => acc + c.y, 0) / selectedComps.length);
    const updated = components.map((c) => (selectedCompIds.has(c.id) ? { ...c, y: avgY } : c));
    onUpdateComponents(updated, true);
  };

  const handleBatchColor = (color: string) => {
    if (selectedCompIds.size === 0) return;
    const updated = components.map((c) => (selectedCompIds.has(c.id) ? { ...c, color } : c));
    onUpdateComponents(updated, true);
  };

  const handleBatchToggleInputs = () => {
    if (selectedCompIds.size === 0) return;
    const updated = components.map((c) => {
      if (selectedCompIds.has(c.id) && c.type === 'INPUT') {
        const nextState = !c.state;
        return {
          ...c,
          state: nextState,
          outputs: c.outputs.map((p) => ({ ...p, value: nextState })),
        };
      }
      return c;
    });
    onUpdateComponents(updated, true);
  };

  

  // Toggle Input Switch State
  const handleInputToggle = (e: React.MouseEvent, comp: CircuitComponent) => {
    e.stopPropagation();
    if (comp.type === 'INPUT') {
      const nextState = !comp.state;
      const updated = components.map((c) => {
        if (c.id === comp.id) {
          return {
            ...c,
            state: nextState,
            outputs: c.outputs.map((p) => ({ ...p, value: nextState })),
          };
        }
        return c;
      });
      onUpdateComponents(updated, true);
    }
  };

  // Handle Port Mouse Down
  const handlePortMouseDown = (e: React.MouseEvent, compId: string, port: Port) => {
    e.stopPropagation();
    e.preventDefault();

    const activeWireStart = wireStartRef.current;
    if (!activeWireStart) {
      const portPos = getPortAbsolutePosition(compId, port.id);
      setWireStart({ compId, portId: port.id, pos: portPos });
    } else if (activeWireStart.compId !== compId || activeWireStart.portId !== port.id) {
      connectPorts(activeWireStart.compId, activeWireStart.portId, compId, port.id);
    }
  };

  // Handle Port Mouse Up
  const handlePortMouseUp = (e: React.MouseEvent, compId: string, port: Port) => {
    e.stopPropagation();
    const activeWireStart = wireStartRef.current;
    if (activeWireStart && (activeWireStart.compId !== compId || activeWireStart.portId !== port.id)) {
      connectPorts(activeWireStart.compId, activeWireStart.portId, compId, port.id);
    }
  };

  // Handle Port Touch Start
  const handlePortTouchStart = (e: React.TouchEvent, compId: string, port: Port) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const t = e.touches[0];

    const activeWireStart = wireStartRef.current;
    if (!activeWireStart) {
      const portPos = getPortAbsolutePosition(compId, port.id);
      setWireStart({ compId, portId: port.id, pos: portPos });
      touchStateRef.current = {
        isDraggingComp: false,
        hasMoved: false,
        startScreenPos: { x: t.clientX, y: t.clientY },
        draggedCompId: null,
        isWiring: true,
        wireStartPortId: port.id,
      };
    } else if (activeWireStart.compId !== compId || activeWireStart.portId !== port.id) {
      connectPorts(activeWireStart.compId, activeWireStart.portId, compId, port.id);
    }
  };

  // Handle Port Touch End
  const handlePortTouchEnd = (e: React.TouchEvent, compId: string, port: Port) => {
    e.stopPropagation();
    const activeWireStart = wireStartRef.current;
    if (activeWireStart && (activeWireStart.compId !== compId || activeWireStart.portId !== port.id)) {
      connectPorts(activeWireStart.compId, activeWireStart.portId, compId, port.id);
    }
  };

  // Fit Circuit to Screen Bounding Box
  const fitToScreen = useCallback(() => {
    if (components.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 360;
    const height = rect.height || window.innerHeight || 600;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    components.forEach((c) => {
      const left = c.x - 10;
      const top = c.y - 15;
      const right = c.x + (c.width || 80) + 35; // Account for output pin & label
      const bottom = c.y + (c.height || 50) + 20;

      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    });

    const paddingX = isMobile ? 40 : 60;
    const paddingY = isMobile ? 64 : 60;
    const contentWidth = Math.max(maxX - minX, 80) + paddingX * 2;
    const contentHeight = Math.max(maxY - minY, 80) + paddingY * 2;

    const scaleX = width / contentWidth;
    const scaleY = height / contentHeight;
    let targetZoom = Math.min(scaleX, scaleY);

    const maxZoomCap = isMobile ? 0.95 : 1.5;
    const minZoomFloor = 0.15;
    targetZoom = Math.min(Math.max(targetZoom, minZoomFloor), maxZoomCap);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const panX = width / 2 - centerX * targetZoom;
    const panY = height / 2 - centerY * targetZoom;

    setZoom(targetZoom);
    setPan({ x: panX, y: panY });
  }, [components, isMobile, setZoom, setPan]);

  React.useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => setZoom((z) => Math.min(z + 0.15, 2.5)),
      zoomOut: () => setZoom((z) => Math.max(z - 0.15, 0.4)),
      fitToScreen,
    }),
    [setZoom, fitToScreen]
  );

  // Auto-fit circuit on container resize or initial load on mobile
  const initialFitDoneRef = useRef(false);
  useEffect(() => {
    if (!isMobile) return;
    const container = containerRef.current;
    if (!container) return;

    // Do initial fit if components are available
    if (!initialFitDoneRef.current && components.length > 0) {
      initialFitDoneRef.current = true;
      const timer = setTimeout(() => fitToScreen(), 60);
      return () => clearTimeout(timer);
    }

    let resizeTimer: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        fitToScreen();
      }, 100);
    });

    observer.observe(container);
    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [isMobile, components.length, fitToScreen]);

  // Touch & Wheel Event Listeners for Pinch-Zoom, Smooth Dragging & Two-Finger Pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDist = 0;
    let initialZoom = 1;
    let initialCanvasMid = { x: 0, y: 0 };
    let isTwoFingerGesture = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isTwoFingerGesture = true;

        // Cancel component drag / wiring on 2-finger zoom/pan
        touchStateRef.current = {
          isDraggingComp: false,
          hasMoved: false,
          startScreenPos: { x: 0, y: 0 },
          draggedCompId: null,
          isWiring: false,
          wireStartPortId: null,
        };
        setDraggingCompIds(new Set());
        setDragStartPos(null);
        setWireStart(null);
        setSnapTarget(null);
        setIsPanning(false);

        const t1 = e.touches[0];
        const t2 = e.touches[1];

        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        const rect = container.getBoundingClientRect();
        const midRelX = midX - rect.left;
        const midRelY = midY - rect.top;

        // Point on canvas under two-finger midpoint
        const canvasX = (midRelX - panRef.current.x) / zoomRef.current;
        const canvasY = (midRelY - panRef.current.y) / zoomRef.current;

        initialDist = dist;
        initialZoom = zoomRef.current;
        initialCanvasMid = { x: canvasX, y: canvasY };
        return;
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];
        // If not initiated by comp or port touchStart
        if (!touchStateRef.current.isDraggingComp && !touchStateRef.current.isWiring) {
          setIsPanning(true);
          const startPan = { x: t.clientX - panRef.current.x, y: t.clientY - panRef.current.y };
          setPanStart(startPan);
          panStartRef.current = startPan;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isTwoFingerGesture) {
        e.preventDefault();

        const t1 = e.touches[0];
        const t2 = e.touches[1];

        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        if (initialDist > 0) {
          const scale = dist / initialDist;
          const newZoom = Math.min(Math.max(initialZoom * scale, 0.3), 3.0);

          const rect = container.getBoundingClientRect();
          const currentMidRelX = midX - rect.left;
          const currentMidRelY = midY - rect.top;

          const newPanX = currentMidRelX - initialCanvasMid.x * newZoom;
          const newPanY = currentMidRelY - initialCanvasMid.y * newZoom;

          setZoom(newZoom);
          setPan({ x: newPanX, y: newPanY });
        }
        return;
      }

      if (e.touches.length === 1 && !isTwoFingerGesture) {
        const t = e.touches[0];
        const rect = container.getBoundingClientRect();
        const canvasPos = {
          x: (t.clientX - rect.left - panRef.current.x) / zoomRef.current,
          y: (t.clientY - rect.top - panRef.current.y) / zoomRef.current,
        };
        setMouseCanvasPos(canvasPos);

        // Case A: Dragging component(s)
        if (touchStateRef.current.isDraggingComp && dragStartPosRef.current && draggingCompIdsRef.current.size > 0) {
          e.preventDefault();
          const screenDx = Math.abs(t.clientX - touchStateRef.current.startScreenPos.x);
          const screenDy = Math.abs(t.clientY - touchStateRef.current.startScreenPos.y);
          if (screenDx > 3 || screenDy > 3) {
            touchStateRef.current.hasMoved = true;
          }

          const dx = canvasPos.x - dragStartPosRef.current.x;
          const dy = canvasPos.y - dragStartPosRef.current.y;

          const updated = componentsRef.current.map((comp) => {
            if (draggingCompIdsRef.current.has(comp.id)) {
              const initPos = dragInitialPositionsRef.current.get(comp.id) || { x: comp.x, y: comp.y };
              const rawX = initPos.x + dx;
              const rawY = initPos.y + dy;
              return {
                ...comp,
                x: Math.round(rawX / 10) * 10,
                y: Math.round(rawY / 10) * 10,
              };
            }
            return comp;
          });
          onUpdateComponents(updated, false);
          return;
        }

        // Case B: Dragging Wire Connection
        const activeWire = wireStartRef.current;
        if (activeWire || touchStateRef.current.isWiring) {
          e.preventDefault();
          // Find magnetic snap candidate port within 45px
          let closestCandidate: {
            compId: string;
            portId: string;
            pos: Position;
            port: Port;
          } | null = null;
          let minCandidateDist = 45;

          const sourcePort = activeWire ? getPort(activeWire.compId, activeWire.portId) : null;
          const isSourceInput = sourcePort?.direction === 'input';

          componentsRef.current.forEach((comp) => {
            if (activeWire && comp.id === activeWire.compId) return;
            const portsToCheck = isSourceInput ? comp.outputs : comp.inputs;
            portsToCheck.forEach((port) => {
              const pPos = getPortAbsolutePosition(comp.id, port.id);
              const d = Math.hypot(pPos.x - canvasPos.x, pPos.y - canvasPos.y);
              if (d < minCandidateDist) {
                minCandidateDist = d;
                closestCandidate = { compId: comp.id, portId: port.id, pos: pPos, port };
              }
            });
          });

          setSnapTarget(closestCandidate);
          return;
        }

        // Case C: Panning Canvas
        if (isPanningRef.current) {
          e.preventDefault();
          setPan({
            x: t.clientX - panStartRef.current.x,
            y: t.clientY - panStartRef.current.y,
          });
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isTwoFingerGesture = false;
        initialDist = 0;
      }

      if (e.touches.length === 0) {
        // Component Drag Finished
        if (touchStateRef.current.isDraggingComp) {
          if (touchStateRef.current.hasMoved) {
            // Commit final position to history
            onUpdateComponents(componentsRef.current, true);
          } else if (touchStateRef.current.draggedCompId) {
            // Single tap on component without moving -> Toggle if INPUT
            const targetComp = componentsRef.current.find((c) => c.id === touchStateRef.current.draggedCompId);
            if (targetComp && targetComp.type === 'INPUT') {
              const nextState = !targetComp.state;
              const updated = componentsRef.current.map((c) => {
                if (c.id === targetComp.id) {
                  return {
                    ...c,
                    state: nextState,
                    outputs: c.outputs.map((p) => ({ ...p, value: nextState })),
                  };
                }
                return c;
              });
              onUpdateComponents(updated, true);
            }
          }
          setDraggingCompIds(new Set());
          setDragStartPos(null);
        }

        // Wire Drag Finished
        const activeWire = wireStartRef.current;
        const currentSnap = snapTargetRef.current;
        if (activeWire && currentSnap) {
          connectPorts(activeWire.compId, activeWire.portId, currentSnap.compId, currentSnap.portId);
        }

        touchStateRef.current = {
          isDraggingComp: false,
          hasMoved: false,
          startScreenPos: { x: 0, y: 0 },
          draggedCompId: null,
          isWiring: false,
          wireStartPortId: null,
        };

        setIsPanning(false);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseRelX = e.clientX - rect.left;
      const mouseRelY = e.clientY - rect.top;

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      const canvasX = (mouseRelX - currentPan.x) / currentZoom;
      const canvasY = (mouseRelY - currentPan.y) / currentZoom;

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.3), 3.0);

      const newPanX = mouseRelX - canvasX * newZoom;
      const newPanY = mouseRelY - canvasY * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [setZoom, setPan, onUpdateComponents, connectPorts, getPort, getPortAbsolutePosition]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCompIds.size > 0) {
          handleDeleteComp();
        } else if (selectedWireId) {
          const filtered = wires.filter((w) => w.id !== selectedWireId);
          if (onUpdateCircuit) {
            onUpdateCircuit(components, filtered, true);
          } else {
            onUpdateWires(filtered);
          }
          setSelectedWireId(null);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedCompIds.size > 0) {
          handleDuplicateComponent();
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (selectedCompIds.size > 0) {
          handleRotateComponent();
        }
      } else if (e.key === 'Escape') {
        setWireStart(null);
        setSnapTarget(null);
        setSelectedCompIds(new Set());
        setSelectedWireId(null);
        setQuickAddPos(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCompIds, selectedWireId, components, wires]);

  // Build Wire SVG Path Data
  const buildWirePath = (start: Position, end: Position): string => {
    if (wireStyle === 'straight') {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    if (wireStyle === 'orthogonal') {
      const midX = (start.x + end.x) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }

    // Bezier
    const dx = Math.abs(end.x - start.x) * 0.5;
    return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
  };

  // Get the first selected component for the toolbar context menu
  const selectedComp = selectedCompIds.size === 1 ? components.find((c) => selectedCompIds.has(c.id)) : null;

  // Render individual Port
  const renderPort = (port: Port, comp: CircuitComponent) => {
    const pos = getRotatedPortOffset(port.relativeX, port.relativeY, comp.rotation || 0);
    const isHovered = hoveredPortId === port.id || snapTarget?.portId === port.id;
    const isConnecting = !!wireStart;
    const isSelf = wireStart?.compId === comp.id && wireStart?.portId === port.id;

    return (
      <g
        key={port.id}
        transform={`translate(${pos.x}, ${pos.y})`}
        onMouseEnter={() => setHoveredPortId(port.id)}
        onMouseLeave={() => setHoveredPortId(null)}
        onMouseDown={(e) => handlePortMouseDown(e, comp.id, port)}
        onMouseUp={(e) => handlePortMouseUp(e, comp.id, port)}
        onTouchStart={(e) => handlePortTouchStart(e, comp.id, port)}
        onTouchEnd={(e) => handlePortTouchEnd(e, comp.id, port)}
        className="cursor-pointer"
      >
        {/* Large invisible hit area for easy touch/mouse targets */}
        <circle r={isMobile ? 18 : 14} fill="transparent" />

        {/* Magnetic Target Pulse Ring */}
        {isConnecting && !isSelf && (
          <circle
            r="10"
            fill="none"
            stroke={isHovered ? '#22c55e' : '#eab308'}
            strokeWidth="2"
            strokeDasharray="3 2"
            className="animate-spin opacity-90"
          />
        )}

        {/* Visible Port Circle */}
        <circle
          r={isHovered ? '7' : '5'}
          fill={port.value ? '#22c55e' : '#1e293b'}
          stroke={isSelf ? '#f59e0b' : port.value ? '#86efac' : isHovered ? '#38bdf8' : '#64748b'}
          strokeWidth="2.5"
          className="transition-all duration-100"
        />
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={handleCanvasDoubleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex-1 bg-[#0b1329] overflow-hidden select-none touch-none ${
        isPanning ? 'cursor-grabbing' : canvasTool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'
      }`}
    >
      {/* Single Unified Floating Toolbar at Top Center */}
      {selectedCompIds.size >= 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
          <MultiSelectionToolbar
            selectedCount={selectedCompIds.size}
            singleComponent={selectedComp}
            onDelete={() => handleDeleteComp()}
            onDuplicate={() => handleDuplicateComponent()}
            onRotate={() => handleRotateComponent()}
            onAlignLeft={handleAlignLeft}
            onAlignTop={handleAlignTop}
            onAlignCenter={handleAlignCenter}
            onChangeColor={handleBatchColor}
            onToggleInputs={handleBatchToggleInputs}
            hasInputsSelected={components.some((c) => selectedCompIds.has(c.id) && c.type === 'INPUT')}
            onClearSelection={() => setSelectedCompIds(new Set())}
            onChangeLabel={(lbl) => selectedComp && handleChangeLabel(selectedComp.id, lbl)}
            onChangeInputCount={(cnt) => selectedComp && handleChangeInputCount(selectedComp.id, cnt)}
          />
        </div>
      )}

      {/* Double Click Spotlight Quick Add Menu */}
      {quickAddPos && (
        <QuickAddMenu
          position={quickAddPos.screen}
          onAdd={(type) => onAddComponent(type, quickAddPos.canvas)}
          onClose={() => setQuickAddPos(null)}
        />
      )}

      {/* Viewport Zoom Controls (Desktop Only) */}
      {!isMobile && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1 shadow-xl text-slate-300">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
            title="Zoom In"
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
            title="Zoom Out"
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (toggleFullscreen) {
                toggleFullscreen();
              } else {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }
            }}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Editor'}
            className={`p-2 rounded-lg transition ${
              isFullscreen ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-slate-800'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* SVG Canvas Workspace */}
      <svg
        ref={svgRef}
        className="w-full h-full block"
      >
        <defs>
          <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#1e293b" />
          </pattern>
        </defs>

        {/* Transformed Workspace Layer */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          <rect id="grid-rect" width="20000" height="20000" x="-10000" y="-10000" fill="url(#dot-grid)" />

          {/* Marquee Selection Box */}
          {marqueeStart && marqueeCurrent && (
            <rect
              x={Math.min(marqueeStart.x, marqueeCurrent.x)}
              y={Math.min(marqueeStart.y, marqueeCurrent.y)}
              width={Math.abs(marqueeCurrent.x - marqueeStart.x)}
              height={Math.abs(marqueeCurrent.y - marqueeStart.y)}
              fill="rgba(56, 189, 248, 0.1)"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}
        
        {/* 1. Render Wires */}
        {wires.map((wire) => {
          const start = getPortAbsolutePosition(wire.fromCompId, wire.fromPortId);
          const end = getPortAbsolutePosition(wire.toCompId, wire.toPortId);
          const isSelected = selectedWireId === wire.id;
          const isSignalActive = wire.color === '#22c55e';

          const pathData = buildWirePath(start, end);

          return (
            <g
              key={wire.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWireId(wire.id);
                setSelectedCompIds(new Set());
              }}
            >
              {/* Wide Hitbox */}
              <path d={pathData} fill="none" stroke="transparent" strokeWidth="16" className="cursor-pointer" />

              {/* Wire Ambient Glow */}
              <path
                d={pathData}
                fill="none"
                stroke={isSignalActive ? '#22c55e' : '#475569'}
                strokeWidth={isSelected ? '6' : '3.5'}
                opacity={isSignalActive ? '0.35' : '0.1'}
                filter="blur(3px)"
              />

              {/* Main Wire Line */}
              <path
                d={pathData}
                fill="none"
                stroke={isSelected ? '#38bdf8' : isSignalActive ? '#22c55e' : '#64748b'}
                strokeWidth={isSelected ? '3.5' : '2.5'}
                strokeDasharray={isSelected ? '6 3' : undefined}
                className="transition-colors duration-150"
              />

              {/* Glowing Signal Flow Particle Animation */}
              {isSignalActive && animateSignals && (
                <circle r="3.5" fill="#86efac" filter="drop-shadow(0px 0px 4px #22c55e)">
                  <animateMotion path={pathData} dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* Wire Pending Connection Guide */}
        {wireStart && (
          <path
            d={buildWirePath(wireStart.pos, snapTarget ? snapTarget.pos : mouseCanvasPos)}
            fill="none"
            stroke={snapTarget ? '#22c55e' : '#eab308'}
            strokeWidth="3"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
        )}

        {/* 2. Render Circuit Components */}
        {components.map((comp) => {
          const isSelected = selectedCompIds.has(comp.id);
          const compColor = comp.color || '#38bdf8';

          return (
            <g
              key={comp.id}
              transform={`translate(${comp.x}, ${comp.y})`}
              onMouseDown={(e) => handleCompMouseDown(e, comp)}
              onTouchStart={(e) => handleCompTouchStart(e, comp)}
              className="cursor-move group"
            >
              {/* Rotation Group */}
              <g transform={`rotate(${comp.rotation || 0}, 40, 25)`}>
                {/* Selection Box */}
                {isSelected && (
                  <g>
                    <rect
                      x="-6"
                      y="-6"
                      width="92"
                      height="62"
                      rx="10"
                      fill="none"
                      stroke={compColor}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                    {/* Quick Delete Badge on Canvas */}
                    <g
                      transform="translate(80, -10)"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComp(comp.id);
                      }}
                      className="cursor-pointer group/del"
                    >
                      <circle r="10" fill="#f43f5e" className="hover:scale-125 transition transform" />
                      <text
                        x="0"
                        y="3.5"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ×
                      </text>
                    </g>
                  </g>
                )}

                {/* Gate Symbol SVG */}
                <g onClick={(e) => handleInputToggle(e, comp)}>
                  <GateSymbolSvg
                    type={comp.type}
                    active={!!comp.state}
                    color={comp.color}
                    inputCount={comp.inputCount || 2}
                    width={80}
                    height={50}
                  />
                </g>
              </g>

              {/* Label */}
              <text
                x="40"
                y="-8"
                fill={comp.color || '#94a3b8'}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                className="select-none"
              >
                {comp.label || comp.type}
              </text>

              {/* Input Ports */}
              {comp.inputs.map((port) => renderPort(port, comp))}

              {/* Output Ports */}
              {comp.outputs.map((port) => renderPort(port, comp))}
            </g>
          );
        })}
        </g>
      </svg>
    </div>
  );
});
