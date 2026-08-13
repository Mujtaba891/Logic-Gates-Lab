const fs = require('fs');
let code = fs.readFileSync('src/components/CircuitCanvas.tsx', 'utf8');

code = code.replace(
  /const handleRotateComponent = \(compId: string\) => \{[\s\S]*?onUpdateComponents\(updated, true\);\n  \};/,
  `const handleRotateComponent = (compId?: string) => {
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
  };`
);

// Fix keyboard shortcuts calling rotate in loop
code = code.replace(
  /Array\.from\(selectedCompIds\)\.forEach\(handleRotateComponent\);/,
  `handleRotateComponent();`
);

fs.writeFileSync('src/components/CircuitCanvas.tsx', code);
