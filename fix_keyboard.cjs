const fs = require('fs');
let code = fs.readFileSync('src/components/CircuitCanvas.tsx', 'utf8');

code = code.replace(
  /if \(selectedCompId\) handleDeleteComp\(selectedCompId\);\n        if \(selectedWireId\) handleDeleteWire\(selectedWireId\);/,
  `if (selectedCompIds.size > 0) {\n          handleDeleteComp();\n        } else if (selectedWireId) {\n          const filtered = wires.filter((w) => w.id !== selectedWireId);\n          if (onUpdateCircuit) {\n            onUpdateCircuit(components, filtered, true);\n          } else {\n            onUpdateWires(filtered);\n          }\n          setSelectedWireId(null);\n        }`
);

code = code.replace(
  /if \(selectedCompId\) handleDuplicateComponent\(selectedCompId\);/,
  `if (selectedCompIds.size > 0) {\n          Array.from(selectedCompIds).forEach(handleDuplicateComponent);\n        }`
);

code = code.replace(
  /if \(selectedCompId\) handleRotateComponent\(selectedCompId\);/,
  `if (selectedCompIds.size > 0) {\n          Array.from(selectedCompIds).forEach(handleRotateComponent);\n        }`
);

code = code.replace(
  /setSelectedCompId\(null\);/,
  `setSelectedCompIds(new Set());`
);

code = code.replace(
  /}, \[selectedCompId, selectedWireId, components, wires\]\);/,
  `}, [selectedCompIds, selectedWireId, components, wires]);`
);

// Delete handle wire (which I probably didn't remove)
code = code.replace(
  /const handleDeleteWire = \([^}]*\}\;/g,
  ''
);

fs.writeFileSync('src/components/CircuitCanvas.tsx', code);
