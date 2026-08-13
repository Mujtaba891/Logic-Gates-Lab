import { CircuitComponent, Wire, TruthTableData, TruthTableRow, GateType } from '../types';

export function createComponentPorts(type: GateType, compId: string, inputCount = 2) {
  switch (type) {
    case 'NOT':
    case 'BUFFER':
      return {
        inputs: [{ id: `${compId}-in-0`, name: 'A', type: 'input' as const, value: false, relativeX: 0, relativeY: 25 }],
        outputs: [{ id: `${compId}-out-0`, name: 'Y', type: 'output' as const, value: false, relativeX: 75, relativeY: 25 }],
      };
    case 'AND':
    case 'OR':
    case 'NAND':
    case 'NOR':
    case 'XOR':
    case 'XNOR': {
      const numInputs = Math.max(2, Math.min(inputCount, 4));
      const inputs = [];
      const inputNames = ['A', 'B', 'C', 'D'];

      for (let i = 0; i < numInputs; i++) {
        const yPos =
          numInputs === 2
            ? i === 0 ? 18 : 32
            : numInputs === 3
            ? 10 + i * 15
            : 8 + i * 11.33;

        inputs.push({
          id: `${compId}-in-${i}`,
          name: inputNames[i],
          type: 'input' as const,
          value: false,
          relativeX: 0,
          relativeY: yPos,
        });
      }

      return {
        inputs,
        outputs: [{ id: `${compId}-out-0`, name: 'Y', type: 'output' as const, value: false, relativeX: 75, relativeY: 25 }],
      };
    }
    case 'INPUT':
    case 'CLOCK':
    case 'HIGH':
    case 'LOW':
      return {
        inputs: [],
        outputs: [{ id: `${compId}-out-0`, name: 'OUT', type: 'output' as const, value: type === 'HIGH', relativeX: 50, relativeY: 20 }],
      };
    case 'OUTPUT':
      return {
        inputs: [{ id: `${compId}-in-0`, name: 'IN', type: 'input' as const, value: false, relativeX: 0, relativeY: 20 }],
        outputs: [],
      };
    case 'HALF_ADDER':
      return {
        inputs: [
          { id: `${compId}-in-0`, name: 'A', type: 'input' as const, value: false, relativeX: 0, relativeY: 10 },
          { id: `${compId}-in-1`, name: 'B', type: 'input' as const, value: false, relativeX: 0, relativeY: 30 },
        ],
        outputs: [
          { id: `${compId}-out-0`, name: 'Sum', type: 'output' as const, value: false, relativeX: 90, relativeY: 10 },
          { id: `${compId}-out-1`, name: 'Carry', type: 'output' as const, value: false, relativeX: 90, relativeY: 30 },
        ],
      };
    case 'FULL_ADDER':
      return {
        inputs: [
          { id: `${compId}-in-0`, name: 'A', type: 'input' as const, value: false, relativeX: 0, relativeY: 10 },
          { id: `${compId}-in-1`, name: 'B', type: 'input' as const, value: false, relativeX: 0, relativeY: 20 },
          { id: `${compId}-in-2`, name: 'Cin', type: 'input' as const, value: false, relativeX: 0, relativeY: 30 },
        ],
        outputs: [
          { id: `${compId}-out-0`, name: 'Sum', type: 'output' as const, value: false, relativeX: 90, relativeY: 12 },
          { id: `${compId}-out-1`, name: 'Cout', type: 'output' as const, value: false, relativeX: 90, relativeY: 28 },
        ],
      };
    case 'MUX_21':
      return {
        inputs: [
          { id: `${compId}-in-0`, name: 'I0', type: 'input' as const, value: false, relativeX: 0, relativeY: 10 },
          { id: `${compId}-in-1`, name: 'I1', type: 'input' as const, value: false, relativeX: 0, relativeY: 20 },
          { id: `${compId}-in-2`, name: 'Sel', type: 'input' as const, value: false, relativeX: 30, relativeY: 40 },
        ],
        outputs: [{ id: `${compId}-out-0`, name: 'Y', type: 'output' as const, value: false, relativeX: 70, relativeY: 20 }],
      };
    default:
      return { inputs: [], outputs: [] };
  }
}

