const fs = require('fs');
let code = fs.readFileSync('src/components/CircuitCanvas.tsx', 'utf8');

// 1. Update Props
code = code.replace(
  /onUpdateCircuit\?: \(components: CircuitComponent\[\], wires: Wire\[\]\) => void;/,
  'onUpdateCircuit?: (components: CircuitComponent[], wires: Wire[], commitHistory?: boolean) => void;'
);
code = code.replace(
  /onUpdateComponents: \(components: CircuitComponent\[\]\) => void;/,
  'onUpdateComponents: (components: CircuitComponent[], commitHistory?: boolean) => void;'
);

// 2. Replace selection & dragging state
code = code.replace(
  /const \[selectedCompId, setSelectedCompId\] = useState<string \| null>\(null\);/,
  `const [selectedCompIds, setSelectedCompIds] = useState<Set<string>>(new Set());`
);
code = code.replace(
  /const \[draggingCompId, setDraggingCompId\] = useState<string \| null>\(null\);/,
  `const [draggingCompIds, setDraggingCompIds] = useState<Set<string>>(new Set());\n  const [dragStartPos, setDragStartPos] = useState<Position | null>(null);\n  const [dragInitialPositions, setDragInitialPositions] = useState<Map<string, Position>>(new Map());\n  const [marqueeStart, setMarqueeStart] = useState<Position | null>(null);\n  const [marqueeCurrent, setMarqueeCurrent] = useState<Position | null>(null);`
);
code = code.replace(
  /const \[dragOffset, setDragOffset\] = useState<Position>\({ x: 0, y: 0 }\);/,
  ``
);

// 3. Update handleCompMouseDown
code = code.replace(
  /const handleCompMouseDown = \(e: React.MouseEvent, comp: CircuitComponent\) => \{[\s\S]*?y: canvasPos\.y - comp\.y,\n    \}\);\n  \};/,
  `const handleCompMouseDown = (e: React.MouseEvent, comp: CircuitComponent) => {
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
  };`
);

// 4. Update handleCanvasMouseDown
code = code.replace(
  /const handleCanvasMouseDown = \(e: React.MouseEvent\) => \{[\s\S]*?\}\n  \};/,
  `const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey && !e.ctrlKey)) {
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
  };`
);

// 5. Update handleMouseMove
code = code.replace(
  /if \(draggingCompId\) \{[\s\S]*?onUpdateComponents\(updated\);\n    \}/,
  `if (draggingCompIds.size > 0 && dragStartPos) {
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
    }`
);

// 6. Update handleMouseUp
code = code.replace(
  /const handleMouseUp = \(\) => \{[\s\S]*?setSnapTarget\(null\);\n    \}\n  \};/,
  `const handleMouseUp = () => {
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
  };`
);

// 7. Update connectPorts
code = code.replace(
  /if \(onUpdateCircuit\) \{\n        onUpdateCircuit\(components, \[\.\.\.filteredWires, newWire\]\);\n      \} else \{\n        onUpdateWires\(\[\.\.\.filteredWires, newWire\]\);\n      \}/,
  `if (onUpdateCircuit) {
        onUpdateCircuit(components, [...filteredWires, newWire], true);
      } else {
        onUpdateWires([...filteredWires, newWire]);
      }`
);

// 8. Update Component Context Actions to commit history
code = code.replace(/onUpdateComponents\(updated\)/g, 'onUpdateComponents(updated, true)');
code = code.replace(/onUpdateCircuit\(updated, updatedWires\)/g, 'onUpdateCircuit(updated, updatedWires, true)');
code = code.replace(/onUpdateCircuit\(filteredComps, filteredWires\)/g, 'onUpdateCircuit(filteredComps, filteredWires, true)');
// We need to fix the duplicate action and delete action to handle multiple selection or just the clicked one.
// Let's modify handleDeleteComp to accept an optional ID or use selectedCompIds if not provided.

// 9. Change selectedComp
code = code.replace(
  /const selectedComp = components\.find\(\(c\) => c\.id === selectedCompId\);/,
  `// Get the first selected component for the toolbar context menu
  const selectedComp = selectedCompIds.size === 1 ? components.find((c) => selectedCompIds.has(c.id)) : null;`
);

// 10. Update delete
code = code.replace(
  /const handleDeleteComp = \(compId: string\) => \{/,
  `const handleDeleteComp = (compId?: string) => {
    const idsToDelete = compId ? new Set([compId]) : selectedCompIds;`
);
code = code.replace(
  /const filteredComps = components\.filter\(\(c\) => c\.id !== compId\);/,
  `const filteredComps = components.filter((c) => !idsToDelete.has(c.id));`
);
code = code.replace(
  /const filteredWires = wires\.filter\(\(w\) => w\.fromCompId !== compId && w\.toCompId !== compId\);/,
  `const filteredWires = wires.filter((w) => !idsToDelete.has(w.fromCompId) && !idsToDelete.has(w.toCompId));`
);
code = code.replace(
  /if \(selectedCompId === compId\) setSelectedCompId\(null\);/,
  `setSelectedCompIds(new Set());`
);

// 11. Add Keyboard delete support
code = code.replace(
  /if \(e\.key === 'Delete' \|\| e\.key === 'Backspace'\) \{[\s\S]*?\}\n    \}\n  \}\);/,
  `if (e.key === 'Delete' || e.key === 'Backspace') {
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
      }
    }
  });`
);

// 12. Fix Duplicate to handle multiple? Let's just fix it for the single passed ID for now.
code = code.replace(
  /const handleDuplicateComponent = \(compId: string\) => \{/,
  `const handleDuplicateComponent = (compId: string) => {` // Keep same
);

// 13. Replace onClick wire handler
code = code.replace(
  /setSelectedWireId\(wire\.id\);\n                setSelectedCompId\(null\);/,
  `setSelectedWireId(wire.id);\n                setSelectedCompIds(new Set());`
);

// 14. Marquee Render
code = code.replace(
  /\{wires\.map\(\(wire\) => \{/,
  `{/* Marquee Selection Box */}
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
        {wires.map((wire) => {`
);

fs.writeFileSync('src/components/CircuitCanvas.tsx', code);
