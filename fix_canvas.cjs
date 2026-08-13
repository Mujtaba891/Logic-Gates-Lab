const fs = require('fs');
let code = fs.readFileSync('src/components/CircuitCanvas.tsx', 'utf8');

code = code.replace(
  /onUpdateComponents\(\[\.\.\.components, cloned\]\);\n    setSelectedCompId\(newId\);/,
  `onUpdateComponents([...components, cloned], true);\n    setSelectedCompIds(new Set([newId]));`
);

code = code.replace(
  /const handleChangeColor = \(compId: string, color: string\) => \{\n    onUpdateComponents\(components\.map\(\(c\) => \(c\.id === compId \? \{ \.\.\.c, color \} : c\)\)\);/,
  `const handleChangeColor = (compId: string, color: string) => {\n    onUpdateComponents(components.map((c) => (c.id === compId ? { ...c, color } : c)), true);`
);

code = code.replace(
  /const handleChangeLabel = \(compId: string, label: string\) => \{\n    onUpdateComponents\(components\.map\(\(c\) => \(c\.id === compId \? \{ \.\.\.c, label \} : c\)\)\);/,
  `const handleChangeLabel = (compId: string, label: string) => {\n    onUpdateComponents(components.map((c) => (c.id === compId ? { ...c, label } : c)), true);`
);

code = code.replace(
  /onUpdateComponents\(filteredComps\);\n      onUpdateWires\(filteredWires\);/,
  `onUpdateComponents(filteredComps, true);\n      onUpdateWires(filteredWires);`
);

fs.writeFileSync('src/components/CircuitCanvas.tsx', code);
