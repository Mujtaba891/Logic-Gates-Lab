const fs = require('fs');
let code = fs.readFileSync('src/components/CircuitCanvas.tsx', 'utf8');

code = code.replace(
  /onRotate=\{handleRotateComponent\}/,
  'onRotate={() => handleRotateComponent()}'
);

code = code.replace(
  /onDelete=\{handleDeleteComp\}/,
  'onDelete={() => handleDeleteComp()}'
);

fs.writeFileSync('src/components/CircuitCanvas.tsx', code);
