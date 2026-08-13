const fs = require('fs');
let code = fs.readFileSync('src/components/CircuitCanvas.tsx', 'utf8');

code = code.replace(
  /<ContextToolbar\s*component=\{selectedComp\}\s*onRotate=\{handleRotateComponent\}\s*onDuplicate=\{handleDuplicateComponent\}\s*onDelete=\{handleDeleteComp\}/,
  `<ContextToolbar
            component={selectedComp}
            onRotate={() => handleRotateComponent()}
            onDuplicate={() => handleDuplicateComponent()}
            onDelete={() => handleDeleteComp()}
`
);

fs.writeFileSync('src/components/CircuitCanvas.tsx', code);
