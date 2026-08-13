const fs = require('fs');
let code = fs.readFileSync('src/components/CircuitCanvas.tsx', 'utf8');

code = code.replace(
  /const handleDuplicateComponent = \(compId: string\) => \{[\s\S]*?setSelectedCompIds\(new Set\(\[newId\]\)\);\n  \};/,
  `const handleDuplicateComponent = () => {
    if (selectedCompIds.size === 0) return;
    
    const newIds = new Set<string>();
    const clonedComps: CircuitComponent[] = [];
    
    components.forEach((c) => {
      if (selectedCompIds.has(c.id)) {
        const newId = \`comp-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`;
        newIds.add(newId);
        clonedComps.push({
          ...c,
          id: newId,
          x: c.x + 20,
          y: c.y + 20,
          inputs: c.inputs.map((p) => ({ ...p, id: \`port-\${Math.random().toString(36).substr(2, 6)}\` })),
          outputs: c.outputs.map((p) => ({ ...p, id: \`port-\${Math.random().toString(36).substr(2, 6)}\` })),
        });
      }
    });

    onUpdateComponents([...components, ...clonedComps], true);
    setSelectedCompIds(newIds);
  };`
);

// Fix ContextToolbar calling duplicate with ID
code = code.replace(
  /onDuplicate=\{handleDuplicateComponent\}/,
  `onDuplicate={() => handleDuplicateComponent()}`
);

// Fix keyboard shortcuts calling duplicate in loop
code = code.replace(
  /Array\.from\(selectedCompIds\)\.forEach\(handleDuplicateComponent\);/,
  `handleDuplicateComponent();`
);

fs.writeFileSync('src/components/CircuitCanvas.tsx', code);