export function evaluateComponentLogic(comp: CircuitComponent): boolean[] {
  const inVals = comp.inputs.map((p) => p.value);

  switch (comp.type) {
    case 'INPUT':
      return [!!comp.state];
    case 'HIGH':
      return [true];
    case 'LOW':
      return [false];
    case 'CLOCK':
      return [!!comp.state];
    case 'NOT':
      return [!inVals[0]];
    case 'BUFFER':
      return [!!inVals[0]];
    case 'AND':
      return [inVals.length > 0 && inVals.every(Boolean)];
    case 'OR':
      return [inVals.some(Boolean)];
    case 'NAND':
      return [!(inVals.length > 0 && inVals.every(Boolean))];
    case 'NOR':
      return [!inVals.some(Boolean)];
    case 'XOR': {
      const activeCount = inVals.filter(Boolean).length;
      return [activeCount % 2 === 1];
    }
    case 'XNOR': {
      const activeCount = inVals.filter(Boolean).length;
      return [activeCount % 2 === 0];
    }
    case 'HALF_ADDER': {
      const a = !!inVals[0];
      const b = !!inVals[1];
      return [a !== b, a && b];
    }
    case 'FULL_ADDER': {
      const a = !!inVals[0];
      const b = !!inVals[1];
      const cin = !!inVals[2];
      const sum = (a !== b) !== cin;
      const cout = (a && b) || (cin && (a !== b));
      return [sum, cout];
    }
    case 'MUX_21': {
      const i0 = !!inVals[0];
      const i1 = !!inVals[1];
      const sel = !!inVals[2];
      return [sel ? i1 : i0];
    }
    case 'OUTPUT':
      return [];
    default:
      return [];
  }
}

export function propagateCircuitLogic(
  components: CircuitComponent[],
  wires: Wire[],
  maxPasses = 15
): { components: CircuitComponent[]; wires: Wire[] } {
  const nextComps: CircuitComponent[] = components.map((c) => ({
    ...c,
    inputs: c.inputs.map((p) => ({ ...p })),
    outputs: c.outputs.map((p) => ({ ...p })),
  }));

  let changed = true;
  let pass = 0;
  const wireStateMap = new Map<string, boolean>();

  while (changed && pass < maxPasses) {
    changed = false;
    pass++;

    for (const comp of nextComps) {
      if (comp.type === 'OUTPUT') {
        comp.state = comp.inputs[0]?.value ?? false;
        continue;
      }

      const outValues = evaluateComponentLogic(comp);
      comp.outputs.forEach((outPort, idx) => {
        const newVal = outValues[idx] ?? false;
        if (outPort.value !== newVal) {
          outPort.value = newVal;
          changed = true;
        }
      });
    }

    for (const wire of wires) {
      const sourceComp = nextComps.find((c) => c.id === wire.fromCompId);
      const targetComp = nextComps.find((c) => c.id === wire.toCompId);

      if (!sourceComp || !targetComp) continue;

      const sourcePort = sourceComp.outputs.find((p) => p.id === wire.fromPortId);
      const targetPort = targetComp.inputs.find((p) => p.id === wire.toPortId);

      if (sourcePort && targetPort) {
        const signal = sourcePort.value;
        wireStateMap.set(wire.id, signal);
        if (targetPort.value !== signal) {
          targetPort.value = signal;
          changed = true;
        }
      }
    }
  }

  const updatedWires = wires.map((w) => ({
    ...w,
    color: wireStateMap.get(w.id) ? '#22c55e' : '#64748b',
  }));

  return { components: nextComps, wires: updatedWires };
}

export function generateCircuitTruthTable(
  components: CircuitComponent[],
  wires: Wire[]
): TruthTableData {
  const inputComps = components
    .filter((c) => c.type === 'INPUT' || c.type === 'CLOCK')
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const outputComps = components
    .filter((c) => c.type === 'OUTPUT')
    .sort((a, b) => a.y - b.y || a.x - b.x);

  if (inputComps.length === 0 || outputComps.length === 0) {
    return { inputLabels: [], outputLabels: [], rows: [] };
  }

  const ensureUnique = (labels: string[]) => {
    const counts = new Map<string, number>();
    const unique: string[] = [];
    for (const lbl of labels) {
      if (counts.has(lbl)) {
        const count = counts.get(lbl)! + 1;
        counts.set(lbl, count);
        unique.push(`${lbl} (${count})`);
      } else {
        counts.set(lbl, 1);
        unique.push(lbl);
      }
    }
    return unique;
  };

  const inputLabels = ensureUnique(inputComps.map((c, i) => c.label || `Input ${i + 1}`));
  const outputLabels = ensureUnique(outputComps.map((c, i) => c.label || `Output ${i + 1}`));

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

  return { inputLabels, outputLabels, rows };
}
