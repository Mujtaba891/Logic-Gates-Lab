const fs = require('fs');
let code = fs.readFileSync('src/utils/logicEngine.ts', 'utf8');

const replacement = `
  const ensureUnique = (labels: string[]) => {
    const counts = new Map<string, number>();
    const unique: string[] = [];
    for (const lbl of labels) {
      if (counts.has(lbl)) {
        const count = counts.get(lbl)! + 1;
        counts.set(lbl, count);
        unique.push(\`\${lbl} (\${count})\`);
      } else {
        counts.set(lbl, 1);
        unique.push(lbl);
      }
    }
    return unique;
  };

  const inputLabels = ensureUnique(inputComps.map((c, i) => c.label || \`Input \${i + 1}\`));
  const outputLabels = ensureUnique(outputComps.map((c, i) => c.label || \`Output \${i + 1}\`));

  const totalCombinations = Math.pow(2, inputComps.length);
  const maxCombinations = Math.min(totalCombinations, 256);

  const rows: TruthTableRow[] = [];

  for (let i = 0; i < maxCombinations; i++) {
    const inputStates: { [id: string]: boolean } = {};
    const inputRowObj: { [label: string]: boolean } = {};
    
    inputComps.forEach((comp, idx) => {
      const bitVal = Boolean((i >> (inputComps.length - 1 - idx)) & 1);
      inputStates[comp.id] = bitVal;
      inputRowObj[inputLabels[idx]] = bitVal;
    });

    const tempComps: CircuitComponent[] = components.map((c) => {
      const cloned: CircuitComponent = {
        ...c,
        inputs: c.inputs.map((p) => ({ ...p })),
        outputs: c.outputs.map((p) => ({ ...p })),
      };
      if (cloned.id in inputStates) {
        cloned.state = inputStates[cloned.id];
        if (cloned.outputs[0]) {
          cloned.outputs[0].value = inputStates[cloned.id];
        }
      }
      return cloned;
    });

    const { components: evalComps } = propagateCircuitLogic(tempComps, wires);

    const outputRowObj: { [label: string]: boolean } = {};
    outputComps.forEach((outComp, idx) => {
      const matchComp = evalComps.find((c) => c.id === outComp.id);
      outputRowObj[outputLabels[idx]] = matchComp?.state ?? false;
    });

    rows.push({
      inputs: inputRowObj,
      outputs: outputRowObj,
    });
  }
`;

code = code.replace(/const inputLabels = inputComps\.map[\s\S]*rows\.push\(\{\n      inputs: inputRowObj,\n      outputs: outputRowObj,\n    \}\);\n  \}/, replacement.trim());

fs.writeFileSync('src/utils/logicEngine.ts', code);
