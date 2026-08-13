export type GateType = 
  | 'AND' 
  | 'OR' 
  | 'NOT' 
  | 'NAND' 
  | 'NOR' 
  | 'XOR' 
  | 'XNOR' 
  | 'BUFFER'
  | 'INPUT' 
  | 'CLOCK' 
  | 'HIGH' 
  | 'LOW' 
  | 'OUTPUT' 
  | 'HEX_OUTPUT' 
  | 'SEVEN_SEGMENT'
  | 'HALF_ADDER'
  | 'FULL_ADDER'
  | 'MUX_21';

export type ComponentCategory = 'gates' | 'inputs' | 'outputs' | 'modules';

export interface Port {
  id: string;
  name: string;
  type: 'input' | 'output';
  value: boolean; // current signal state (true = 1, false = 0)
  relativeX: number; // percentage or px relative to component origin
  relativeY: number;
}

export interface CircuitComponent {
  id: string;
  type: GateType;
  label: string;
  x: number;
  y: number;
  inputs: Port[];
  outputs: Port[];
  rotation?: 0 | 90 | 180 | 270;
  inputCount?: number;
  state?: boolean; // for toggle inputs / clocks / leds
  clockFrequencyMs?: number; // for clock pulse generators
  color?: string; // custom color tag or LED color
}

export type WireStyle = 'bezier' | 'orthogonal' | 'straight';

export interface Wire {
  id: string;
  fromCompId: string;
  fromPortId: string;
  toCompId: string;
  toPortId: string;
  color?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface TruthTableRow {
  inputs: { [portIdOrLabel: string]: boolean };
  outputs: { [portIdOrLabel: string]: boolean };
}

export interface TruthTableData {
  inputLabels: string[];
  outputLabels: string[];
  rows: TruthTableRow[];
}

export interface GateDefinition {
  type: GateType;
  name: string;
  category: ComponentCategory;
  description: string;
  booleanExpr: string;
  symbolSvg: string; // inline SVG rendering representation
  truthTable: { a: number; b?: number; out: number }[];
  icChip: string;
  transistorCount: number;
  realWorldApps: string[];
  defaultInputCount: number;
  defaultOutputCount: number;
}

export interface Challenge {
  id: string;
  title: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  hint: string;
  inputs: { name: string }[];
  outputs: { name: string }[];
  targetTruthTable: { [key: string]: boolean }[]; // expected output for each input combination
  allowedGates?: GateType[];
  initialCircuit?: { components: CircuitComponent[]; wires: Wire[] };
}

export interface QuizQuestion {
  id: string;
  type: 'identify_symbol' | 'predict_output' | 'boolean_expression' | 'truth_table_match';
  question: string;
  gateType?: GateType;
  diagramSvg?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProject {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  components: CircuitComponent[];
  wires: Wire[];
}

export interface WaveformPoint {
  time: number;
  values: { [id: string]: boolean };
}
