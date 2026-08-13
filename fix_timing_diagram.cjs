const fs = require('fs');
let typeCode = fs.readFileSync('src/types.ts', 'utf8');
typeCode = typeCode.replace(
  /export interface WaveformPoint \{\n  time: number;\n  values: \{ \[label: string\]: boolean \};\n\}/,
  `export interface WaveformPoint {\n  time: number;\n  values: { [id: string]: boolean };\n}`
);
fs.writeFileSync('src/types.ts', typeCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  /const signalValues: \{ \[label: string\]: boolean \} = \{\};\n\n      propagatedComps\.forEach\(\(c, idx\) => \{\n        if \(c\.type === 'INPUT' \|\| c\.type === 'CLOCK' \|\| c\.type === 'OUTPUT'\) \{\n          const label = c\.label \|\| `\$\{c\.type\} \$\{idx \+ 1\}`;\n          signalValues\[label\] = !!c\.state;\n        \}\n      \}\);/,
  `const signalValues: { [id: string]: boolean } = {};

      propagatedComps.forEach((c) => {
        if (c.type === 'INPUT' || c.type === 'CLOCK' || c.type === 'OUTPUT') {
          signalValues[c.id] = !!c.state;
        }
      });`
);

appCode = appCode.replace(
  /const signalLabels = components\n    \.filter\(\(c\) => c\.type === 'INPUT' \|\| c\.type === 'CLOCK' \|\| c\.type === 'OUTPUT'\)\n    \.map\(\(c, i\) => c\.label \|\| `\$\{c\.type\} \$\{i \+ 1\}`\);/,
  `const activeSignals = components
    .filter((c) => c.type === 'INPUT' || c.type === 'CLOCK' || c.type === 'OUTPUT')
    .map((c, i) => ({ id: c.id, label: c.label || \`\${c.type} \${i + 1}\` }));`
);

appCode = appCode.replace(
  /signalLabels=\{signalLabels\}/,
  `signals={activeSignals}`
);
fs.writeFileSync('src/App.tsx', appCode);

let timingCode = fs.readFileSync('src/components/TimingDiagram.tsx', 'utf8');
timingCode = timingCode.replace(
  /signalLabels: string\[\];/,
  `signals: { id: string, label: string }[];`
);
timingCode = timingCode.replace(
  /signalLabels,/,
  `signals,`
);
timingCode = timingCode.replace(
  /\{signalLabels\.length === 0/,
  `{signals.length === 0`
);
timingCode = timingCode.replace(
  /\{signalLabels\.map\(\(label\) => \(/,
  `{signals.map((sig) => (`
);
timingCode = timingCode.replace(
  /<div key=\{label\} /,
  `<div key={sig.id} `
);
timingCode = timingCode.replace(
  /\{label\}/,
  `{sig.label}`
);
timingCode = timingCode.replace(
  /const prevVal = displayHistory\[idx - 1\]\?\.values\[label\] \?\? false;/g,
  `const prevVal = displayHistory[idx - 1]?.values[sig.id] ?? false;`
);
timingCode = timingCode.replace(
  /const currVal = pt\.values\[label\] \?\? false;/g,
  `const currVal = pt.values[sig.id] ?? false;`
);
fs.writeFileSync('src/components/TimingDiagram.tsx', timingCode);
