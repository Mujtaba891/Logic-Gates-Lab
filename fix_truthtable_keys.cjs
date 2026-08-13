const fs = require('fs');
let code = fs.readFileSync('src/components/TruthTablePanel.tsx', 'utf8');

// Fix <th> keys
code = code.replace(/<th key=\{lbl\} /g, (match, offset, str) => {
  // It appears twice, once for inputs, once for outputs.
  return str.substring(offset - 50, offset).includes('inputLabels') ? '<th key={`in-${lbl}`} ' : '<th key={`out-${lbl}`} ';
});

// Fix <td> keys
code = code.replace(/<td\s+key=\{lbl\}\s+className=/g, (match, offset, str) => {
  return str.substring(offset - 100, offset).includes('inputLabels') ? '<td key={`in-${lbl}`} className=' : '<td key={`out-${lbl}`} className=';
});

fs.writeFileSync('src/components/TruthTablePanel.tsx', code);
