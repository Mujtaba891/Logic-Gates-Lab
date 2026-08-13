const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[components, setComponents\] = useState<CircuitComponent\[\]>\(defaultPreset\.components\);\n  const \[wires, setWires\] = useState<Wire\[\]>\(defaultPreset\.wires\);/,
  `const [components, setComponents] = useState<CircuitComponent[]>(defaultPreset.components);
  const [wires, setWires] = useState<Wire[]>(defaultPreset.wires);

  const { pushHistory, undo, redo, canUndo, canRedo, resetHistory } = useCircuitHistory({
    components: defaultPreset.components,
    wires: defaultPreset.wires,
  });

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
  }, [handleUndo, handleRedo]);`
);

code = code.replace(
  /const updateCircuitState = useCallback\(\n    \(newComps: CircuitComponent\[\], newWires: Wire\[\]\) => \{/,
  `const updateCircuitState = useCallback(
    (newComps: CircuitComponent[], newWires: Wire[], commitToHistory: boolean = false) => {`
);

code = code.replace(
  /setWaveformHistory\(\(prev\) => \[\.\.\.prev\.slice\(-30\), \{ time: timeNow, values: signalValues \}\]\);\n    \},\n    \[\]/,
  `setWaveformHistory((prev) => [...prev.slice(-30), { time: timeNow, values: signalValues }]);
      
      if (commitToHistory) {
        pushHistory({ components: propagatedComps, wires: propagatedWires });
      }
    },
    [pushHistory]`
);

code = code.replace(
  /onImportJSON={handleImportJSON}/,
  `onImportJSON={handleImportJSON}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}`
);

code = code.replace(
  /updateCircuitState\(\[\.\.\.components, newComp\], wires\);/,
  `updateCircuitState([...components, newComp], wires, true);`
);

fs.writeFileSync('src/App.tsx', code);
